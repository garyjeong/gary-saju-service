/**
 * AI 클라이언트 통합 테스트
 * 환경변수 설정, 공급자 토글, 에러 핸들링 테스트
 */

import {
	AI_CONFIG,
	getProviderConfig,
	getEnabledProviders,
	AIProvider,
} from "@/lib/ai/ai-config";
import { AIServiceManager } from "@/lib/ai/ai-service-manager";
import { AIServiceError, AI_ERROR_CODES } from "@/lib/ai/ai-client-interface";
import {
	RetryExecutor,
	PROVIDER_RETRY_STRATEGIES,
} from "@/lib/ai/retry-strategies";

// Mock 환경변수 설정
const originalEnv = process.env;

beforeEach(() => {
	jest.resetModules();
	process.env = { ...originalEnv };
});

afterEach(() => {
	process.env = originalEnv;
});

describe("AI 설정 시스템 테스트", () => {
	describe("환경변수 기반 설정", () => {
		it("기본 공급자가 'auto'일 때 사용 가능한 API 키에 따라 선택되어야 한다", () => {
			process.env.AI_DEFAULT_PROVIDER = "auto";
			process.env.OPENAI_API_KEY = "test-openai-key";
			process.env.GOOGLE_AI_API_KEY = "test-google-key";

			// AI_CONFIG는 모듈 로드 시 설정되므로 다시 import
			jest.resetModules();
			const { AI_CONFIG } = require("@/lib/ai/ai-config");

			// Google AI가 우선 선택되어야 함 (비용 효율성)
			expect(AI_CONFIG.defaultProvider).toBe("google");
		});

		it("OpenAI API 키만 있을 때 OpenAI가 선택되어야 한다", () => {
			process.env.AI_DEFAULT_PROVIDER = "auto";
			process.env.OPENAI_API_KEY = "test-openai-key";
			delete process.env.GOOGLE_AI_API_KEY;

			jest.resetModules();
			const { AI_CONFIG } = require("@/lib/ai/ai-config");

			expect(AI_CONFIG.defaultProvider).toBe("openai");
		});

		it("API 키가 없을 때 에러가 발생해야 한다", () => {
			process.env.AI_DEFAULT_PROVIDER = "auto";
			delete process.env.OPENAI_API_KEY;
			delete process.env.GOOGLE_AI_API_KEY;

			expect(() => {
				jest.resetModules();
				require("@/lib/ai/ai-config");
			}).toThrow("사용 가능한 API 키가 없습니다");
		});

		it("특정 공급자 설정 시 해당 API 키가 필요해야 한다", () => {
			process.env.AI_DEFAULT_PROVIDER = "openai";
			delete process.env.OPENAI_API_KEY;

			expect(() => {
				jest.resetModules();
				require("@/lib/ai/ai-config");
			}).toThrow("OPENAI_API_KEY가 설정되지 않았습니다");
		});
	});

	describe("공급자 설정 유틸리티", () => {
		beforeEach(() => {
			process.env.OPENAI_API_KEY = "test-openai-key";
			process.env.GOOGLE_AI_API_KEY = "test-google-key";
		});

		it("활성화된 공급자 목록을 반환해야 한다", () => {
			jest.resetModules();
			const { getEnabledProviders, AI_CONFIG } = require("@/lib/ai/ai-config");

			const enabledProviders = getEnabledProviders(AI_CONFIG);
			expect(enabledProviders).toContain("openai");
			expect(enabledProviders).toContain("google");
		});

		it("특정 공급자 설정을 조회할 수 있어야 한다", () => {
			jest.resetModules();
			const { getProviderConfig, AI_CONFIG } = require("@/lib/ai/ai-config");

			const openaiConfig = getProviderConfig(AI_CONFIG, "openai");
			expect(openaiConfig.enabled).toBe(true);
			expect(openaiConfig.apiKey).toBe("test-openai-key");
		});
	});
});

describe("AI 서비스 관리자 테스트", () => {
	let serviceManager: AIServiceManager;

	beforeEach(() => {
		process.env.OPENAI_API_KEY = "test-openai-key";
		process.env.GOOGLE_AI_API_KEY = "test-google-key";
		process.env.AI_DEFAULT_PROVIDER = "openai";
	});

	afterEach(async () => {
		if (serviceManager) {
			await serviceManager.shutdown();
		}
	});

	it("서비스 매니저가 정상적으로 초기화되어야 한다", () => {
		expect(() => {
			serviceManager = new AIServiceManager();
		}).not.toThrow();

		expect(serviceManager).toBeDefined();
	});

	it("지원되는 공급자 목록을 반환해야 한다", () => {
		serviceManager = new AIServiceManager();
		const supportedProviders = serviceManager.getSupportedProviders();

		expect(supportedProviders).toContain("openai");
		expect(supportedProviders).toContain("google");
	});

	it("헬스 체크가 정상적으로 작동해야 한다", async () => {
		serviceManager = new AIServiceManager();

		const healthStatus = await serviceManager.getHealthStatus();
		expect(healthStatus).toBeDefined();
		expect(typeof healthStatus.openai).toBe("boolean");
		expect(typeof healthStatus.google).toBe("boolean");
	});
});

