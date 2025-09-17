/**
 * AI 요청 재시도 및 백오프 전략
 * 지능형 재시도, 지수 백오프, Jitter, 회복 전략
 */

import {
	AIServiceError,
	AI_ERROR_CODES,
	isRetryableError,
} from "./ai-client-interface";
import { AIProvider } from "./ai-config";

/**
 * 재시도 전략 설정
 */
export interface RetryStrategy {
	maxRetries: number;
	baseDelay: number; // 기본 지연 시간 (밀리초)
	maxDelay: number; // 최대 지연 시간 (밀리초)
	backoffMultiplier: number; // 백오프 배수
	jitterType: "none" | "full" | "equal" | "decorrelated";
	timeoutStrategy: "fixed" | "progressive" | "adaptive";
	enableCircuitBreaker: boolean;
	circuitBreakerThreshold: number;
	circuitBreakerRecoveryTime: number; // 밀리초
}

/**
 * 기본 재시도 전략
 */
export const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
	maxRetries: 3,
	baseDelay: 1000,
	maxDelay: 30000,
	backoffMultiplier: 2,
	jitterType: "equal",
	timeoutStrategy: "progressive",
	enableCircuitBreaker: true,
	circuitBreakerThreshold: 5,
	circuitBreakerRecoveryTime: 60000,
};

/**
 * 공급자별 특화 재시도 전략
 */
export const PROVIDER_RETRY_STRATEGIES: Record<AIProvider, RetryStrategy> = {
	openai: {
		...DEFAULT_RETRY_STRATEGY,
		maxRetries: 4, // OpenAI는 더 안정적이므로 많은 재시도
		baseDelay: 1000,
		backoffMultiplier: 2,
		jitterType: "equal",
		timeoutStrategy: "progressive",
	},
	google: {
		...DEFAULT_RETRY_STRATEGY,
		maxRetries: 3, // Google AI는 무료 할당량이 있으므로 적절한 재시도
		baseDelay: 1500,
		backoffMultiplier: 1.8,
		jitterType: "full",
		timeoutStrategy: "adaptive",
	},
};

/**
 * 에러별 재시도 가능성 및 지연 시간 결정
 */
export interface ErrorRetryPolicy {
	retryable: boolean;
	delayMultiplier: number; // 기본 지연 시간에 대한 배수
	maxRetries: number; // 이 에러에 대한 최대 재시도 횟수
	skipCircuitBreaker: boolean; // 회로 차단기 무시 여부
}

/**
 * 에러 코드별 재시도 정책
 */
