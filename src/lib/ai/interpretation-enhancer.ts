/**
 * 개-사주 AI 해석 강화 서비스
 * OpenAI를 사용한 개인화된 사주 해석 생성
 */

import {
	googleAI,
	getGeminiModel,
	AIInterpretationRequest,
	AIInterpretationResponse,
	AIServiceError,
	validateAIRequest,
	parseGeminiResponse,
} from "./google-ai-client";
import {
	generatePersonalizedPrompt,
	generateSimplePrompt,
	generateFallbackPrompt,
} from "./prompt-templates";
import { PromptManager, PromptGenerationOptions } from "./prompt-manager";
import { aiServiceManager } from "./ai-service-manager";
import { UnifiedAIRequest } from "./ai-client-interface";
import { AI_CONFIG } from "./ai-config";

/**
 * AI 해석 강화 서비스 클래스
 */
export class InterpretationEnhancer {
	private readonly maxRetries = 3;
	private readonly timeout = 30000; // 30초
	private readonly promptManager: PromptManager;
	private readonly useAdvancedPrompts: boolean;
	private readonly useUnifiedAI: boolean;

	constructor(
		options: {
			useAdvancedPrompts?: boolean;
			useUnifiedAI?: boolean;
		} = {}
	) {
		this.promptManager = new PromptManager();
		this.useAdvancedPrompts =
			options.useAdvancedPrompts ?? AI_CONFIG.features.enableAdvancedPrompts;
		this.useUnifiedAI = options.useUnifiedAI ?? true; // 새로운 통합 시스템을 기본으로 사용
	}

	/**
	 * 개인화된 사주 해석 생성
	 */
	async enhanceInterpretation(
		request: AIInterpretationRequest,
		options: PromptGenerationOptions & {
			enableFallback?: boolean;
		} = {}
	): Promise<AIInterpretationResponse> {
		const startTime = Date.now();

		try {
			// 요청 검증
			validateAIRequest(request);

			// AI 프롬프트 생성 (고도화된 시스템 또는 레거시)
			let prompt: string;
			let promptMetadata: any = {};

			if (this.useAdvancedPrompts && !options.enableFallback) {
				const promptResult = await this.promptManager.generatePrompt(request, {
					theme: "modern_practical",
					responseFormat: "detailed_json",
					enableQualityCheck: true,
					minQualityScore: 70,
					...options,
				});
				prompt = promptResult.prompt;
				promptMetadata = promptResult.metadata;
			} else {
				// 레거시 시스템 사용
				prompt = generatePersonalizedPrompt(request);
				promptMetadata = { system: "legacy", version: "1.0.0" };
			}

			// AI API 호출 (통합 시스템 또는 레거시)
			let aiResponse: string;
			let aiProvider = "unknown";

			if (this.useUnifiedAI) {
				// 새로운 통합 AI 시스템 사용
				const unifiedRequest: UnifiedAIRequest = {
					prompt,
					maxTokens: promptMetadata.estimatedTokens
						? Math.min(
								promptMetadata.estimatedTokens + 500,
								AI_CONFIG.limits.maxTokensPerRequest
						  )
						: 2000,
					temperature: 0.7,
					metadata: {
						requestId: `saju_${Date.now()}`,
						context: {
							service: "saju-interpretation",
							useAdvancedPrompts: this.useAdvancedPrompts,
							promptVersion: promptMetadata.version,
						},
					},
				};

				const response = await aiServiceManager.generateCompletion(
					unifiedRequest
				);
				aiResponse = response.content;
				aiProvider = response.provider;
			} else {
				// 레거시 Google AI 시스템 사용
				aiResponse = await this.callGemini(prompt);
				aiProvider = "google-legacy";
			}

			// 응답 파싱 및 검증
			const enhancedInterpretation = parseGeminiResponse(aiResponse);

			const processingTime = Date.now() - startTime;

			return {
				enhancedInterpretation,
				metadata: {
					processingTime,
					model: this.useUnifiedAI ? "unified-ai" : "gemini-1.5-flash",
					aiProvider,
					cached: false,
					promptSystem: promptMetadata.system || "unknown",
					promptVersion: promptMetadata.version || "1.0.0",
					promptQualityScore: promptMetadata.qualityScore,
					promptTokens: promptMetadata.estimatedTokens,
					promptComplexity: promptMetadata.complexity,
					useUnifiedAI: this.useUnifiedAI,
				},
			};
		} catch (error) {
			console.error("AI 해석 생성 실패:", error);

			// 폴백 해석 시도
			return this.generateFallbackInterpretation(
				request,
				Date.now() - startTime
			);
		}
	}

