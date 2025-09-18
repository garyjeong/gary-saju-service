import { CompatibilityCalculator } from "@/lib/compatibility/compatibility-calculator";
import { CompatibilityInput } from "@/lib/compatibility/types";

// Mock dependencies
jest.mock("@/lib/saju/calculator", () => ({
	SajuCalculator: jest.fn().mockImplementation(() => ({
		calculate: jest.fn().mockReturnValue({
			basic: {
				name: "Test",
				birthInfo: {
					year: "갑자년",
					month: "을축월",
					day: "병인일",
					time: "정묘시",
				},
				pillars: {
					year: {
						heavenly: "갑",
						earthly: "자",
						element: "wood",
						ganJi: "갑자",
					},
					month: {
						heavenly: "을",
						earthly: "축",
						element: "earth",
						ganJi: "을축",
					},
					day: {
						heavenly: "병",
						earthly: "인",
						element: "fire",
						ganJi: "병인",
					},
					time: {
						heavenly: "정",
						earthly: "묘",
						element: "fire",
						ganJi: "정묘",
					},
				},
			},
			elements: {
				wood: { score: 30, description: "목의 기운이 강함" },
				fire: { score: 20, description: "화의 기운이 보통" },
				earth: { score: 20, description: "토의 기운이 보통" },
				metal: { score: 15, description: "금의 기운이 약함" },
				water: { score: 15, description: "수의 기운이 약함" },
			},
			interpretation: {
				personality: ["창의적", "성장지향적"],
				strengths: ["리더십", "추진력"],
				challenges: ["고집", "성급함"],
				summary: "성장 지향적이고 창의적인 성격",
			},
			compatibility: {
				favorable: ["을", "기", "임"],
				unfavorable: ["경", "신"],
			},
		}),
	})),
}));

