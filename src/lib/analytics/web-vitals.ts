/**
 * Web Vitals 성능 측정 및 트래킹
 * Core Web Vitals와 기타 성능 지표 수집
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";
import { trackPerformance } from "./vercel-analytics";

/**
 * Web Vitals 데이터 타입
 */
interface WebVitalsMetric {
	name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
	value: number;
	rating: "good" | "needs-improvement" | "poor";
	delta: number;
	id: string;
}

/**
 * 성능 임계값 정의 (Google 권장사항 기준)
 */
const PERFORMANCE_THRESHOLDS = {
	// Largest Contentful Paint (LCP)
	LCP: { good: 2500, poor: 4000 },

	// Interaction to Next Paint (INP) - FID의 대체 메트릭
	INP: { good: 200, poor: 500 },

	// Cumulative Layout Shift (CLS)
	CLS: { good: 0.1, poor: 0.25 },

	// First Contentful Paint (FCP)
	FCP: { good: 1800, poor: 3000 },

	// Time to First Byte (TTFB)
	TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * 성능 등급 계산
 */
function getRating(
	name: keyof typeof PERFORMANCE_THRESHOLDS,
	value: number
): "good" | "needs-improvement" | "poor" {
	const thresholds = PERFORMANCE_THRESHOLDS[name];
	if (value <= thresholds.good) return "good";
	if (value <= thresholds.poor) return "needs-improvement";
	return "poor";
}

/**
 * Web Vitals 트래킹 함수
 */
function sendToAnalytics(metric: WebVitalsMetric) {
	// 개발환경에서는 콘솔에 출력
	if (process.env.NODE_ENV === "development") {
		console.log("📈 Web Vitals:", {
			name: metric.name,
			value: Math.round(metric.value),
			rating: metric.rating,
		});
		return;
	}

	// 커스텀 메트릭으로 전송 (trackPerformance는 다른 함수들이 있음)
	const metricData = {
		name: metric.name,
		value: Math.round(metric.value),
		rating: metric.rating,
		timestamp: Date.now(),
	};

	// 개발환경이 아닌 경우에만 전송
	if (process.env.NODE_ENV === "production") {
		// Vercel Analytics의 track 함수 사용
		import("@/lib/analytics/vercel-analytics").then(({ safeTrack }) => {
			safeTrack("web_vitals", metricData);
		});
	}

	// 추가 분석 서비스 연동 가능
	// 예: Google Analytics, Mixpanel 등
}

/**
 * 모든 Web Vitals 수집 시작
 */
export function initWebVitals() {
	// Largest Contentful Paint (LCP)
	onLCP((metric) => {
		sendToAnalytics({
			name: "LCP",
			value: metric.value,
			rating: getRating("LCP", metric.value),
			delta: metric.delta,
			id: metric.id,
		});
	});

	// Interaction to Next Paint (INP) - FID의 대체 메트릭
	onINP((metric) => {
		sendToAnalytics({
			name: "INP",
			value: metric.value,
			rating: getRating("INP", metric.value),
			delta: metric.delta,
			id: metric.id,
		});
	});

	// Cumulative Layout Shift (CLS)
	onCLS((metric) => {
		sendToAnalytics({
			name: "CLS",
			value: metric.value,
			rating: getRating("CLS", metric.value),
			delta: metric.delta,
			id: metric.id,
		});
	});

	// First Contentful Paint (FCP)
	onFCP((metric) => {
		sendToAnalytics({
			name: "FCP",
			value: metric.value,
			rating: getRating("FCP", metric.value),
			delta: metric.delta,
			id: metric.id,
		});
	});

	// Time to First Byte (TTFB)
	onTTFB((metric) => {
		sendToAnalytics({
			name: "TTFB",
			value: metric.value,
			rating: getRating("TTFB", metric.value),
			delta: metric.delta,
			id: metric.id,
		});
	});
}

/**
 * 페이지별 성능 측정
 */
export class PagePerformanceTracker {
	private startTime: number;
	private pageName: string;

	constructor(pageName: string) {
		this.startTime = performance.now();
		this.pageName = pageName;
	}

	/**
	 * 특정 작업의 수행 시간 측정
	 */
	measureTask<T>(taskName: string, task: () => Promise<T>): Promise<T> {
		const taskStart = performance.now();

		return task().then((result) => {
			const taskTime = performance.now() - taskStart;

			if (process.env.NODE_ENV === "development") {
				console.log(
					`⏱️ ${this.pageName} - ${taskName}: ${Math.round(taskTime)}ms`
				);
			}

			// 성능 데이터 전송
			sendToAnalytics({
				name: "custom" as any,
				value: taskTime,
				rating:
					taskTime < 1000
						? "good"
						: taskTime < 3000
						? "needs-improvement"
						: "poor",
				delta: 0,
				id: `${this.pageName}-${taskName}`,
			});

			return result;
		});
	}

	/**
	 * 페이지 전체 로딩 시간 측정 완료
	 */
	complete() {
		const totalTime = performance.now() - this.startTime;

		if (process.env.NODE_ENV === "development") {
			console.log(
				`📄 ${this.pageName} 총 로딩 시간: ${Math.round(totalTime)}ms`
			);
		}

		// 페이지 총 로딩 시간 전송
		if (process.env.NODE_ENV === "production") {
			import("@/lib/analytics/vercel-analytics").then(({ safeTrack }) => {
				safeTrack("page_total_loading_time", {
					page: this.pageName,
					duration: Math.round(totalTime),
					rating:
						totalTime < 2000
							? "good"
							: totalTime < 5000
							? "needs-improvement"
							: "poor",
				});
			});
		}
	}
}

/**
 * 네트워크 정보 수집
 */
export function trackNetworkInfo() {
	if (!("connection" in navigator)) return;

	const connection = (navigator as any).connection;

	const networkInfo = {
		effective_type: connection.effectiveType, // '4g', '3g', etc.
		downlink: connection.downlink, // Mbps
		rtt: connection.rtt, // milliseconds
		save_data: connection.saveData, // boolean
	};

	if (process.env.NODE_ENV === "development") {
		console.log("🌐 네트워크 정보:", networkInfo);
	}

	// 네트워크 정보 전송
	if (process.env.NODE_ENV === "production") {
		import("@/lib/analytics/vercel-analytics").then(({ safeTrack }) => {
			safeTrack("network_info", networkInfo);
		});
	}
}

/**
 * 디바이스 정보 수집
 */
export function trackDeviceInfo() {
	const deviceInfo = {
		memory: (navigator as any).deviceMemory || "unknown", // GB
		cores: (navigator as any).hardwareConcurrency || "unknown",
		viewport_width: window.innerWidth,
		viewport_height: window.innerHeight,
		pixel_ratio: window.devicePixelRatio,
		user_agent: navigator.userAgent.substring(0, 100), // 길이 제한
	};

	if (process.env.NODE_ENV === "development") {
		console.log("📱 디바이스 정보:", deviceInfo);
	}
}

/**
 * 에러 추적 설정
 */
export function initErrorTracking() {
	// JavaScript 에러 추적
	window.addEventListener("error", (event) => {
		const errorInfo = {
			message: event.message.substring(0, 100),
			filename: event.filename,
			line_number: event.lineno,
			column_number: event.colno,
		};

		if (process.env.NODE_ENV === "development") {
			console.error("❌ JavaScript Error:", errorInfo);
		}

		// JavaScript 에러 전송
		if (process.env.NODE_ENV === "production") {
			import("@/lib/analytics/vercel-analytics").then(({ safeTrack }) => {
				safeTrack("javascript_error", errorInfo);
			});
		}
	});

	// Promise 에러 추적
	window.addEventListener("unhandledrejection", (event) => {
		const errorInfo = {
			reason: String(event.reason).substring(0, 100),
		};

		if (process.env.NODE_ENV === "development") {
			console.error("❌ Promise Error:", errorInfo);
		}

		// Promise 에러 전송
		if (process.env.NODE_ENV === "production") {
			import("@/lib/analytics/vercel-analytics").then(({ safeTrack }) => {
				safeTrack("promise_error", errorInfo);
			});
		}
	});
}