	/**
	 * Google AI API 호출 (재시도 로직 포함)
	 */
	private async callGemini(prompt: string, retryCount = 0): Promise<string> {
		try {
			const model = getGeminiModel();

			// Google AI 프롬프트 포맷팅
			const fullPrompt = `당신은 전문적인 사주 해석가입니다. 항상 JSON 형식으로만 응답하며, 건설적이고 희망적인 조언을 제공합니다.

${prompt}`;

			const result = await model.generateContent({
				contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
				generationConfig: {
					maxOutputTokens: 2000,
					temperature: 0.7,
					topP: 0.9,
				},
			});

			const response = await result.response;
			const content = response.text();

			if (!content) {
				throw new AIServiceError(
					"AI로부터 응답을 받지 못했습니다",
					"NO_RESPONSE"
				);
			}

			return content;
		} catch (error: any) {
			console.error(
				`Google AI API 호출 실패 (시도 ${retryCount + 1}/${this.maxRetries}):`,
				error
			);

			// 재시도 로직
			if (retryCount < this.maxRetries - 1) {
				const delay = Math.pow(2, retryCount) * 1000; // 지수 백오프
				await new Promise((resolve) => setTimeout(resolve, delay));
				return this.callGemini(prompt, retryCount + 1);
			}

			// 최대 재시도 횟수 초과시 에러 발생
			if (
				error.message?.includes("quota") ||
				error.message?.includes("limit")
			) {
				throw new AIServiceError(
					"API 사용량이 초과되었습니다",
					"QUOTA_EXCEEDED"
				);
			} else if (error.message?.includes("rate")) {
				throw new AIServiceError(
					"요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요",
					"RATE_LIMITED"
				);
			} else {
				throw new AIServiceError(
					"AI 서비스 일시적 오류가 발생했습니다",
					"API_ERROR",
					error
				);
			}
		}
	}

	// parseAIResponse 메서드를 제거하고 google-ai-client의 parseGeminiResponse 함수 사용

