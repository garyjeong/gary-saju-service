/**
 * Google AI 통합 클라이언트 구현
 * 통합 인터페이스를 사용한 Google AI API 래퍼
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
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
 * Google AI 통합 클라이언트
 */
export class GoogleAIUnifiedClient implements IAIClient {
	public readonly provider: AIProvider = "google";
	public readonly config: AIProviderConfig;
	private readonly client: GoogleGenerativeAI;
	private readonly model: GenerativeModel;
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
				"Google AI API 키가 설정되지 않았습니다",
				"google",
				AI_ERROR_CODES.AUTH_INVALID_API_KEY
			);
		}

		this.client = new GoogleGenerativeAI(config.apiKey);
		this.model = this.client.getGenerativeModel({
			model: config.model,
			generationConfig: {
				maxOutputTokens: config.maxTokens,
				temperature: config.temperature,
				topP: 0.9,
			},
		});

		// 고도화된 재시도 전략 적용
		this.retryExecutor = new RetryExecutor(
			"google",
			PROVIDER_RETRY_STRATEGIES.google
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
				const response = await this.makeGoogleAIRequest(request, requestId);

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
				operationName: "Google AI API 요청",
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
	 * 실제 Google AI API 요청
	 */
	private async makeGoogleAIRequest(
		request: UnifiedAIRequest,
		requestId: string
	): Promise<UnifiedAIResponse> {
		// 프롬프트 구성
		let fullPrompt = request.prompt;

		if (request.systemMessage) {
			fullPrompt = `시스템 지침: ${request.systemMessage}\n\n사용자 요청: ${request.prompt}`;
		}

		// 모델별 설정 오버라이드
		const modelToUse = request.model
			? this.client.getGenerativeModel({
					model: request.model,
					generationConfig: {
						maxOutputTokens: Math.min(
							request.maxTokens || this.config.maxTokens,
							this.config.maxTokens
						),
						temperature: request.temperature ?? this.config.temperature,
						topP: 0.9,
					},
			  })
			: this.model;

		const result = await modelToUse.generateContent({
			contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
		});

		const response = await result.response;
		const content = response.text();

		if (!content) {
			throw new AIServiceError(
				"Google AI로부터 유효한 응답을 받지 못했습니다",
				"google",
				AI_ERROR_CODES.PARSING_ERROR
			);
		}

		// 토큰 사용량 계산 (Google AI는 정확한 토큰 수를 제공하지 않을 수 있음)
		const promptTokens =
			response.usageMetadata?.promptTokenCount || estimateTokens(fullPrompt);
		const completionTokens =
			response.usageMetadata?.candidatesTokenCount || estimateTokens(content);
		const totalTokens =
			response.usageMetadata?.totalTokenCount ||
			promptTokens + completionTokens;

		return {
			content,
			provider: "google",
			model: request.model || this.config.model,
			usage: {
				promptTokens,
				completionTokens,
				totalTokens,
			},
			metadata: {
				requestId,
				responseTime: 0, // 타이머에서 설정됨
				finishReason: this.mapFinishReason(
					response.candidates?.[0]?.finishReason
				),
				cached: false,
			},
			rawResponse: response,
		};
	}

	/**
	 * Google AI finish_reason 매핑
	 */
	private mapFinishReason(
		reason: string | undefined
	): "stop" | "length" | "error" | "timeout" {
		switch (reason) {
			case "STOP":
				return "stop";
			case "MAX_TOKENS":
				return "length";
			case "SAFETY":
			case "RECITATION":
				return "stop"; // 안전 필터에 의한 중단도 정상 완료로 처리
			case "OTHER":
			default:
				return "error";
		}
	}

	/**
	 * 에러 처리 및 변환
	 */
	private handleError(error: any, retryCount: number): AIServiceError {
		let errorCode = AI_ERROR_CODES.UNKNOWN_ERROR;
		let message = "알 수 없는 오류가 발생했습니다";
		let retryable = false;
		let statusCode: number | undefined;

		// Google AI 에러 처리
		if (error.message) {
			const errorMessage = error.message.toLowerCase();

			if (
				errorMessage.includes("api key") ||
				errorMessage.includes("unauthorized")
			) {
				errorCode = AI_ERROR_CODES.AUTH_INVALID_API_KEY;
				message = "Google AI API 키가 유효하지 않습니다";
			} else if (
				errorMessage.includes("quota") ||
				errorMessage.includes("limit exceeded")
			) {
				errorCode = AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED;
				message = "Google AI API 사용량 한도를 초과했습니다";
			} else if (
				errorMessage.includes("rate limit") ||
				errorMessage.includes("too many requests")
			) {
				errorCode = AI_ERROR_CODES.AUTH_RATE_LIMITED;
				message = "Google AI API 요청 빈도 제한에 걸렸습니다";
				retryable = true;
			} else if (
				errorMessage.includes("invalid") ||
				errorMessage.includes("bad request")
			) {
				errorCode = AI_ERROR_CODES.REQUEST_INVALID_PARAMS;
				message = "요청 매개변수가 유효하지 않습니다";
			} else if (errorMessage.includes("timeout")) {
				errorCode = AI_ERROR_CODES.REQUEST_TIMEOUT;
				message = "요청 시간이 초과되었습니다";
				retryable = true;
			} else if (
				errorMessage.includes("server error") ||
				errorMessage.includes("internal error")
			) {
				errorCode = AI_ERROR_CODES.SERVER_ERROR;
				message = "Google AI 서버 오류가 발생했습니다";
				retryable = true;
			} else if (
				errorMessage.includes("service unavailable") ||
				errorMessage.includes("temporarily unavailable")
			) {
				errorCode = AI_ERROR_CODES.SERVER_UNAVAILABLE;
				message = "Google AI 서비스가 일시적으로 사용할 수 없습니다";
				retryable = true;
			} else if (errorMessage.includes("model not found")) {
				errorCode = AI_ERROR_CODES.MODEL_NOT_FOUND;
				message = "요청한 Google AI 모델을 찾을 수 없습니다";
			} else {
				message = error.message;
			}
		}

		// 네트워크 관련 에러
		if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
			errorCode = AI_ERROR_CODES.REQUEST_TIMEOUT;
			message = "요청 시간이 초과되었습니다";
			retryable = true;
		} else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
			errorCode = AI_ERROR_CODES.NETWORK_ERROR;
			message = "네트워크 연결 오류가 발생했습니다";
			retryable = true;
		}

		// HTTP 상태 코드 기반 처리
		if (error.status) {
			statusCode = error.status;
			retryable = error.status >= 500;
		}

		// 자동 재시도 로직 확인
		if (!retryable) {
			retryable = isRetryableError(errorCode);
		}

		return new AIServiceError(
			message,
			"google",
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
			const result = await this.model.generateContent({
				contents: [{ role: "user", parts: [{ text: "Hello" }] }],
			});

			await result.response.text();

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
		// Google AI 클라이언트는 특별한 정리가 필요하지 않음
		// 필요시 연결 풀 정리 등을 여기서 수행
	}
}
