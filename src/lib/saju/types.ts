/**
 * 개-사주 사주 계산 타입 정의
 * T-003: 실제 사주 계산 로직을 위한 TypeScript 타입
 */

export interface SajuInput {
	name: string;
	birthDate: string; // YYYY-MM-DD
	birthTime: string; // HH:mm
	gender: "male" | "female";
}

export interface PillarInfo {
	heavenly: string; // 천간 (甲乙丙丁...)
	earthly: string; // 지지 (子丑寅卯...)
	element: string; // 오행 (木火土金水)
	ganJi: string; // 간지 조합 (甲子, 乙丑...)
}

export interface SajuResult {
	// 기본 사주 정보
	basic: {
		name: string;
		birthInfo: {
			year: string; // 을해년 (乙亥)
			month: string; // 기묘월 (己卯)
			day: string; // 정축일 (丁丑)
			time: string; // 정미시 (丁未)
		};
		pillars: {
			year: PillarInfo;
			month: PillarInfo;
			day: PillarInfo;
			time: PillarInfo;
		};
	};

	// 오행 분석
	elements: {
		wood: { score: number; description: string };
		fire: { score: number; description: string };
		earth: { score: number; description: string };
		metal: { score: number; description: string };
		water: { score: number; description: string };
	};

	// 기본 풀이
	interpretation: {
		personality: string[];
		strengths: string[];
		challenges: string[];
		summary: string;
	};

	// 호환성 (간단버전)
	compatibility: {
		favorable: string[];
		unfavorable: string[];
	};
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

// manseryeok 라이브러리 타입 (외부 라이브러리용)
export interface FourPillars {
	year: { heavenly: string; earthly: string };
	month: { heavenly: string; earthly: string };
	day: { heavenly: string; earthly: string };
	time: { heavenly: string; earthly: string };
}