export const ERROR_RETRY_POLICIES: Record<string, ErrorRetryPolicy> = {
	// 인증 관련 - 재시도 불가
	[AI_ERROR_CODES.AUTH_INVALID_API_KEY]: {
		retryable: false,
		delayMultiplier: 1,
		maxRetries: 0,
		skipCircuitBreaker: true,
	},
	[AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED]: {
		retryable: false,
		delayMultiplier: 1,
		maxRetries: 0,
		skipCircuitBreaker: false,
	},

	// 속도 제한 - 긴 지연으로 재시도
	[AI_ERROR_CODES.AUTH_RATE_LIMITED]: {
		retryable: true,
		delayMultiplier: 3, // 더 긴 지연
		maxRetries: 2,
		skipCircuitBreaker: true,
	},

	// 요청 관련 - 제한적 재시도
	[AI_ERROR_CODES.REQUEST_INVALID_PARAMS]: {
		retryable: false,
		delayMultiplier: 1,
		maxRetries: 0,
		skipCircuitBreaker: true,
	},
	[AI_ERROR_CODES.REQUEST_TOO_LARGE]: {
		retryable: false,
		delayMultiplier: 1,
		maxRetries: 0,
		skipCircuitBreaker: true,
	},
	[AI_ERROR_CODES.REQUEST_TIMEOUT]: {
		retryable: true,
		delayMultiplier: 1.5,
		maxRetries: 3,
		skipCircuitBreaker: false,
	},

	// 모델 관련 - 적극적 재시도
	[AI_ERROR_CODES.MODEL_NOT_FOUND]: {
		retryable: false,
		delayMultiplier: 1,
		maxRetries: 0,
		skipCircuitBreaker: true,
	},
	[AI_ERROR_CODES.MODEL_OVERLOADED]: {
		retryable: true,
		delayMultiplier: 2,
		maxRetries: 4,
		skipCircuitBreaker: false,
	},
	[AI_ERROR_CODES.MODEL_MAINTENANCE]: {
		retryable: true,
		delayMultiplier: 5, // 유지보수는 더 오래 걸림
		maxRetries: 2,
		skipCircuitBreaker: false,
	},

	// 네트워크 관련 - 적극적 재시도
	[AI_ERROR_CODES.NETWORK_ERROR]: {
		retryable: true,
		delayMultiplier: 1,
		maxRetries: 5,
		skipCircuitBreaker: false,
	},
	[AI_ERROR_CODES.NETWORK_TIMEOUT]: {
		retryable: true,
		delayMultiplier: 1.2,
		maxRetries: 4,
		skipCircuitBreaker: false,
	},

	// 서버 관련 - 제한적 재시도
	[AI_ERROR_CODES.SERVER_ERROR]: {
		retryable: true,
		delayMultiplier: 1.5,
		maxRetries: 3,
		skipCircuitBreaker: false,
	},
	[AI_ERROR_CODES.SERVER_UNAVAILABLE]: {
		retryable: true,
		delayMultiplier: 2,
		maxRetries: 2,
		skipCircuitBreaker: false,
	},

	// 기타
	[AI_ERROR_CODES.UNKNOWN_ERROR]: {
		retryable: true,
		delayMultiplier: 1,
		maxRetries: 2,
		skipCircuitBreaker: false,
	},
	[AI_ERROR_CODES.PARSING_ERROR]: {
		retryable: true,
		delayMultiplier: 1,
		maxRetries: 2,
		skipCircuitBreaker: true,
	},
};

/**
 * Jitter 유형별 계산 함수
 */
export function calculateJitter(
	baseDelay: number,
	jitterType: RetryStrategy["jitterType"]
): number {
	switch (jitterType) {
		case "none":
			return baseDelay;

		case "full":
			// 0 ~ baseDelay 사이의 랜덤 값
			return Math.random() * baseDelay;

		case "equal":
			// baseDelay/2 ~ baseDelay 사이의 랜덤 값
			return baseDelay / 2 + Math.random() * (baseDelay / 2);

		case "decorrelated":
			// 이전 지연 시간을 기반으로 한 랜덤 값 (더 자연스러운 분산)
			return Math.random() * baseDelay * 3;

		default:
			return baseDelay;
	}
}

/**
 * 지수 백오프 계산
 */
export function calculateBackoffDelay(
	attempt: number,
	strategy: RetryStrategy,
	errorCode?: string
): number {
	const errorPolicy = errorCode ? ERROR_RETRY_POLICIES[errorCode] : null;
	const delayMultiplier = errorPolicy?.delayMultiplier || 1;

	// 기본 지수 백오프 계산
	const exponentialDelay =
		strategy.baseDelay *
		Math.pow(strategy.backoffMultiplier, attempt - 1) *
		delayMultiplier;

	// 최대 지연 시간 제한
	const cappedDelay = Math.min(exponentialDelay, strategy.maxDelay);

	// Jitter 적용
	const delayWithJitter = calculateJitter(cappedDelay, strategy.jitterType);

	return Math.round(delayWithJitter);
}

/**
 * 타임아웃 전략별 계산
 */
export function calculateTimeout(
	attempt: number,
	baseTimeout: number,
	strategy: RetryStrategy["timeoutStrategy"],
	averageResponseTime?: number
): number {
	switch (strategy) {
		case "fixed":
			return baseTimeout;

		case "progressive":
			// 재시도할 때마다 타임아웃 증가
			return baseTimeout + (attempt - 1) * 5000;

		case "adaptive":
			// 평균 응답 시간 기반 적응형 타임아웃
			if (averageResponseTime) {
				const adaptiveTimeout = averageResponseTime * 3; // 평균의 3배
				return Math.max(adaptiveTimeout, baseTimeout);
			}
			return baseTimeout + (attempt - 1) * 3000;

		default:
			return baseTimeout;
	}
}

