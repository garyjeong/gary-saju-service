/**
 * 개-사주 AI 해석 훅
 * AI 개인화 해석 기능을 위한 React Hook
 */

"use client";

import { useState, useCallback } from "react";
import {
	AIInterpretationRequest,
	AIInterpretationResponse,
} from "@/lib/ai/openai-client";

/**
 * AI 해석 상태 타입
 */
interface AIInterpretationState {
	data: AIInterpretationResponse | null;
	isLoading: boolean;
	error: string | null;
	isEnhanced: boolean;
}

/**
 * 사용자 프로필 타입 (간소화)
 */
export interface UserProfile {
	age?: number;
	gender?: "male" | "female" | "other";
	interests?: (
		| "career"
		| "love"
		| "health"
		| "money"
		| "family"
		| "growth"
		| "creativity"
	)[];
	tone?: "formal" | "casual" | "poetic";
}

/**
 * AI 해석 훅
 */
export function useAIInterpretation() {
	const [state, setState] = useState<AIInterpretationState>({
		data: null,
		isLoading: false,
		error: null,
		isEnhanced: false,
	});

	/**
	 * AI 해석 강화 요청
	 */
	const enhanceInterpretation = useCallback(
		async (sajuResult: any, userProfile?: UserProfile) => {
			setState((prev) => ({
				...prev,
				isLoading: true,
				error: null,
			}));

			try {
				const request: AIInterpretationRequest = {
					sajuResult,
					userProfile,
				};

				const response = await fetch("/api/ai/enhance-interpretation", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(request),
				});

				const result = await response.json();

				if (!response.ok || !result.success) {
					throw new Error(result.error || "해석 생성에 실패했습니다");
				}

				setState({
					data: result.data,
					isLoading: false,
					error: null,
					isEnhanced: true,
				});

				return result.data;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "알 수 없는 오류가 발생했습니다";

				setState((prev) => ({
					...prev,
					isLoading: false,
					error: errorMessage,
				}));

				console.error("AI 해석 요청 실패:", error);
				throw error;
			}
		},
		[]
	);

	/**
	 * 상태 초기화
	 */
	const reset = useCallback(() => {
		setState({
			data: null,
			isLoading: false,
			error: null,
			isEnhanced: false,
		});
	}, []);

	/**
	 * 기본 해석과 AI 해석 병합
	 */
	const getMergedInterpretation = useCallback(
		(basicInterpretation: any) => {
			if (!state.data?.enhancedInterpretation) {
				return basicInterpretation;
			}

			const enhanced = state.data.enhancedInterpretation;

			return {
				...basicInterpretation,
				personality: enhanced.personality,
				strengths: enhanced.strengths,
				challenges: enhanced.challenges,
				summary: enhanced.summary,
				// AI 전용 필드들
				lifeAdvice: enhanced.lifeAdvice,
				careerGuidance: enhanced.careerGuidance,
				relationshipTips: enhanced.relationshipTips,
				// 메타데이터
				isAIEnhanced: true,
				aiMetadata: state.data.metadata,
			};
		},
		[state.data]
	);

	return {
		// 상태
		...state,

		// 액션
		enhanceInterpretation,
		reset,
		getMergedInterpretation,

		// 컴퓨티드 값
		processingTime: state.data?.metadata.processingTime,
		isCached: state.data?.metadata.cached,
		aiModel: state.data?.metadata.model,
	};
}

/**
 * AI 해석 요청 가능 여부 확인
 */
export function useAIAvailability() {
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
	const [isChecking, setIsChecking] = useState(false);

	const checkAvailability = useCallback(async () => {
		setIsChecking(true);

		try {
			// 간단한 헬스체크 요청
			const response = await fetch("/api/ai/enhance-interpretation", {
				method: "OPTIONS",
			});

			setIsAvailable(response.ok);
		} catch (error) {
			setIsAvailable(false);
		} finally {
			setIsChecking(false);
		}
	}, []);

	return {
		isAvailable,
		isChecking,
		checkAvailability,
	};
}

/**
 * AI 해석 옵션 관리 훅
 */
export function useAIPreferences() {
	const [preferences, setPreferences] = useState<UserProfile>({
		tone: "casual",
		interests: ["career", "love"],
	});

	const updatePreferences = useCallback((updates: Partial<UserProfile>) => {
		setPreferences((prev) => ({
			...prev,
			...updates,
		}));
	}, []);

	const resetPreferences = useCallback(() => {
		setPreferences({
			tone: "casual",
			interests: ["career", "love"],
		});
	}, []);

	return {
		preferences,
		updatePreferences,
		resetPreferences,
	};
}
