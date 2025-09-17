/**
 * AI 모니터링 시스템 테스트
 * 성능 추적, 에러 모니터링, 알림 시스템 테스트
 */

import {
	AIMonitoringSystem,
	MonitoringEvent,
	MonitoringEventType,
} from "@/lib/ai/ai-monitoring";
import { AIProvider } from "@/lib/ai/ai-config";
import { AI_ERROR_CODES } from "@/lib/ai/ai-client-interface";

describe("AI 모니터링 시스템 테스트", () => {
	let monitoring: AIMonitoringSystem;

	beforeEach(() => {
		monitoring = new AIMonitoringSystem({
			enabled: true,
			enableAlerts: false, // 테스트 중 알림 비활성화
			retentionPeriod: 3600000, // 1시간
		});
	});

	afterEach(() => {
		monitoring.stop();
	});

	describe("이벤트 기록", () => {
		it("요청 시작 이벤트를 기록할 수 있어야 한다", () => {
			const requestId = "test-request-123";

			monitoring.recordRequestStart("openai", requestId, {
				model: "gpt-4o-mini",
				promptTokens: 100,
			});

			const metrics = monitoring.getMetrics("openai");
			expect(metrics.totalRequests).toBe(1);
		});

		it("요청 완료 이벤트를 기록할 수 있어야 한다", () => {
			const requestId = "test-request-123";

			monitoring.recordRequestStart("openai", requestId);
			monitoring.recordRequestCompleted("openai", requestId, {
				responseTime: 1500,
				totalTokens: 200,
			});

			const metrics = monitoring.getMetrics("openai");
			expect(metrics.totalRequests).toBe(1);
			expect(metrics.successfulRequests).toBe(1);
			expect(metrics.averageResponseTime).toBe(1500);
		});

		it("요청 실패 이벤트를 기록할 수 있어야 한다", () => {
			const requestId = "test-request-123";

			monitoring.recordRequestStart("openai", requestId);
			monitoring.recordRequestFailed("openai", requestId, {
				errorCode: AI_ERROR_CODES.TIMEOUT,
				errorMessage: "Request timeout",
				responseTime: 30000,
			});

			const metrics = monitoring.getMetrics("openai");
			expect(metrics.totalRequests).toBe(1);
			expect(metrics.failedRequests).toBe(1);
			expect(metrics.errorRate).toBe(100);
		});

		it("서킷 브레이커 이벤트를 기록할 수 있어야 한다", () => {
			monitoring.recordCircuitBreakerEvent("openai", "opened", {
				failureCount: 5,
				threshold: 5,
			});

			const events = monitoring.getRecentEvents("openai", 10);
			expect(events).toHaveLength(1);
			expect(events[0].type).toBe("circuit_breaker_opened");
		});

		it("폴백 활성화 이벤트를 기록할 수 있어야 한다", () => {
			monitoring.recordFallbackActivated("openai", "google", {
				reason: "Primary provider unavailable",
				originalError: "Service temporarily unavailable",
			});

			const events = monitoring.getRecentEvents("openai", 10);
			expect(events).toHaveLength(1);
			expect(events[0].type).toBe("fallback_activated");
		});
	});

	describe("메트릭 계산", () => {
		it("에러율을 올바르게 계산해야 한다", () => {
			// 성공 요청 3개
			for (let i = 0; i < 3; i++) {
				monitoring.recordRequestStart("openai", `success-${i}`);
				monitoring.recordRequestCompleted("openai", `success-${i}`, {
					responseTime: 1000,
				});
			}

			// 실패 요청 1개
			monitoring.recordRequestStart("openai", "failure-1");
			monitoring.recordRequestFailed("openai", "failure-1", {
				errorCode: AI_ERROR_CODES.TIMEOUT,
				errorMessage: "Timeout",
			});

			const metrics = monitoring.getMetrics("openai");
			expect(metrics.totalRequests).toBe(4);
			expect(metrics.successfulRequests).toBe(3);
			expect(metrics.failedRequests).toBe(1);
			expect(metrics.errorRate).toBe(25); // 1/4 = 25%
		});

		it("평균 응답 시간을 올바르게 계산해야 한다", () => {
			const responseTimes = [1000, 1500, 2000];

			responseTimes.forEach((time, index) => {
				monitoring.recordRequestStart("openai", `req-${index}`);
				monitoring.recordRequestCompleted("openai", `req-${index}`, {
					responseTime: time,
				});
			});

			const metrics = monitoring.getMetrics("openai");
			const expectedAverage =
				responseTimes.reduce((sum, time) => sum + time, 0) /
				responseTimes.length;
			expect(metrics.averageResponseTime).toBe(expectedAverage);
		});

		it("P99 응답 시간을 올바르게 계산해야 한다", () => {
			// 100개의 요청 생성 (1ms~100ms)
			for (let i = 1; i <= 100; i++) {
				monitoring.recordRequestStart("openai", `req-${i}`);
				monitoring.recordRequestCompleted("openai", `req-${i}`, {
					responseTime: i,
				});
			}

			const metrics = monitoring.getMetrics("openai");
			// P99는 99번째 백분위수이므로 99ms 근처여야 함
			expect(metrics.p99ResponseTime).toBeCloseTo(99, 0);
		});
	});

	describe("통계 및 분석", () => {
		it("시간별 통계를 제공해야 한다", () => {
			// 여러 요청 생성
			for (let i = 0; i < 5; i++) {
				monitoring.recordRequestStart("openai", `req-${i}`);
				monitoring.recordRequestCompleted("openai", `req-${i}`, {
					responseTime: 1000 + i * 100,
				});
			}

			const hourlyStats = monitoring.getHourlyStats("openai");
			expect(hourlyStats).toBeDefined();
			expect(hourlyStats.totalRequests).toBe(5);
			expect(hourlyStats.successfulRequests).toBe(5);
			expect(hourlyStats.failedRequests).toBe(0);
		});

		it("최근 이벤트 목록을 반환해야 한다", () => {
			// 여러 이벤트 생성
			monitoring.recordRequestStart("openai", "req-1");
			monitoring.recordRequestCompleted("openai", "req-1", {
				responseTime: 1000,
			});
			monitoring.recordRequestStart("openai", "req-2");
			monitoring.recordRequestFailed("openai", "req-2", {
				errorCode: AI_ERROR_CODES.TIMEOUT,
				errorMessage: "Timeout",
			});

			const recentEvents = monitoring.getRecentEvents("openai", 10);
			expect(recentEvents.length).toBeGreaterThan(0);

			// 최신 이벤트가 먼저 나와야 함
			for (let i = 1; i < recentEvents.length; i++) {
				expect(recentEvents[i - 1].timestamp).toBeGreaterThanOrEqual(
					recentEvents[i].timestamp
				);
			}
		});

		it("전체 시스템 개요를 제공해야 한다", () => {
			// 여러 공급자에 대한 요청 생성
			monitoring.recordRequestStart("openai", "openai-req-1");
			monitoring.recordRequestCompleted("openai", "openai-req-1", {
				responseTime: 1000,
			});

			monitoring.recordRequestStart("google", "google-req-1");
			monitoring.recordRequestCompleted("google", "google-req-1", {
				responseTime: 800,
			});

			const overview = monitoring.getSystemOverview();
			expect(overview.totalProviders).toBe(2);
			expect(overview.totalRequests).toBe(2);
			expect(overview.overallErrorRate).toBe(0);
		});
	});

	describe("알림 시스템", () => {
		let alertTriggered = false;
		let lastAlert: any = null;

		beforeEach(() => {
			alertTriggered = false;
			lastAlert = null;

			// 알림 활성화 및 콜백 설정
			monitoring = new AIMonitoringSystem({
				enabled: true,
				enableAlerts: true,
				retentionPeriod: 3600000,
				thresholds: {
					errorRate: 50, // 50% 에러율에서 알림
					responseTime: 5000, // 5초 응답시간에서 알림
				},
				alertCallback: (alert) => {
					alertTriggered = true;
					lastAlert = alert;
				},
			});
		});

		it("높은 에러율에서 알림이 발생해야 한다", () => {
			// 에러율 60%가 되도록 요청 생성 (3실패/5전체)
			for (let i = 0; i < 2; i++) {
				monitoring.recordRequestStart("openai", `success-${i}`);
				monitoring.recordRequestCompleted("openai", `success-${i}`, {
					responseTime: 1000,
				});
			}

			for (let i = 0; i < 3; i++) {
				monitoring.recordRequestStart("openai", `failure-${i}`);
				monitoring.recordRequestFailed("openai", `failure-${i}`, {
					errorCode: AI_ERROR_CODES.TIMEOUT,
					errorMessage: "Timeout",
				});
			}

			// 알림이 발생해야 함
			expect(alertTriggered).toBe(true);
			expect(lastAlert?.type).toBe("high_error_rate");
			expect(lastAlert?.provider).toBe("openai");
		});

		it("느린 응답 시간에서 알림이 발생해야 한다", () => {
			monitoring.recordRequestStart("openai", "slow-req");
			monitoring.recordRequestCompleted("openai", "slow-req", {
				responseTime: 6000, // 6초 (임계치 5초 초과)
			});

			expect(alertTriggered).toBe(true);
			expect(lastAlert?.type).toBe("slow_response");
			expect(lastAlert?.provider).toBe("openai");
		});
	});

	describe("데이터 보존 및 정리", () => {
		it("만료된 이벤트를 정리해야 한다", async () => {
			// 짧은 보존 기간으로 모니터링 시스템 생성 (1ms)
			const shortRetentionMonitoring = new AIMonitoringSystem({
				enabled: true,
				retentionPeriod: 1,
			});

			// 이벤트 생성
			shortRetentionMonitoring.recordRequestStart("openai", "test-req");

			// 보존 기간이 지나도록 대기
			await new Promise((resolve) => setTimeout(resolve, 10));

			// 정리 실행
			const cleanedCount = shortRetentionMonitoring.cleanupExpiredEvents();

			expect(cleanedCount).toBeGreaterThan(0);

			shortRetentionMonitoring.stop();
		});
	});
});
