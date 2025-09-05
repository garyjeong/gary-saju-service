/**
 * 개-사주 OpenAI 클라이언트 설정
 * AI 해석 서비스의 핵심 클라이언트
 */

import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
	throw new Error("OPENAI_API_KEY is required");
}

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI 응답 타입 정의
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
 * 토큰 사용량 추정
 */
export function estimateTokenUsage(request: AIInterpretationRequest): number {
	const baseTokens = 1000; // 기본 프롬프트
	const sajuTokens = JSON.stringify(request.sajuResult).length / 4; // 대략적 추정
	const profileTokens = request.userProfile ? 100 : 0;

	return Math.ceil(baseTokens + sajuTokens + profileTokens);
}
