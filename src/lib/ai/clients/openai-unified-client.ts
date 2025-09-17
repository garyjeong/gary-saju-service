/**
 * OpenAI 통합 클라이언트 구현
 * 통합 인터페이스를 사용한 OpenAI API 래퍼
 */

import OpenAI from "openai";
import {
	IAIClient,
	UnifiedAIRequest,
	UnifiedAIResponse,
	AIServiceError,
	AI_ERROR_CODES,
	isRetryableError,
	generateRequestId,
	estimateTokens,
	ResponseTimer,
	DEFAULT_USAGE_INFO,
} from "../ai-client-interface";
import { AIProvider, AIProviderConfig } from "../ai-config";
import { RetryExecutor, PROVIDER_RETRY_STRATEGIES } from "../retry-strategies";

/**
 * OpenAI 통합 클라이언트
 */
export class OpenAIUnifiedClient implements IAIClient {
	public readonly provider: AIProvider = "openai";
	public readonly config: AIProviderConfig;
	private readonly client: OpenAI;
	private readonly retryExecutor: RetryExecutor;
	private usageTracker = {
		requests: 0,
		tokens: 0,
		lastReset: Date.now(),
	};

	constructor(config: AIProviderConfig) {
		this.config = config;

		if (!config.apiKey) {
			throw new AIServiceError(
				"OpenAI API 키가 설정되지 않았습니다",
				"openai",
				AI_ERROR_CODES.AUTH_INVALID_API_KEY
			);
		}

		this.client = new OpenAI({
			apiKey: config.apiKey,
			timeout: config.timeout,
			maxRetries: 0, // 우리가 직접 재시도 로직을 구현
		});

		// 고도화된 재시도 전략 적용
		this.retryExecutor = new RetryExecutor(
			"openai",
			PROVIDER_RETRY_STRATEGIES.openai
		);
	}

	/**
	 * AI 모델에게 요청을 보냅니다
	 */
	async generateCompletion(
		request: UnifiedAIRequest
	): Promise<UnifiedAIResponse> {
		const timer = new ResponseTimer();
		const requestId = request.metadata?.requestId || generateRequestId();

		return await this.retryExecutor.execute(
			async () => {
				const response = await this.makeOpenAIRequest(request, requestId);

				// 사용량 추적 업데이트
				this.updateUsageTracker(response.usage.totalTokens);

				return {
					...response,
					metadata: {
						...response.metadata,
						requestId,
						responseTime: timer.getElapsedTime(),
					},
				};
			},
			{
				operationName: "OpenAI API 요청",
				requestId,
				metadata: {
					model: request.model || this.config.model,
					maxTokens: request.maxTokens,
					temperature: request.temperature,
				},
			}
		);
	}

	/**
	 * 실제 OpenAI API 요청
	 */
	private async makeOpenAIRequest(
		request: UnifiedAIRequest,
		requestId: string
	): Promise<UnifiedAIResponse> {
		const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

		// 시스템 메시지 추가
		if (request.systemMessage) {
			messages.push({
				role: "system",
				content: request.systemMessage,
			});
		}

		// 사용자 프롬프트 추가
		messages.push({
			role: "user",
			content: request.prompt,
		});

		const completion = await this.client.chat.completions.create({
			model: request.model || this.config.model,
			messages,
			max_tokens: Math.min(
				request.maxTokens || this.config.maxTokens,
				this.config.maxTokens
			),
			temperature: request.temperature ?? this.config.temperature,
			stream: false,
		});

		const choice = completion.choices[0];
		if (!choice || !choice.message?.content) {
			throw new AIServiceError(
				"OpenAI로부터 유효한 응답을 받지 못했습니다",
				"openai",
				AI_ERROR_CODES.PARSING_ERROR
			);
		}

		return {
			content: choice.message.content,
			provider: "openai",
			model: completion.model,
			usage: {
				promptTokens:
					completion.usage?.prompt_tokens || estimateTokens(request.prompt),
				completionTokens:
					completion.usage?.completion_tokens ||
					estimateTokens(choice.message.content),
				totalTokens: completion.usage?.total_tokens || 0,
			},
			metadata: {
				requestId,
				responseTime: 0, // 타이머에서 설정됨
				finishReason: this.mapFinishReason(choice.finish_reason),
				cached: false,
			},
			rawResponse: completion,
		};
	}

	/**
	 * OpenAI finish_reason 매핑
	 */
	private mapFinishReason(
		reason: string | null | undefined
	): "stop" | "length" | "error" | "timeout" {
		switch (reason) {
			case "stop":
				return "stop";
			case "length":
				return "length";
			case "content_filter":
			case "function_call":
			case "tool_calls":
				return "stop";
			default:
				return "error";
		}
	}

