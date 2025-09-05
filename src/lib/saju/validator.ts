/**
 * 사주 입력 데이터 검증을 담당하는 클래스
 * Single Responsibility Principle: 검증 로직만 담당
 */

import { SajuInput, ValidationResult } from "./types";

export class SajuValidator {
	private readonly DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
	private readonly TIME_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;
	private readonly MIN_YEAR = 1900;

	/**
	 * 사주 입력 데이터의 전체 검증
	 */
	validate(input: SajuInput): ValidationResult {
		const errors: string[] = [];

		errors.push(...this.validateName(input.name));
		errors.push(...this.validateBirthDate(input.birthDate));
		errors.push(...this.validateBirthTime(input.birthTime));
		errors.push(...this.validateGender(input.gender));

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	/**
	 * 이름 검증
	 */
	private validateName(name: string): string[] {
		const errors: string[] = [];

		if (!name || name.trim().length === 0) {
			errors.push("이름을 입력해주세요.");
		}

		return errors;
	}

	/**
	 * 생년월일 검증
	 */
	private validateBirthDate(birthDate: string): string[] {
		const errors: string[] = [];

		if (!birthDate || !this.DATE_REGEX.test(birthDate)) {
			errors.push("올바른 생년월일 형식(YYYY-MM-DD)을 입력해주세요.");
			return errors;
		}

		const date = new Date(birthDate);
		const today = new Date();

		if (date > today) {
			errors.push("미래 날짜는 입력할 수 없습니다.");
		}

		if (date.getFullYear() < this.MIN_YEAR) {
			errors.push("1900년 이후 날짜를 입력해주세요.");
		}

		return errors;
	}

	/**
	 * 출생시간 검증
	 */
	private validateBirthTime(birthTime: string): string[] {
		const errors: string[] = [];

		if (!birthTime || !this.TIME_REGEX.test(birthTime)) {
			errors.push("올바른 시간 형식(HH:mm)을 입력해주세요.");
		}

		return errors;
	}

	/**
	 * 성별 검증
	 */
	private validateGender(gender: string): string[] {
		const errors: string[] = [];

		if (!gender || !["male", "female"].includes(gender)) {
			errors.push("성별을 선택해주세요.");
		}

		return errors;
	}
}