/**
 * 에러 재시도 가능성 판단
 */
export function shouldRetry(
	error: AIServiceError,
	attempt: number,
	strategy: RetryStrategy
): {
	shouldRetry: boolean;
	delay: number;
	reason: string;
} {
	const errorPolicy = ERROR_RETRY_POLICIES[error.errorCode];

	// 에러별 정책이 있는 경우 해당 정책 사용
	if (errorPolicy) {
		const maxRetries = Math.min(errorPolicy.maxRetries, strategy.maxRetries);

		if (!errorPolicy.retryable || attempt > maxRetries) {
			return {
				shouldRetry: false,
				delay: 0,
				reason: errorPolicy.retryable
					? `최대 재시도 횟수 초과 (${maxRetries})`
					: "재시도 불가능한 에러",
			};
		}

		return {
			shouldRetry: true,
			delay: calculateBackoffDelay(attempt, strategy, error.errorCode),
			reason: `에러별 정책에 따른 재시도 (${errorPolicy.maxRetries}회 중 ${attempt}회)`,
		};
	}

	// 기본 재시도 로직
	if (attempt > strategy.maxRetries) {
		return {
			shouldRetry: false,
			delay: 0,
			reason: `최대 재시도 횟수 초과 (${strategy.maxRetries})`,
		};
	}

	if (!isRetryableError(error.errorCode)) {
		return {
			shouldRetry: false,
			delay: 0,
			reason: "재시도 불가능한 에러 코드",
		};
	}

	return {
		shouldRetry: true,
		delay: calculateBackoffDelay(attempt, strategy),
		reason: `기본 재시도 로직 (${strategy.maxRetries}회 중 ${attempt}회)`,
	};
}

/**
 * 회로 차단기 상태
 */
export interface CircuitBreakerState {
	isOpen: boolean;
	failureCount: number;
	lastFailureTime: number;
	successCount: number;
	lastSuccessTime: number;
	state: "closed" | "open" | "half-open";
}

/**
 * 회로 차단기 클래스
 */
export class CircuitBreaker {
	private state: CircuitBreakerState;

	constructor(private provider: AIProvider, private strategy: RetryStrategy) {
		this.state = {
			isOpen: false,
			failureCount: 0,
			lastFailureTime: 0,
			successCount: 0,
			lastSuccessTime: 0,
			state: "closed",
		};
	}

	/**
	 * 요청 전 상태 확인
	 */
	canExecute(): boolean {
		if (!this.strategy.enableCircuitBreaker) {
			return true;
		}

		const now = Date.now();

		switch (this.state.state) {
			case "closed":
				return true;

			case "open":
				// 복구 시간이 지났으면 반열림 상태로 전환
				if (
					now - this.state.lastFailureTime >=
					this.strategy.circuitBreakerRecoveryTime
				) {
					this.state.state = "half-open";
					return true;
				}
				return false;

			case "half-open":
				return true;

			default:
				return true;
		}
	}

	/**
	 * 성공 기록
	 */
	recordSuccess(): void {
		if (!this.strategy.enableCircuitBreaker) return;

		this.state.successCount++;
		this.state.lastSuccessTime = Date.now();

		if (this.state.state === "half-open") {
			// 반열림 상태에서 성공하면 닫힘 상태로 복구
			this.state.state = "closed";
			this.state.failureCount = 0;
		}
	}

	/**
	 * 실패 기록
	 */
	recordFailure(error: AIServiceError): void {
		if (!this.strategy.enableCircuitBreaker) return;

		const errorPolicy = ERROR_RETRY_POLICIES[error.errorCode];

		// 특정 에러는 회로 차단기에서 제외
		if (errorPolicy?.skipCircuitBreaker) {
			return;
		}

		this.state.failureCount++;
		this.state.lastFailureTime = Date.now();

		// 임계치 초과 시 회로 열기
		if (this.state.failureCount >= this.strategy.circuitBreakerThreshold) {
			this.state.state = "open";
			this.state.isOpen = true;

			console.warn(
				`🔥 회로 차단기 열림: ${this.provider} (연속 실패 ${this.state.failureCount}회)`
			);
		}
	}

