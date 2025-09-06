/**
 * 브라우저 호환성 지원 유틸리티
 * 개-사주 서비스의 브라우저 호환성 확인 및 폴백 처리
 */

/**
 * 브라우저 기능 지원 여부 확인
 */
export interface BrowserSupport {
	clipboard: boolean;
	nativeShare: boolean;
	sessionStorage: boolean;
	fetch: boolean;
	urlSearchParams: boolean;
	css: {
		grid: boolean;
		flexbox: boolean;
		gradients: boolean;
	};
}

/**
 * 현재 브라우저의 기능 지원 여부 검사
 */
export function checkBrowserSupport(): BrowserSupport {
	const support: BrowserSupport = {
		clipboard: false,
		nativeShare: false,
		sessionStorage: false,
		fetch: false,
		urlSearchParams: false,
		css: {
			grid: false,
			flexbox: false,
			gradients: false,
		},
	};

	// SSR 환경에서는 기본값 반환
	if (typeof window === "undefined") {
		return support;
	}

	try {
		// Clipboard API 지원 확인
		support.clipboard = !!(navigator.clipboard && window.isSecureContext);

		// Native Share API 지원 확인
		support.nativeShare = !!(navigator.share && navigator.canShare);

		// Session Storage 지원 확인
		support.sessionStorage = (() => {
			try {
				const test = "__test__";
				sessionStorage.setItem(test, test);
				sessionStorage.removeItem(test);
				return true;
			} catch {
				return false;
			}
		})();

		// Fetch API 지원 확인
		support.fetch = typeof fetch !== "undefined";

		// URLSearchParams 지원 확인
		support.urlSearchParams = typeof URLSearchParams !== "undefined";

		// CSS 기능 지원 확인
		if (CSS && CSS.supports) {
			support.css.grid = CSS.supports("display", "grid");
			support.css.flexbox = CSS.supports("display", "flex");
			support.css.gradients = CSS.supports(
				"background",
				"linear-gradient(red, blue)"
			);
		}
	} catch (error) {
		console.warn("브라우저 호환성 검사 중 오류:", error);
	}

	return support;
}

/**
 * 지원되지 않는 브라우저에 대한 경고 메시지
 */
export function getUnsupportedBrowserMessage(): string | null {
	const support = checkBrowserSupport();

	// 필수 기능들 확인
	if (!support.fetch || !support.sessionStorage) {
		return "이 브라우저는 서비스의 일부 기능이 제한될 수 있습니다. 최신 브라우저를 사용해주세요.";
	}

	return null;
}

/**
 * 브라우저별 최적화 설정
 */
export interface BrowserOptimizations {
	usePolyfills: boolean;
	disableAnimations: boolean;
	fallbackToBasicUI: boolean;
}

export function getBrowserOptimizations(): BrowserOptimizations {
	const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

	return {
		// IE나 오래된 브라우저에서는 polyfill 사용
		usePolyfills: /MSIE|Trident/.test(userAgent),

		// 성능이 낮은 환경에서는 애니메이션 비활성화
		disableAnimations: /Android.*4\.|iPhone.*OS [6-9]_/.test(userAgent),

		// 매우 오래된 브라우저에서는 기본 UI 사용
		fallbackToBasicUI: /MSIE [6-9]/.test(userAgent),
	};
}

/**
 * 모바일 브라우저별 특수 처리
 */
export function getMobileBrowserInfo() {
	if (typeof navigator === "undefined") return null;

	const userAgent = navigator.userAgent;

	return {
		isIOS: /iPad|iPhone|iPod/.test(userAgent),
		isAndroid: /Android/.test(userAgent),
		isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
		isChrome: /Chrome/.test(userAgent),
		isFirefox: /Firefox/.test(userAgent),
		isEdge: /Edg/.test(userAgent),

		// PWA 지원 여부
		supportsPWA: "serviceWorker" in navigator && "PushManager" in window,

		// 설치 프롬프트 지원
		supportsInstallPrompt: "BeforeInstallPromptEvent" in window,
	};
}

/**
 * 주요 브라우저별 최소 지원 버전
 */
export const MINIMUM_SUPPORTED_VERSIONS = {
	chrome: 70,
	firefox: 65,
	safari: 12,
	edge: 79,
	ios_safari: 12,
	android: 70,
} as const;

/**
 * 현재 브라우저가 지원 범위 내인지 확인
 */
export function isSupportedBrowser(): boolean {
	if (typeof navigator === "undefined") return true;

	const userAgent = navigator.userAgent;

	// 매우 오래된 브라우저들은 지원하지 않음
	if (/MSIE [6789]|MSIE 10/.test(userAgent)) return false;
	if (/Android [234]\./.test(userAgent)) return false;
	if (/iPhone.*OS [6789]_|iPhone.*OS 10_/.test(userAgent)) return false;

	return true;
}
