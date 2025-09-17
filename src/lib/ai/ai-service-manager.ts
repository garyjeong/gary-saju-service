/**
 * AI 서비스 통합 관리자
 * 다중 공급자 지원, 폴백 처리, 로드 밸런싱
 */

import {
	IAIClient,
	IAIClientFactory,
	UnifiedAIRequest,
	UnifiedAIResponse,
	AIServiceError,
	AI_ERROR_CODES,
	isRetryableError,
} from "./ai-client-interface";
import {
	AIProvider,
	AIConfig,
	AI_CONFIG,
	getProviderConfig,
	getEnabledProviders,
} from "./ai-config";
import { OpenAIUnifiedClient } from "./clients/openai-unified-client";
import { GoogleAIUnifiedClient } from "./clients/google-unified-client";
import { RetryExecutor } from "./retry-strategies";
import { aiMonitoring } from "./ai-monitoring";

/**
 * AI 클라이언트 팩토리
 */
export class AIClientFactory implements IAIClientFactory {
	/**
	 * 지정된 공급자의 클라이언트를 생성합니다
	 */
	createClient(provider: AIProvider, config: any): IAIClient {
		switch (provider) {
			case "openai":
				return new OpenAIUnifiedClient(config);
			case "google":
				return new GoogleAIUnifiedClient(config);
			default:
				throw new Error(`지원되지 않는 AI 공급자: ${provider}`);
		}
	}

	/**
	 * 지원되는 공급자 목록을 반환합니다
	 */
	getSupportedProviders(): AIProvider[] {
		return ["openai", "google"];
	}
}

/**
 * AI 서비스 관리자 설정
 */
export interface AIServiceManagerOptions {
	config?: AIConfig;
	enableHealthCheck?: boolean;
	healthCheckInterval?: number; // 밀리초
	enableLoadBalancing?: boolean;
	loadBalancingStrategy?: "round-robin" | "least-used" | "fastest-response";
	enableCircuitBreaker?: boolean;
	circuitBreakerThreshold?: number; // 연속 실패 횟수
}

/**
 * AI 서비스 통합 관리자
 */
export class AIServiceManager {
	private readonly config: AIConfig;
	private readonly factory: AIClientFactory;
	private readonly clients: Map<AIProvider, IAIClient> = new Map();
	private readonly healthStatus: Map<AIProvider, boolean> = new Map();
	private readonly circuitBreakers: Map<
		AIProvider,
		{
			failureCount: number;
			lastFailure: number;
			isOpen: boolean;
		}
	> = new Map();
	private readonly usageStats: Map<
		AIProvider,
		{
			requests: number;
			totalResponseTime: number;
			lastUsed: number;
		}
	> = new Map();

	private currentProviderIndex = 0;
	private healthCheckTimer?: NodeJS.Timeout;

	constructor(private options: AIServiceManagerOptions = {}) {
		this.config = options.config || AI_CONFIG;
		this.factory = new AIClientFactory();

		this.initializeClients();

		if (options.enableHealthCheck !== false) {
			this.startHealthCheck(options.healthCheckInterval || 60000);
		}
	}

	/**
	 * 클라이언트 초기화
	 */
	private initializeClients(): void {
		const enabledProviders = getEnabledProviders(this.config);

		for (const provider of enabledProviders) {
			try {
				const providerConfig = getProviderConfig(provider, this.config);
				if (providerConfig) {
					const client = this.factory.createClient(provider, providerConfig);
					this.clients.set(provider, client);
					this.healthStatus.set(provider, true);
					this.circuitBreakers.set(provider, {
						failureCount: 0,
						lastFailure: 0,
						isOpen: false,
					});
					this.usageStats.set(provider, {
						requests: 0,
						totalResponseTime: 0,
						lastUsed: 0,
					});
				}
			} catch (error) {
				console.error(`AI 클라이언트 초기화 실패: ${provider}`, error);
				this.healthStatus.set(provider, false);
			}
		}

		if (this.clients.size === 0) {
			throw new Error(
				"사용 가능한 AI 클라이언트가 없습니다. API 키와 설정을 확인해주세요."
			);
		}
	}

