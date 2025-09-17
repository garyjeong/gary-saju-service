/**
 * 통합 프롬프트 관리자
 * 기존 시스템과 고도화된 시스템의 브릿지 역할
 */

import { AIInterpretationRequest } from "./openai-client";
import { generatePersonalizedPrompt } from "./prompt-templates";
import {
	generateAdvancedPrompt,
	generatePromptMetadata,
	ENHANCED_TONE_MODIFIERS,
	PROMPT_THEMES,
	RESPONSE_FORMATS,
} from "./advanced-prompt-templates";
import { PromptTestRunner } from "./prompt-testing";

/**
 * 프롬프트 생성 옵션
 */
export interface PromptGenerationOptions {
	// 시스템 설정
	useAdvancedSystem?: boolean;
	version?: string;

	// 고급 옵션
	theme?: keyof typeof PROMPT_THEMES;
	responseFormat?: keyof typeof RESPONSE_FORMATS;
	experimentGroup?: "A" | "B" | "C";

	// A/B 테스트
	enableABTest?: boolean;
	abTestRatio?: number; // 0.0 - 1.0

	// 성능 설정
	maxTokens?: number;
	enableCaching?: boolean;

	// 품질 관리
	enableQualityCheck?: boolean;
	minQualityScore?: number;

	// 커스텀 지침
	customInstructions?: string[];

	// 디버깅
	includeDebugInfo?: boolean;
}

/**
 * 프롬프트 생성 결과
 */
export interface PromptGenerationResult {
	prompt: string;
	metadata: {
		version: string;
		system: "legacy" | "advanced";
		theme?: string;
		responseFormat?: string;
		experimentGroup?: string;
		estimatedTokens: number;
		complexity: string;
		generationTime: number;
		qualityScore?: number;
		debugInfo?: any;
	};
	alternatives?: {
		prompt: string;
		experimentGroup: string;
		qualityScore?: number;
	}[];
}

/**
 * 통합 프롬프트 관리자 클래스
 */
export class PromptManager {
	private testRunner: PromptTestRunner;
	private readonly defaultOptions: PromptGenerationOptions;

	constructor() {
		this.testRunner = new PromptTestRunner();
		this.defaultOptions = {
			useAdvancedSystem: true,
			theme: "modern_practical",
			responseFormat: "detailed_json",
			experimentGroup: "A",
			enableABTest: false,
			abTestRatio: 0.1,
			maxTokens: 2000,
			enableCaching: true,
			enableQualityCheck: true,
			minQualityScore: 70,
			includeDebugInfo: false,
		};
	}

	/**
	 * 메인 프롬프트 생성 함수
	 */
	async generatePrompt(
		request: AIInterpretationRequest,
		options: PromptGenerationOptions = {}
	): Promise<PromptGenerationResult> {
		const finalOptions = { ...this.defaultOptions, ...options };
		const startTime = performance.now();

		try {
			// A/B 테스트 활성화 시
			if (
				finalOptions.enableABTest &&
				Math.random() < (finalOptions.abTestRatio || 0.1)
			) {
				return await this.generateABTestPrompts(request, finalOptions);
			}

			// 일반 프롬프트 생성
			const result = await this.generateSinglePrompt(request, finalOptions);

			// 품질 검사
			if (finalOptions.enableQualityCheck) {
				await this.performQualityCheck(result, request, finalOptions);
			}

			return result;
		} catch (error) {
			console.error("프롬프트 생성 실패:", error);

			// 폴백: 기존 시스템 사용
			return this.generateFallbackPrompt(request, finalOptions, startTime);
		}
	}

	/**
	 * 단일 프롬프트 생성
	 */
	private async generateSinglePrompt(
		request: AIInterpretationRequest,
		options: PromptGenerationOptions
	): Promise<PromptGenerationResult> {
		const startTime = performance.now();

		let prompt: string;
		let metadata: any;

		if (options.useAdvancedSystem) {
			// 고도화된 시스템 사용
			prompt = generateAdvancedPrompt(request, {
				theme: options.theme,
				responseFormat: options.responseFormat,
				experimentGroup: options.experimentGroup,
				customInstructions: options.customInstructions,
			});

			metadata = generatePromptMetadata(request, {
				theme: options.theme,
				responseFormat: options.responseFormat,
				experimentGroup: options.experimentGroup,
			});
		} else {
			// 기존 시스템 사용
			prompt = generatePersonalizedPrompt(request);
			metadata = {
				version: "1.0.0",
				system: "legacy" as const,
				estimatedTokens: this.estimateTokens(prompt),
				complexity: "medium",
			};
		}

		const generationTime = performance.now() - startTime;

		// 토큰 제한 확인
		if (options.maxTokens && metadata.estimatedTokens > options.maxTokens) {
			throw new Error(
				`토큰 수 초과: ${metadata.estimatedTokens} > ${options.maxTokens}`
			);
		}

		return {
			prompt,
			metadata: {
				...metadata,
				system: options.useAdvancedSystem
					? ("advanced" as const)
					: ("legacy" as const),
				generationTime,
				debugInfo: options.includeDebugInfo
					? {
							options,
							request: this.sanitizeRequest(request),
					  }
					: undefined,
			},
		};
	}

