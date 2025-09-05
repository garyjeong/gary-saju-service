/**
 * 개-사주 AI 해석 강화 서비스
 * OpenAI를 사용한 개인화된 사주 해석 생성
 */

import {
	openai,
	AIInterpretationRequest,
	AIInterpretationResponse,
	AIServiceError,
	validateAIRequest,
} from "./openai-client";
import {
	generatePersonalizedPrompt,
	generateSimplePrompt,
	generateFallbackPrompt,
} from "./prompt-templates";

/**
 * AI 해석 강화 서비스 클래스
 */
export class InterpretationEnhancer {
	private readonly maxRetries = 3;
	private readonly timeout = 30000; // 30초

	/**
	 * 개인화된 사주 해석 생성
	 */
	async enhanceInterpretation(
		request: AIInterpretationRequest
	): Promise<AIInterpretationResponse> {
		const startTime = Date.now();

		try {
			// 요청 검증
			validateAIRequest(request);

			// AI 프롬프트 생성
			const prompt = generatePersonalizedPrompt(request);

			// OpenAI API 호출
			const aiResponse = await this.callOpenAI(prompt);

			// 응답 파싱 및 검증
			const enhancedInterpretation = this.parseAIResponse(aiResponse);

			const processingTime = Date.now() - startTime;

			return {
				enhancedInterpretation,
				metadata: {
					processingTime,
					model: "gpt-4",
					cached: false,
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
	 * OpenAI API 호출 (재시도 로직 포함)
	 */
	private async callOpenAI(prompt: string, retryCount = 0): Promise<string> {
		try {
			const completion = await openai.chat.completions.create({
				model: "gpt-4",
				messages: [
					{
						role: "system",
						content:
							"당신은 전문적인 사주 해석가입니다. 항상 JSON 형식으로만 응답하며, 건설적이고 희망적인 조언을 제공합니다.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				max_tokens: 2000,
				temperature: 0.7,
				top_p: 0.9,
				frequency_penalty: 0.1,
				presence_penalty: 0.1,
			});

			const content = completion.choices[0]?.message?.content;

			if (!content) {
				throw new AIServiceError(
					"AI로부터 응답을 받지 못했습니다",
					"NO_RESPONSE"
				);
			}

			return content;
		} catch (error: any) {
			console.error(
				`OpenAI API 호출 실패 (시도 ${retryCount + 1}/${this.maxRetries}):`,
				error
			);

			// 재시도 로직
			if (retryCount < this.maxRetries - 1) {
				const delay = Math.pow(2, retryCount) * 1000; // 지수 백오프
				await new Promise((resolve) => setTimeout(resolve, delay));
				return this.callOpenAI(prompt, retryCount + 1);
			}

			// 최대 재시도 횟수 초과시 에러 발생
			if (error.code === "insufficient_quota") {
				throw new AIServiceError(
					"API 사용량이 초과되었습니다",
					"QUOTA_EXCEEDED"
				);
			} else if (error.code === "rate_limit_exceeded") {
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

	/**
	 * AI 응답 파싱 및 검증
	 */
	private parseAIResponse(response: string): any {
		try {
			// JSON 추출 (```json 코드 블록 형태로 올 수 있음)
			let jsonString = response.trim();

			if (jsonString.includes("```json")) {
				const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
				if (match) {
					jsonString = match[1];
				}
			} else if (jsonString.includes("```")) {
				const match = jsonString.match(/```\s*([\s\S]*?)\s*```/);
				if (match) {
					jsonString = match[1];
				}
			}

			const parsed = JSON.parse(jsonString);

			// 필수 필드 검증
			const requiredFields = [
				"personality",
				"strengths",
				"challenges",
				"summary",
			];
			for (const field of requiredFields) {
				if (
					!parsed[field] ||
					typeof parsed[field] !== "string" ||
					parsed[field].trim().length === 0
				) {
					throw new Error(`필수 필드 누락: ${field}`);
				}
			}

			// 옵셔널 필드 기본값 설정
			return {
				personality: parsed.personality.trim(),
				strengths: parsed.strengths.trim(),
				challenges: parsed.challenges.trim(),
				summary: parsed.summary.trim(),
				lifeAdvice:
					parsed.lifeAdvice?.trim() ||
					"매일 조금씩 성장하는 자신을 믿고 나아가세요.",
				careerGuidance:
					parsed.careerGuidance?.trim() ||
					"본인의 강점을 살려 꾸준히 발전시켜 나가세요.",
				relationshipTips:
					parsed.relationshipTips?.trim() ||
					"진실한 마음으로 사람들과 소통하며 좋은 관계를 유지하세요.",
			};
		} catch (error) {
			console.error("AI 응답 파싱 실패:", error);
			throw new AIServiceError(
				"AI 응답 형식이 올바르지 않습니다",
				"PARSE_ERROR",
				{ response, error }
			);
		}
	}

	/**
	 * 폴백 해석 생성 (AI 실패 시)
	 */
	private async generateFallbackInterpretation(
		request: AIInterpretationRequest,
		processingTime: number
	): Promise<AIInterpretationResponse> {
		try {
			// 간단한 프롬프트로 재시도
			const fallbackPrompt = generateFallbackPrompt(request.sajuResult);
			const response = await this.callOpenAI(fallbackPrompt);

			const enhancedInterpretation = this.parseAIResponse(response);

			return {
				enhancedInterpretation,
				metadata: {
					processingTime,
					model: "gpt-4-fallback",
					cached: false,
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
			const response = await this.callOpenAI(prompt);
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