	/**
	 * AI 요청 처리 (메인 엔트리 포인트)
	 */
	async generateCompletion(
		request: UnifiedAIRequest
	): Promise<UnifiedAIResponse> {
		const provider = this.selectProvider();
		let lastError: AIServiceError | null = null;

		// 기본 공급자로 시도
		try {
			return await this.executeRequest(provider, request);
		} catch (error) {
			lastError =
				error instanceof AIServiceError
					? error
					: new AIServiceError(
							error instanceof Error ? error.message : "알 수 없는 오류",
							provider,
							AI_ERROR_CODES.UNKNOWN_ERROR
					  );

			this.handleFailure(provider, lastError);
		}

		// 폴백 공급자로 시도 (활성화된 경우)
		if (this.config.enableFallback && this.config.fallbackProvider) {
			const fallbackProvider = this.config.fallbackProvider;

			if (
				fallbackProvider !== provider &&
				this.isProviderAvailable(fallbackProvider)
			) {
				try {
					console.warn(
						`기본 공급자 실패, 폴백 공급자로 전환: ${provider} -> ${fallbackProvider}`
					);

					// 폴백 활성화 모니터링
					aiMonitoring.recordFallbackActivated(
						provider,
						fallbackProvider,
						lastError?.message || "기본 공급자 실패"
					);

					return await this.executeRequest(fallbackProvider, request);
				} catch (error) {
					const fallbackError =
						error instanceof AIServiceError
							? error
							: new AIServiceError(
									error instanceof Error ? error.message : "알 수 없는 오류",
									fallbackProvider,
									AI_ERROR_CODES.UNKNOWN_ERROR
							  );

					this.handleFailure(fallbackProvider, fallbackError);
					lastError = fallbackError;
				}
			}
		}

		// 모든 시도가 실패한 경우
		throw (
			lastError ||
			new AIServiceError(
				"모든 AI 공급자에서 요청이 실패했습니다",
				provider,
				AI_ERROR_CODES.SERVER_UNAVAILABLE
			)
		);
	}