	/**
	 * A/B 테스트 프롬프트 생성
	 */
	private async generateABTestPrompts(
		request: AIInterpretationRequest,
		options: PromptGenerationOptions
	): Promise<PromptGenerationResult> {
		// 그룹 A: 기본 설정
		const optionsA = { ...options, experimentGroup: "A" as const };
		const resultA = await this.generateSinglePrompt(request, optionsA);

		// 그룹 B: 다른 테마나 톤으로 실험
		const optionsB = {
			...options,
			experimentGroup: "B" as const,
			theme:
				options.theme === "modern_practical"
					? ("psychological" as const)
					: ("modern_practical" as const),
		};
		const resultB = await this.generateSinglePrompt(request, optionsB);

		// 품질 점수 비교 (실제 AI 호출 없이 기본 메트릭으로)
		const qualityA = await this.estimateQuality(resultA.prompt, request);
		const qualityB = await this.estimateQuality(resultB.prompt, request);

		// 더 높은 품질의 프롬프트를 메인으로 선택
		const mainResult = qualityA >= qualityB ? resultA : resultB;
		const altResult = qualityA >= qualityB ? resultB : resultA;

		return {
			...mainResult,
			metadata: {
				...mainResult.metadata,
				qualityScore: Math.max(qualityA, qualityB),
			},
			alternatives: [
				{
					prompt: altResult.prompt,
					experimentGroup: altResult.metadata.experimentGroup || "B",
					qualityScore: qualityA >= qualityB ? qualityB : qualityA,
				},
			],
		};
	}

	/**
	 * 품질 검사 수행
	 */
	private async performQualityCheck(
		result: PromptGenerationResult,
		request: AIInterpretationRequest,
		options: PromptGenerationOptions
	) {
		const qualityScore = await this.estimateQuality(result.prompt, request);
		result.metadata.qualityScore = qualityScore;

		if (qualityScore < (options.minQualityScore || 70)) {
			console.warn(
				`낮은 품질 점수: ${qualityScore} < ${options.minQualityScore}`
			);

			// 품질 개선 시도 (간단한 재생성)
			if (options.useAdvancedSystem) {
				const improvedOptions = {
					...options,
					theme: "wisdom" as const, // 더 신중한 테마로 변경
					customInstructions: [
						...(options.customInstructions || []),
						"더욱 개인화되고 구체적인 조언을 제공해주세요",
					],
				};

				const improvedResult = await this.generateSinglePrompt(
					request,
					improvedOptions as any
				);
				const improvedScore = await this.estimateQuality(
					improvedResult.prompt,
					request
				);

				if (improvedScore > qualityScore) {
					result.prompt = improvedResult.prompt;
					result.metadata = {
						...result.metadata,
						...improvedResult.metadata,
						qualityScore: improvedScore,
					};
				}
			}
		}
	}

	/**
	 * 폴백 프롬프트 생성
	 */
	private generateFallbackPrompt(
		request: AIInterpretationRequest,
		options: PromptGenerationOptions,
		startTime: number
	): PromptGenerationResult {
		const prompt = generatePersonalizedPrompt(request);
		const generationTime = performance.now() - startTime;

		return {
			prompt,
			metadata: {
				version: "1.0.0-fallback",
				system: "legacy",
				estimatedTokens: this.estimateTokens(prompt),
				complexity: "simple",
				generationTime,
				qualityScore: 60, // 폴백이므로 낮은 점수
			},
		};
	}

