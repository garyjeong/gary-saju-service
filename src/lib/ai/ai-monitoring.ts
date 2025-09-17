/**
 * AI 서비스 모니터링 및 알림 시스템
 * 오류 추적, 성능 모니터링, 임계치 알림
 */

import { AIProvider } from "./ai-config";
import { AIServiceError, AI_ERROR_CODES } from "./ai-client-interface";

/**
 * 모니터링 이벤트 타입
 */
export type MonitoringEventType =
	| "request_started"
	| "request_completed"
	| "request_failed"
	| "circuit_breaker_opened"
	| "circuit_breaker_closed"
	| "fallback_activated"
	| "quota_warning"
	| "quota_exceeded"
	| "high_error_rate"
	| "slow_response"
	| "service_degraded"
	| "service_recovered";

/**
 * 모니터링 이벤트 데이터
 */
export interface MonitoringEvent {
	timestamp: number;
	type: MonitoringEventType;
	provider: AIProvider;
	severity: "info" | "warning" | "error" | "critical";
	message: string;
	metadata: {
		requestId?: string;
		responseTime?: number;
		errorCode?: string;
		errorMessage?: string;
		retryCount?: number;
		circuitBreakerState?: string;
		[key: string]: any;
	};
}

/**
 * 성능 메트릭
 */
export interface PerformanceMetrics {
	totalRequests: number;
	successfulRequests: number;
	failedRequests: number;
	averageResponseTime: number;
	maxResponseTime: number;
	minResponseTime: number;
	errorRate: number;
	p95ResponseTime: number;
	p99ResponseTime: number;
	lastResetTime: number;
	timeWindow: number; // 메트릭 수집 시간 윈도우 (밀리초)
}

/**
 * 공급자별 메트릭
 */
export interface ProviderMetrics {
	[provider: string]: PerformanceMetrics;
}

/**
 * 알림 설정
 */
export interface AlertConfig {
	enabled: boolean;
	thresholds: {
		errorRate: number; // 에러율 임계치 (%)
		responseTime: number; // 응답 시간 임계치 (ms)
		quotaUsage: number; // 할당량 사용률 임계치 (%)
		circuitBreakerTrips: number; // 회로 차단기 트립 임계치 (횟수)
	};
	webhookUrl?: string;
	emailRecipients?: string[];
	slackChannel?: string;
	cooldownPeriod: number; // 알림 쿨다운 시간 (밀리초)
}

/**
 * 기본 알림 설정
 */
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
	enabled: true,
	thresholds: {
		errorRate: 10, // 10% 이상 에러율
		responseTime: 10000, // 10초 이상 응답 시간
		quotaUsage: 80, // 80% 이상 할당량 사용
		circuitBreakerTrips: 3, // 3번 이상 회로 차단기 트립
	},
	cooldownPeriod: 300000, // 5분 쿨다운
};

/**
 * AI 모니터링 시스템
 */
export class AIMonitoringSystem {
	private events: MonitoringEvent[] = [];
	private metrics: ProviderMetrics = {};
	private responseTimes: { [provider: string]: number[] } = {};
	private lastAlerts: { [type: string]: number } = {};

	constructor(
		private alertConfig: AlertConfig = DEFAULT_ALERT_CONFIG,
		private maxEvents: number = 1000,
		private metricsWindow: number = 3600000 // 1시간
	) {
		// 주기적 정리 작업
		setInterval(() => this.cleanupOldData(), 60000); // 1분마다
	}

	/**
	 * 이벤트 기록
	 */
	recordEvent(event: Omit<MonitoringEvent, "timestamp">): void {
		const fullEvent: MonitoringEvent = {
			...event,
			timestamp: Date.now(),
		};

		this.events.push(fullEvent);

		// 이벤트 수 제한
		if (this.events.length > this.maxEvents) {
			this.events = this.events.slice(-this.maxEvents);
		}

		// 메트릭 업데이트
		this.updateMetrics(fullEvent);

		// 알림 확인
		this.checkAlerts(fullEvent);

		// 디버그 로그
		if (event.severity === "error" || event.severity === "critical") {
			console.error(
				`🚨 AI 모니터링 알림 [${event.severity.toUpperCase()}]: ${
					event.message
				}`,
				{
					provider: event.provider,
					metadata: event.metadata,
				}
			);
		} else if (event.severity === "warning") {
			console.warn(`⚠️ AI 모니터링 경고: ${event.message}`, {
				provider: event.provider,
				metadata: event.metadata,
			});
		}
	}

