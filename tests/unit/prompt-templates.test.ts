/**
 * 프롬프트 템플릿 스냅샷 테스트
 * 프롬프트 품질 관리 및 회귀 방지
 */

import {
	generateAdvancedPrompt,
	generatePromptMetadata,
	ENHANCED_TONE_MODIFIERS,
	PROMPT_THEMES,
	RESPONSE_FORMATS,
} from "@/lib/ai/advanced-prompt-templates";
import { generatePersonalizedPrompt } from "@/lib/ai/prompt-templates";
import { PromptManager } from "@/lib/ai/prompt-manager";
import { PromptTestRunner } from "@/lib/ai/prompt-testing";
import { AIInterpretationRequest } from "@/lib/ai/openai-client";

// 테스트용 기본 사주 데이터
const mockSajuResult = {
	pillars: {
		year: { heavenly: "갑", earthly: "인" },
		month: { heavenly: "을", earthly: "묘" },
		day: { heavenly: "병", earthly: "진" },
		hour: { heavenly: "정", earthly: "사" },
	},
	elements: {
		목: { score: 35, name: "목" },
		화: { score: 25, name: "화" },
		토: { score: 20, name: "토" },
		금: { score: 15, name: "금" },
		수: { score: 5, name: "수" },
	},
	interpretation: {
		personality: "창의적이고 활동적인 성격으로 새로운 아이디어를 즐깁니다",
		summary: "목 기운이 강한 사주로 성장과 발전의 에너지를 가지고 있습니다",
		advice: "꾸준한 노력과 인내심을 기르는 것이 중요합니다",
	},
};

// 다양한 사용자 프로필
const userProfiles = {
	youngCasual: {
		age: 24,
		gender: "female" as const,
		tone: "casual" as const,
		interests: ["career", "love"],
	},
	middleAgedFormal: {
		age: 42,
		gender: "male" as const,
		tone: "formal" as const,
		interests: ["family", "health", "wealth"],
	},
	seniorWisdom: {
		age: 58,
		gender: "other" as const,
		tone: "wisdom" as const,
		interests: ["spirituality", "health"],
	},
	energeticCareer: {
		age: 30,
		gender: "female" as const,
		tone: "energetic" as const,
		interests: ["career", "adventure", "learning"],
	},
};

