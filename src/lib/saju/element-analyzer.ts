/**
 * 오행 분석을 담당하는 클래스
 * Single Responsibility Principle: 오행 균형 분석만 담당
 */

import { getEarthlyBranchElement, getHeavenlyStemElement } from "manseryeok";
import { FourPillars, SajuResult } from "./types";
import { ELEMENT_DESCRIPTIONS } from "./constants";

export class ElementAnalyzer {
	/**
	 * 사주 기둥으로부터 오행 균형 분석
	 */
	analyzeElements(pillars: FourPillars): SajuResult["elements"] {
		const elementCounts = this.countElements(pillars);
		const total = this.calculateTotal(elementCounts);

		return this.buildElementResult(elementCounts, total);
	}

	/**
	 * 각 오행의 개수 계산
	 */
	private countElements(pillars: FourPillars): Record<string, number> {
		const elementCounts = {
			木: 0, // 목
			火: 0, // 화
			土: 0, // 토
			金: 0, // 금
			水: 0, // 수
		};

		// 천간과 지지의 오행 계산
		Object.values(pillars).forEach((pillar) => {
			const heavenlyElement = getHeavenlyStemElement(pillar.heavenly as any);
			const earthlyElement = getEarthlyBranchElement(pillar.earthly as any);

			elementCounts[heavenlyElement as keyof typeof elementCounts]++;
			elementCounts[earthlyElement as keyof typeof elementCounts]++;
		});

		return elementCounts;
	}

	/**
	 * 전체 오행 개수 계산
	 */
	private calculateTotal(elementCounts: Record<string, number>): number {
		return Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
	}

	/**
	 * 오행 분석 결과 객체 생성
	 */
	private buildElementResult(
		elementCounts: Record<string, number>,
		total: number
	): SajuResult["elements"] {
		return {
			wood: {
				score: Math.round((elementCounts.木 / total) * 100),
				description: ELEMENT_DESCRIPTIONS.wood,
			},
			fire: {
				score: Math.round((elementCounts.火 / total) * 100),
				description: ELEMENT_DESCRIPTIONS.fire,
			},
			earth: {
				score: Math.round((elementCounts.土 / total) * 100),
				description: ELEMENT_DESCRIPTIONS.earth,
			},
			metal: {
				score: Math.round((elementCounts.金 / total) * 100),
				description: ELEMENT_DESCRIPTIONS.metal,
			},
			water: {
				score: Math.round((elementCounts.水 / total) * 100),
				description: ELEMENT_DESCRIPTIONS.water,
			},
		};
	}
}