	/**
	 * 요청 시작 기록
	 */
	recordRequestStart(
		provider: AIProvider,
		requestId: string,
		metadata?: Record<string, any>
	): void {
		this.recordEvent({
			type: "request_started",
			provider,
			severity: "info",
			message: `AI 요청 시작: ${provider}`,
			metadata: {
				requestId,
				...metadata,
			},
		});
	}

	/**
	 * 요청 완료 기록
	 */
	recordRequestSuccess(
		provider: AIProvider,
		requestId: string,
		responseTime: number,
		metadata?: Record<string, any>
	): void {
		// 응답 시간 추적
		if (!this.responseTimes[provider]) {
			this.responseTimes[provider] = [];
		}
		this.responseTimes[provider].push(responseTime);

		// 최근 1000개만 유지
		if (this.responseTimes[provider].length > 1000) {
			this.responseTimes[provider] = this.responseTimes[provider].slice(-1000);
		}

		this.recordEvent({
			type: "request_completed",
			provider,
			severity: "info",
			message: `AI 요청 완료: ${provider} (${responseTime}ms)`,
			metadata: {
				requestId,
				responseTime,
				...metadata,
			},
		});
	}

	/**
	 * 요청 실패 기록
	 */
	recordRequestFailure(
		provider: AIProvider,
		requestId: string,
		error: AIServiceError,
		responseTime?: number,
		metadata?: Record<string, any>
	): void {
		const severity = this.determineSeverity(error);

		this.recordEvent({
			type: "request_failed",
			provider,
			severity,
			message: `AI 요청 실패: ${provider} - ${error.message}`,
			metadata: {
				requestId,
				responseTime,
				errorCode: error.errorCode,
				errorMessage: error.message,
				retryCount: error.details?.retryCount,
				...metadata,
			},
		});
	}

	/**
	 * 회로 차단기 상태 변경 기록
	 */
	recordCircuitBreakerEvent(
		provider: AIProvider,
		state: "opened" | "closed" | "half-open",
		metadata?: Record<string, any>
	): void {
		const eventType =
			state === "opened" ? "circuit_breaker_opened" : "circuit_breaker_closed";
		const severity = state === "opened" ? "warning" : "info";

		this.recordEvent({
			type: eventType,
			provider,
			severity,
			message: `회로 차단기 ${
				state === "opened" ? "열림" : "닫힘"
			}: ${provider}`,
			metadata: {
				circuitBreakerState: state,
				...metadata,
			},
		});
	}

	/**
	 * 폴백 활성화 기록
	 */
	recordFallbackActivated(
		primaryProvider: AIProvider,
		fallbackProvider: AIProvider,
		reason: string,
		metadata?: Record<string, any>
	): void {
		this.recordEvent({
			type: "fallback_activated",
			provider: primaryProvider,
			severity: "warning",
			message: `폴백 활성화: ${primaryProvider} → ${fallbackProvider} (이유: ${reason})`,
			metadata: {
				fallbackProvider,
				reason,
				...metadata,
			},
		});
	}

	/**
	 * 메트릭 업데이트
	 */
	private updateMetrics(event: MonitoringEvent): void {
		const provider = event.provider;

		if (!this.metrics[provider]) {
			this.metrics[provider] = {
				totalRequests: 0,
				successfulRequests: 0,
				failedRequests: 0,
				averageResponseTime: 0,
				maxResponseTime: 0,
				minResponseTime: Infinity,
				errorRate: 0,
				p95ResponseTime: 0,
				p99ResponseTime: 0,
				lastResetTime: Date.now(),
				timeWindow: this.metricsWindow,
			};
		}

		const metrics = this.metrics[provider];

		switch (event.type) {
			case "request_started":
				metrics.totalRequests++;
				break;

			case "request_completed":
				metrics.successfulRequests++;
				if (event.metadata.responseTime) {
					const responseTime = event.metadata.responseTime;
					metrics.maxResponseTime = Math.max(
						metrics.maxResponseTime,
						responseTime
					);
					metrics.minResponseTime = Math.min(
						metrics.minResponseTime,
						responseTime
					);

					// 평균 응답 시간 계산 (이동 평균)
					const total = metrics.successfulRequests + metrics.failedRequests;
					metrics.averageResponseTime =
						(metrics.averageResponseTime * (total - 1) + responseTime) / total;
				}
				break;

			case "request_failed":
				metrics.failedRequests++;
				break;
		}

		// 에러율 계산
		const totalRequests = metrics.successfulRequests + metrics.failedRequests;
		if (totalRequests > 0) {
			metrics.errorRate = (metrics.failedRequests / totalRequests) * 100;
		}

		// 백분위수 계산 (응답 시간)
		if (
			this.responseTimes[provider] &&
			this.responseTimes[provider].length > 0
		) {
			const sorted = [...this.responseTimes[provider]].sort((a, b) => a - b);
			const p95Index = Math.floor(sorted.length * 0.95);
			const p99Index = Math.floor(sorted.length * 0.99);

			metrics.p95ResponseTime = sorted[p95Index] || 0;
			metrics.p99ResponseTime = sorted[p99Index] || 0;
		}
	}

