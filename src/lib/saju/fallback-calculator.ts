/**
 * 사주나우 폴백 사주 계산기
 * T-003: manseryeok 라이브러리 이슈 시 대안 계산 로직
 */

import { SajuInput, SajuResult } from "./types";

// 간단한 천간지지 변환 테이블
const HEAVENLY_STEMS = [
	"갑",
	"을",
	"병",
	"정",
	"무",
	"기",
	"경",
	"신",
	"임",
	"계",
];
const EARTHLY_BRANCHES = [
	"자",
	"축",
	"인",
	"묘",
	"진",
	"사",
	"오",
	"미",
	"신",
	"유",
	"술",
	"해",
];

const STEM_ELEMENTS: Record<string, string> = {
	갑: "목",
	을: "목",
	병: "화",
	정: "화",
	무: "토",
	기: "토",
	경: "금",
	신: "금",
	임: "수",
	계: "수",
};

const BRANCH_ELEMENTS: Record<string, string> = {
	인: "목",
	묘: "목",
	사: "화",
	오: "화",
	진: "토",
	술: "토",
	축: "토",
	미: "토",
	신: "금",
	유: "금",
	해: "수",
	자: "수",
};

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
		wood: { score: 20, description: "창의성과 성장력을 나타냅니다" },
		fire: { score: 25, description: "열정과 활동력을 나타냅니다" },
		earth: { score: 30, description: "안정성과 신뢰감을 나타냅니다" },
		metal: { score: 15, description: "논리성과 결단력을 나타냅니다" },
		water: { score: 10, description: "지혜와 적응력을 나타냅니다" },
	};

	// 성격 분석 (일간 기준)
	const dayElement = STEM_ELEMENTS[dayStem] || "토";

	const personalityByElement: Record<string, string[]> = {
		목: [
			"창의적이고 성장 지향적인 성격을 가지고 있습니다.",
			"새로운 아이디어를 제시하고 변화를 추구하는 경향이 있습니다.",
			"때로는 급한 성격으로 인해 세심함이 부족할 수 있습니다.",
		],
		화: [
			"열정적이고 활동적인 성격을 가지고 있습니다.",
			"리더십이 뛰어나고 사람들을 이끄는 능력이 있습니다.",
			"간혹 성급함으로 인해 실수를 할 수 있습니다.",
		],
		토: [
			"안정적이고 신뢰할 수 있는 성격입니다.",
			"차근차근 일을 처리하며 책임감이 강합니다.",
			"변화에 대한 적응이 다소 느릴 수 있습니다.",
		],
		금: [
			"논리적이고 체계적인 사고를 가지고 있습니다.",
			"결단력이 있고 목표 달성 능력이 뛰어납니다.",
			"때로는 고집이 세어 유연성이 부족할 수 있습니다.",
		],
		수: [
			"지혜롭고 적응력이 뛰어난 성격입니다.",
			"상황 파악 능력이 뛰어나고 융통성이 있습니다.",
			"때로는 우유부단하여 결정을 미룰 수 있습니다.",
		],
	};

	const strengthsByElement: Record<string, string[]> = {
		목: ["창의적 사고력", "성장 잠재력", "변화 적응력", "혁신 능력"],
		화: ["리더십", "추진력", "소통 능력", "열정"],
		토: ["안정성", "신뢰성", "인내력", "조화 능력"],
		금: ["논리력", "결단력", "체계성", "목표 달성력"],
		수: ["지혜", "적응력", "직관력", "포용력"],
	};

	const challengesByElement: Record<string, string[]> = {
		목: ["성급함", "계획성 부족", "감정 기복"],
		화: ["조급함", "고집", "에너지 소모"],
		토: ["변화 거부감", "고지식함", "느린 결정"],
		금: ["융통성 부족", "완벽주의", "관계 소홀"],
		수: ["우유부단함", "의존성", "일관성 부족"],
	};

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
			personality: personalityByElement[dayElement] || personalityByElement.토,
			strengths: strengthsByElement[dayElement] || strengthsByElement.토,
			challenges: challengesByElement[dayElement] || challengesByElement.토,
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