	/**
	 * 에러 처리 및 변환
	 */
	private handleError(error: any, retryCount: number): AIServiceError {
		let errorCode = AI_ERROR_CODES.UNKNOWN_ERROR as any;
		let message = "알 수 없는 오류가 발생했습니다";
		let retryable = false;
		let statusCode: number | undefined;

		if (error instanceof OpenAI.APIError) {
			statusCode = error.status;

			switch (error.status) {
				case 401:
					errorCode = AI_ERROR_CODES.AUTH_INVALID_API_KEY;
					message = "OpenAI API 키가 유효하지 않습니다";
					break;
				case 429:
					if (error.message?.includes("quota")) {
						errorCode = AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED;
						message = "OpenAI API 사용량 한도를 초과했습니다";
					} else {
						errorCode = AI_ERROR_CODES.AUTH_RATE_LIMITED;
						message = "OpenAI API 요청 빈도 제한에 걸렸습니다";
						retryable = true;
					}
					break;
				case 400:
					errorCode = AI_ERROR_CODES.REQUEST_INVALID_PARAMS;
					message = "요청 매개변수가 유효하지 않습니다";
					break;
				case 413:
					errorCode = AI_ERROR_CODES.REQUEST_TOO_LARGE;
					message = "요청 크기가 너무 큽니다";
					break;
				case 500:
				case 502:
				case 503:
				case 504:
					errorCode = AI_ERROR_CODES.SERVER_ERROR;
					message = "OpenAI 서버 오류가 발생했습니다";
					retryable = true;
					break;
				default:
					message = error.message || message;
					retryable = error.status >= 500;
			}
		} else if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
			errorCode = AI_ERROR_CODES.REQUEST_TIMEOUT;
			message = "요청 시간이 초과되었습니다";
			retryable = true;
		} else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
			errorCode = AI_ERROR_CODES.NETWORK_ERROR;
			message = "네트워크 연결 오류가 발생했습니다";
			retryable = true;
		}

		// 자동 재시도 로직 확인
		if (!retryable) {
			retryable = isRetryableError(errorCode);
		}

		return new AIServiceError(
			message,
			"openai",
			errorCode,
			retryable,
			statusCode,
			{
				originalError: error.message,
				retryCount,
				timestamp: new Date().toISOString(),
			}
		);
	}

	/**
	 * 사용량 추적 업데이트
	 */
	private updateUsageTracker(tokens: number): void {
		const now = Date.now();
		const hoursSinceReset =
			(now - this.usageTracker.lastReset) / (1000 * 60 * 60);

		// 1시간마다 카운터 리셋
		if (hoursSinceReset >= 1) {
			this.usageTracker.requests = 0;
			this.usageTracker.tokens = 0;
			this.usageTracker.lastReset = now;
		}

		this.usageTracker.requests++;
		this.usageTracker.tokens += tokens;
	}

	/**
	 * 클라이언트 상태를 확인합니다
	 */
	async healthCheck(): Promise<{
		healthy: boolean;
		latency?: number;
		error?: string;
	}> {
		try {
			const timer = new ResponseTimer();

			// 간단한 요청으로 상태 확인
			await this.client.chat.completions.create({
				model: this.config.model,
				messages: [{ role: "user", content: "Hello" }],
				max_tokens: 1,
				temperature: 0,
			});

			return {
				healthy: true,
				latency: timer.getElapsedTime(),
			};
		} catch (error) {
			return {
				healthy: false,
				error: error instanceof Error ? error.message : "알 수 없는 오류",
			};
		}
	}

	/**
	 * 사용량 및 제한 정보를 조회합니다
	 */
	async getUsageInfo(): Promise<{
		requests: { used: number; limit: number; remaining: number };
		tokens: { used: number; limit: number; remaining: number };
		resetTime?: Date;
	}> {
		const rateLimit = this.config.metadata.rateLimit;

		if (!rateLimit) {
			return {
				...DEFAULT_USAGE_INFO,
				resetTime: new Date(this.usageTracker.lastReset + 60 * 60 * 1000), // 1시간 후
			};
		}

		return {
			requests: {
				used: this.usageTracker.requests,
				limit: rateLimit.requestsPerMinute,
				remaining: Math.max(
					0,
					rateLimit.requestsPerMinute - this.usageTracker.requests
				),
			},
			tokens: {
				used: this.usageTracker.tokens,
				limit: rateLimit.tokensPerMinute,
				remaining: Math.max(
					0,
					rateLimit.tokensPerMinute - this.usageTracker.tokens
				),
			},
			resetTime: new Date(this.usageTracker.lastReset + 60 * 60 * 1000),
		};
	}

	/**
	 * 클라이언트를 정리합니다
	 */
	async cleanup(): Promise<void> {
		// OpenAI 클라이언트는 특별한 정리가 필요하지 않음
		// 필요시 연결 풀 정리 등을 여기서 수행
	}
}