	/**
	 * 알림 확인 및 발송
	 */
	private checkAlerts(event: MonitoringEvent): void {
		if (!this.alertConfig.enabled) return;

		const provider = event.provider;
		const metrics = this.metrics[provider];
		const now = Date.now();

		// 에러율 임계치 확인
		if (metrics && metrics.errorRate >= this.alertConfig.thresholds.errorRate) {
			const alertKey = `error_rate_${provider}`;
			const lastAlert = this.lastAlerts[alertKey] || 0;

			if (now - lastAlert > this.alertConfig.cooldownPeriod) {
				this.sendAlert({
					type: "high_error_rate",
					provider,
					severity: "warning",
					message: `높은 에러율 감지: ${provider} (${metrics.errorRate.toFixed(
						2
					)}%)`,
					metadata: {
						errorRate: metrics.errorRate,
						threshold: this.alertConfig.thresholds.errorRate,
						totalRequests: metrics.totalRequests,
						failedRequests: metrics.failedRequests,
					},
				});
				this.lastAlerts[alertKey] = now;
			}
		}

		// 응답 시간 임계치 확인
		if (
			event.metadata.responseTime &&
			event.metadata.responseTime >= this.alertConfig.thresholds.responseTime
		) {
			const alertKey = `slow_response_${provider}`;
			const lastAlert = this.lastAlerts[alertKey] || 0;

			if (now - lastAlert > this.alertConfig.cooldownPeriod) {
				this.sendAlert({
					type: "slow_response",
					provider,
					severity: "warning",
					message: `느린 응답 시간 감지: ${provider} (${event.metadata.responseTime}ms)`,
					metadata: {
						responseTime: event.metadata.responseTime,
						threshold: this.alertConfig.thresholds.responseTime,
						requestId: event.metadata.requestId,
					},
				});
				this.lastAlerts[alertKey] = now;
			}
		}

		// 회로 차단기 트립 확인
		if (event.type === "circuit_breaker_opened") {
			this.sendAlert({
				type: "circuit_breaker_opened",
				provider,
				severity: "error",
				message: `회로 차단기 열림: ${provider}`,
				metadata: event.metadata,
			});
		}
	}

	/**
	 * 알림 발송
	 */
	private async sendAlert(event: MonitoringEvent): Promise<void> {
		try {
			// 웹훅 알림
			if (this.alertConfig.webhookUrl) {
				await this.sendWebhookAlert(event);
			}

			// 이메일 알림
			if (
				this.alertConfig.emailRecipients &&
				this.alertConfig.emailRecipients.length > 0
			) {
				await this.sendEmailAlert(event);
			}

			// Slack 알림
			if (this.alertConfig.slackChannel) {
				await this.sendSlackAlert(event);
			}

			console.log(`📧 알림 발송 완료: ${event.type} - ${event.provider}`);
		} catch (error) {
			console.error("알림 발송 실패:", error);
		}
	}

	/**
	 * 웹훅 알림 발송
	 */
	private async sendWebhookAlert(event: MonitoringEvent): Promise<void> {
		if (!this.alertConfig.webhookUrl) return;

		const payload = {
			timestamp: new Date(event.timestamp).toISOString(),
			type: event.type,
			provider: event.provider,
			severity: event.severity,
			message: event.message,
			metadata: event.metadata,
		};

		const response = await fetch(this.alertConfig.webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(
				`웹훅 알림 실패: ${response.status} ${response.statusText}`
			);
		}
	}

	/**
	 * 이메일 알림 발송 (구현 필요)
	 */
	private async sendEmailAlert(event: MonitoringEvent): Promise<void> {
		// TODO: 이메일 서비스 연동 구현
		console.log("이메일 알림 (미구현):", event);
	}

	/**
	 * Slack 알림 발송 (구현 필요)
	 */
	private async sendSlackAlert(event: MonitoringEvent): Promise<void> {
		// TODO: Slack 연동 구현
		console.log("Slack 알림 (미구현):", event);
	}

