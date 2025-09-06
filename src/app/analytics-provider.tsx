"use client";

import { useEffect } from "react";
import { initWebVitals, initErrorTracking, trackNetworkInfo, trackDeviceInfo } from "@/lib/analytics/web-vitals";
import { initPerformanceMonitoring } from "@/lib/analytics/performance-monitor";

/**
 * 클라이언트 사이드 분석 도구 초기화
 */
export default function AnalyticsProvider() {
	useEffect(() => {
		// Web Vitals 측정 시작
		initWebVitals();
		
		// 에러 추적 설정
		initErrorTracking();
		
		// 네트워크 및 디바이스 정보 수집
		trackNetworkInfo();
		trackDeviceInfo();
		
		// 성능 모니터링 초기화
		const performanceMonitor = initPerformanceMonitoring();
		
		// 개발환경에서만 로그 출력
		if (process.env.NODE_ENV === 'development') {
			console.log('📊 Analytics & Performance Monitoring 초기화 완료');
		}

		// 정리 함수
		return () => {
			if (performanceMonitor) {
				performanceMonitor.destroy();
			}
		};
	}, []);

	// UI를 렌더링하지 않음
	return null;
}
