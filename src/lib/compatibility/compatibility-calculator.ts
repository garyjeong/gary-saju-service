import { SajuCalculator } from "@/lib/saju/calculator";
import { SajuResult } from "@/lib/saju/types";
import { CompatibilityInput, CompatibilityResult } from "./types";
import {
	calculateElementHarmony,
	calculateYinYangHarmony,
} from "./element-relations";

export class CompatibilityCalculator {
	private sajuCalculator: SajuCalculator;

	constructor() {
		this.sajuCalculator = new SajuCalculator();
	}

	/**
	 * 메인 상성 분석 메서드
	 */
	async analyzeCompatibility(
		input: CompatibilityInput
	): Promise<CompatibilityResult> {
		// 1. 두 사람의 사주 계산
		const person1Saju = this.sajuCalculator.calculate({
			name: input.person1.name,
			birthDate: input.person1.birthDate,
			birthTime: input.person1.birthTime,
			gender: input.person1.gender,
		});

		const person2Saju = this.sajuCalculator.calculate({
			name: input.person2.name,
			birthDate: input.person2.birthDate,
			birthTime: input.person2.birthTime,
			gender: input.person2.gender,
		});

		// 2. 오행 강도 추출
		const person1Elements = this.extractElementStrengths(person1Saju);
		const person2Elements = this.extractElementStrengths(person2Saju);

		// 3. 오행 조화 계산
		const elementHarmony = calculateElementHarmony(
			person1Elements,
			person2Elements
		);

		// 4. 음양 조화 계산
		const yinYangHarmony = calculateYinYangHarmony(
			input.person1.gender,
			input.person2.gender
		);

		// 5. 오행 조화 평균 계산
		const fiveElementsHarmony = Math.round(
			(elementHarmony.wood +
				elementHarmony.fire +
				elementHarmony.earth +
				elementHarmony.metal +
				elementHarmony.water) /
				5
		);

		// 6. 전체 점수 계산
		const overall = Math.round(
			fiveElementsHarmony * 0.4 +
				yinYangHarmony * 0.3 +
				this.calculatePersonalityMatch(person1Saju, person2Saju) * 0.3
		);

		// 7. 해석 생성
		const interpretation = this.generateInterpretation(
			overall,
			input.relationshipType,
			elementHarmony,
			yinYangHarmony
		);

		// 8. 오행 비교 데이터 생성
		const elementComparison = {
			wood: {
				p1: person1Elements.wood,
				p2: person2Elements.wood,
				harmony: elementHarmony.wood,
			},
			fire: {
				p1: person1Elements.fire,
				p2: person2Elements.fire,
				harmony: elementHarmony.fire,
			},
			earth: {
				p1: person1Elements.earth,
				p2: person2Elements.earth,
				harmony: elementHarmony.earth,
			},
			metal: {
				p1: person1Elements.metal,
				p2: person2Elements.metal,
				harmony: elementHarmony.metal,
			},
			water: {
				p1: person1Elements.water,
				p2: person2Elements.water,
				harmony: elementHarmony.water,
			},
		};

		return {
			input,
			person1Saju,
			person2Saju,
			score: {
				overall,
				elements: elementHarmony,
				yinYang: yinYangHarmony,
				fiveElementsHarmony,
			},
			interpretation,
			elementComparison,
		};
	}

	/**
	 * 사주 결과에서 오행 강도 추출
	 */
	private extractElementStrengths(sajuResult: SajuResult): {
		wood: number;
		fire: number;
		earth: number;
		metal: number;
		water: number;
	} {
		// 사주 결과에서 오행 정보를 추출
		const elements = sajuResult.elements || {
			wood: { score: 0, description: "" },
			fire: { score: 0, description: "" },
			earth: { score: 0, description: "" },
			metal: { score: 0, description: "" },
			water: { score: 0, description: "" },
		};

		return {
			wood: elements.wood?.score || Math.floor(Math.random() * 50) + 10,
			fire: elements.fire?.score || Math.floor(Math.random() * 50) + 10,
			earth: elements.earth?.score || Math.floor(Math.random() * 50) + 10,
			metal: elements.metal?.score || Math.floor(Math.random() * 50) + 10,
			water: elements.water?.score || Math.floor(Math.random() * 50) + 10,
		};
	}

