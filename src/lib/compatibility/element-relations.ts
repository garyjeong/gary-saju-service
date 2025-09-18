/**
 * 오행 상생상극 관계 정의
 * 전통 사주학의 오행 이론을 기반으로 한 상성 분석
 */

import { ElementType, ElementRelation } from "./types";

// 오행별 강도 타입
export type ElementStrength = {
	wood: number;
	fire: number;
	earth: number;
	metal: number;
	water: number;
};

// 🌟 오행 상생 관계 (生)
// 목생화(木生火) → 화생토(火生土) → 토생금(土生金) → 금생수(金生水) → 수생목(水生木)
export const GENERATION_CYCLE: Record<ElementType, ElementType> = {
	wood: "fire", // 목 → 화
	fire: "earth", // 화 → 토
	earth: "metal", // 토 → 금
	metal: "water", // 금 → 수
	water: "wood", // 수 → 목
};

// 🌟 오행 상극 관계 (克)
// 목극토(木克土) → 토극수(土克水) → 수극화(水克火) → 화극금(火克金) → 금극목(金克木)
export const DESTRUCTION_CYCLE: Record<ElementType, ElementType> = {
	wood: "earth", // 목 → 토
	earth: "water", // 토 → 수
	water: "fire", // 수 → 화
	fire: "metal", // 화 → 금
	metal: "wood", // 금 → 목
};

// 🌟 오행별 특성
export const ELEMENT_CHARACTERISTICS = {
	wood: {
		name: "목(木)",
		nature: "성장, 확장, 창조",
		personality: ["창의적", "성장지향적", "유연한", "진취적"],
		season: "봄",
		direction: "동",
		color: ["녹색", "청색"],
		emotion: "분노",
		virtue: "인(仁)",
	},
	fire: {
		name: "화(火)",
		nature: "열정, 활동, 변화",
		personality: ["열정적", "활동적", "외향적", "카리스마"],
		season: "여름",
		direction: "남",
		color: ["빨간색", "주황색"],
		emotion: "기쁨",
		virtue: "예(禮)",
	},
	earth: {
		name: "토(土)",
		nature: "안정, 포용, 중재",
		personality: ["안정적", "신뢰할 수 있는", "포용력", "실용적"],
		season: "늦여름",
		direction: "중앙",
		color: ["황색", "갈색"],
		emotion: "사려",
		virtue: "신(信)",
	},
	metal: {
		name: "금(金)",
		nature: "정리, 결단, 완성",
		personality: ["논리적", "결단력", "완벽주의", "독립적"],
		season: "가을",
		direction: "서",
		color: ["흰색", "금색"],
		emotion: "슬픔",
		virtue: "의(義)",
	},
	water: {
		name: "수(水)",
		nature: "지혜, 적응, 흐름",
		personality: ["지혜로운", "적응력", "직관적", "깊이"],
		season: "겨울",
		direction: "북",
		color: ["검은색", "남색"],
		emotion: "두려움",
		virtue: "지(智)",
	},
} as const;

/**
 * 두 오행 간의 관계를 분석
 */
export function analyzeElementRelation(
	element1: ElementType,
	element2: ElementType
): ElementRelation {
	// 같은 원소인 경우
	if (element1 === element2) {
		return {
			type: "neutral",
			description: `같은 ${ELEMENT_CHARACTERISTICS[element1].name} 원소로 조화로운 관계`,
			score: 75,
		};
	}

	// 상생 관계 확인
	if (GENERATION_CYCLE[element1] === element2) {
		return {
			type: "generate",
			description: `${ELEMENT_CHARACTERISTICS[element1].name}이(가) ${ELEMENT_CHARACTERISTICS[element2].name}을(를) 생성하는 매우 좋은 관계`,
			score: 90,
		};
	}

	if (GENERATION_CYCLE[element2] === element1) {
		return {
			type: "generate",
			description: `${ELEMENT_CHARACTERISTICS[element2].name}이(가) ${ELEMENT_CHARACTERISTICS[element1].name}을(를) 생성하는 매우 좋은 관계`,
			score: 85,
		};
	}

	// 상극 관계 확인
	if (DESTRUCTION_CYCLE[element1] === element2) {
		return {
			type: "overcome",
			description: `${ELEMENT_CHARACTERISTICS[element1].name}이(가) ${ELEMENT_CHARACTERISTICS[element2].name}을(를) 극하는 주의 필요한 관계`,
			score: 25,
		};
	}

	if (DESTRUCTION_CYCLE[element2] === element1) {
		return {
			type: "overcome",
			description: `${ELEMENT_CHARACTERISTICS[element2].name}이(가) ${ELEMENT_CHARACTERISTICS[element1].name}을(를) 극하는 주의 필요한 관계`,
			score: 20,
		};
	}

	// 중성 관계 (간접적 상생상극)
	return {
		type: "neutral",
		description: `${ELEMENT_CHARACTERISTICS[element1].name}과(와) ${ELEMENT_CHARACTERISTICS[element2].name}의 평범한 관계`,
		score: 60,
	};
}

/**
 * 음양 조화 계산
 */
export function calculateYinYangHarmony(
	gender1: "male" | "female",
	gender2: "male" | "female"
): number {
	// 남성(양), 여성(음)으로 가정
	const yinYang1 = gender1 === "male" ? 1 : -1;
	const yinYang2 = gender2 === "male" ? 1 : -1;

	// 음양이 다르면 조화 점수 높음
	if (yinYang1 !== yinYang2) {
		return 90; // 음양 조화가 좋음
	} else {
		return 40; // 음양 조화가 보통 (동성이라도 관계에 따라 다를 수 있으므로 0은 아님)
	}
}

/**
 * 오행별 조화도 계산 (각 오행별로 점수 반환)
 */
