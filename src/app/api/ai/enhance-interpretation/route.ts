/**
 * 개-사주 AI 개인화 해석 API
 * POST /api/ai/enhance-interpretation
 */

import { NextRequest, NextResponse } from "next/server";
import { interpretationEnhancer } from "@/lib/ai/interpretation-enhancer";
import {
	getCachedInterpretation,
	setCachedInterpretation,
	getCacheStats,
} from "@/lib/ai/cache-manager";
import {
	AIInterpretationRequest,
	AIServiceError,
} from "@/lib/ai/openai-client";

/**
 * AI 해석 강화 API 핸들러
 */
export async function POST(request: NextRequest) {
	try {
		// 요청 본문 파싱
		const body: AIInterpretationRequest = await request.json();

		// 기본 검증
		if (!body.sajuResult) {
			return NextResponse.json(
				{ error: "사주 결과가 필요합니다", code: "MISSING_SAJU_RESULT" },
				{ status: 400 }
			);
		}

		// 캐시 확인
		const cachedResult = getCachedInterpretation(body);
		if (cachedResult) {
			return NextResponse.json({
				success: true,
				data: cachedResult,
			});
		}

		// AI 해석 생성
		const enhancedInterpretation =
			await interpretationEnhancer.enhanceInterpretation(body);

		// 캐시에 저장
		setCachedInterpretation(body, enhancedInterpretation);

		// 성공 응답
		return NextResponse.json({
			success: true,
			data: enhancedInterpretation,
		});
	} catch (error) {
		console.error("AI 해석 API 에러:", error);

		// AI 서비스 에러 처리
		if (error instanceof AIServiceError) {
			const statusCode = getStatusCodeForError(error.code);

			return NextResponse.json(
				{
					success: false,
					error: error.message,
					code: error.code,
					details: error.details,
				},
				{ status: statusCode }
			);
		}

		// 일반 에러 처리
		return NextResponse.json(
			{
				success: false,
				error: "서버 내부 오류가 발생했습니다",
				code: "INTERNAL_SERVER_ERROR",
			},
			{ status: 500 }
		);
	}
}

/**
 * 캐시 상태 조회 API (개발용)
 */
export async function GET(request: NextRequest) {
	try {
		// 개발 환경에서만 허용
		if (process.env.NODE_ENV !== "development") {
			return NextResponse.json(
				{ error: "이 API는 개발 환경에서만 사용할 수 있습니다" },
				{ status: 403 }
			);
		}

		const stats = getCacheStats();

		return NextResponse.json({
			success: true,
			data: {
				cacheStats: stats,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("캐시 상태 조회 에러:", error);

		return NextResponse.json(
			{
				success: false,
				error: "캐시 상태를 조회할 수 없습니다",
			},
			{ status: 500 }
		);
	}
}

/**
 * OPTIONS 요청 처리 (CORS)
 */
export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

/**
 * 에러 코드에 따른 HTTP 상태 코드 매핑
 */
function getStatusCodeForError(errorCode: string): number {
	switch (errorCode) {
		case "MISSING_SAJU_RESULT":
		case "MISSING_PILLARS":
		case "MISSING_ELEMENTS":
		case "PARSE_ERROR":
			return 400; // Bad Request

		case "QUOTA_EXCEEDED":
		case "RATE_LIMITED":
			return 429; // Too Many Requests

		case "NO_RESPONSE":
		case "API_ERROR":
			return 502; // Bad Gateway

		default:
			return 500; // Internal Server Error
	}
}