	/**
	 * 폴백 해석 생성 (AI 실패 시)
	 */
	private async generateFallbackInterpretation(
		request: AIInterpretationRequest,
		processingTime: number
	): Promise<AIInterpretationResponse> {
		try {
			// 고도화된 시스템이 실패했을 때 레거시 시스템으로 폴백
			let fallbackPrompt: string;
			let fallbackMetadata: any = {};

			if (this.useAdvancedPrompts) {
				// 고도화된 시스템의 폴백 (간단한 설정으로)
				try {
					const promptResult = await this.promptManager.generatePrompt(
						request,
						{
							useAdvancedSystem: true,
							theme: "modern_practical",
							responseFormat: "simple_json",
							enableQualityCheck: false,
							maxTokens: 1000,
						}
					);
					fallbackPrompt = promptResult.prompt;
					fallbackMetadata = { ...promptResult.metadata, fallback: "advanced" };
				} catch {
					// 고도화된 시스템도 실패하면 레거시로
					fallbackPrompt = generateFallbackPrompt(request.sajuResult);
					fallbackMetadata = {
						system: "legacy",
						version: "1.0.0",
						fallback: "legacy",
					};
				}
			} else {
				// 레거시 시스템 폴백
				fallbackPrompt = generateFallbackPrompt(request.sajuResult);
				fallbackMetadata = {
					system: "legacy",
					version: "1.0.0",
					fallback: "legacy",
				};
			}

			// AI API 호출 (통합 시스템 또는 레거시)
			let response: string;
			let fallbackProvider = "unknown";

			if (this.useUnifiedAI) {
				// 새로운 통합 AI 시스템 사용 (폴백 모드)
				const unifiedRequest: UnifiedAIRequest = {
					prompt: fallbackPrompt,
					maxTokens: 1000, // 폴백은 더 짧게
					temperature: 0.5, // 폴백은 더 보수적으로
					metadata: {
						requestId: `saju_fallback_${Date.now()}`,
						context: {
							service: "saju-interpretation-fallback",
							isFallback: true,
						},
					},
				};

				const unifiedResponse = await aiServiceManager.generateCompletion(
					unifiedRequest
				);
				response = unifiedResponse.content;
				fallbackProvider = unifiedResponse.provider;
			} else {
				// 레거시 Google AI 시스템 사용
				response = await this.callGemini(fallbackPrompt);
				fallbackProvider = "google-legacy";
			}

			const enhancedInterpretation = parseGeminiResponse(response);

			return {
				enhancedInterpretation,
				metadata: {
					processingTime,
					model: this.useUnifiedAI
						? "unified-ai-fallback"
						: "gemini-1.5-flash-fallback",
					aiProvider: fallbackProvider,
					cached: false,
					promptSystem: fallbackMetadata.system || "unknown",
					promptVersion: fallbackMetadata.version || "1.0.0",
					promptQualityScore: fallbackMetadata.qualityScore || 50,
					promptTokens: fallbackMetadata.estimatedTokens,
					promptComplexity: fallbackMetadata.complexity || "simple",
					isFallback: true,
					fallbackType: fallbackMetadata.fallback || "unknown",
					useUnifiedAI: this.useUnifiedAI,
				},
			};
		} catch (error) {
			console.error("폴백 해석도 실패:", error);

			// 최후의 수단: 기본 해석 반환
			return this.generateBasicFallback(request.sajuResult, processingTime);
		}
	}

	/**
	 * 기본 폴백 해석 (AI 완전 실패 시)
	 */
	private generateBasicFallback(
		sajuResult: any,
		processingTime: number
	): AIInterpretationResponse {
		const interpretation = sajuResult.interpretation || {};

		return {
			enhancedInterpretation: {
				personality:
					interpretation.personality || "고유한 개성과 매력을 지닌 분이시네요.",
				strengths:
					interpretation.strengths?.join(", ") ||
					"많은 잠재력과 가능성을 가지고 계십니다.",
				challenges:
					interpretation.challenges?.join(", ") ||
					"꾸준한 노력으로 더욱 발전할 수 있을 것입니다.",
				summary:
					interpretation.summary ||
					"균형 잡힌 삶을 추구하며 지속적인 성장이 기대되는 사주입니다.",
				lifeAdvice:
					"자신만의 길을 믿고 꾸준히 나아가시면 좋은 결과가 있을 것입니다.",
				careerGuidance:
					"본인의 관심사와 재능을 살려 전문성을 기르는 것이 중요합니다.",
				relationshipTips:
					"진실하고 따뜻한 마음으로 사람들과 관계를 맺어가세요.",
			},
			metadata: {
				processingTime,
				model: "fallback",
				cached: false,
			},
		};
	}

	/**
	 * 간단한 해석 생성 (캐시용)
	 */
	async generateSimpleInterpretation(sajuResult: any): Promise<any> {
		try {
			const prompt = generateSimplePrompt(sajuResult);
			const response = await this.callGemini(prompt);
			return JSON.parse(response);
		} catch (error) {
			console.error("간단한 해석 생성 실패:", error);
			return {
				personality: "독특한 매력을 지닌 분",
				summary: "균형 잡힌 사주",
				advice: "꾸준한 노력이 중요",
			};
		}
	}
}

// 싱글톤 인스턴스 생성
export const interpretationEnhancer = new InterpretationEnhancer();
