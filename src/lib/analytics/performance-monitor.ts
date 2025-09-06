/**
 * 성능 모니터링 및 메트릭 수집
 * Next.js 앱의 다양한 성능 지표를 추적
 */

"use client";

/**
 * 페이지별 성능 기준값 (밀리초)
 */
const PERFORMANCE_BENCHMARKS = {
	// 페이지 로드 시간
	pageLoad: {
		excellent: 1000,
		good: 2500,
		needsImprovement: 4000,
	},

	// API 응답 시간
	apiResponse: {
		excellent: 200,
		good: 500,
		needsImprovement: 1000,
	},

	// AI 처리 시간
	aiProcessing: {
		excellent: 2000,
		good: 5000,
		needsImprovement: 10000,
	},
} as const;

/**
 * 성능 등급 계산
 */
function getPerformanceGrade(
	value: number,
	benchmark: typeof PERFORMANCE_BENCHMARKS.pageLoad
): "excellent" | "good" | "needs-improvement" | "poor" {
	if (value <= benchmark.excellent) return "excellent";
	if (value <= benchmark.good) return "good";
	if (value <= benchmark.needsImprovement) return "needs-improvement";
	return "poor";
}

/**
 * 실시간 성능 모니터
 */
export class PerformanceMonitor {
	private static instance: PerformanceMonitor;
	private metrics: Map<string, number[]> = new Map();
	private observers: PerformanceObserver[] = [];

	private constructor() {
		this.initializeObservers();
	}

	static getInstance(): PerformanceMonitor {
		if (!PerformanceMonitor.instance) {
			PerformanceMonitor.instance = new PerformanceMonitor();
		}
		return PerformanceMonitor.instance;
	}

	/**
	 * Performance Observers 초기화
	 */
	private initializeObservers() {
		if (typeof window === "undefined") return;

		// Navigation 이벤트 추적
		if ("PerformanceObserver" in window) {
			const navigationObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === "navigation") {
						const navEntry = entry as PerformanceNavigationTiming;
						this.recordNavigation(navEntry);
					}
				}
			});

			try {
				navigationObserver.observe({ entryTypes: ["navigation"] });
				this.observers.push(navigationObserver);
			} catch (error) {
				console.warn("Navigation observer not supported:", error);
			}
		}

		// Resource 로딩 추적
		if ("PerformanceObserver" in window) {
			const resourceObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === "resource") {
						this.recordResource(entry as PerformanceResourceTiming);
					}
				}
			});

			try {
				resourceObserver.observe({ entryTypes: ["resource"] });
				this.observers.push(resourceObserver);
			} catch (error) {
				console.warn("Resource observer not supported:", error);
			}
		}
	}

	/**
	 * Navigation 성능 기록
	 */
	private recordNavigation(entry: PerformanceNavigationTiming) {
		const metrics = {
			dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
			tcpConnect: entry.connectEnd - entry.connectStart,
			tlsHandshake: entry.connectEnd - entry.secureConnectionStart,
			ttfb: entry.responseStart - entry.requestStart,
			domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
			loadComplete: entry.loadEventEnd - entry.fetchStart,
		};

		Object.entries(metrics).forEach(([key, value]) => {
			this.addMetric(`navigation.${key}`, value);
		});

		if (process.env.NODE_ENV === "development") {
			console.log("📊 Navigation Performance:", metrics);
		}
	}

	/**
	 * Resource 로딩 성능 기록
	 */
	private recordResource(entry: PerformanceResourceTiming) {
		const duration = entry.responseEnd - entry.startTime;
		const resourceType = this.getResourceType(entry.name);

		this.addMetric(`resource.${resourceType}`, duration);

		// 느린 리소스 감지 (2초 이상)
		if (duration > 2000 && process.env.NODE_ENV === "development") {
			console.warn(
				`🐌 Slow resource loading: ${entry.name} (${Math.round(duration)}ms)`
			);
		}
	}

	/**
	 * 리소스 타입 추출
	 */
	private getResourceType(url: string): string {
		if (url.includes(".js")) return "script";
		if (url.includes(".css")) return "stylesheet";
		if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "image";
		if (url.includes("/api/")) return "api";
		return "other";
	}

	/**
	 * 메트릭 추가
	 */
	addMetric(key: string, value: number) {
		if (!this.metrics.has(key)) {
			this.metrics.set(key, []);
		}
		this.metrics.get(key)!.push(value);

		// 최근 100개 값만 유지
		const values = this.metrics.get(key)!;
		if (values.length > 100) {
			values.shift();
		}
	}

	/**
	 * 메트릭 통계 계산
	 */
	getMetricStats(key: string) {
		const values = this.metrics.get(key);
		if (!values || values.length === 0) {
			return null;
		}

		const sorted = [...values].sort((a, b) => a - b);
		const sum = values.reduce((a, b) => a + b, 0);

		return {
			count: values.length,
			min: sorted[0],
			max: sorted[sorted.length - 1],
			avg: sum / values.length,
			median: sorted[Math.floor(sorted.length / 2)],
			p95: sorted[Math.floor(sorted.length * 0.95)],
		};
	}

	/**
	 * 모든 메트릭 요약
	 */
	getSummary() {
		const summary: Record<string, any> = {};

		for (const [key, values] of this.metrics.entries()) {
			summary[key] = this.getMetricStats(key);
		}

		return summary;
	}

	/**
	 * 메트릭 초기화
	 */
	reset() {
		this.metrics.clear();
	}

	/**
	 * 관찰자 정리
	 */
	destroy() {
		this.observers.forEach((observer) => observer.disconnect());
		this.observers = [];
		this.metrics.clear();
	}
}

