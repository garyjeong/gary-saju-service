/**
 * 프롬프트 테스팅 및 품질 관리 시스템
 * 스냅샷 테스트, A/B 테스트, 성능 측정 지원
 */

import { AIInterpretationRequest } from "./openai-client";
import {
	generateAdvancedPrompt,
	generatePromptMetadata,
	ENHANCED_TONE_MODIFIERS,
	PROMPT_THEMES,
	RESPONSE_FORMATS,
} from "./advanced-prompt-templates";
import { generatePersonalizedPrompt } from "./prompt-templates";

/**
 * 테스트 시나리오 인터페이스
 */
export interface PromptTestScenario {
	id: string;
	name: string;
	description: string;
	testData: AIInterpretationRequest;
	expectedOutputTypes: string[];
	qualityMetrics: QualityMetric[];
}

/**
 * 품질 메트릭 정의
 */
export interface QualityMetric {
	name: string;
	type: "length" | "keyword" | "sentiment" | "readability" | "personalization";
	target: number | string | string[];
	weight: number; // 1-10
}

/**
 * 프롬프트 테스트 결과
 */
export interface PromptTestResult {
	scenarioId: string;
	prompt: string;
	metadata: any;
	qualityScore: number;
	metrics: {
		[key: string]: {
			value: any;
			score: number;
			passed: boolean;
		};
	};
	executionTime: number;
	promptLength: number;
	estimatedTokens: number;
}

/**
 * A/B 테스트 결과 비교
 */
export interface ABTestComparison {
	scenarioId: string;
	versionA: PromptTestResult;
	versionB: PromptTestResult;
	winner: "A" | "B" | "tie";
	confidenceLevel: number;
	significantDifferences: string[];
}

/**
 * 프롬프트 테스트 실행기
 */
export class PromptTestRunner {
	private scenarios: PromptTestScenario[] = [];
	private snapshots: Map<string, string> = new Map();

	constructor() {
		this.initializeDefaultScenarios();
	}

	/**
	 * 기본 테스트 시나리오 초기화
	 */
	private initializeDefaultScenarios() {
		// 기본 사주 데이터 (테스트용)
		const baseSajuResult = {
			pillars: {
				year: { heavenly: "갑", earthly: "인" },
				month: { heavenly: "을", earthly: "묘" },
				day: { heavenly: "병", earthly: "진" },
				hour: { heavenly: "정", earthly: "사" },
			},
			elements: {
				목: { score: 30, name: "목" },
				화: { score: 25, name: "화" },
				토: { score: 20, name: "토" },
				금: { score: 15, name: "금" },
				수: { score: 10, name: "수" },
			},
			interpretation: {
				personality: "창의적이고 활동적인 성격",
				summary: "목 기운이 강한 사주",
				advice: "꾸준한 노력이 필요함",
			},
		};

		this.scenarios = [
			{
				id: "young-casual",
				name: "젊은 세대 캐주얼 톤",
				description: "20대 사용자, 친근한 톤, 커리어 관심사",
				testData: {
					sajuResult: baseSajuResult,
					userProfile: {
						age: 25,
						gender: "female",
						tone: "casual",
						interests: ["career", "love"],
					},
				},
				expectedOutputTypes: ["personality", "summary", "advice"],
				qualityMetrics: [
					{
						name: "친근한 표현 사용",
						type: "keyword",
						target: ["~해", "그런데", "진짜로"],
						weight: 8,
					},
					{
						name: "커리어 관련 키워드",
						type: "keyword",
						target: ["직업", "취업", "커리어", "성공"],
						weight: 7,
					},
					{
						name: "적절한 길이",
						type: "length",
						target: 500,
						weight: 6,
					},
				],
			},
			{
				id: "middle-formal",
				name: "중년 정중한 톤",
				description: "40대 사용자, 격식 있는 톤, 가족 관심사",
				testData: {
					sajuResult: baseSajuResult,
					userProfile: {
						age: 42,
						gender: "male",
						tone: "formal",
						interests: ["family", "health"],
					},
				},
				expectedOutputTypes: ["personality", "summary", "lifeAdvice"],
				qualityMetrics: [
					{
						name: "정중한 표현 사용",
						type: "keyword",
						target: ["말씀드리겠습니다", "하시기 바랍니다", "귀하의"],
						weight: 9,
					},
					{
						name: "가족 관련 언급",
						type: "keyword",
						target: ["가족", "가정", "자녀", "부모"],
						weight: 8,
					},
				],
			},
			{
				id: "senior-wisdom",
				name: "시니어 지혜 톤",
				description: "60대 사용자, 지혜로운 톤, 건강과 영성 관심",
				testData: {
					sajuResult: baseSajuResult,
					userProfile: {
						age: 62,
						gender: "other",
						tone: "wisdom",
						interests: ["health", "spirituality"],
					},
				},
				expectedOutputTypes: ["personality", "summary", "lifeAdvice"],
				qualityMetrics: [
					{
						name: "지혜로운 표현",
						type: "keyword",
						target: ["인생의 여정", "깊이 성찰", "진정한 의미"],
						weight: 9,
					},
					{
						name: "건강 관련 조언",
						type: "keyword",
						target: ["건강", "관리", "안정", "평안"],
						weight: 8,
					},
				],
			},
		];
	}

