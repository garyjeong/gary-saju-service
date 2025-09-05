/**
 * 개-사주 폴백 사주 계산기
 * T-003: manseryeok 라이브러리 이슈 시 대안 계산 로직
 * Refactored with shared constants
 */

import { SajuInput, SajuResult } from "./types";
import {
	HEAVENLY_STEMS,
	EARTHLY_BRANCHES,
	STEM_ELEMENTS,
	BRANCH_ELEMENTS,
	PERSONALITY_BY_ELEMENT,
	STRENGTHS_BY_ELEMENT,
	CHALLENGES_BY_ELEMENT,
	ELEMENT_DESCRIPTIONS,
} from "./constants";

/**
 * 폴백 사주 계산 함수 (간단한 로직)
 */
export function calculateSajuFallback(input: SajuInput): SajuResult {
	const birthYear = parseInt(input.birthDate.split("-")[0]);
	const birthMonth = parseInt(input.birthDate.split("-")[1]);
	const birthDay = parseInt(input.birthDate.split("-")[2]);
	const birthHour = parseInt(input.birthTime.split(":")[0]);

	// 간단한 계산으로 천간지지 구하기 (실제 역법과는 다름)
	const yearStem = HEAVENLY_STEMS[(birthYear - 4) % 10];
	const yearBranch = EARTHLY_BRANCHES[(birthYear - 4) % 12];

	const monthStem = HEAVENLY_STEMS[(birthMonth - 1) % 10];
	const monthBranch = EARTHLY_BRANCHES[(birthMonth + 1) % 12];

	const dayStem = HEAVENLY_STEMS[(birthDay - 1) % 10];
	const dayBranch = EARTHLY_BRANCHES[(birthDay - 1) % 12];

	const timeStem = HEAVENLY_STEMS[birthHour % 10];
	const timeBranch = EARTHLY_BRANCHES[Math.floor(birthHour / 2)];

	// 오행 분석 (간단화)
	const elements = {
		wood: { score: 20, description: ELEMENT_DESCRIPTIONS.wood },
		fire: { score: 25, description: ELEMENT_DESCRIPTIONS.fire },
		earth: { score: 30, description: ELEMENT_DESCRIPTIONS.earth },
		metal: { score: 15, description: ELEMENT_DESCRIPTIONS.metal },
		water: { score: 10, description: ELEMENT_DESCRIPTIONS.water },
	};

	// 성격 분석 (일간 기준)
	const dayElement = STEM_ELEMENTS[dayStem] || "토";

	return {
		basic: {
			name: input.name,
			birthInfo: {
				year: `${yearStem}${yearBranch}년 (${yearStem}${yearBranch})`,
				month: `${monthStem}${monthBranch}월 (${monthStem}${monthBranch})`,
				day: `${dayStem}${dayBranch}일 (${dayStem}${dayBranch})`,
				time: `${timeStem}${timeBranch}시 (${timeStem}${timeBranch})`,
			},
			pillars: {
				year: {
					heavenly: yearStem,
					earthly: yearBranch,
					element: STEM_ELEMENTS[yearStem] || "토",
					ganJi: `${yearStem}${yearBranch}`,
				},
				month: {
					heavenly: monthStem,
					earthly: monthBranch,
					element: STEM_ELEMENTS[monthStem] || "토",
					ganJi: `${monthStem}${monthBranch}`,
				},
				day: {
					heavenly: dayStem,
					earthly: dayBranch,
					element: STEM_ELEMENTS[dayStem] || "토",
					ganJi: `${dayStem}${dayBranch}`,
				},
				time: {
					heavenly: timeStem,
					earthly: timeBranch,
					element: STEM_ELEMENTS[timeStem] || "토",
					ganJi: `${timeStem}${timeBranch}`,
				},
			},
		},
		elements,
		interpretation: {
			personality:
				PERSONALITY_BY_ELEMENT[dayElement] || PERSONALITY_BY_ELEMENT.토,
			strengths: STRENGTHS_BY_ELEMENT[dayElement] || STRENGTHS_BY_ELEMENT.토,
			challenges: CHALLENGES_BY_ELEMENT[dayElement] || CHALLENGES_BY_ELEMENT.토,
			summary: `${dayElement} 기운이 강한 사주로, ${
				dayElement === "목"
					? "창의성과 성장력"
					: dayElement === "화"
					? "열정과 활동력"
					: dayElement === "토"
					? "안정성과 신뢰감"
					: dayElement === "금"
					? "논리성과 결단력"
					: "지혜와 적응력"
			}이 특징적입니다.`,
		},
		compatibility: {
			favorable: ["정유일", "무인일", "경술일"],
			unfavorable: ["신묘일", "임신일"],
		},
	};
}