	/**
	 * 현재 상태 조회
	 */
	getState(): CircuitBreakerState & { provider: AIProvider } {
		return {
			...this.state,
			provider: this.provider,
		};
	}

	/**
	 * 수동 복구
	 */
	reset(): void {
		this.state = {
			isOpen: false,
			failureCount: 0,
			lastFailureTime: 0,
			successCount: 0,
			lastSuccessTime: 0,
			state: "closed",
		};

		console.log(`🔧 회로 차단기 수동 복구: ${this.provider}`);
	}
}

/**
 * 재시도 실행기
 */
export class RetryExecutor {
	private circuitBreaker: CircuitBreaker;

	constructor(
		private provider: AIProvider,
		private strategy: RetryStrategy = PROVIDER_RETRY_STRATEGIES[provider] ||
			DEFAULT_RETRY_STRATEGY
	) {
		this.circuitBreaker = new CircuitBreaker(provider, strategy);
	}

	/**
	 * 재시도 로직과 함께 함수 실행
	 */
	async execute<T>(
		operation: () => Promise<T>,
		context: {
			operationName: string;
			requestId?: string;
			metadata?: Record<string, any>;
		}
	): Promise<T> {
		let attempt = 0;
		let lastError: AIServiceError | null = null;

		while (attempt <= this.strategy.maxRetries) {
			attempt++;

			// 회로 차단기 확인
			if (!this.circuitBreaker.canExecute()) {
				throw new AIServiceError(
					`회로 차단기가 열려있음: ${this.provider}`,
					this.provider,
					AI_ERROR_CODES.SERVER_UNAVAILABLE,
					false,
					undefined,
					{
						circuitBreakerState: this.circuitBreaker.getState(),
						operationName: context.operationName,
						requestId: context.requestId,
					}
				);
			}

			try {
				const result = await operation();

				// 성공 시 회로 차단기에 기록
				this.circuitBreaker.recordSuccess();

				if (attempt > 1) {
					console.log(
						`✅ ${context.operationName} 성공 (${attempt}회 시도 후): ${this.provider}`
					);
				}

				return result;
			} catch (error) {
				const aiError =
					error instanceof AIServiceError
						? error
						: new AIServiceError(
								error instanceof Error ? error.message : "알 수 없는 오류",
								this.provider,
								AI_ERROR_CODES.UNKNOWN_ERROR,
								true
						  );

				lastError = aiError;

				// 회로 차단기에 실패 기록
				this.circuitBreaker.recordFailure(aiError);

				// 재시도 여부 판단
				const retryDecision = shouldRetry(aiError, attempt, this.strategy);

				if (!retryDecision.shouldRetry) {
					console.error(
						`❌ ${context.operationName} 최종 실패: ${aiError.message} (이유: ${retryDecision.reason})`
					);
					throw aiError;
				}

				// 지연 시간 계산 및 대기
				if (retryDecision.delay > 0) {
					console.warn(
						`⏳ ${context.operationName} 재시도 대기: ${retryDecision.delay}ms (${attempt}/${this.strategy.maxRetries}회) - ${retryDecision.reason}`
					);
					await new Promise((resolve) =>
						setTimeout(resolve, retryDecision.delay)
					);
				}
			}
		}

		// 모든 재시도 실패
		throw (
			lastError ||
			new AIServiceError(
				"모든 재시도가 실패했습니다",
				this.provider,
				AI_ERROR_CODES.UNKNOWN_ERROR
			)
		);
	}

	/**
	 * 회로 차단기 상태 조회
	 */
	getCircuitBreakerState(): CircuitBreakerState & { provider: AIProvider } {
		return this.circuitBreaker.getState();
	}

	/**
	 * 회로 차단기 리셋
	 */
	resetCircuitBreaker(): void {
		this.circuitBreaker.reset();
	}

	/**
	 * 전략 업데이트
	 */
	updateStrategy(newStrategy: Partial<RetryStrategy>): void {
		this.strategy = { ...this.strategy, ...newStrategy };
	}
}