	/**
	 * 단일 시나리오 테스트 실행
	 */
	async runScenarioTest(
		scenarioId: string,
		useAdvanced: boolean = true,
		options: any = {}
	): Promise<PromptTestResult> {
		const scenario = this.scenarios.find((s) => s.id === scenarioId);
		if (!scenario) {
			throw new Error(`시나리오 '${scenarioId}'를 찾을 수 없습니다.`);
		}

		const startTime = performance.now();

		// 프롬프트 생성
		const prompt = useAdvanced
			? generateAdvancedPrompt(scenario.testData, options)
			: generatePersonalizedPrompt(scenario.testData);

		const metadata = useAdvanced
			? generatePromptMetadata(scenario.testData, options)
			: { version: "1.0.0", legacy: true };

		const executionTime = performance.now() - startTime;

		// 품질 메트릭 평가
		const metrics: any = {};
		let totalScore = 0;
		let totalWeight = 0;

		for (const metric of scenario.qualityMetrics) {
			const result = this.evaluateMetric(prompt, metric);
			metrics[metric.name] = result;
			totalScore += result.score * metric.weight;
			totalWeight += metric.weight;
		}

		const qualityScore = totalWeight > 0 ? totalScore / totalWeight : 0;

		return {
			scenarioId: scenario.id,
			prompt,
			metadata,
			qualityScore: Math.round(qualityScore),
			metrics,
			executionTime,
			promptLength: prompt.length,
			estimatedTokens: metadata.estimatedTokens || this.estimateTokens(prompt),
		};
	}

