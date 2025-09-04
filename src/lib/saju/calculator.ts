/**
 * 사주나우 사주 계산 엔진
 * T-003: manseryeok 라이브러리를 사용한 실제 사주 계산 로직
 */

import {
	calculateFourPillars,
	fourPillarsToString,
	getEarthlyBranchElement,
	getHeavenlyStemElement,
	HEAVENLY_STEMS_HANJA,
	EARTHLY_BRANCHES_HANJA,
	FIVE_ELEMENTS,
} from "manseryeok";
import {
	SajuInput,
	SajuResult,
	FourPillars,
	PillarInfo,
	ValidationResult,
} from "./types";
import { calculateSajuFallback } from "./fallback-calculator";

/**
 * 사주 입력 데이터 검증
 */
export function validateSajuInput(input: SajuInput): ValidationResult {
	const errors: string[] = [];

	// 이름 검증
	if (!input.name || input.name.trim().length === 0) {
		errors.push("이름을 입력해주세요.");
	}

	// 생년월일 검증 (YYYY-MM-DD)
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!input.birthDate || !dateRegex.test(input.birthDate)) {
		errors.push("올바른 생년월일 형식(YYYY-MM-DD)을 입력해주세요.");
	} else {
		const date = new Date(input.birthDate);
		const today = new Date();
		if (date > today) {
			errors.push("미래 날짜는 입력할 수 없습니다.");
		}
		if (date.getFullYear() < 1900) {
			errors.push("1900년 이후 날짜를 입력해주세요.");
		}
	}

	// 출생시간 검증 (HH:mm)
	const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
	if (!input.birthTime || !timeRegex.test(input.birthTime)) {
		errors.push("올바른 시간 형식(HH:mm)을 입력해주세요.");
	}

	// 성별 검증
	if (!input.gender || !["male", "female"].includes(input.gender)) {
		errors.push("성별을 선택해주세요.");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * 생년월일과 시간을 Date 객체로 변환
 */
function createBirthDateTime(birthDate: string, birthTime: string): Date {
	const [year, month, day] = birthDate.split("-").map(Number);
	const [hour, minute] = birthTime.split(":").map(Number);

	return new Date(year, month - 1, day, hour, minute);
}

/**
 * 기둥 정보를 PillarInfo 타입으로 변환
 */
function convertToPillarInfo(heavenly: string, earthly: string): PillarInfo {
	const heavenlyElement = getHeavenlyStemElement(heavenly);
	const earthlyElement = getEarthlyBranchElement(earthly);

	return {
		heavenly,
		earthly,
		element: heavenlyElement,
		ganJi: `${heavenly}${earthly}`,
	};
}

/**
 * 오행 균형 분석
 */
function analyzeElements(pillars: FourPillars): SajuResult["elements"] {
	const elementCounts = {
		木: 0, // 목
		火: 0, // 화
		土: 0, // 토
		金: 0, // 금
		水: 0, // 수
	};

	// 천간과 지지의 오행 계산
	Object.values(pillars).forEach((pillar) => {
		const heavenlyElement = getHeavenlyStemElement(pillar.heavenly);
		const earthlyElement = getEarthlyBranchElement(pillar.earthly);

		elementCounts[heavenlyElement as keyof typeof elementCounts]++;
		elementCounts[earthlyElement as keyof typeof elementCounts]++;
	});

	const total = Object.values(elementCounts).reduce(
		(sum, count) => sum + count,
		0
	);

	return {
		wood: {
			score: Math.round((elementCounts.木 / total) * 100),
			description: "창의성과 성장력을 나타냅니다",
		},
		fire: {
			score: Math.round((elementCounts.火 / total) * 100),
			description: "열정과 활동력을 나타냅니다",
		},
		earth: {
			score: Math.round((elementCounts.土 / total) * 100),
			description: "안정성과 신뢰감을 나타냅니다",
		},
		metal: {
			score: Math.round((elementCounts.金 / total) * 100),
			description: "논리성과 결단력을 나타냅니다",
		},
		water: {
			score: Math.round((elementCounts.水 / total) * 100),
			description: "지혜와 적응력을 나타냅니다",
		},
	};
}

/**
 * 초보자용 해석 생성
 */
function generateInterpretation(
	pillars: FourPillars,
	elements: SajuResult["elements"]
): SajuResult["interpretation"] {
	const dayPillar = pillars.day;
	const dayElement = getHeavenlyStemElement(dayPillar.heavenly);

	// 일간(日干) 기준 기본 성격 분석
	const personalityByElement: Record<string, string[]> = {
		木: [
			"창의적이고 성장 지향적인 성격을 가지고 있습니다.",
			"새로운 아이디어를 제시하고 변화를 추구하는 경향이 있습니다.",
			"때로는 급한 성격으로 인해 세심함이 부족할 수 있습니다.",
		],
		火: [
			"열정적이고 활동적인 성격을 가지고 있습니다.",
			"리더십이 뛰어나고 사람들을 이끄는 능력이 있습니다.",
			"간혹 성급함으로 인해 실수를 할 수 있습니다.",
		],
		土: [
			"안정적이고 신뢰할 수 있는 성격입니다.",
			"차근차근 일을 처리하며 책임감이 강합니다.",
			"변화에 대한 적응이 다소 느릴 수 있습니다.",
		],
		金: [
			"논리적이고 체계적인 사고를 가지고 있습니다.",
			"결단력이 있고 목표 달성 능력이 뛰어납니다.",
			"때로는 고집이 세어 유연성이 부족할 수 있습니다.",
		],
		水: [
			"지혜롭고 적응력이 뛰어난 성격입니다.",
			"상황 파악 능력이 뛰어나고 융통성이 있습니다.",
			"때로는 우유부단하여 결정을 미룰 수 있습니다.",
		],
	};

	// 주요 오행에 따른 강점과 약점
	const dominantElement = Object.entries(elements).reduce((max, current) =>
		current[1].score > max[1].score ? current : max
	);

	const strengthsByElement: Record<string, string[]> = {
		wood: ["창의적 사고력", "성장 잠재력", "변화 적응력", "혁신 능력"],
		fire: ["리더십", "추진력", "소통 능력", "열정"],
		earth: ["안정성", "신뢰성", "인내력", "조화 능력"],
		metal: ["논리력", "결단력", "체계성", "목표 달성력"],
		water: ["지혜", "적응력", "직관력", "포용력"],
	};

	const challengesByElement: Record<string, string[]> = {
		wood: ["성급함", "계획성 부족", "감정 기복"],
		fire: ["조급함", "고집", "에너지 소모"],
		earth: ["변화 거부감", "고지식함", "느린 결정"],
		metal: ["융통성 부족", "완벽주의", "관계 소홀"],
		water: ["우유부단함", "의존성", "일관성 부족"],
	};

	return {
		personality: personalityByElement[dayElement] || personalityByElement.土,
		strengths:
			strengthsByElement[dominantElement[0]] || strengthsByElement.earth,
		challenges:
			challengesByElement[dominantElement[0]] || challengesByElement.earth,
		summary: `${dominantElement[0]}(${
			dominantElement[0] === "wood"
				? "목"
				: dominantElement[0] === "fire"
				? "화"
				: dominantElement[0] === "earth"
				? "토"
				: dominantElement[0] === "metal"
				? "금"
				: "수"
		}) 기운이 강한 사주로, ${dominantElement[1].description.replace(
			"을 나타냅니다",
			"이 특징적입니다"
		)}.`,
	};
}

/**
 * 메인 사주 계산 함수
 */
export function calculateSaju(input: SajuInput): SajuResult {
	// 입력 검증
	const validation = validateSajuInput(input);
	if (!validation.isValid) {
		throw new Error(`입력 데이터 오류: ${validation.errors.join(", ")}`);
	}

	try {
		// 생년월일시를 Date 객체로 변환
		const birthDateTime = createBirthDateTime(input.birthDate, input.birthTime);

		// manseryeok으로 사주 계산 시도
		let fourPillars: any;
		try {
			fourPillars = calculateFourPillars(birthDateTime);

			// manseryeok 결과가 유효한지 확인
			if (
				!fourPillars ||
				!fourPillars.year?.heavenlyStem ||
				!fourPillars.year?.earthlyBranch
			) {
				throw new Error("manseryeok 결과가 유효하지 않음");
			}
		} catch (manseryeokError) {
			console.warn(
				"manseryeok 라이브러리 오류, 폴백 계산 사용:",
				manseryeokError
			);
			// 폴백 계산 사용
			return calculateSajuFallback(input);
		}

		// manseryeok 결과를 우리 형식으로 변환
		const convertedPillars: FourPillars = {
			year: {
				heavenly: fourPillars.year.heavenlyStem || "갑",
				earthly: fourPillars.year.earthlyBranch || "자",
			},
			month: {
				heavenly: fourPillars.month.heavenlyStem || "갑",
				earthly: fourPillars.month.earthlyBranch || "자",
			},
			day: {
				heavenly: fourPillars.day.heavenlyStem || "갑",
				earthly: fourPillars.day.earthlyBranch || "자",
			},
			time: {
				heavenly: fourPillars.hour.heavenlyStem || "갑",
				earthly: fourPillars.hour.earthlyBranch || "자",
			},
		};

		// 오행 분석
		const elements = analyzeElements(convertedPillars);

		// 해석 생성
		const interpretation = generateInterpretation(convertedPillars, elements);

		// 결과 반환
		return {
			basic: {
				name: input.name,
				birthInfo: {
					year: `${convertedPillars.year.heavenly}${convertedPillars.year.earthly}년 (${convertedPillars.year.heavenly}${convertedPillars.year.earthly})`,
					month: `${convertedPillars.month.heavenly}${convertedPillars.month.earthly}월 (${convertedPillars.month.heavenly}${convertedPillars.month.earthly})`,
					day: `${convertedPillars.day.heavenly}${convertedPillars.day.earthly}일 (${convertedPillars.day.heavenly}${convertedPillars.day.earthly})`,
					time: `${convertedPillars.time.heavenly}${convertedPillars.time.earthly}시 (${convertedPillars.time.heavenly}${convertedPillars.time.earthly})`,
				},
				pillars: {
					year: convertToPillarInfo(
						convertedPillars.year.heavenly,
						convertedPillars.year.earthly
					),
					month: convertToPillarInfo(
						convertedPillars.month.heavenly,
						convertedPillars.month.earthly
					),
					day: convertToPillarInfo(
						convertedPillars.day.heavenly,
						convertedPillars.day.earthly
					),
					time: convertToPillarInfo(
						convertedPillars.time.heavenly,
						convertedPillars.time.earthly
					),
				},
			},
			elements,
			interpretation,
			compatibility: {
				favorable: ["정유일", "무인일", "경술일"], // 실제 계산 로직 추후 구현
				unfavorable: ["신묘일", "임신일"],
			},
		};
	} catch (error) {
		console.error("사주 계산 오류:", error);
		// 최종 폴백으로 간단 계산 사용
		return calculateSajuFallback(input);
	}
}
