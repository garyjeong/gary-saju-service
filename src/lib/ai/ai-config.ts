/**
 * AI 공급자 통합 설정 시스템
 * 환경변수 기반 동적 공급자 선택 및 관리
 */

/**
 * 지원되는 AI 공급자 목록
 */
export type AIProvider = "openai" | "google" | "auto";

/**
 * AI 공급자별 설정 인터페이스
 */
export interface AIProviderConfig {
	name: string;
	enabled: boolean;
	apiKey?: string;
	model: string;
	maxTokens: number;
	temperature: number;
	timeout: number;
	retries: number;
	metadata: {
		version: string;
		description: string;
		costPerToken?: number;
		rateLimit?: {
			requestsPerMinute: number;
			tokensPerMinute: number;
		};
	};
}

/**
 * 통합 AI 설정
 */
export interface AIConfig {
	defaultProvider: AIProvider;
	fallbackProvider?: AIProvider;
	enableFallback: boolean;
	providers: {
		openai: AIProviderConfig;
		google: AIProviderConfig;
	};
	features: {
		enableAdvancedPrompts: boolean;
		enableQualityCheck: boolean;
		enableCaching: boolean;
		enableAnalytics: boolean;
		enableDebugMode: boolean;
	};
	limits: {
		maxRequestsPerHour: number;
		maxTokensPerRequest: number;
		cacheExpiryHours: number;
	};
}

/**
 * 환경변수에서 AI 설정을 로드하는 함수
 */
function loadAIConfigFromEnv(): AIConfig {
	// 기본 공급자 결정 (환경변수 우선, 없으면 auto)
	const defaultProvider =
		(process.env.AI_DEFAULT_PROVIDER as AIProvider) || "auto";
	const fallbackProvider = process.env.AI_FALLBACK_PROVIDER as AIProvider;

	// API 키 확인
	const openaiApiKey = process.env.OPENAI_API_KEY;
	const googleApiKey = process.env.GOOGLE_AI_API_KEY;

	// 'auto' 모드에서는 사용 가능한 API 키에 따라 자동 선택
	let resolvedDefaultProvider = defaultProvider;
	if (defaultProvider === "auto") {
		if (googleApiKey && openaiApiKey) {
			// 둘 다 있으면 Google AI 우선 (비용 효율성)
			resolvedDefaultProvider = "google";
		} else if (googleApiKey) {
			resolvedDefaultProvider = "google";
		} else if (openaiApiKey) {
			resolvedDefaultProvider = "openai";
		} else {
			throw new Error(
				"AI_DEFAULT_PROVIDER가 auto로 설정되었지만, 사용 가능한 API 키가 없습니다. OPENAI_API_KEY 또는 GOOGLE_AI_API_KEY를 설정해주세요."
			);
		}
	}

	// 선택된 공급자의 API 키 검증
	if (resolvedDefaultProvider === "openai" && !openaiApiKey) {
		throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
	}
	if (resolvedDefaultProvider === "google" && !googleApiKey) {
		throw new Error("GOOGLE_AI_API_KEY가 설정되지 않았습니다.");
	}

	return {
		defaultProvider: resolvedDefaultProvider,
		fallbackProvider:
			fallbackProvider ||
			(resolvedDefaultProvider === "openai" ? "google" : "openai"),
		enableFallback: process.env.AI_ENABLE_FALLBACK !== "false",

		providers: {
			openai: {
				name: "OpenAI GPT",
				enabled: !!openaiApiKey,
				apiKey: openaiApiKey,
				model: process.env.OPENAI_MODEL || "gpt-4o-mini",
				maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
				temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
				timeout: parseInt(process.env.OPENAI_TIMEOUT || "30000"),
				retries: parseInt(process.env.OPENAI_RETRIES || "3"),
				metadata: {
					version: "gpt-4o-mini",
					description: "OpenAI GPT-4o Mini - 빠르고 비용 효율적",
					costPerToken: 0.00015, // 추정값 ($0.15/1M tokens)
					rateLimit: {
						requestsPerMinute: 500,
						tokensPerMinute: 50000,
					},
				},
			},

			google: {
				name: "Google Gemini",
				enabled: !!googleApiKey,
				apiKey: googleApiKey,
				model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash",
				maxTokens: parseInt(process.env.GOOGLE_AI_MAX_TOKENS || "2000"),
				temperature: parseFloat(process.env.GOOGLE_AI_TEMPERATURE || "0.7"),
				timeout: parseInt(process.env.GOOGLE_AI_TIMEOUT || "30000"),
				retries: parseInt(process.env.GOOGLE_AI_RETRIES || "3"),
				metadata: {
					version: "gemini-1.5-flash",
					description: "Google Gemini 1.5 Flash - 무료 할당량 제공",
					costPerToken: 0.00005, // 추정값 ($0.05/1M tokens)
					rateLimit: {
						requestsPerMinute: 1000,
						tokensPerMinute: 1000000,
					},
				},
			},
		},

		features: {
			enableAdvancedPrompts: process.env.AI_ENABLE_ADVANCED_PROMPTS !== "false",
			enableQualityCheck: process.env.AI_ENABLE_QUALITY_CHECK !== "false",
			enableCaching: process.env.AI_ENABLE_CACHING !== "false",
			enableAnalytics: process.env.AI_ENABLE_ANALYTICS !== "false",
			enableDebugMode: process.env.AI_DEBUG_MODE === "true",
		},

		limits: {
			maxRequestsPerHour: parseInt(
				process.env.AI_MAX_REQUESTS_PER_HOUR || "100"
			),
			maxTokensPerRequest: parseInt(
				process.env.AI_MAX_TOKENS_PER_REQUEST || "4000"
			),
			cacheExpiryHours: parseInt(process.env.AI_CACHE_EXPIRY_HOURS || "24"),
		},
	};
}