/**
 * 메모리 사용량 모니터링
 */
export class MemoryMonitor {
	/**
	 * 현재 메모리 사용량 수집
	 */
	static getMemoryUsage() {
		if (
			typeof window === "undefined" ||
			!("performance" in window) ||
			!("memory" in performance)
		) {
			return null;
		}

		const memory = (performance as any).memory;

		return {
			usedJSHeapSize: memory.usedJSHeapSize / 1048576, // MB
			totalJSHeapSize: memory.totalJSHeapSize / 1048576, // MB
			jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576, // MB
			usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100, // %
		};
	}

	/**
	 * 메모리 사용량 추적 시작
	 */
	static startTracking(interval: number = 5000) {
		const trackingInterval = setInterval(() => {
			const usage = MemoryMonitor.getMemoryUsage();
			if (usage && usage.usage > 80) {
				console.warn("⚠️ High memory usage detected:", usage);
			}
		}, interval);

		return () => clearInterval(trackingInterval);
	}
}

/**
 * 사용자 경험 메트릭 추적
 */
export class UXMetrics {
	private static longTasks: PerformanceEntry[] = [];

	/**
	 * Long Task 추적 시작
	 */
	static initLongTaskTracking() {
		if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
			return;
		}

		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				UXMetrics.longTasks.push(entry);

				if (process.env.NODE_ENV === "development") {
					console.warn(
						`🐌 Long task detected: ${Math.round(entry.duration)}ms`
					);
				}
			}
		});

		try {
			observer.observe({ entryTypes: ["longtask"] });
		} catch (error) {
			console.warn("Long task observer not supported:", error);
		}
	}

	/**
	 * 페이지 Freeze 감지
	 */
	static detectPageFreeze() {
		let lastTime = performance.now();
		let freezeCount = 0;

		const checkFreeze = () => {
			const currentTime = performance.now();
			const delta = currentTime - lastTime;

			// 100ms 이상 지연된 경우 freeze로 간주
			if (delta > 100) {
				freezeCount++;
				if (process.env.NODE_ENV === "development") {
					console.warn(
						`🧊 Page freeze detected: ${Math.round(
							delta
						)}ms (Count: ${freezeCount})`
					);
				}
			}

			lastTime = currentTime;
			requestAnimationFrame(checkFreeze);
		};

		requestAnimationFrame(checkFreeze);
	}

	/**
	 * Long Task 통계
	 */
	static getLongTaskStats() {
		if (UXMetrics.longTasks.length === 0) {
			return null;
		}

		const durations = UXMetrics.longTasks.map((task) => task.duration);
		const totalDuration = durations.reduce(
			(sum, duration) => sum + duration,
			0
		);

		return {
			count: UXMetrics.longTasks.length,
			totalDuration: Math.round(totalDuration),
			avgDuration: Math.round(totalDuration / durations.length),
			maxDuration: Math.round(Math.max(...durations)),
		};
	}
}

/**
 * 성능 모니터링 초기화
 */
export function initPerformanceMonitoring() {
	if (typeof window === "undefined") return;

	const monitor = PerformanceMonitor.getInstance();
	MemoryMonitor.startTracking();
	UXMetrics.initLongTaskTracking();
	UXMetrics.detectPageFreeze();

	// 페이지 언로드 시 정리
	window.addEventListener("beforeunload", () => {
		monitor.destroy();
	});

	if (process.env.NODE_ENV === "development") {
		console.log("📊 Performance monitoring initialized");

		// 5분마다 성능 요약 출력
		setInterval(() => {
			console.log("📊 Performance Summary:", monitor.getSummary());
			console.log("🧠 Memory Usage:", MemoryMonitor.getMemoryUsage());
			console.log("🐌 Long Task Stats:", UXMetrics.getLongTaskStats());
		}, 5 * 60 * 1000);
	}

	return monitor;
}