	/**
	 * 품질 메트릭 평가
	 */
	private evaluateMetric(prompt: string, metric: QualityMetric) {
		switch (metric.type) {
			case "length":
				const length = prompt.length;
				const targetLength = metric.target as number;
				const lengthDiff = Math.abs(length - targetLength) / targetLength;
				const lengthScore = Math.max(0, 100 - lengthDiff * 100);
				return {
					value: length,
					score: Math.round(lengthScore),
					passed: lengthDiff < 0.2, // 20% 오차 허용
				};

			case "keyword":
				const keywords = metric.target as string[];
				const foundKeywords = keywords.filter((keyword) =>
					prompt.toLowerCase().includes(keyword.toLowerCase())
				);
				const keywordScore = (foundKeywords.length / keywords.length) * 100;
				return {
					value: foundKeywords,
					score: Math.round(keywordScore),
					passed: keywordScore >= 50, // 50% 이상 키워드 포함
				};

			case "sentiment":
				// 간단한 감정 분석 (긍정/부정 키워드 기반)
				const positiveWords = [
					"좋은",
					"훌륭한",
					"성공",
					"발전",
					"성장",
					"기회",
				];
				const negativeWords = ["나쁜", "실패", "문제", "위험", "어려운"];

				const positiveCount = positiveWords.filter((word) =>
					prompt.includes(word)
				).length;
				const negativeCount = negativeWords.filter((word) =>
					prompt.includes(word)
				).length;

				const sentimentScore = Math.min(
					100,
					(positiveCount / (negativeCount + 1)) * 50
				);
				return {
					value: { positive: positiveCount, negative: negativeCount },
					score: Math.round(sentimentScore),
					passed: positiveCount > negativeCount,
				};

			case "readability":
				// 간단한 가독성 점수 (문장 길이 기반)
				const sentences = prompt
					.split(/[.!?]/)
					.filter((s) => s.trim().length > 0);
				const avgSentenceLength =
					sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
				const readabilityScore = Math.max(
					0,
					100 - Math.abs(avgSentenceLength - 100) / 2
				);
				return {
					value: Math.round(avgSentenceLength),
					score: Math.round(readabilityScore),
					passed: avgSentenceLength > 20 && avgSentenceLength < 200,
				};

			case "personalization":
				// 개인화 정도 측정 (사용자 프로필 관련 키워드 포함도)
				const personalKeywords = [
					"나이",
					"성별",
					"관심",
					"연령",
					"톤",
					"스타일",
				];
				const personalCount = personalKeywords.filter((word) =>
					prompt.includes(word)
				).length;
				const personalizationScore =
					(personalCount / personalKeywords.length) * 100;
				return {
					value: personalCount,
					score: Math.round(personalizationScore),
					passed: personalCount >= 2,
				};

			default:
				return {
					value: null,
					score: 0,
					passed: false,
				};
		}
	}

	/**
	 * A/B 테스트 실행
	 */
	async runABTest(
		scenarioId: string,
		optionsA: any = {},
		optionsB: any = {}
	): Promise<ABTestComparison> {
		const [resultA, resultB] = await Promise.all([
			this.runScenarioTest(scenarioId, true, {
				...optionsA,
				experimentGroup: "A",
			}),
			this.runScenarioTest(scenarioId, true, {
				...optionsB,
				experimentGroup: "B",
			}),
		]);

		// 승자 결정 (품질 점수 기반)
		let winner: "A" | "B" | "tie" = "tie";
		if (Math.abs(resultA.qualityScore - resultB.qualityScore) >= 5) {
			winner = resultA.qualityScore > resultB.qualityScore ? "A" : "B";
		}

		// 신뢰도 계산 (간단한 계산)
		const scoreDiff = Math.abs(resultA.qualityScore - resultB.qualityScore);
		const confidenceLevel = Math.min(95, scoreDiff * 2);

		// 유의미한 차이점 식별
		const significantDifferences: string[] = [];

		Object.keys(resultA.metrics).forEach((metricName) => {
			const scoreA = resultA.metrics[metricName].score;
			const scoreB = resultB.metrics[metricName].score;
			if (Math.abs(scoreA - scoreB) >= 20) {
				significantDifferences.push(
					`${metricName}: A(${scoreA}) vs B(${scoreB})`
				);
			}
		});

		return {
			scenarioId,
			versionA: resultA,
			versionB: resultB,
			winner,
			confidenceLevel,
			significantDifferences,
		};
	}

	/**
	 * 모든 시나리오 실행 (회귀 테스트)
	 */
	async runRegressionTests(useAdvanced: boolean = true): Promise<{
		overall: {
			passed: number;
			failed: number;
			averageScore: number;
		};
		results: PromptTestResult[];
	}> {
		const results: PromptTestResult[] = [];

		for (const scenario of this.scenarios) {
			try {
				const result = await this.runScenarioTest(scenario.id, useAdvanced);
				results.push(result);
			} catch (error) {
				console.error(`시나리오 ${scenario.id} 실행 실패:`, error);
			}
		}

		const passed = results.filter((r) => r.qualityScore >= 70).length;
		const failed = results.length - passed;
		const averageScore =
			results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;

		return {
			overall: {
				passed,
				failed,
				averageScore: Math.round(averageScore),
			},
			results,
		};
	}

