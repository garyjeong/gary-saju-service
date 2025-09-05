/**
 * 개-사주 입력 검증 스키마
 * T-003: Zod를 사용한 강력한 입력 검증 시스템
 */

import { z } from "zod";

export const SajuInputSchema = z.object({
	name: z
		.string()
		.min(1, "이름을 입력해주세요")
		.max(10, "이름은 10글자 이하로 입력해주세요")
		.regex(/^[가-힣a-zA-Z\s]+$/, "이름은 한글 또는 영문만 입력 가능합니다"),

	birthDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요")
		.refine((date) => {
			// 유효한 날짜인지 확인 (2월 30일 같은 존재하지 않는 날짜 방지)
			const [year, month, day] = date.split("-").map(Number);
			const parsedDate = new Date(year, month - 1, day);
			return (
				parsedDate.getFullYear() === year &&
				parsedDate.getMonth() === month - 1 &&
				parsedDate.getDate() === day
			);
		}, "존재하지 않는 날짜입니다")
		.refine((date) => {
			const parsedDate = new Date(date);
			const today = new Date();
			return parsedDate <= today;
		}, "미래 날짜는 입력할 수 없습니다")
		.refine((date) => {
			const parsedDate = new Date(date);
			return parsedDate.getFullYear() >= 1900;
		}, "1900년 이후 날짜를 입력해주세요"),

	birthTime: z
		.string()
		.regex(
			/^([01]?\d|2[0-3]):([0-5]\d)$/,
			"올바른 시간 형식(HH:mm)을 입력해주세요"
		),

	gender: z.enum(["male", "female"], {
		errorMap: () => ({ message: "성별을 선택해주세요" }),
	}),
});

export type SajuInputType = z.infer<typeof SajuInputSchema>;

/**
 * 사주 입력 데이터 검증 함수
 */
export function validateSajuData(data: unknown) {
	return SajuInputSchema.safeParse(data);
}

/**
 * 생년월일 범위 검증
 */
export function validateDateRange(birthDate: string): {
	isValid: boolean;
	message?: string;
} {
	const date = new Date(birthDate);
	const today = new Date();
	const minDate = new Date("1900-01-01");

	if (date > today) {
		return { isValid: false, message: "미래 날짜는 입력할 수 없습니다" };
	}

	if (date < minDate) {
		return { isValid: false, message: "1900년 이후 날짜를 입력해주세요" };
	}

	return { isValid: true };
}

/**
 * 시간 형식 검증
 */
export function validateTimeFormat(time: string): {
	isValid: boolean;
	message?: string;
} {
	const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;

	if (!timeRegex.test(time)) {
		return {
			isValid: false,
			message: "올바른 시간 형식(HH:mm)을 입력해주세요",
		};
	}

	return { isValid: true };
}
