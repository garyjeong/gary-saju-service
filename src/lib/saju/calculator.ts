/**
 * 개-사주 사주 계산 엔진
 * T-003: manseryeok 라이브러리를 사용한 실제 사주 계산 로직
 * Refactored with OOP principles
 */

import {
	calculateFourPillars,
	getEarthlyBranchElement,
	getHeavenlyStemElement,
} from "manseryeok";
import {
	SajuInput,
	SajuResult,
	FourPillars,
	PillarInfo,
	ValidationResult,
} from "./types";
import { calculateSajuFallback } from "./fallback-calculator";
import { SajuValidator } from "./validator";
import { ElementAnalyzer } from "./element-analyzer";
import { InterpretationGenerator } from "./interpretation-generator";

/**
 * 사주 계산을 담당하는 메인 클래스
 * Dependency Injection Pattern 적용
 */
export class SajuCalculator {
	private validator: SajuValidator;
	private elementAnalyzer: ElementAnalyzer;
	private interpretationGenerator: InterpretationGenerator;

	constructor() {
		this.validator = new SajuValidator();
		this.elementAnalyzer = new ElementAnalyzer();
		this.interpretationGenerator = new InterpretationGenerator();
	}

	/**
	 * 사주 계산 메인 메서드
	 */
	calculate(input: SajuInput): SajuResult {
		const validation = this.validator.validate(input);
		if (!validation.isValid) {
			throw new Error(`입력 데이터 오류: ${validation.errors.join(", ")}`);
		}

		try {
			const birthInfo = this.parseBirthInfo(input);
			const fourPillars = this.calculateFourPillars(birthInfo);
			const convertedPillars = this.convertPillars(fourPillars);
			const elements = this.elementAnalyzer.analyzeElements(convertedPillars);
			const interpretation =
				this.interpretationGenerator.generateInterpretation(
					convertedPillars,
					elements
				);

			return this.buildResult(
				input,
				convertedPillars,
				elements,
				interpretation
			);
		} catch (error) {
			console.error("사주 계산 오류:", error);
			return calculateSajuFallback(input);
		}
	}

	/**
	 * 생년월일시 파싱
	 */
	private parseBirthInfo(input: SajuInput) {
		const [year, month, day] = input.birthDate.split("-").map(Number);
		const [hour, minute] = input.birthTime.split(":").map(Number);

		return { year, month, day, hour, minute };
	}

	/**
	 * manseryeok 라이브러리를 사용한 사주 계산
	 */
	private calculateFourPillars(birthInfo: any) {
		const fourPillars = calculateFourPillars(birthInfo);

		if (!fourPillars?.year?.heavenlyStem || !fourPillars?.year?.earthlyBranch) {
			throw new Error("manseryeok 결과가 유효하지 않음");
		}

		return fourPillars;
	}

	/**
	 * manseryeok 결과를 내부 형식으로 변환
	 */
	private convertPillars(fourPillars: any): FourPillars {
		return {
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
	}

	/**
	 * 최종 결과 객체 생성
	 */
	private buildResult(
		input: SajuInput,
		pillars: FourPillars,
		elements: SajuResult["elements"],
		interpretation: SajuResult["interpretation"]
	): SajuResult {
		return {
			basic: {
				name: input.name,
				birthInfo: this.formatBirthInfo(pillars),
				pillars: this.formatPillars(pillars),
			},
			elements,
			interpretation,
			compatibility: {
				favorable: ["정유일", "무인일", "경술일"], // TODO: 실제 계산 로직 구현
				unfavorable: ["신묘일", "임신일"],
			},
		};
	}

	/**
	 * 생년월일시 포매팅
	 */
	private formatBirthInfo(pillars: FourPillars) {
		return {
			year: `${pillars.year.heavenly}${pillars.year.earthly}년 (${pillars.year.heavenly}${pillars.year.earthly})`,
			month: `${pillars.month.heavenly}${pillars.month.earthly}월 (${pillars.month.heavenly}${pillars.month.earthly})`,
			day: `${pillars.day.heavenly}${pillars.day.earthly}일 (${pillars.day.heavenly}${pillars.day.earthly})`,
			time: `${pillars.time.heavenly}${pillars.time.earthly}시 (${pillars.time.heavenly}${pillars.time.earthly})`,
		};
	}

	/**
	 * 기둥 정보 포매팅
	 */
	private formatPillars(pillars: FourPillars) {
		return {
			year: this.convertToPillarInfo(
				pillars.year.heavenly,
				pillars.year.earthly
			),
			month: this.convertToPillarInfo(
				pillars.month.heavenly,
				pillars.month.earthly
			),
			day: this.convertToPillarInfo(pillars.day.heavenly, pillars.day.earthly),
			time: this.convertToPillarInfo(
				pillars.time.heavenly,
				pillars.time.earthly
			),
		};
	}

	/**
	 * 기둥 정보를 PillarInfo 타입으로 변환
	 */
	private convertToPillarInfo(heavenly: string, earthly: string): PillarInfo {
		const heavenlyElement = getHeavenlyStemElement(heavenly as any);
		const earthlyElement = getEarthlyBranchElement(earthly as any);

		return {
			heavenly,
			earthly,
			element: heavenlyElement,
			ganJi: `${heavenly}${earthly}`,
		};
	}
}

/**
 * 사주 입력 데이터 검증 (하위 호환성을 위한 함수)
 */
export function validateSajuInput(input: SajuInput): ValidationResult {
	const validator = new SajuValidator();
	return validator.validate(input);
}

/**
 * 메인 사주 계산 함수 (하위 호환성을 위한 래퍼 함수)
 */
export function calculateSaju(input: SajuInput): SajuResult {
	const calculator = new SajuCalculator();
	return calculator.calculate(input);
}