	/**
	 * 품질 추정 (간단한 휴리스틱 기반)
	 */
	private async estimateQuality(
		prompt: string,
		request: AIInterpretationRequest
	): Promise<number> {
		let score = 70; // 기본 점수

		// 길이 검사
		if (prompt.length < 500) score -= 10;
		if (prompt.length > 5000) score -= 15;
		if (prompt.length >= 800 && prompt.length <= 3000) score += 10;

		// 개인화 정도 검사
		if (request.userProfile) {
			if (request.userProfile.tone && prompt.includes(request.userProfile.tone))
				score += 5;
			if (request.userProfile.age && prompt.includes("연령")) score += 5;
			if (
				request.userProfile.interests &&
				request.userProfile.interests.some((interest) =>
					prompt.includes(interest)
				)
			)
				score += 10;
		}

		// 구조적 요소 검사
		if (prompt.includes("JSON")) score += 5;
		if (prompt.includes("응답 형식")) score += 5;
		if (prompt.includes("주의사항")) score += 5;

		// 전문성 키워드 검사
		const professionalKeywords = ["전문가", "해석", "분석", "조언", "가이드"];
		const foundKeywords = professionalKeywords.filter((keyword) =>
			prompt.includes(keyword)
		).length;
		score += foundKeywords * 2;

		// 부정적 표현 검사 (감점)
		const negativeKeywords = ["안 좋은", "나쁜", "문제", "위험"];
		const negativeCount = negativeKeywords.filter((keyword) =>
			prompt.includes(keyword)
		).length;
		score -= negativeCount * 5;

		return Math.max(0, Math.min(100, score));
	}

	/**
	 * 토큰 수 추정
	 */
	private estimateTokens(text: string): number {
		// 한국어는 대략 1글자당 1.5토큰으로 추정
		return Math.round(text.length * 1.5);
	}

	/**
	 * 요청 데이터 정화 (디버깅용)
	 */
	private sanitizeRequest(request: AIInterpretationRequest): any {
		return {
			hasUserProfile: !!request.userProfile,
			userProfileKeys: request.userProfile
				? Object.keys(request.userProfile)
				: [],
			sajuResultKeys: Object.keys(request.sajuResult),
			estimatedDataSize: JSON.stringify(request).length,
		};
	}

	/**
	 * 프롬프트 통계 조회
	 */
	async getPromptStatistics(
		timeRange: "day" | "week" | "month" = "day"
	): Promise<{
		totalGenerated: number;
		averageQuality: number;
		systemUsage: {
			advanced: number;
			legacy: number;
		};
		popularThemes: Array<{ theme: string; count: number }>;
		averageTokens: number;
		averageGenerationTime: number;
	}> {
		// 실제 구현에서는 데이터베이스나 로그에서 통계를 가져와야 함
		// 여기서는 목업 데이터 반환
		return {
			totalGenerated: 150,
			averageQuality: 78,
			systemUsage: {
				advanced: 120,
				legacy: 30,
			},
			popularThemes: [
				{ theme: "modern_practical", count: 80 },
				{ theme: "wisdom", count: 40 },
				{ theme: "psychological", count: 30 },
			],
			averageTokens: 1250,
			averageGenerationTime: 45,
		};
	}

	/**
	 * 프롬프트 최적화 제안
	 */
	async getOptimizationSuggestions(
		request: AIInterpretationRequest,
		currentOptions: PromptGenerationOptions
	): Promise<{
		suggestions: Array<{
			type: "performance" | "quality" | "personalization";
			description: string;
			impact: "low" | "medium" | "high";
			implementation: string;
		}>;
		estimatedImprovement: number;
	}> {
		const suggestions = [];

		// 성능 최적화 제안
		if (currentOptions.maxTokens && currentOptions.maxTokens > 1500) {
			suggestions.push({
				type: "performance" as const,
				description: "토큰 사용량을 줄여 응답 속도를 향상시킬 수 있습니다",
				impact: "medium" as const,
				implementation:
					"maxTokens을 1200으로 설정하고 responseFormat을 simple_json으로 변경",
			});
		}

		// 품질 개선 제안
		if (!currentOptions.enableQualityCheck) {
			suggestions.push({
				type: "quality" as const,
				description:
					"품질 검사를 활성화하여 일관된 고품질 응답을 보장할 수 있습니다",
				impact: "high" as const,
				implementation: "enableQualityCheck: true, minQualityScore: 75 설정",
			});
		}

		// 개인화 개선 제안
		if (
			request.userProfile &&
			request.userProfile.interests &&
			request.userProfile.interests.length > 0 &&
			currentOptions.theme === "modern_practical"
		) {
			suggestions.push({
				type: "personalization" as const,
				description: "사용자의 관심사에 더 특화된 테마를 사용할 수 있습니다",
				impact: "medium" as const,
				implementation: `관심사 ${request.userProfile.interests[0]}에 맞는 테마로 변경`,
			});
		}

		const estimatedImprovement = suggestions.reduce((sum, s) => {
			const impact = s.impact === "high" ? 15 : s.impact === "medium" ? 10 : 5;
			return sum + impact;
		}, 0);

		return {
			suggestions,
			estimatedImprovement: Math.min(estimatedImprovement, 30), // 최대 30% 개선
		};
	}

	/**
	 * 테스트 러너 접근자
	 */
	getTestRunner(): PromptTestRunner {
		return this.testRunner;
	}
}
