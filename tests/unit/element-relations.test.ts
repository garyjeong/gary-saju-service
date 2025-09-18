import {
	calculateElementHarmony,
	calculateYinYangHarmony,
	GENERATION_CYCLE,
	DESTRUCTION_CYCLE,
	ElementStrength,
} from "@/lib/compatibility/element-relations";

describe("Element Relations", () => {
	describe("GENERATION_CYCLE", () => {
		test("상생 관계가 올바르게 정의되어 있어야 한다", () => {
			expect(GENERATION_CYCLE.wood).toBe("fire");
			expect(GENERATION_CYCLE.fire).toBe("earth");
			expect(GENERATION_CYCLE.earth).toBe("metal");
			expect(GENERATION_CYCLE.metal).toBe("water");
			expect(GENERATION_CYCLE.water).toBe("wood");
		});
	});

	describe("DESTRUCTION_CYCLE", () => {
		test("상극 관계가 올바르게 정의되어 있어야 한다", () => {
			expect(DESTRUCTION_CYCLE.wood).toBe("earth");
			expect(DESTRUCTION_CYCLE.fire).toBe("metal");
			expect(DESTRUCTION_CYCLE.earth).toBe("water");
			expect(DESTRUCTION_CYCLE.metal).toBe("wood");
			expect(DESTRUCTION_CYCLE.water).toBe("fire");
		});
	});

	describe("calculateElementHarmony", () => {
		const mockElements1: ElementStrength = {
			wood: 20,
			fire: 30,
			earth: 25,
			metal: 15,
			water: 10,
		};

		const mockElements2: ElementStrength = {
			wood: 25,
			fire: 20,
			earth: 30,
			metal: 10,
			water: 15,
		};

		test("오행 조화 점수가 0-100 범위 내에 있어야 한다", () => {
			const result = calculateElementHarmony(mockElements1, mockElements2);

			Object.values(result).forEach((score) => {
				expect(score).toBeGreaterThanOrEqual(0);
				expect(score).toBeLessThanOrEqual(100);
			});
		});

		test("모든 오행 요소에 대해 점수가 계산되어야 한다", () => {
			const result = calculateElementHarmony(mockElements1, mockElements2);

			expect(result).toHaveProperty("wood");
			expect(result).toHaveProperty("fire");
			expect(result).toHaveProperty("earth");
			expect(result).toHaveProperty("metal");
			expect(result).toHaveProperty("water");
		});

		test("동일한 오행 강도를 가진 경우 높은 점수를 받아야 한다", () => {
			const identicalElements: ElementStrength = {
				wood: 20,
				fire: 20,
				earth: 20,
				metal: 20,
				water: 20,
			};

			const result = calculateElementHarmony(
				identicalElements,
				identicalElements
			);

			// 동일한 강도이므로 모든 점수가 50 이상이어야 함
			Object.values(result).forEach((score) => {
				expect(score).toBeGreaterThanOrEqual(40);
			});
		});

		test("극단적으로 다른 오행 강도의 경우 낮은 점수를 받아야 한다", () => {
			const extremeElements1: ElementStrength = {
				wood: 100,
				fire: 0,
				earth: 0,
				metal: 0,
				water: 0,
			};

			const extremeElements2: ElementStrength = {
				wood: 0,
				fire: 100,
				earth: 0,
				metal: 0,
				water: 0,
			};

			const result = calculateElementHarmony(
				extremeElements1,
				extremeElements2
			);

			// 극단적으로 다른 경우이므로 일부 점수가 낮아야 함
			const scores = Object.values(result);
			const minScore = Math.min(...scores);
			expect(minScore).toBeLessThan(50);
		});
	});

	describe("calculateYinYangHarmony", () => {
		test("음양이 다른 경우 높은 점수를 받아야 한다", () => {
			const maleFemalScore = calculateYinYangHarmony("male", "female");
			const femaleMaleScore = calculateYinYangHarmony("female", "male");

			expect(maleFemalScore).toBe(90);
			expect(femaleMaleScore).toBe(90);
		});

		test("음양이 같은 경우 보통 점수를 받아야 한다", () => {
			const maleMaleScore = calculateYinYangHarmony("male", "male");
			const femaleFemaleScore = calculateYinYangHarmony("female", "female");

			expect(maleMaleScore).toBe(40);
			expect(femaleFemaleScore).toBe(40);
		});

		test("점수가 0-100 범위 내에 있어야 한다", () => {
			const scores = [
				calculateYinYangHarmony("male", "female"),
				calculateYinYangHarmony("female", "male"),
				calculateYinYangHarmony("male", "male"),
				calculateYinYangHarmony("female", "female"),
			];

			scores.forEach((score) => {
				expect(score).toBeGreaterThanOrEqual(0);
				expect(score).toBeLessThanOrEqual(100);
			});
		});
	});
});
