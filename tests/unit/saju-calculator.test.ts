import { calculateSaju, validateSajuInput } from "@/lib/saju/calculator";
import { calculateSajuFallback } from "@/lib/saju/fallback-calculator";
import { SajuInput } from "@/lib/saju/types";

describe("사주 계산 로직 테스트", () => {
	const validInput: SajuInput = {
		name: "김민지",
		birthDate: "1995-03-15",
		birthTime: "14:30",
		gender: "female",
	};

	describe("validateSajuInput", () => {
		it("유효한 입력 데이터를 검증해야 한다", () => {
			const result = validateSajuInput(validInput);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("이름이 비어있으면 에러를 반환해야 한다", () => {
			const invalidInput = { ...validInput, name: "" };
			const result = validateSajuInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("이름을 입력해주세요.");
		});

		it("잘못된 날짜 형식이면 에러를 반환해야 한다", () => {
			const invalidInput = { ...validInput, birthDate: "1995/03/15" };
			const result = validateSajuInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain(
				"올바른 생년월일 형식(YYYY-MM-DD)을 입력해주세요."
			);
		});

		it("미래 날짜면 에러를 반환해야 한다", () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);
			const invalidInput = {
				...validInput,
				birthDate: futureDate.toISOString().split("T")[0],
			};
			const result = validateSajuInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("미래 날짜는 입력할 수 없습니다.");
		});

		it("1900년 이전 날짜면 에러를 반환해야 한다", () => {
			const invalidInput = { ...validInput, birthDate: "1899-01-01" };
			const result = validateSajuInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("1900년 이후 날짜를 입력해주세요.");
		});

		it("잘못된 시간 형식이면 에러를 반환해야 한다", () => {
			const invalidInput = { ...validInput, birthTime: "25:61" };
			const result = validateSajuInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain(
				"올바른 시간 형식(HH:mm)을 입력해주세요."
			);
		});

		it("성별이 없으면 에러를 반환해야 한다", () => {
			const invalidInput = { ...validInput, gender: "" as any };
			const result = validateSajuInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("성별을 선택해주세요.");
		});
	});

	describe("calculateSaju", () => {
		it("유효한 입력으로 사주 결과를 반환해야 한다", () => {
			const result = calculateSaju(validInput);

			expect(result).toBeDefined();
			expect(result.basic.name).toBe(validInput.name);
			expect(result.basic.pillars).toBeDefined();
			expect(result.basic.pillars.year).toBeDefined();
			expect(result.basic.pillars.month).toBeDefined();
			expect(result.basic.pillars.day).toBeDefined();
			expect(result.basic.pillars.time).toBeDefined();

			expect(result.elements).toBeDefined();
			expect(result.elements.wood.score).toBeGreaterThanOrEqual(0);
			expect(result.elements.fire.score).toBeGreaterThanOrEqual(0);
			expect(result.elements.earth.score).toBeGreaterThanOrEqual(0);
			expect(result.elements.metal.score).toBeGreaterThanOrEqual(0);
			expect(result.elements.water.score).toBeGreaterThanOrEqual(0);

			expect(result.interpretation).toBeDefined();
			expect(result.interpretation.personality).toBeInstanceOf(Array);
			expect(result.interpretation.strengths).toBeInstanceOf(Array);
			expect(result.interpretation.challenges).toBeInstanceOf(Array);
			expect(result.interpretation.summary).toBeDefined();
		});

		it("잘못된 입력으로 에러를 발생시켜야 한다", () => {
			const invalidInput = { ...validInput, name: "" };

			expect(() => calculateSaju(invalidInput)).toThrow();
		});

		it("오행 점수의 합이 100에 가까워야 한다", () => {
			const result = calculateSaju(validInput);
			const total =
				result.elements.wood.score +
				result.elements.fire.score +
				result.elements.earth.score +
				result.elements.metal.score +
				result.elements.water.score;

			// 반올림으로 인한 오차를 고려하여 95-105 범위로 설정
			expect(total).toBeGreaterThanOrEqual(95);
			expect(total).toBeLessThanOrEqual(105);
		});
	});

	describe("calculateSajuFallback", () => {
		it("폴백 계산기가 정상 작동해야 한다", () => {
			const result = calculateSajuFallback(validInput);

			expect(result).toBeDefined();
			expect(result.basic.name).toBe(validInput.name);
			expect(result.basic.pillars).toBeDefined();
			expect(result.elements).toBeDefined();
			expect(result.interpretation).toBeDefined();
		});

		it("폴백 계산기의 결과가 일관성이 있어야 한다", () => {
			const result1 = calculateSajuFallback(validInput);
			const result2 = calculateSajuFallback(validInput);

			// 같은 입력에 대해 같은 결과를 반환해야 함
			expect(result1.basic.pillars.day.heavenly).toBe(
				result2.basic.pillars.day.heavenly
			);
			expect(result1.elements.wood.score).toBe(result2.elements.wood.score);
		});
	});

	describe("경계값 테스트", () => {
		it("1900년 1월 1일 자정에 태어난 경우를 처리해야 한다", () => {
			const edgeInput: SajuInput = {
				name: "테스트",
				birthDate: "1900-01-01",
				birthTime: "00:00",
				gender: "male",
			};

			expect(() => calculateSaju(edgeInput)).not.toThrow();
		});

		it("오늘 태어난 경우를 처리해야 한다", () => {
			const today = new Date().toISOString().split("T")[0];
			const edgeInput: SajuInput = {
				name: "테스트",
				birthDate: today,
				birthTime: "23:59",
				gender: "female",
			};

			expect(() => calculateSaju(edgeInput)).not.toThrow();
		});

		it("매우 긴 이름도 처리할 수 있어야 한다", () => {
			const longNameInput: SajuInput = {
				...validInput,
				name: "가".repeat(10), // 최대 길이 테스트
			};

			expect(() => calculateSaju(longNameInput)).not.toThrow();
		});
	});
});