	/**
	 * 스냅샷 저장
	 */
	saveSnapshot(scenarioId: string, prompt: string) {
		this.snapshots.set(scenarioId, prompt);
	}

	/**
	 * 스냅샷 비교
	 */
	compareWithSnapshot(
		scenarioId: string,
		currentPrompt: string
	): {
		changed: boolean;
		diff?: string;
	} {
		const snapshot = this.snapshots.get(scenarioId);
		if (!snapshot) {
			return { changed: true, diff: "No snapshot found" };
		}

		if (snapshot === currentPrompt) {
			return { changed: false };
		}

		// 간단한 diff 계산
		const diff = this.calculateDiff(snapshot, currentPrompt);
		return { changed: true, diff };
	}

	/**
	 * 단순 diff 계산
	 */
	private calculateDiff(old: string, current: string): string {
		const oldLines = old.split("\n");
		const currentLines = current.split("\n");

		const maxLines = Math.max(oldLines.length, currentLines.length);
		const diffLines: string[] = [];

		for (let i = 0; i < maxLines; i++) {
			const oldLine = oldLines[i] || "";
			const currentLine = currentLines[i] || "";

			if (oldLine !== currentLine) {
				if (oldLine) diffLines.push(`- ${oldLine}`);
				if (currentLine) diffLines.push(`+ ${currentLine}`);
			}
		}

		return diffLines.join("\n");
	}

	/**
	 * 토큰 수 추정 (간단한 계산)
	 */
	private estimateTokens(text: string): number {
		// 한국어는 대략 1글자당 1.5토큰으로 추정
		return Math.round(text.length * 1.5);
	}

	/**
	 * 커스텀 시나리오 추가
	 */
	addCustomScenario(scenario: PromptTestScenario) {
		this.scenarios.push(scenario);
	}

	/**
	 * 시나리오 목록 조회
	 */
	getScenarios(): PromptTestScenario[] {
		return [...this.scenarios];
	}
}

/**
 * 프롬프트 품질 리포트 생성
 */
export function generateQualityReport(results: PromptTestResult[]): {
	summary: {
		totalTests: number;
		averageScore: number;
		passRate: number;
		averageTokens: number;
		averageExecutionTime: number;
	};
	recommendations: string[];
	topIssues: string[];
} {
	const totalTests = results.length;
	const averageScore =
		results.reduce((sum, r) => sum + r.qualityScore, 0) / totalTests;
	const passRate =
		(results.filter((r) => r.qualityScore >= 70).length / totalTests) * 100;
	const averageTokens =
		results.reduce((sum, r) => sum + r.estimatedTokens, 0) / totalTests;
	const averageExecutionTime =
		results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests;

	// 권장사항 생성
	const recommendations: string[] = [];
	if (averageScore < 70) {
		recommendations.push("전체적인 프롬프트 품질 개선이 필요합니다.");
	}
	if (averageTokens > 2000) {
		recommendations.push("프롬프트 길이를 줄여 토큰 사용량을 최적화하세요.");
	}
	if (averageExecutionTime > 100) {
		recommendations.push("프롬프트 생성 성능을 개선하세요.");
	}

	// 주요 문제점 식별
	const topIssues: string[] = [];
	const failedMetrics = new Map<string, number>();

	results.forEach((result) => {
		Object.entries(result.metrics).forEach(([metricName, metric]) => {
			if (!metric.passed) {
				failedMetrics.set(metricName, (failedMetrics.get(metricName) || 0) + 1);
			}
		});
	});

	// 가장 자주 실패하는 메트릭들
	const sortedIssues = Array.from(failedMetrics.entries())
		.sort(([, a], [, b]) => b - a)
		.slice(0, 3);

	sortedIssues.forEach(([metricName, count]) => {
		topIssues.push(`${metricName}: ${count}회 실패`);
	});

	return {
		summary: {
			totalTests,
			averageScore: Math.round(averageScore),
			passRate: Math.round(passRate),
			averageTokens: Math.round(averageTokens),
			averageExecutionTime: Math.round(averageExecutionTime),
		},
		recommendations,
		topIssues,
	};
}