describe("CompatibilityCalculator", () => {
	let calculator: CompatibilityCalculator;
	let mockInput: CompatibilityInput;

	beforeEach(() => {
		calculator = new CompatibilityCalculator();
		mockInput = {
			relationshipType: "romance",
			person1: {
				name: "홍길동",
				birthDate: "1990-01-01",
				birthTime: "09:00",
				gender: "male",
			},
			person2: {
				name: "김영희",
				birthDate: "1992-05-15",
				birthTime: "14:30",
				gender: "female",
			},
		};
	});

	describe("analyzeCompatibility", () => {
		test("상성 분석 결과를 정상적으로 반환해야 한다", async () => {
			const result = await calculator.analyzeCompatibility(mockInput);

			expect(result).toHaveProperty("input");
			expect(result).toHaveProperty("person1Saju");
			expect(result).toHaveProperty("person2Saju");
			expect(result).toHaveProperty("score");
			expect(result).toHaveProperty("interpretation");
			expect(result).toHaveProperty("elementComparison");
		});

		test("입력된 정보가 결과에 올바르게 포함되어야 한다", async () => {
			const result = await calculator.analyzeCompatibility(mockInput);

			expect(result.input).toEqual(mockInput);
			expect(result.input.person1.name).toBe("홍길동");
			expect(result.input.person2.name).toBe("김영희");
			expect(result.input.relationshipType).toBe("romance");
		});

		test("점수가 유효한 범위 내에 있어야 한다", async () => {
			const result = await calculator.analyzeCompatibility(mockInput);

			// 전체 점수 검증
			expect(result.score.overall).toBeGreaterThanOrEqual(0);
			expect(result.score.overall).toBeLessThanOrEqual(100);

			// 오행별 점수 검증
			Object.values(result.score.elements).forEach((score) => {
				expect(score).toBeGreaterThanOrEqual(0);
				expect(score).toBeLessThanOrEqual(100);
			});

			// 음양 조화 점수 검증
			expect(result.score.yinYang).toBeGreaterThanOrEqual(0);
			expect(result.score.yinYang).toBeLessThanOrEqual(100);

			// 오행 조화 점수 검증
			expect(result.score.fiveElementsHarmony).toBeGreaterThanOrEqual(0);
			expect(result.score.fiveElementsHarmony).toBeLessThanOrEqual(100);
		});

		test("해석 정보가 포함되어야 한다", async () => {
			const result = await calculator.analyzeCompatibility(mockInput);

			expect(result.interpretation.summary).toBeDefined();
			expect(typeof result.interpretation.summary).toBe("string");
			expect(result.interpretation.summary.length).toBeGreaterThan(0);

			expect(Array.isArray(result.interpretation.strengths)).toBe(true);
			expect(Array.isArray(result.interpretation.challenges)).toBe(true);
			expect(Array.isArray(result.interpretation.advice)).toBe(true);

			expect(result.interpretation.strengths.length).toBeGreaterThan(0);
			expect(result.interpretation.challenges.length).toBeGreaterThan(0);
			expect(result.interpretation.advice.length).toBeGreaterThan(0);
		});

		test("관계별 특화 해석이 포함되어야 한다", async () => {
			const result = await calculator.analyzeCompatibility(mockInput);

			expect(result.interpretation.relationshipSpecific).toHaveProperty(
				"romance"
			);
			expect(
				Array.isArray(result.interpretation.relationshipSpecific.romance)
			).toBe(true);
			expect(
				result.interpretation.relationshipSpecific.romance!.length
			).toBeGreaterThan(0);
		});

		test("결혼 관계 타입에 대한 특화 해석이 생성되어야 한다", async () => {
			const marriageInput = {
				...mockInput,
				relationshipType: "marriage" as const,
			};

			const result = await calculator.analyzeCompatibility(marriageInput);

			expect(result.interpretation.relationshipSpecific).toHaveProperty(
				"marriage"
			);
			expect(
				Array.isArray(result.interpretation.relationshipSpecific.marriage)
			).toBe(true);
			expect(
				result.interpretation.relationshipSpecific.marriage!.length
			).toBeGreaterThan(0);
		});

		test("사업 관계 타입에 대한 특화 해석이 생성되어야 한다", async () => {
			const businessInput = {
				...mockInput,
				relationshipType: "business" as const,
			};

			const result = await calculator.analyzeCompatibility(businessInput);

			expect(result.interpretation.relationshipSpecific).toHaveProperty(
				"business"
			);
			expect(
				Array.isArray(result.interpretation.relationshipSpecific.business)
			).toBe(true);
			expect(
				result.interpretation.relationshipSpecific.business!.length
			).toBeGreaterThan(0);
		});

		test("우정 관계 타입에 대한 특화 해석이 생성되어야 한다", async () => {
			const friendshipInput = {
				...mockInput,
				relationshipType: "friendship" as const,
			};

			const result = await calculator.analyzeCompatibility(friendshipInput);

			expect(result.interpretation.relationshipSpecific).toHaveProperty(
				"friendship"
			);
			expect(
				Array.isArray(result.interpretation.relationshipSpecific.friendship)
			).toBe(true);
			expect(
				result.interpretation.relationshipSpecific.friendship!.length
			).toBeGreaterThan(0);
		});

		test("오행 비교 데이터가 정확하게 생성되어야 한다", async () => {
			const result = await calculator.analyzeCompatibility(mockInput);

			const elements = ["wood", "fire", "earth", "metal", "water"] as const;

			elements.forEach((element) => {
				expect(result.elementComparison).toHaveProperty(element);
				expect(result.elementComparison[element]).toHaveProperty("p1");
				expect(result.elementComparison[element]).toHaveProperty("p2");
				expect(result.elementComparison[element]).toHaveProperty("harmony");

				// 수치 범위 검증
				expect(result.elementComparison[element].p1).toBeGreaterThanOrEqual(0);
				expect(result.elementComparison[element].p2).toBeGreaterThanOrEqual(0);
				expect(
					result.elementComparison[element].harmony
				).toBeGreaterThanOrEqual(0);
				expect(result.elementComparison[element].harmony).toBeLessThanOrEqual(
					100
				);
			});
		});

		test("음양 조화가 성별에 따라 올바르게 계산되어야 한다", async () => {
			// 남녀 조합
			const maleFemalResult = await calculator.analyzeCompatibility(mockInput);
			expect(maleFemalResult.score.yinYang).toBe(90);

			// 남남 조합
			const maleMaleInput = {
				...mockInput,
				person2: { ...mockInput.person2, gender: "male" as const },
			};
			const maleMaleResult = await calculator.analyzeCompatibility(
				maleMaleInput
			);
			expect(maleMaleResult.score.yinYang).toBe(40);

			// 여여 조합
			const femaleFemaleInput = {
				...mockInput,
				person1: { ...mockInput.person1, gender: "female" as const },
				person2: { ...mockInput.person2, gender: "female" as const },
			};
			const femaleFemaleResult = await calculator.analyzeCompatibility(
				femaleFemaleInput
			);
			expect(femaleFemaleResult.score.yinYang).toBe(40);
		});
	});

	describe("data validation", () => {
		test("잘못된 입력 데이터도 처리하여 결과를 반환해야 한다", async () => {
			const invalidInput = {
				...mockInput,
				person1: {
					...mockInput.person1,
					birthDate: "invalid-date",
				},
			};

			// Mock에서는 항상 결과를 반환하므로 정상 처리되어야 함
			const result = await calculator.analyzeCompatibility(invalidInput);
			expect(result).toHaveProperty("input");
			expect(result).toHaveProperty("score");
			expect(result).toHaveProperty("interpretation");
		});
	});
});