/**
 * 전역 AI 설정 인스턴스
 */
export const AI_CONFIG: AIConfig = loadAIConfigFromEnv();

/**
 * AI 설정 유효성 검증
 */
export function validateAIConfig(config: AIConfig): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// 기본 공급자 검증
	if (!["openai", "google"].includes(config.defaultProvider)) {
		errors.push(`지원되지 않는 기본 공급자: ${config.defaultProvider}`);
	}

	// 공급자별 설정 검증
	Object.entries(config.providers).forEach(([providerName, providerConfig]) => {
		if (!providerConfig.enabled && config.defaultProvider === providerName) {
			errors.push(`기본 공급자 ${providerName}이 비활성화되어 있습니다.`);
		}

		if (providerConfig.enabled && !providerConfig.apiKey) {
			errors.push(`${providerName} 공급자가 활성화되었지만 API 키가 없습니다.`);
		}

		if (providerConfig.maxTokens > config.limits.maxTokensPerRequest) {
			warnings.push(
				`${providerName} maxTokens (${providerConfig.maxTokens})이 전역 제한 (${config.limits.maxTokensPerRequest})보다 큽니다.`
			);
		}
	});

	// 폴백 설정 검증
	if (config.enableFallback && config.fallbackProvider) {
		if (!config.providers[config.fallbackProvider]?.enabled) {
			warnings.push(
				`폴백 공급자 ${config.fallbackProvider}가 비활성화되어 있습니다.`
			);
		}
	}

	// 기능 설정 검증
	if (
		!config.features.enableAdvancedPrompts &&
		!config.features.enableQualityCheck
	) {
		warnings.push(
			"고급 프롬프트와 품질 검사가 모두 비활성화되어 있습니다. 품질이 저하될 수 있습니다."
		);
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * 활성화된 공급자 목록 조회
 */
export function getEnabledProviders(
	config: AIConfig = AI_CONFIG
): AIProvider[] {
	return Object.entries(config.providers)
		.filter(([_, providerConfig]) => providerConfig.enabled)
		.map(([providerName]) => providerName as AIProvider);
}

/**
 * 특정 공급자의 설정 조회
 */
export function getProviderConfig(
	provider: AIProvider,
	config: AIConfig = AI_CONFIG
): AIProviderConfig | null {
	if (provider === "auto") {
		return getProviderConfig(config.defaultProvider, config);
	}
	return config.providers[provider] || null;
}

/**
 * 비용 효율적인 공급자 선택
 */
export function getCostEffectiveProvider(
	config: AIConfig = AI_CONFIG
): AIProvider {
	const enabledProviders = getEnabledProviders(config);

	if (enabledProviders.length === 0) {
		throw new Error("활성화된 AI 공급자가 없습니다.");
	}

	// 비용 효율성 순서: Google < OpenAI
	if (enabledProviders.includes("google")) {
		return "google";
	}

	return enabledProviders[0];
}

/**
 * 성능 우선 공급자 선택
 */
export function getPerformanceProvider(
	config: AIConfig = AI_CONFIG
): AIProvider {
	const enabledProviders = getEnabledProviders(config);

	if (enabledProviders.length === 0) {
		throw new Error("활성화된 AI 공급자가 없습니다.");
	}

	// 성능 우선 순서: OpenAI >= Google
	if (enabledProviders.includes("openai")) {
		return "openai";
	}

	return enabledProviders[0];
}

/**
 * AI 설정 정보 출력 (디버깅용)
 */
export function printAIConfigSummary(config: AIConfig = AI_CONFIG): void {
	if (!config.features.enableDebugMode) return;

	console.log("\n🤖 AI 설정 요약:");
	console.log(`├─ 기본 공급자: ${config.defaultProvider}`);
	console.log(`├─ 폴백 공급자: ${config.fallbackProvider || "없음"}`);
	console.log(`├─ 폴백 활성화: ${config.enableFallback ? "예" : "아니오"}`);

	console.log("├─ 공급자별 상태:");
	Object.entries(config.providers).forEach(([name, providerConfig]) => {
		const status = providerConfig.enabled ? "✅" : "❌";
		const model = providerConfig.model || "미설정";
		console.log(`│  ├─ ${name}: ${status} (${model})`);
	});

	console.log("├─ 활성화된 기능:");
	Object.entries(config.features).forEach(([feature, enabled]) => {
		const status = enabled ? "✅" : "❌";
		console.log(`│  ├─ ${feature}: ${status}`);
	});

	console.log("└─ 제한 설정:");
	console.log(`   ├─ 시간당 최대 요청: ${config.limits.maxRequestsPerHour}`);
	console.log(`   ├─ 요청당 최대 토큰: ${config.limits.maxTokensPerRequest}`);
	console.log(`   └─ 캐시 만료 시간: ${config.limits.cacheExpiryHours}시간\n`);
}

// 초기화 시 설정 검증 및 정보 출력
const validation = validateAIConfig(AI_CONFIG);
if (!validation.isValid) {
	console.error("❌ AI 설정 오류:", validation.errors);
	throw new Error(
		`AI 설정이 유효하지 않습니다: ${validation.errors.join(", ")}`
	);
}

if (validation.warnings.length > 0) {
	console.warn("⚠️ AI 설정 경고:", validation.warnings);
}

printAIConfigSummary();