	/**
	 * 특정 공급자로 요청 실행
	 */
	private async executeRequest(
		provider: AIProvider,
		request: UnifiedAIRequest
	): Promise<UnifiedAIResponse> {
		const client = this.clients.get(provider);
		if (!client) {
			throw new AIServiceError(
				`AI 클라이언트를 찾을 수 없습니다: ${provider}`,
				provider,
				AI_ERROR_CODES.MODEL_NOT_FOUND
			);
		}

		if (!this.isProviderAvailable(provider)) {
			throw new AIServiceError(
				`AI 공급자를 사용할 수 없습니다: ${provider}`,
				provider,
				AI_ERROR_CODES.SERVER_UNAVAILABLE
			);
		}

		const requestId =
			request.metadata?.requestId ||
			`req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		const startTime = Date.now();

		// 요청 시작 모니터링
		aiMonitoring.recordRequestStart(provider, requestId, {
			model: request.model,
			maxTokens: request.maxTokens,
			temperature: request.temperature,
		});

		try {
			const response = await client.generateCompletion(request);
			const responseTime = Date.now() - startTime;

			// 성공 시 통계 업데이트
			this.updateSuccessStats(provider, responseTime);
			this.resetCircuitBreaker(provider);

			// 성공 모니터링
			aiMonitoring.recordRequestSuccess(provider, requestId, responseTime, {
				model: response.model,
				totalTokens: response.usage.totalTokens,
				finishReason: response.metadata.finishReason,
			});

			return response;
		} catch (error) {
			// 실패 시 통계 업데이트
			const responseTime = Date.now() - startTime;
			this.updateFailureStats(provider, responseTime);

			// 실패 모니터링
			if (error instanceof AIServiceError) {
				aiMonitoring.recordRequestFailure(
					provider,
					requestId,
					error,
					responseTime
				);
				this.handleFailure(provider, error);
			}

			throw error;
		}
	}

	/**
	 * 공급자 선택 로직
	 */
	private selectProvider(): AIProvider {
		const availableProviders = Array.from(this.clients.keys()).filter(
			(provider) => this.isProviderAvailable(provider)
		);

		if (availableProviders.length === 0) {
			throw new AIServiceError(
				"사용 가능한 AI 공급자가 없습니다",
				this.config.defaultProvider,
				AI_ERROR_CODES.SERVER_UNAVAILABLE
			);
		}

		// 로드 밸런싱이 비활성화되거나 기본 공급자가 사용 가능한 경우
		if (
			!this.options.enableLoadBalancing ||
			availableProviders.includes(this.config.defaultProvider)
		) {
			return this.config.defaultProvider;
		}

		// 로드 밸런싱 전략에 따라 공급자 선택
		switch (this.options.loadBalancingStrategy) {
			case "round-robin":
				return this.selectRoundRobin(availableProviders);
			case "least-used":
				return this.selectLeastUsed(availableProviders);
			case "fastest-response":
				return this.selectFastestResponse(availableProviders);
			default:
				return availableProviders[0];
		}
	}

	/**
	 * 라운드 로빈 선택
	 */
	private selectRoundRobin(providers: AIProvider[]): AIProvider {
		const provider = providers[this.currentProviderIndex % providers.length];
		this.currentProviderIndex =
			(this.currentProviderIndex + 1) % providers.length;
		return provider;
	}

	/**
	 * 최소 사용량 선택
	 */
	private selectLeastUsed(providers: AIProvider[]): AIProvider {
		return providers.reduce((least, current) => {
			const leastStats = this.usageStats.get(least);
			const currentStats = this.usageStats.get(current);

			return (currentStats?.requests || 0) < (leastStats?.requests || 0)
				? current
				: least;
		});
	}

	/**
	 * 최빠른 응답 선택
	 */
	private selectFastestResponse(providers: AIProvider[]): AIProvider {
		return providers.reduce((fastest, current) => {
			const fastestStats = this.usageStats.get(fastest);
			const currentStats = this.usageStats.get(current);

			const fastestAvg = fastestStats?.requests
				? fastestStats.totalResponseTime / fastestStats.requests
				: Infinity;
			const currentAvg = currentStats?.requests
				? currentStats.totalResponseTime / currentStats.requests
				: Infinity;

			return currentAvg < fastestAvg ? current : fastest;
		});
	}

	/**
	 * 공급자 사용 가능성 확인
	 */
	private isProviderAvailable(provider: AIProvider): boolean {
		if (!this.clients.has(provider)) return false;
		if (!this.healthStatus.get(provider)) return false;

		if (this.options.enableCircuitBreaker) {
			const breaker = this.circuitBreakers.get(provider);
			if (breaker?.isOpen) {
				// 서킷 브레이커가 열린 후 일정 시간이 지나면 반열림 상태로 전환
				const now = Date.now();
				const timeSinceFailure = now - breaker.lastFailure;

				if (timeSinceFailure > 60000) {
					// 1분 후 재시도
					breaker.isOpen = false;
					return true;
				}

				return false;
			}
		}

		return true;
	}

	/**
	 * 실패 처리
	 */
	private handleFailure(provider: AIProvider, error: AIServiceError): void {
		const breaker = this.circuitBreakers.get(provider);
		if (breaker && this.options.enableCircuitBreaker) {
			const wasOpen = breaker.isOpen;
			breaker.failureCount++;
			breaker.lastFailure = Date.now();

			// 임계치를 초과하면 서킷 브레이커 열기
			const threshold = this.options.circuitBreakerThreshold || 5;
			if (breaker.failureCount >= threshold && !wasOpen) {
				breaker.isOpen = true;
				console.warn(
					`서킷 브레이커 열림: ${provider} (연속 실패 ${breaker.failureCount}회)`
				);

				// 회로 차단기 열림 모니터링
				aiMonitoring.recordCircuitBreakerEvent(provider, "opened", {
					failureCount: breaker.failureCount,
					threshold,
					lastError: error.message,
				});
			}
		}

		// 특정 에러 타입에 따라 헬스 상태 업데이트
		if (
			[
				AI_ERROR_CODES.AUTH_INVALID_API_KEY,
				AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED,
				AI_ERROR_CODES.SERVER_UNAVAILABLE,
			].includes(error.errorCode)
		) {
			this.healthStatus.set(provider, false);
		}
	}

	/**
	 * 성공 통계 업데이트
	 */
	private updateSuccessStats(provider: AIProvider, responseTime: number): void {
		const stats = this.usageStats.get(provider);
		if (stats) {
			stats.requests++;
			stats.totalResponseTime += responseTime;
			stats.lastUsed = Date.now();
		}
	}

	/**
	 * 실패 통계 업데이트
	 */
	private updateFailureStats(provider: AIProvider, responseTime: number): void {
		// 실패한 요청도 통계에 포함 (평균 계산 정확성을 위해)
		const stats = this.usageStats.get(provider);
		if (stats) {
			stats.totalResponseTime += responseTime;
		}
	}

	/**
	 * 서킷 브레이커 리셋
	 */
	private resetCircuitBreaker(provider: AIProvider): void {
		const breaker = this.circuitBreakers.get(provider);
		if (breaker && (breaker.isOpen || breaker.failureCount > 0)) {
			const wasOpen = breaker.isOpen;
			breaker.failureCount = 0;
			breaker.isOpen = false;

			// 회로 차단기가 열려있었다면 닫힘 모니터링
			if (wasOpen) {
				aiMonitoring.recordCircuitBreakerEvent(provider, "closed", {
					recoveryTime: Date.now() - breaker.lastFailure,
				});
			}
		}
	}

	/**
	 * 헬스 체크 시작
	 */
	private startHealthCheck(interval: number): void {
		this.healthCheckTimer = setInterval(async () => {
			for (const [provider, client] of this.clients) {
				try {
					const health = await client.healthCheck();
					this.healthStatus.set(provider, health.healthy);

					if (!health.healthy) {
						console.warn(
							`AI 공급자 헬스 체크 실패: ${provider} - ${health.error}`
						);
					}
				} catch (error) {
					this.healthStatus.set(provider, false);
					console.error(`AI 공급자 헬스 체크 오류: ${provider}`, error);
				}
			}
		}, interval);
	}

	/**
	 * 서비스 상태 조회
	 */
	async getServiceStatus(): Promise<{
		providers: Array<{
			name: AIProvider;
			healthy: boolean;
			circuitOpen: boolean;
			stats: {
				requests: number;
				averageResponseTime: number;
				lastUsed: number;
			};
		}>;
		overall: {
			totalRequests: number;
			availableProviders: number;
			defaultProvider: AIProvider;
		};
	}> {
		const providers = Array.from(this.clients.keys()).map((provider) => {
			const stats = this.usageStats.get(provider);
			const breaker = this.circuitBreakers.get(provider);

			return {
				name: provider,
				healthy: this.healthStatus.get(provider) || false,
				circuitOpen: breaker?.isOpen || false,
				stats: {
					requests: stats?.requests || 0,
					averageResponseTime: stats?.requests
						? Math.round(stats.totalResponseTime / stats.requests)
						: 0,
					lastUsed: stats?.lastUsed || 0,
				},
			};
		});

		const totalRequests = providers.reduce(
			(sum, p) => sum + p.stats.requests,
			0
		);
		const availableProviders = providers.filter(
			(p) => p.healthy && !p.circuitOpen
		).length;

		return {
			providers,
			overall: {
				totalRequests,
				availableProviders,
				defaultProvider: this.config.defaultProvider,
			},
		};
	}

	/**
	 * 특정 공급자의 사용량 정보 조회
	 */
	async getProviderUsage(provider: AIProvider): Promise<any> {
		const client = this.clients.get(provider);
		if (!client) {
			throw new Error(`AI 클라이언트를 찾을 수 없습니다: ${provider}`);
		}

		return await client.getUsageInfo();
	}

	/**
	 * 모든 공급자의 회로 차단기 상태 조회
	 */
	getCircuitBreakerStates(): Record<AIProvider, any> {
		const states: Record<string, any> = {};

		for (const [provider, client] of this.clients) {
			try {
				// 클라이언트에서 RetryExecutor의 회로 차단기 상태 조회
				if (
					client instanceof OpenAIUnifiedClient ||
					client instanceof GoogleAIUnifiedClient
				) {
					// @ts-ignore - private 멤버 접근
					const retryExecutor = client.retryExecutor as RetryExecutor;
					if (retryExecutor) {
						states[provider] = retryExecutor.getCircuitBreakerState();
					}
				}
			} catch (error) {
				console.error(`회로 차단기 상태 조회 실패: ${provider}`, error);
				states[provider] = {
					provider,
					state: "unknown",
					error: error instanceof Error ? error.message : "알 수 없는 오류",
				};
			}
		}

		return states as Record<AIProvider, any>;
	}

	/**
	 * 특정 공급자의 회로 차단기 수동 리셋
	 */
	resetCircuitBreaker(provider: AIProvider): boolean {
		const client = this.clients.get(provider);
		if (!client) {
			console.error(`AI 클라이언트를 찾을 수 없습니다: ${provider}`);
			return false;
		}

		try {
			// 클라이언트에서 RetryExecutor의 회로 차단기 리셋
			if (
				client instanceof OpenAIUnifiedClient ||
				client instanceof GoogleAIUnifiedClient
			) {
				// @ts-ignore - private 멤버 접근
				const retryExecutor = client.retryExecutor as RetryExecutor;
				if (retryExecutor) {
					retryExecutor.resetCircuitBreaker();
					console.log(`✅ 회로 차단기 수동 리셋 완료: ${provider}`);
					return true;
				}
			}
		} catch (error) {
			console.error(`회로 차단기 리셋 실패: ${provider}`, error);
		}

		return false;
	}

	/**
	 * 모든 공급자의 회로 차단기 일괄 리셋
	 */
	resetAllCircuitBreakers(): { success: AIProvider[]; failed: AIProvider[] } {
		const success: AIProvider[] = [];
		const failed: AIProvider[] = [];

		for (const provider of this.clients.keys()) {
			if (this.resetCircuitBreaker(provider)) {
				success.push(provider);
			} else {
				failed.push(provider);
			}
		}

		console.log(
			`🔧 회로 차단기 일괄 리셋 완료 - 성공: ${success.length}, 실패: ${failed.length}`
		);

		return { success, failed };
	}

	/**
	 * 서비스 정리
	 */
	async cleanup(): Promise<void> {
		if (this.healthCheckTimer) {
			clearInterval(this.healthCheckTimer);
		}

		for (const client of this.clients.values()) {
			await client.cleanup();
		}

		this.clients.clear();
		this.healthStatus.clear();
		this.circuitBreakers.clear();
		this.usageStats.clear();
	}
}

/**
 * 전역 AI 서비스 관리자 인스턴스
 */
export const aiServiceManager = new AIServiceManager({
	enableHealthCheck: true,
	healthCheckInterval: 60000,
	enableLoadBalancing: true,
	loadBalancingStrategy: "fastest-response",
	enableCircuitBreaker: true,
	circuitBreakerThreshold: 5,
});