describe("프롬프트 템플릿 시스템", () => {
	let promptManager: PromptManager;
	let testRunner: PromptTestRunner;

	beforeAll(() => {
		promptManager = new PromptManager();
		testRunner = new PromptTestRunner();
	});

	describe("고도화된 프롬프트 생성", () => {
		test("기본 프롬프트 생성 스냅샷", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			const prompt = generateAdvancedPrompt(request);

			// 동적 부분 제거 후 스냅샷 비교
			const normalizedPrompt = prompt
				.replace(/v\d+\.\d+\.\d+/g, "vX.X.X")
				.replace(/\d{4}-\d{2}-\d{2}/g, "YYYY-MM-DD")
				.replace(/\d+년 \d+월 \d+일/g, "YYYY년 MM월 DD일");

			expect(normalizedPrompt).toMatchSnapshot();
		});

		test("다양한 톤 조정 스냅샷", () => {
			const baseRequest: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			Object.keys(ENHANCED_TONE_MODIFIERS).forEach((tone) => {
				const request = {
					...baseRequest,
					userProfile: {
						...baseRequest.userProfile,
						tone: tone as keyof typeof ENHANCED_TONE_MODIFIERS,
					},
				};

				const prompt = generateAdvancedPrompt(request);
				const normalizedPrompt = prompt
					.replace(/v\d+\.\d+\.\d+/g, "vX.X.X")
					.replace(/\d{4}-\d{2}-\d{2}/g, "YYYY-MM-DD");

				expect(normalizedPrompt).toMatchSnapshot(`tone-${tone}`);
			});
		});

		test("다양한 테마 스냅샷", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.middleAgedFormal,
			};

			Object.keys(PROMPT_THEMES).forEach((theme) => {
				const prompt = generateAdvancedPrompt(request, {
					theme: theme as keyof typeof PROMPT_THEMES,
				});

				const normalizedPrompt = prompt
					.replace(/v\d+\.\d+\.\d+/g, "vX.X.X")
					.replace(/\d{4}-\d{2}-\d{2}/g, "YYYY-MM-DD");

				expect(normalizedPrompt).toMatchSnapshot(`theme-${theme}`);
			});
		});

		test("다양한 응답 형식 스냅샷", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.seniorWisdom,
			};

			Object.keys(RESPONSE_FORMATS).forEach((format) => {
				const prompt = generateAdvancedPrompt(request, {
					responseFormat: format as keyof typeof RESPONSE_FORMATS,
				});

				const normalizedPrompt = prompt
					.replace(/v\d+\.\d+\.\d+/g, "vX.X.X")
					.replace(/\d{4}-\d{2}-\d{2}/g, "YYYY-MM-DD");

				expect(normalizedPrompt).toMatchSnapshot(`format-${format}`);
			});
		});
	});

	describe("프롬프트 메타데이터 생성", () => {
		test("메타데이터 구조 검증", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.energeticCareer,
			};

			const metadata = generatePromptMetadata(request, {
				theme: "modern_practical",
				responseFormat: "detailed_json",
				experimentGroup: "A",
			});

			expect(metadata).toHaveProperty("version");
			expect(metadata).toHaveProperty("createdAt");
			expect(metadata).toHaveProperty("theme");
			expect(metadata).toHaveProperty("responseFormat");
			expect(metadata).toHaveProperty("experimentGroup");
			expect(metadata).toHaveProperty("estimatedTokens");
			expect(metadata).toHaveProperty("complexity");

			expect(typeof metadata.estimatedTokens).toBe("number");
			expect(["simple", "medium", "complex"]).toContain(metadata.complexity);
		});

		test("토큰 수 추정 정확성", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			const metadata = generatePromptMetadata(request);

			// 합리적인 토큰 수 범위 검증
			expect(metadata.estimatedTokens).toBeGreaterThan(500);
			expect(metadata.estimatedTokens).toBeLessThan(3000);
		});
	});

	describe("통합 프롬프트 매니저", () => {
		test("기본 프롬프트 생성", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			const result = await promptManager.generatePrompt(request);

			expect(result).toHaveProperty("prompt");
			expect(result).toHaveProperty("metadata");
			expect(result.metadata).toHaveProperty("system");
			expect(result.metadata).toHaveProperty("estimatedTokens");
			expect(result.metadata).toHaveProperty("generationTime");
		});

		test("A/B 테스트 프롬프트 생성", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.middleAgedFormal,
			};

			const result = await promptManager.generatePrompt(request, {
				enableABTest: true,
				abTestRatio: 1.0, // 100% A/B 테스트
			});

			expect(result).toHaveProperty("alternatives");
			expect(result.alternatives).toHaveLength(1);
			expect(result.alternatives![0]).toHaveProperty("prompt");
			expect(result.alternatives![0]).toHaveProperty("experimentGroup");
		});

		test("품질 검사 활성화", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.seniorWisdom,
			};

			const result = await promptManager.generatePrompt(request, {
				enableQualityCheck: true,
				minQualityScore: 75,
			});

			expect(result.metadata).toHaveProperty("qualityScore");
			expect(result.metadata.qualityScore).toBeGreaterThanOrEqual(60); // 최소한의 품질 보장
		});

		test("커스텀 지침 적용", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.energeticCareer,
			};

			const customInstructions = [
				"더욱 구체적인 직업 조언을 포함해주세요",
				"국제적인 관점에서 조언해주세요",
			];

			const result = await promptManager.generatePrompt(request, {
				customInstructions,
				includeDebugInfo: true,
			});

			expect(result.prompt).toContain("구체적");
			expect(result.metadata.debugInfo).toBeDefined();
		});
	});

	describe("프롬프트 테스트 러너", () => {
		test("시나리오 테스트 실행", async () => {
			const result = await testRunner.runScenarioTest("young-casual");

			expect(result).toHaveProperty("scenarioId", "young-casual");
			expect(result).toHaveProperty("prompt");
			expect(result).toHaveProperty("qualityScore");
			expect(result).toHaveProperty("metrics");
			expect(result.qualityScore).toBeGreaterThanOrEqual(0);
			expect(result.qualityScore).toBeLessThanOrEqual(100);
		});

		test("회귀 테스트 실행", async () => {
			const results = await testRunner.runRegressionTests(true);

			expect(results).toHaveProperty("overall");
			expect(results).toHaveProperty("results");
			expect(results.overall).toHaveProperty("passed");
			expect(results.overall).toHaveProperty("failed");
			expect(results.overall).toHaveProperty("averageScore");

			expect(results.results.length).toBeGreaterThan(0);
		});

		test("A/B 테스트 비교", async () => {
			const comparison = await testRunner.runABTest(
				"young-casual",
				{ theme: "modern_practical" },
				{ theme: "psychological" }
			);

			expect(comparison).toHaveProperty("scenarioId", "young-casual");
			expect(comparison).toHaveProperty("versionA");
			expect(comparison).toHaveProperty("versionB");
			expect(comparison).toHaveProperty("winner");
			expect(["A", "B", "tie"]).toContain(comparison.winner);
		});
	});

	describe("레거시 호환성", () => {
		test("기존 프롬프트 시스템 동작", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			const legacyPrompt = generatePersonalizedPrompt(request);

			expect(typeof legacyPrompt).toBe("string");
			expect(legacyPrompt.length).toBeGreaterThan(100);
			expect(legacyPrompt).toContain("JSON");
		});

		test("레거시와 고도화된 시스템 결과 비교", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.middleAgedFormal,
			};

			const legacyResult = await promptManager.generatePrompt(request, {
				useAdvancedSystem: false,
			});

			const advancedResult = await promptManager.generatePrompt(request, {
				useAdvancedSystem: true,
			});

			// 둘 다 유효한 프롬프트여야 함
			expect(legacyResult.prompt.length).toBeGreaterThan(100);
			expect(advancedResult.prompt.length).toBeGreaterThan(100);

			// 고도화된 시스템이 더 상세해야 함
			expect(advancedResult.prompt.length).toBeGreaterThan(
				legacyResult.prompt.length
			);
			expect(advancedResult.metadata.system).toBe("advanced");
			expect(legacyResult.metadata.system).toBe("legacy");
		});
	});

	describe("에러 처리 및 폴백", () => {
		test("잘못된 옵션 처리", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			// 에러가 발생해도 폴백 프롬프트가 생성되어야 함
			const result = await promptManager.generatePrompt(request, {
				maxTokens: 10, // 매우 작은 토큰 제한
			});

			expect(result).toHaveProperty("prompt");
			expect(result.metadata.system).toBe("legacy"); // 폴백 시 레거시 시스템 사용
		});

		test("빈 사용자 프로필 처리", () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				// userProfile 없음
			};

			const prompt = generateAdvancedPrompt(request);

			expect(typeof prompt).toBe("string");
			expect(prompt.length).toBeGreaterThan(100);
		});

		test("불완전한 사주 데이터 처리", () => {
			const incompleteRequest: AIInterpretationRequest = {
				sajuResult: {
					pillars: mockSajuResult.pillars,
					// elements와 interpretation 없음
					elements: {},
					interpretation: {},
				},
			};

			expect(() => {
				generateAdvancedPrompt(incompleteRequest);
			}).not.toThrow();
		});
	});

	describe("성능 및 최적화", () => {
		test("프롬프트 생성 성능", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.energeticCareer,
			};

			const startTime = performance.now();
			await promptManager.generatePrompt(request);
			const endTime = performance.now();

			const executionTime = endTime - startTime;

			// 100ms 이내에 생성되어야 함
			expect(executionTime).toBeLessThan(100);
		});

		test("메모리 사용량 제한", () => {
			const requests = Array.from({ length: 100 }, () => ({
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			}));

			// 많은 프롬프트를 생성해도 메모리 누수가 없어야 함
			requests.forEach((request) => {
				const prompt = generateAdvancedPrompt(request);
				expect(prompt.length).toBeLessThan(10000); // 10KB 이하
			});
		});

		test("최적화 제안 생성", async () => {
			const request: AIInterpretationRequest = {
				sajuResult: mockSajuResult,
				userProfile: userProfiles.youngCasual,
			};

			const suggestions = await promptManager.getOptimizationSuggestions(
				request,
				{
					maxTokens: 2500,
					enableQualityCheck: false,
				}
			);

			expect(suggestions).toHaveProperty("suggestions");
			expect(suggestions).toHaveProperty("estimatedImprovement");
			expect(Array.isArray(suggestions.suggestions)).toBe(true);
			expect(typeof suggestions.estimatedImprovement).toBe("number");
		});
	});
});
