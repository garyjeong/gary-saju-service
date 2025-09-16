/**
 * 개-사주 브랜드 가이드라인 & 디자인 토큰
 * T-001: 컬러 팔레트 및 타이포그래피 가이드라인 정의
 */

// ============================================
// 컬러 팔레트 (Color Palette)
// ============================================

export const COLORS = {
	// Primary Colors: 깊고 따뜻한 브라운 (전통적 느낌)
	primary: {
		DEFAULT: "hsl(28, 30%, 25%)", // 메인 브랜드 컬러
		foreground: "hsl(45, 50%, 95%)", // primary 위의 텍스트
		description: "전통적이면서 신뢰감을 주는 깊은 브라운",
	},

	// Secondary Colors: 부드러운 베이지 (현대적 감성)
	secondary: {
		DEFAULT: "hsl(45, 25%, 92%)", // 배경 및 카드
		foreground: "hsl(28, 30%, 25%)", // secondary 위의 텍스트
		description: "현대적이고 깔끔한 느낌의 부드러운 베이지",
	},

	// Accent Colors: 금색 계열 (고급스러운 포인트)
	accent: {
		DEFAULT: "hsl(45, 60%, 75%)", // 강조 요소
		foreground: "hsl(28, 30%, 25%)", // accent 위의 텍스트
		description: "고급스럽고 화려한 금색 계열 포인트 컬러",
	},

	// Grayscale: 따뜻한 톤의 그레이스케일
	grayscale: {
		background: "hsl(0, 0%, 100%)", // 페이지 배경
		foreground: "hsl(28, 15%, 15%)", // 메인 텍스트
		muted: "hsl(45, 15%, 95%)", // 비활성 배경
		mutedForeground: "hsl(28, 10%, 50%)", // 비활성 텍스트
		border: "hsl(45, 15%, 88%)", // 테두리
		input: "hsl(45, 15%, 88%)", // 입력 필드
		description: "따뜻한 느낌의 그레이 톤 시스템",
	},
} as const;

// ============================================
// 레이아웃 & 간격 시스템 (Layout & Spacing)
// ============================================

export const LAYOUT = {
	// 컨테이너 최대 너비
	container: {
		maxWidth: "1200px",
		padding: {
			mobile: "1rem", // 16px
			tablet: "1.5rem", // 24px
			desktop: "2rem", // 32px
			wide: "3rem", // 48px
		},
	},

	// 섹션 간격
	spacing: {
		section: {
			mobile: "3rem", // 48px
			desktop: "5rem", // 80px
		},
		component: {
			xs: "0.5rem", // 8px
			sm: "0.75rem", // 12px
			md: "1rem", // 16px
			lg: "1.5rem", // 24px
			xl: "2rem", // 32px
			"2xl": "3rem", // 48px
		},
	},

	// 카드 및 컴포넌트 크기
	card: {
		borderRadius: "0.75rem", // 12px
		padding: {
			sm: "1rem", // 16px
			md: "1.5rem", // 24px
			lg: "2rem", // 32px
		},
		shadow: {
			sm: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
			md: "0 4px 12px 0 rgba(0, 0, 0, 0.12)",
			lg: "0 8px 24px 0 rgba(0, 0, 0, 0.16)",
		},
	},
} as const;

// ============================================
// 사주 전용 컬러 (오행 기반)
// ============================================

export const SAJU_COLORS = {
	// 오행(五行) 컬러 시스템
	elements: {
		토: {
			color: "hsl(28, 60%, 55%)",
			name: "토(土)",
			description: "황토색 - 안정과 중심",
		},
		수: {
			color: "hsl(200, 50%, 40%)",
			name: "수(水)",
			description: "청색 - 지혜와 흐름",
		},
		목: {
			color: "hsl(120, 40%, 35%)",
			name: "목(木)",
			description: "녹색 - 성장과 생명",
		},
		화: {
			color: "hsl(0, 70%, 50%)",
			name: "화(火)",
			description: "적색 - 열정과 에너지",
		},
		금: {
			color: "hsl(50, 30%, 85%)",
			name: "금(金)",
			description: "백금색 - 정의와 결단",
		},
	},

	// 차트 전용 컬러 (시각화용)
	chart: [
		"hsl(28, 60%, 55%)", // 토(土)
		"hsl(200, 50%, 40%)", // 수(水)
		"hsl(120, 40%, 35%)", // 목(木)
		"hsl(0, 70%, 50%)", // 화(火)
		"hsl(50, 30%, 85%)", // 금(金)
	],
} as const;