	/**
	 * 에러 심각도 결정
	 */
	private determineSeverity(
		error: AIServiceError
	): MonitoringEvent["severity"] {
		switch (error.errorCode) {
			case AI_ERROR_CODES.AUTH_INVALID_API_KEY:
			case AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED:
				return "critical";

			case AI_ERROR_CODES.AUTH_RATE_LIMITED:
			case AI_ERROR_CODES.MODEL_OVERLOADED:
			case AI_ERROR_CODES.SERVER_UNAVAILABLE:
				return "warning";

			case AI_ERROR_CODES.REQUEST_TIMEOUT:
			case AI_ERROR_CODES.NETWORK_ERROR:
				return "warning";

			default:
				return "error";
		}
	}

	/**
	 * 메트릭 조회
	 */
	getMetrics(
		provider?: AIProvider
	): ProviderMetrics | PerformanceMetrics | null {
		if (provider) {
			return this.metrics[provider] || null;
		}
		return this.metrics;
	}

	/**
	 * 최근 이벤트 조회
	 */
	getRecentEvents(
		count: number = 50,
		provider?: AIProvider,
		type?: MonitoringEventType
	): MonitoringEvent[] {
		let filteredEvents = this.events;

		if (provider) {
			filteredEvents = filteredEvents.filter((e) => e.provider === provider);
		}

		if (type) {
			filteredEvents = filteredEvents.filter((e) => e.type === type);
		}

		return filteredEvents.slice(-count);
	}

	/**
	 * 전체 시스템 상태 요약
	 */
	getSystemHealthSummary(): {
		status: "healthy" | "degraded" | "critical";
		providers: {
			[provider: string]: {
				status: "healthy" | "degraded" | "critical";
				errorRate: number;
				averageResponseTime: number;
				lastError?: string;
			};
		};
		totalRequests: number;
		overallErrorRate: number;
	} {
		const providers: any = {};
		let totalRequests = 0;
		let totalFailures = 0;
		let overallStatus: "healthy" | "degraded" | "critical" = "healthy";

		for (const [provider, metrics] of Object.entries(this.metrics)) {
			totalRequests += metrics.totalRequests;
			totalFailures += metrics.failedRequests;

			let providerStatus: "healthy" | "degraded" | "critical" = "healthy";

			if (metrics.errorRate >= 20) {
				providerStatus = "critical";
			} else if (
				metrics.errorRate >= 10 ||
				metrics.averageResponseTime >= 10000
			) {
				providerStatus = "degraded";
			}

			// 전체 상태 업데이트
			if (providerStatus === "critical") {
				overallStatus = "critical";
			} else if (
				providerStatus === "degraded" &&
				overallStatus !== "critical"
			) {
				overallStatus = "degraded";
			}

			// 최근 에러 조회
			const recentErrors = this.getRecentEvents(
				1,
				provider as AIProvider,
				"request_failed"
			);
			const lastError =
				recentErrors.length > 0 ? recentErrors[0].message : undefined;

			providers[provider] = {
				status: providerStatus,
				errorRate: metrics.errorRate,
				averageResponseTime: metrics.averageResponseTime,
				lastError,
			};
		}

		const overallErrorRate =
			totalRequests > 0 ? (totalFailures / totalRequests) * 100 : 0;

		return {
			status: overallStatus,
			providers,
			totalRequests,
			overallErrorRate,
		};
	}

	/**
	 * 오래된 데이터 정리
	 */
	private cleanupOldData(): void {
		const now = Date.now();
		const cutoffTime = now - this.metricsWindow;

		// 오래된 이벤트 제거
		this.events = this.events.filter((event) => event.timestamp > cutoffTime);

		// 오래된 응답 시간 데이터 제거
		for (const provider in this.responseTimes) {
			// 최근 1시간 데이터만 유지하는 것이 아니라, 최근 1000개만 유지
			if (this.responseTimes[provider].length > 1000) {
				this.responseTimes[provider] =
					this.responseTimes[provider].slice(-1000);
			}
		}

		// 메트릭 리셋 (1시간마다)
		for (const metrics of Object.values(this.metrics)) {
			if (now - metrics.lastResetTime > this.metricsWindow) {
				metrics.totalRequests = 0;
				metrics.successfulRequests = 0;
				metrics.failedRequests = 0;
				metrics.errorRate = 0;
				metrics.averageResponseTime = 0;
				metrics.maxResponseTime = 0;
				metrics.minResponseTime = Infinity;
				metrics.lastResetTime = now;
			}
		}
	}

	/**
	 * 알림 설정 업데이트
	 */
	updateAlertConfig(newConfig: Partial<AlertConfig>): void {
		this.alertConfig = { ...this.alertConfig, ...newConfig };
		console.log("📊 AI 모니터링 알림 설정 업데이트:", this.alertConfig);
	}
}

/**
 * 전역 모니터링 인스턴스
 */
export const aiMonitoring = new AIMonitoringSystem();
