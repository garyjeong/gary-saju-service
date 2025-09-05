/**
 * 개-사주 서비스 더미 데이터
 * T-002: UI-only 목업용 샘플 데이터
 */

export const DUMMY_USER = {
	name: "김민지",
	birthDate: "1995-03-15",
	birthTime: "14:30",
	gender: "female" as const,
} as const;

export const DUMMY_SAJU_RESULT = {
	// 기본 사주 정보
	basic: {
		birthInfo: {
			year: "을해년 (乙亥)",
			month: "기묘월 (己卯)",
			day: "정축일 (丁丑)",
			time: "정미시 (丁未)",
		},
		elements: {
			year: { heavenly: "乙", earthly: "亥", element: "목" },
			month: { heavenly: "己", earthly: "卯", element: "토" },
			day: { heavenly: "丁", earthly: "丑", element: "화" },
			time: { heavenly: "丁", earthly: "未", element: "화" },
		},
	},

	// 기본 풀이
	interpretation: {
		personality: [
			"따뜻하고 배려심이 깊어 주변 사람들에게 인기가 많습니다.",
			"창의적인 아이디어가 풍부하고 예술적 감각이 뛰어납니다.",
			"때로는 완벽주의 성향으로 스트레스를 받기도 합니다.",
		],
		strengths: [
			"뛰어난 소통 능력",
			"창의적 사고력",
			"리더십 자질",
			"배려심과 공감 능력",
		],
		challenges: [
			"때로는 우유부단함",
			"완벽주의로 인한 스트레스",
			"감정 기복이 있을 수 있음",
		],
		compatibility: {
			good: ["정유일", "무인일", "경술일"],
			avoid: ["신묘일", "임신일"],
		},
	},

	// 오행 분석
	elements: {
		wood: { score: 25, description: "창의성과 성장" },
		fire: { score: 35, description: "열정과 활동력" },
		earth: { score: 20, description: "안정과 신뢰" },
		metal: { score: 10, description: "논리와 결단" },
		water: { score: 10, description: "지혜와 적응력" },
	},

	// 대운 정보
	luck: {
		current: {
			period: "2024-2033년",
			theme: "새로운 도약의 시기",
			description: "경력과 인간관계에서 큰 발전이 예상됩니다.",
		},
		yearly: [
			{
				year: 2024,
				theme: "변화와 기회",
				score: 85,
				keywords: ["승진", "새로운 만남", "건강 관리"],
			},
			{
				year: 2025,
				theme: "안정과 성장",
				score: 78,
				keywords: ["재정 안정", "학습", "가족"],
			},
			{
				year: 2026,
				theme: "도전과 확장",
				score: 92,
				keywords: ["새 프로젝트", "해외", "투자"],
			},
		],
	},
} as const;

export const DUMMY_SHARE_CARD = {
	title: "김민지님의 사주 풀이",
	subtitle: "을해년 기묘월 정축일 정미시",
	keyWords: ["창의적", "리더십", "배려심"],
	dominantElement: "화(火)",
	luckyColor: "#E67E22",
	description: "따뜻한 마음과 창의적 사고의 소유자",
} as const;

export const DUMMY_TODAY_FORTUNE = {
	date: "2024년 1월 15일",
	keyword: "새로운 시작",
	description: "오늘은 새로운 아이디어를 실행에 옮기기 좋은 날입니다.",
	score: 88,
	advice: "오후 시간대에 중요한 결정을 내리는 것이 유리합니다.",
} as const;