describe("재시도 전략 테스트", () => {
	let retryExecutor: RetryExecutor;

	beforeEach(() => {
		retryExecutor = new RetryExecutor(
			"openai",
			PROVIDER_RETRY_STRATEGIES.openai
		);
	});

	it("재시도 실행기가 정상적으로 초기화되어야 한다", () => {
		expect(retryExecutor).toBeDefined();
	});

	it("성공하는 작업은 즉시 반환되어야 한다", async () => {
		const mockOperation = jest.fn().mockResolvedValue("success");

		const result = await retryExecutor.execute(mockOperation);

		expect(result).toBe("success");
		expect(mockOperation).toHaveBeenCalledTimes(1);
	});

	it("재시도 가능한 에러는 재시도되어야 한다", async () => {
		const retryableError = new AIServiceError(
			"Rate limit exceeded",
			"openai",
			AI_ERROR_CODES.RATE_LIMIT_EXCEEDED
		);

		const mockOperation = jest
			.fn()
			.mockRejectedValueOnce(retryableError)
			.mockRejectedValueOnce(retryableError)
			.mockResolvedValue("success");

		const result = await retryExecutor.execute(mockOperation);

		expect(result).toBe("success");
		expect(mockOperation).toHaveBeenCalledTimes(3);
	});

	it("재시도 불가능한 에러는 즉시 실패해야 한다", async () => {
		const nonRetryableError = new AIServiceError(
			"Invalid API key",
			"openai",
			AI_ERROR_CODES.AUTH_INVALID_API_KEY
		);

		const mockOperation = jest.fn().mockRejectedValue(nonRetryableError);

		await expect(retryExecutor.execute(mockOperation)).rejects.toThrow(
			"Invalid API key"
		);

		expect(mockOperation).toHaveBeenCalledTimes(1);
	});

	it("최대 재시도 횟수를 초과하면 실패해야 한다", async () => {
		const retryableError = new AIServiceError(
			"Timeout",
			"openai",
			AI_ERROR_CODES.TIMEOUT
		);

		const mockOperation = jest.fn().mockRejectedValue(retryableError);

		await expect(retryExecutor.execute(mockOperation)).rejects.toThrow();

		// 기본 재시도 횟수 + 1 (초기 시도)
		const expectedCalls = PROVIDER_RETRY_STRATEGIES.openai.maxRetries + 1;
		expect(mockOperation).toHaveBeenCalledTimes(expectedCalls);
	});
});

describe("에러 처리 테스트", () => {
	it("AIServiceError가 올바른 정보를 포함해야 한다", () => {
		const error = new AIServiceError(
			"Test error message",
			"openai",
			AI_ERROR_CODES.TIMEOUT,
			{ requestId: "test-123" }
		);

		expect(error.message).toBe("Test error message");
		expect(error.provider).toBe("openai");
		expect(error.errorCode).toBe(AI_ERROR_CODES.TIMEOUT);
		expect(error.details).toEqual({ requestId: "test-123" });
		expect(error.name).toBe("AIServiceError");
	});

	it("다양한 에러 코드가 정의되어 있어야 한다", () => {
		expect(AI_ERROR_CODES.TIMEOUT).toBeDefined();
		expect(AI_ERROR_CODES.RATE_LIMIT_EXCEEDED).toBeDefined();
		expect(AI_ERROR_CODES.AUTH_INVALID_API_KEY).toBeDefined();
		expect(AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED).toBeDefined();
		expect(AI_ERROR_CODES.VALIDATION_INVALID_REQUEST).toBeDefined();
		expect(AI_ERROR_CODES.VALIDATION_CONTENT_FILTER).toBeDefined();
		expect(AI_ERROR_CODES.SERVER_INTERNAL_ERROR).toBeDefined();
		expect(AI_ERROR_CODES.SERVER_UNAVAILABLE).toBeDefined();
		expect(AI_ERROR_CODES.NETWORK_CONNECTION_ERROR).toBeDefined();
		expect(AI_ERROR_CODES.UNKNOWN_ERROR).toBeDefined();
	});
});