export function calculateElementHarmony(
	person1Elements: Record<ElementType, number>,
	person2Elements: Record<ElementType, number>
): Record<ElementType, number> {
	const harmonyScores: Record<ElementType, number> = {
		wood: 0,
		fire: 0,
		earth: 0,
		metal: 0,
		water: 0,
	};

	const elements: ElementType[] = ["wood", "fire", "earth", "metal", "water"];

	elements.forEach((element) => {
		const p1 = person1Elements[element];
		const p2 = person2Elements[element];

		// 1. 동일 오행의 조화 (비슷한 강도일수록 좋음)
		const sameElementDiff = Math.abs(p1 - p2);
		harmonyScores[element] += Math.max(0, 50 - sameElementDiff / 2); // 차이가 클수록 점수 감소

		// 2. 상생 관계 고려
		const relation = analyzeElementRelation(element, element); // 같은 원소 관계
		harmonyScores[element] += relation.score * 0.3;

		// 점수 상한/하한 설정
		harmonyScores[element] = Math.max(0, Math.min(100, harmonyScores[element]));
	});

	return harmonyScores;
}

/**
 * 전체 오행 조화도 계산
 * 두 사람의 전체 오행 분포를 고려한 조화도
 */
export function calculateOverallElementHarmony(
	person1Elements: Record<ElementType, number>,
	person2Elements: Record<ElementType, number>
): { score: number; analysis: string[] } {
	let totalScore = 0;
	let relationCount = 0;
	const analysis: string[] = [];

	// 각 원소별 상호작용 분석
	const elements: ElementType[] = ["wood", "fire", "earth", "metal", "water"];

	for (const elem1 of elements) {
		for (const elem2 of elements) {
			if (elem1 !== elem2) {
				const person1Score = person1Elements[elem1];
				const person2Score = person2Elements[elem2];

				// 둘 다 중요한 원소인 경우만 계산 (10점 이상)
				if (person1Score >= 10 && person2Score >= 10) {
					const relation = analyzeElementRelation(elem1, elem2);
					const weight = (person1Score + person2Score) / 200; // 0~1 가중치
					const weightedScore = relation.score * weight;

					totalScore += weightedScore;
					relationCount++;

					if (relation.type === "generate" && weight > 0.3) {
						analysis.push(
							`${ELEMENT_CHARACTERISTICS[elem1].name}과 ${ELEMENT_CHARACTERISTICS[elem2].name}의 상생 관계가 강력합니다`
						);
					} else if (relation.type === "overcome" && weight > 0.3) {
						analysis.push(
							`${ELEMENT_CHARACTERISTICS[elem1].name}과 ${ELEMENT_CHARACTERISTICS[elem2].name}의 상극 관계에 주의가 필요합니다`
						);
					}
				}
			}
		}
	}

	const averageScore = relationCount > 0 ? totalScore / relationCount : 50;

	// 전체적인 균형 보너스/페널티
	const person1Balance = calculateBalance(person1Elements);
	const person2Balance = calculateBalance(person2Elements);
	const balanceBonus = (Math.min(person1Balance, person2Balance) / 100) * 10;

	const finalScore = Math.max(0, Math.min(100, averageScore + balanceBonus));

	// 분석 요약 추가
	if (finalScore >= 80) {
		analysis.unshift("오행의 조화가 매우 훌륭합니다");
	} else if (finalScore >= 60) {
		analysis.unshift("오행의 조화가 양호합니다");
	} else if (finalScore >= 40) {
		analysis.unshift("오행의 조화가 보통입니다");
	} else {
		analysis.unshift("오행의 조화에 주의가 필요합니다");
	}

	return {
		score: Math.round(finalScore),
		analysis,
	};
}

/**
 * 개인의 오행 균형도 계산
 */
function calculateBalance(elements: Record<ElementType, number>): number {
	const values = Object.values(elements);
	const average = values.reduce((sum, val) => sum + val, 0) / values.length;
	const variance =
		values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
		values.length;
	const standardDeviation = Math.sqrt(variance);

	// 표준편차가 낮을수록 균형이 좋음 (0~100 점수)
	return Math.max(0, 100 - standardDeviation * 2);
}

/**
 * 주도 원소 추출
 */
export function getDominantElement(
	elements: Record<ElementType, number>
): ElementType {
	return Object.entries(elements).reduce(
		(max, [element, score]) =>
			score > elements[max] ? (element as ElementType) : max,
		"wood" as ElementType
	);
}

/**
 * 관계 타입별 오행 가중치
 */
export const RELATIONSHIP_ELEMENT_WEIGHTS = {
	romance: {
		wood: 1.2, // 성장, 창의성 중요
		fire: 1.3, // 열정, 매력 매우 중요
		earth: 1.0, // 안정성 기본
		metal: 0.8, // 논리성 덜 중요
		water: 1.1, // 감정, 직감 중요
	},
	marriage: {
		wood: 1.0, // 성장 기본
		fire: 1.1, // 열정 중요하지만 적당히
		earth: 1.4, // 안정성 매우 중요
		metal: 1.2, // 결단력, 책임감 중요
		water: 1.1, // 지혜, 적응력 중요
	},
	business: {
		wood: 1.3, // 창의성, 성장성 매우 중요
		fire: 1.2, // 추진력, 리더십 중요
		earth: 1.1, // 신뢰성 중요
		metal: 1.4, // 논리성, 결단력 매우 중요
		water: 1.2, // 지혜, 전략적 사고 중요
	},
	friendship: {
		wood: 1.1, // 성장 함께 하기
		fire: 1.2, // 즐거움, 활동성
		earth: 1.3, // 신뢰, 포용력 중요
		metal: 0.9, // 완벽주의 덜 중요
		water: 1.1, // 깊이 있는 교감
	},
} as const;