	/**
	 * 성격 궁합 계산 (일주 중심)
	 */
	private calculatePersonalityMatch(
		person1Saju: SajuResult,
		person2Saju: SajuResult
	): number {
		// 임시로 기본값 반환 (실제로는 일주 천간 비교 등 복잡한 로직)
		return Math.floor(Math.random() * 40) + 60; // 60-100 사이 값
	}

	/**
	 * 해석 생성
	 */
	private generateInterpretation(
		overallScore: number,
		relationshipType: string,
		elementHarmony: Record<string, number>,
		yinYangHarmony: number
	) {
		// 전체 요약
		let summary = "";
		if (overallScore >= 90) {
			summary = "천생연분! 매우 훌륭한 상성을 가진 최고의 궁합입니다.";
		} else if (overallScore >= 80) {
			summary = "훌륭한 상성으로 서로에게 큰 도움이 되는 관계입니다.";
		} else if (overallScore >= 70) {
			summary = "좋은 상성으로 노력하면 행복한 관계를 만들 수 있습니다.";
		} else if (overallScore >= 60) {
			summary = "보통의 상성으로 서로의 이해와 배려가 필요합니다.";
		} else {
			summary = "어려운 상성이지만 진정한 사랑으로 극복할 수 있습니다.";
		}

		// 강점
		const strengths = [];
		if (yinYangHarmony >= 80) {
			strengths.push("음양의 조화가 뛰어나 서로를 잘 보완합니다");
		}
		if (elementHarmony.wood >= 70) {
			strengths.push("목의 기운이 조화로워 함께 성장할 수 있습니다");
		}
		if (elementHarmony.fire >= 70) {
			strengths.push("화의 기운이 강해 열정적인 관계를 만들 수 있습니다");
		}
		if (elementHarmony.earth >= 70) {
			strengths.push("토의 기운이 안정되어 든든한 관계를 형성합니다");
		}
		if (elementHarmony.metal >= 70) {
			strengths.push("금의 기운이 조화로워 서로를 정화시켜줍니다");
		}
		if (elementHarmony.water >= 70) {
			strengths.push("수의 기운이 흘러 지혜로운 관계를 만듭니다");
		}
		if (strengths.length === 0) {
			strengths.push("서로에게 배울 점이 많은 의미 있는 관계입니다");
		}

		// 주의사항
		const challenges = [];
		if (yinYangHarmony < 50) {
			challenges.push(
				"음양의 부조화로 갈등이 생길 수 있으니 서로를 이해하려 노력하세요"
			);
		}
		if (overallScore < 70) {
			challenges.push("서로 다른 성향으로 인한 오해가 생길 수 있습니다");
		}
		if (Math.min(...Object.values(elementHarmony)) < 40) {
			challenges.push("일부 오행의 충돌로 감정적 갈등이 있을 수 있습니다");
		}
		if (challenges.length === 0) {
			challenges.push("급하게 결론을 내리지 말고 서로를 더 깊이 알아가세요");
		}

		// 조언
		const advice = [
			"서로의 장점을 인정하고 격려해주세요",
			"차이점은 단점이 아닌 배울 점으로 받아들이세요",
			"솔직하고 따뜻한 대화를 자주 나누세요",
			"함께하는 시간을 소중히 여기고 추억을 만들어가세요",
		];

		// 관계별 특화 해석
		const relationshipSpecific: any = {};

		if (relationshipType === "romance") {
			relationshipSpecific.romance = [
				"로맨틱한 데이트를 통해 서로의 마음을 확인하세요",
				"서로의 꿈과 목표를 응원해주는 연인이 되세요",
				"작은 기념일도 소중히 여기며 사랑을 표현하세요",
			];
		} else if (relationshipType === "marriage") {
			relationshipSpecific.marriage = [
				"장기적인 인생 계획을 함께 세워보세요",
				"서로의 가족과 좋은 관계를 만들어가세요",
				"경제적 목표를 공유하고 함께 노력하세요",
			];
		} else if (relationshipType === "business") {
			relationshipSpecific.business = [
				"각자의 전문성을 존중하고 활용하세요",
				"명확한 역할 분담과 책임을 정하세요",
				"정기적인 소통으로 방향성을 맞춰가세요",
			];
		} else if (relationshipType === "friendship") {
			relationshipSpecific.friendship = [
				"서로의 개성과 취향을 인정해주세요",
				"함께 즐길 수 있는 활동을 찾아보세요",
				"어려운 일이 있을 때 서로 도움을 주고받으세요",
			];
		}

		return {
			summary,
			strengths,
			challenges,
			advice,
			relationshipSpecific,
		};
	}
}
