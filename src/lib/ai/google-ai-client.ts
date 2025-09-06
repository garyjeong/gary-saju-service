/**
 * 개-사주 Google AI (Gemini) 클라이언트 설정
 * AI 해석 서비스의 핵심 Google AI 클라이언트
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_AI_API_KEY) {
	throw new Error("GOOGLE_AI_API_KEY is required");
}

// Google AI 클라이언트 초기화
export const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * AI 응답 타입 정의 (기존과 호환)
 */
export interface AIInterpretationRequest {
	sajuResult: any;
	userProfile?: {
		age?: number;
		gender?: "male" | "female" | "other";
		interests?: string[];
		tone?: "formal" | "casual" | "poetic";
	};
}

export interface AIInterpretationResponse {
	enhancedInterpretation: {
		personality: string;
		strengths: string;
		challenges: string;
		summary: string;
		lifeAdvice: string;
		careerGuidance: string;
		relationshipTips: string;
	};
	metadata: {
		processingTime: number;
		model: string;
		cached: boolean;
	};
}

/**
 * AI 서비스 에러 처리
 */
export class AIServiceError extends Error {
	constructor(
		message: string,
		public code: string = "AI_SERVICE_ERROR",
		public details?: any
	) {
		super(message);
		this.name = "AIServiceError";
	}
}

/**
 * AI 요청 제한 및 검증
 */
export function validateAIRequest(request: AIInterpretationRequest): void {
	if (!request.sajuResult) {
		throw new AIServiceError("사주 결과가 필요합니다", "MISSING_SAJU_RESULT");
	}

	if (!request.sajuResult.pillars) {
		throw new AIServiceError("사주 기둥 정보가 필요합니다", "MISSING_PILLARS");
	}

	if (!request.sajuResult.elements) {
		throw new AIServiceError("오행 정보가 필요합니다", "MISSING_ELEMENTS");
	}
}

/**
 * Google AI 모델 가져오기
 */
export function getGeminiModel() {
	return googleAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

/**
 * 토큰 사용량 추정 (Google AI 기준)
 */
export function estimateTokenUsage(request: AIInterpretationRequest): number {
	const baseTokens = 1000; // 기본 프롬프트
	const sajuTokens = JSON.stringify(request.sajuResult).length / 4; // 대략적 추정
	const profileTokens = request.userProfile ? 100 : 0;

	return Math.ceil(baseTokens + sajuTokens + profileTokens);
}

/**
 * Google AI 응답 파싱
 */
export function parseGeminiResponse(response: string): any {
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
		console.error("Gemini 응답 파싱 실패:", error);
		throw new AIServiceError(
			"AI 응답 형식이 올바르지 않습니다",
			"PARSE_ERROR",
			{ response, error }
		);
	}
}