// ============================================
// 타이포그래피 (Typography)
// ============================================

export const TYPOGRAPHY = {
	// 폰트 패밀리
	fontFamily: {
		primary: "Noto Sans KR", // 기본 텍스트용
		secondary: "Noto Serif KR", // 제목 및 사주 해석용
		mono: "Geist Mono", // 숫자 및 데이터 표시용
		description: {
			primary: "한글 가독성이 우수한 산세리프체, UI 전반에 사용",
			secondary: "전통적 느낌의 명조체, 제목과 사주 해석에 활용",
			mono: "숫자와 데이터 표시에 최적화된 모노스페이스체",
		},
	},

	// 폰트 크기 및 행간 시스템
	fontSize: {
		xs: {
			size: "0.75rem",
			lineHeight: "1.5",
			letterSpacing: "0.02em",
			usage: "캡션, 작은 라벨",
		},
		sm: {
			size: "0.875rem",
			lineHeight: "1.5",
			letterSpacing: "0.015em",
			usage: "작은 텍스트, 부가 정보",
		},
		base: {
			size: "1rem",
			lineHeight: "1.6",
			letterSpacing: "0.01em",
			usage: "본문 텍스트",
		},
		lg: {
			size: "1.125rem",
			lineHeight: "1.6",
			letterSpacing: "0.005em",
			usage: "큰 본문, 중요 텍스트",
		},
		xl: {
			size: "1.25rem",
			lineHeight: "1.6",
			letterSpacing: "0em",
			usage: "소제목",
		},
		"2xl": {
			size: "1.5rem",
			lineHeight: "1.5",
			letterSpacing: "-0.005em",
			usage: "중간 제목",
		},
		"3xl": {
			size: "1.875rem",
			lineHeight: "1.4",
			letterSpacing: "-0.01em",
			usage: "큰 제목",
		},
		"4xl": {
			size: "2.25rem",
			lineHeight: "1.3",
			letterSpacing: "-0.015em",
			usage: "메인 제목",
		},
		"5xl": {
			size: "3rem",
			lineHeight: "1.2",
			letterSpacing: "-0.02em",
			usage: "히어로 제목",
		},
		"6xl": {
			size: "3.75rem",
			lineHeight: "1.1",
			letterSpacing: "-0.025em",
			usage: "대형 디스플레이",
		},
	},

	// 폰트 굵기
	fontWeight: {
		light: 300, // 가벼운 텍스트
		normal: 400, // 일반 텍스트
		medium: 500, // 중간 강조
		bold: 700, // 강한 강조
	},
} as const;

// ============================================
// 테마 설정 (다크모드 지원)
// ============================================

export const THEMES = {
	light: {
		name: "라이트 모드",
		colors: {
			background: "hsl(0, 0%, 100%)",
			foreground: "hsl(28, 15%, 15%)",
			primary: "hsl(28, 30%, 25%)",
			secondary: "hsl(45, 25%, 92%)",
			accent: "hsl(45, 60%, 75%)",
		},
	},
	dark: {
		name: "다크 모드",
		colors: {
			background: "hsl(28, 20%, 8%)",
			foreground: "hsl(45, 40%, 90%)",
			primary: "hsl(45, 50%, 70%)",
			secondary: "hsl(28, 15%, 18%)",
			accent: "hsl(45, 45%, 60%)",
		},
	},
} as const;

// ============================================
// 사용 가이드라인
// ============================================

export const BRAND_GUIDELINES = {
	colorUsage: {
		primary: "메인 CTA 버튼, 네비게이션, 로고에 사용",
		secondary: "카드 배경, 섹션 구분, 비활성 요소에 사용",
		accent: "강조가 필요한 요소, 하이라이트, 중요 정보에 사용",
		grayscale: "텍스트, 테두리, 배경 등 기본 UI 요소에 사용",
	},

	typographyUsage: {
		headings: "Noto Serif KR 사용, 전통적이면서 권위있는 느낌",
		body: "Noto Sans KR 사용, 읽기 편하고 현대적인 느낌",
		data: "Geist Mono 사용, 숫자와 데이터의 정확한 표현",
	},

	accessibility: {
		contrast: "최소 4.5:1 명도 대비 유지",
		fontSize: "최소 16px 이상 사용 권장",
		lineHeight: "한글 텍스트는 1.6 이상 행간 유지",
	},
} as const;
