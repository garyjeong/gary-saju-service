/**
 * 상성 분석 시스템 타입 정의
 * 두 사람의 사주팔자 비교 분석을 위한 TypeScript 타입
 */

import { SajuInput, SajuResult } from "@/lib/saju/types";

// 관계 타입 정의
export type RelationshipType =
	| "romance"
	| "marriage"
	| "business"
	| "friendship";

// 오행 원소 타입
export type ElementType = "wood" | "fire" | "earth" | "metal" | "water";

// 오행 상생상극 관계
export interface ElementRelation {
	type: "generate" | "overcome" | "neutral";
	description: string;
	score: number; // -100 ~ 100
}

// 두 사람의 사주 입력 (앱에서 사용하는 간단한 형태)
export interface CompatibilityInput {
	person1: {
		name: string;
		birthDate: string; // YYYY-MM-DD
		birthTime: string; // HH:mm
		gender: "male" | "female";
	};
	person2: {
		name: string;
		birthDate: string; // YYYY-MM-DD
		birthTime: string; // HH:mm
		gender: "male" | "female";
	};
	relationshipType: RelationshipType;
}

// 내부 계산용 상세 입력 (기존 형태 유지)
export interface DetailedCompatibilityInput {
	person1: {
		sajuInput: SajuInput;
		sajuResult: SajuResult;
	};
	person2: {
		sajuInput: SajuInput;
		sajuResult: SajuResult;
	};
	relationshipType: RelationshipType;
}

// 궁합 점수 상세 정보
export interface CompatibilityScore {
	overall: number; // 0-100 전체 궁합 점수
	breakdown: {
		elementHarmony: number; // 오행 조화도
		personalityMatch: number; // 성격 궁합
		lifeGoalAlignment: number; // 인생 목표 일치도
		communicationStyle: number; // 소통 방식 궁합
		energyBalance: number; // 에너지 균형
	};
}

// 관계별 상세 분석
export interface RelationshipAnalysis {
	type: RelationshipType;
	strengths: string[]; // 강점
	challenges: string[]; // 주의사항
	advice: string[]; // 조언
	compatibility: {
		romantic?: {
			attraction: number; // 매력도
			emotional: number; // 감정적 궁합
			physical: number; // 신체적 궁합
		};
		marital?: {
			longTermStability: number; // 장기 안정성
			familyHarmony: number; // 가족 화목
			wealthBuilding: number; // 재물 궁합
		};
		business?: {
			workSynergy: number; // 업무 시너지
			decisionMaking: number; // 의사결정 궁합
			riskTolerance: number; // 위험 감수성
		};
		friendship?: {
			trust: number; // 신뢰도
			fun: number; // 재미 요소
			support: number; // 상호 지원
		};
	};
}

// 오행 비교 분석
export interface ElementCompatibility {
	person1Dominant: ElementType;
	person2Dominant: ElementType;
	relation: ElementRelation;
	harmony: number; // 0-100 조화도
	details: {
		[key in ElementType]: {
			person1Score: number;
			person2Score: number;
			interaction: "synergy" | "conflict" | "neutral";
			description: string;
		};
	};
}

// 사주 기둥별 비교
export interface PillarCompatibility {
	year: {
		// 년주 - 가문, 뿌리
		compatibility: number;
		description: string;
		significance: "high" | "medium" | "low";
	};
	month: {
		// 월주 - 직업, 사회성
		compatibility: number;
		description: string;
		significance: "high" | "medium" | "low";
	};
	day: {
		// 일주 - 본성, 배우자궁
		compatibility: number;
		description: string;
		significance: "high" | "medium" | "low";
	};
	time: {
		// 시주 - 자녀, 미래
		compatibility: number;
		description: string;
		significance: "high" | "medium" | "low";
	};
}

// 최종 상성 분석 결과
export interface CompatibilityResult {
	input: CompatibilityInput;
	person1Saju: SajuResult; // 첫 번째 사람의 사주 결과
	person2Saju: SajuResult; // 두 번째 사람의 사주 결과
	score: {
		overall: number; // 0-100
		elements: {
			wood: number;
			fire: number;
			earth: number;
			metal: number;
			water: number;
		};
		yinYang: number; // 음양 조화
		fiveElementsHarmony: number; // 오행 조화
	};
	interpretation: {
		summary: string;
		strengths: string[];
		challenges: string[];
		advice: string[];
		relationshipSpecific: {
			romance?: string[];
			marriage?: string[];
			business?: string[];
			friendship?: string[];
		};
	};
	elementComparison: {
		wood: { p1: number; p2: number; harmony: number };
		fire: { p1: number; p2: number; harmony: number };
		earth: { p1: number; p2: number; harmony: number };
		metal: { p1: number; p2: number; harmony: number };
		water: { p1: number; p2: number; harmony: number };
	};
}

// 상성 분석 옵션
export interface CompatibilityOptions {
	relationshipType: RelationshipType;
	includeAdvancedAnalysis?: boolean; // 고급 분석 포함 여부
	includeFutureGuidance?: boolean; // 미래 가이드 포함 여부
	customWeights?: {
		// 가중치 커스터마이징
		elementHarmony?: number;
		personalityMatch?: number;
		lifeGoalAlignment?: number;
		communicationStyle?: number;
		energyBalance?: number;
	};
}

// 검증 결과
export interface CompatibilityValidationResult {
	isValid: boolean;
	errors: string[];
	warnings?: string[];
}
