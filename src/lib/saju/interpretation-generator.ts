/**
 * 사주 해석 생성을 담당하는 클래스
 * Single Responsibility Principle: 해석 문구 생성만 담당
 */

import { getHeavenlyStemElement } from "manseryeok";
import { FourPillars, SajuResult } from "./types";
import {
	PERSONALITY_BY_ELEMENT,
	STRENGTHS_BY_ELEMENT,
	CHALLENGES_BY_ELEMENT,
	ELEMENT_KOREAN_MAP,
} from "./constants";

export class InterpretationGenerator {
	/**
	 * 사주 해석 생성
	 */
	generateInterpretation(
		pillars: FourPillars,
		elements: SajuResult["elements"]
	): SajuResult["interpretation"] {
		const dayElement = this.getDayElement(pillars.day);
		const dominantElement = this.findDominantElement(elements);

		return {
			personality: this.getPersonality(dayElement),
			strengths: this.getStrengths(dominantElement[0]),
			challenges: this.getChallenges(dominantElement[0]),
			summary: this.buildSummary(dominantElement),
		};
	}

	/**
	 * 일간의 오행 추출
	 */
	private getDayElement(dayPillar: {
		heavenly: string;
		earthly: string;
	}): string {
		return getHeavenlyStemElement(dayPillar.heavenly as any);
	}

	/**
	 * 가장 강한 오행 찾기
	 */
	private findDominantElement(
		elements: SajuResult["elements"]
	): [string, { score: number; description: string }] {
		return Object.entries(elements).reduce((max, current) =>
			current[1].score > max[1].score ? current : max
		);
	}

	/**
	 * 성격 특성 가져오기
	 */
	private getPersonality(dayElement: string): string[] {
		return PERSONALITY_BY_ELEMENT[dayElement] || PERSONALITY_BY_ELEMENT.土;
	}

	/**
	 * 강점 가져오기
	 */
	private getStrengths(dominantElementKey: string): string[] {
		return (
			STRENGTHS_BY_ELEMENT[dominantElementKey] || STRENGTHS_BY_ELEMENT.earth
		);
	}

	/**
	 * 약점 가져오기
	 */
	private getChallenges(dominantElementKey: string): string[] {
		return (
			CHALLENGES_BY_ELEMENT[dominantElementKey] || CHALLENGES_BY_ELEMENT.earth
		);
	}

	/**
	 * 요약 문구 생성
	 */
	private buildSummary(
		dominantElement: [string, { score: number; description: string }]
	): string {
		const koreanElement =
			ELEMENT_KOREAN_MAP[dominantElement[0]] || dominantElement[0];
		const description = dominantElement[1].description.replace(
			"을 나타냅니다",
			"이 특징적입니다"
		);

		return `${dominantElement[0]}(${koreanElement}) 기운이 강한 사주로, ${description}.`;
	}
}
