/**
 * Vercel Analytics 설정 및 이벤트 트래킹
 * 개-사주 서비스의 성능 및 사용자 분석
 */

import { track } from "@vercel/analytics";

/**
 * 사주 관련 이벤트 트래킹
 */
export const trackSajuEvent = {
	/**
	 * 사주 입력 시작
	 */
	inputStart: () => {
		track("saju_input_start");
	},

	/**
	 * 사주 계산 완료
	 */
	calculationComplete: (data?: {
		birthYear?: number;
		gender?: string;
		hasTime?: boolean;
	}) => {
		track("saju_calculation_complete", data);
	},

	/**
	 * AI 해석 요청
	 */
	aiInterpretationRequest: (data?: {
		profileAge?: number;
		profileGender?: string;
		profileTone?: string;
		interests?: string[];
	}) => {
		track("ai_interpretation_request", {
			...data,
			interests: data?.interests?.join(","),
		});
	},

	/**
	 * AI 해석 완료
	 */
	aiInterpretationComplete: (data?: {
		processingTime?: number;
		cached?: boolean;
		model?: string;
	}) => {
		track("ai_interpretation_complete", data);
	},

	/**
	 * 공유 시도
	 */
	shareAttempt: (
		method: "native" | "clipboard" | "download" | "social",
		platform?: string
	) => {
		track("share_attempt", { method, platform });
	},

	/**
	 * 공유 성공
	 */
	shareSuccess: (
		method: "native" | "clipboard" | "download" | "social",
		platform?: string
	) => {
		track("share_success", { method, platform });
	},

	/**
	 * 오류 발생
	 */
	error: (
		errorType: "calculation" | "ai" | "share" | "network",
		message?: string
	) => {
		track("error_occurred", {
			error_type: errorType,
			error_message: message?.substring(0, 100), // 개인정보 보호를 위해 길이 제한
		});
	},

	/**
	 * 페이지 체류 시간 (5분 이상)
	 */
	longEngagement: (
		pageType: "input" | "result" | "share",
		timeSpent: number
	) => {
		track("long_engagement", {
			page_type: pageType,
			time_spent_seconds: timeSpent,
		});
	},
};

/**
 * 성능 관련 이벤트 트래킹
 */
export const trackPerformance = {
	/**
	 * AI API 응답 시간
	 */
	aiResponseTime: (responseTime: number, cached: boolean) => {
		debugTrack("ai_response_time", {
			response_time_ms: responseTime,
			cached: cached ? "true" : "false",
		});
	},

	/**
	 * 사주 계산 시간
	 */
	calculationTime: (calculationTime: number) => {
		debugTrack("saju_calculation_time", {
			calculation_time_ms: calculationTime,
		});
	},

	/**
	 * 이미지 생성 시간
	 */
	imageGenerationTime: (generationTime: number) => {
		debugTrack("image_generation_time", {
			generation_time_ms: generationTime,
		});
	},

	/**
	 * 커스텀 Web Vitals 메트릭
	 */
	webVitalsCustom: (metric: { name: string; value: number; page?: string }) => {
		debugTrack("web_vitals_custom", metric);
	},
};

/**
 * 페이지 성능 측정 클래스
 */
export class PagePerformanceTracker {
	private startTime: number;
	private pageName: string;

	constructor(pageName: string) {
		this.startTime = performance.now();
		this.pageName = pageName;
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

		trackPerformance.webVitalsCustom({
			name: "page_load",
			value: totalTime,
			page: this.pageName,
		});
	}
}

/**
 * 사용자 행동 분석
 */
export const trackUserBehavior = {
	/**
	 * 탭 전환
	 */
	tabSwitch: (fromTab: string, toTab: string) => {
		track("tab_switch", { from_tab: fromTab, to_tab: toTab });
	},

	/**
	 * 프로필 모달 열기
	 */
	profileModalOpen: () => {
		track("profile_modal_open");
	},

	/**
	 * AI 재해석 요청
	 */
	aiReinterpretation: (profileChanged: boolean) => {
		track("ai_reinterpretation", { profile_changed: profileChanged });
	},

	/**
	 * 외부 링크 클릭
	 */
	externalLinkClick: (
		linkType: "social" | "reference" | "other",
		destination?: string
	) => {
		track("external_link_click", { link_type: linkType, destination });
	},
};

/**
 * 비즈니스 관련 지표 트래킹
 */
export const trackBusiness = {
	/**
	 * 바이럴 지표 - 공유를 통한 유입
	 */
	viralInbound: (
		source: "facebook" | "twitter" | "kakao" | "line" | "direct" | "other"
	) => {
		track("viral_inbound", { traffic_source: source });
	},

	/**
	 * 사용자 여정 완료
	 */
	journeyComplete: (steps: ("input" | "result" | "ai" | "share")[]) => {
		track("user_journey_complete", {
			journey: steps.join(" -> "),
			steps_count: steps.length,
		});
	},

	/**
	 * 재방문자 식별
	 */
	returningUser: (daysSinceLastVisit?: number) => {
		track("returning_user", { days_since_last_visit: daysSinceLastVisit });
	},
};

/**
 * 개인정보 보호 준수 트래킹 헬퍼
 */
export const safeTrack = (eventName: string, data?: Record<string, any>) => {
	// 개인정보가 포함될 수 있는 필드들 필터링
	const sanitizedData = data
		? Object.entries(data).reduce((acc, [key, value]) => {
				// 개인식별 정보 제외
				if (
					["name", "email", "phone", "address"].some((pii) =>
						key.toLowerCase().includes(pii)
					)
				) {
					return acc;
				}

				// 문자열 길이 제한 (100자)
				if (typeof value === "string" && value.length > 100) {
					acc[key] = value.substring(0, 100);
				} else {
					acc[key] = value;
				}

				return acc;
		  }, {} as Record<string, any>)
		: undefined;

	track(eventName, sanitizedData);
};

/**
 * 개발환경에서는 콘솔 로그만 출력
 */
export const debugTrack = (eventName: string, data?: Record<string, any>) => {
	if (process.env.NODE_ENV === "development") {
		console.log("📊 Analytics Event:", eventName, data);
	} else {
		safeTrack(eventName, data);
	}
};
