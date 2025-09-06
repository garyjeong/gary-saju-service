/**
 * 브라우저 호환성 폴리필
 * 개-사주 서비스의 구형 브라우저 지원을 위한 폴리필들
 */

/**
 * URLSearchParams 폴리필 (IE 미지원)
 */
if (typeof URLSearchParams === "undefined") {
	(global as any).URLSearchParams = class URLSearchParamsPolyfill {
		private params: Record<string, string> = {};

		constructor(init?: string | Record<string, string>) {
			if (typeof init === "string") {
				this.parseString(init);
			} else if (init) {
				Object.assign(this.params, init);
			}
		}

		private parseString(str: string) {
			const pairs = str.replace(/^\?/, "").split("&");
			pairs.forEach((pair) => {
				const [key, value = ""] = pair.split("=");
				if (key) {
					this.params[decodeURIComponent(key)] = decodeURIComponent(value);
				}
			});
		}

		get(name: string): string | null {
			return this.params[name] || null;
		}

		set(name: string, value: string): void {
			this.params[name] = value;
		}

		append(name: string, value: string): void {
			if (this.params[name]) {
				this.params[name] += "," + value;
			} else {
				this.params[name] = value;
			}
		}

		delete(name: string): void {
			delete this.params[name];
		}

		has(name: string): boolean {
			return name in this.params;
		}

		toString(): string {
			return Object.entries(this.params)
				.map(
					([key, value]) =>
						`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
				)
				.join("&");
		}
	};
}

/**
 * Fetch API 폴리필 (IE 미지원)
 */
if (typeof fetch === "undefined") {
	(global as any).fetch = async function (
		input: string | Request,
		init?: RequestInit
	): Promise<Response> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const url = typeof input === "string" ? input : input.url;
			const method = init?.method || "GET";

			xhr.open(method, url, true);

			// 헤더 설정
			if (init?.headers) {
				const headers = init.headers as Record<string, string>;
				Object.entries(headers).forEach(([key, value]) => {
					xhr.setRequestHeader(key, value);
				});
			}

			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					const response = {
						ok: xhr.status >= 200 && xhr.status < 300,
						status: xhr.status,
						statusText: xhr.statusText,
						json: async () => JSON.parse(xhr.responseText),
						text: async () => xhr.responseText,
						headers: new Headers(),
					} as Response;

					if (response.ok) {
						resolve(response);
					} else {
						reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
					}
				}
			};

			xhr.onerror = () => reject(new Error("Network error"));

			if (init?.body) {
				// ReadableStream은 xhr.send에서 지원하지 않으므로 변환
				if (
					typeof init.body === "string" ||
					init.body instanceof FormData ||
					init.body instanceof ArrayBuffer
				) {
					xhr.send(init.body);
				} else {
					// 다른 타입은 문자열로 변환
					xhr.send(String(init.body));
				}
			} else {
				xhr.send();
			}
		});
	};
}

/**
 * Array.find 폴리필 (IE 미지원)
 */
if (!Array.prototype.find) {
	Array.prototype.find = function <T>(
		this: T[],
		predicate: (value: T, index: number, obj: T[]) => boolean
	): T | undefined {
		for (let i = 0; i < this.length; i++) {
			if (predicate(this[i], i, this)) {
				return this[i];
			}
		}
		return undefined;
	};
}

/**
 * Object.entries 폴리필 (IE 미지원)
 */
if (!Object.entries) {
	Object.entries = function <T>(obj: Record<string, T>): [string, T][] {
		const keys = Object.keys(obj);
		const entries: [string, T][] = [];
		for (let i = 0; i < keys.length; i++) {
			entries.push([keys[i], obj[keys[i]]]);
		}
		return entries;
	};
}

/**
 * CSS.supports 폴리필
 */
if (typeof CSS === "undefined" || !CSS.supports) {
	(global as any).CSS = {
		supports: function (property: string, value: string): boolean {
			// 기본적인 CSS 속성들에 대한 간단한 체크
			const testElement = document.createElement("div");
			try {
				(testElement.style as any)[property] = value;
				return (testElement.style as any)[property] === value;
			} catch {
				return false;
			}
		},
	};
}

/**
 * IntersectionObserver 폴리필 로딩 (필요시)
 */
export function loadIntersectionObserverPolyfill(): Promise<void> {
	return new Promise((resolve) => {
		if ("IntersectionObserver" in window) {
			resolve();
		} else {
			// 실제 서비스에서는 CDN이나 npm 패키지 사용 권장
			const script = document.createElement("script");
			script.src =
				"https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver";
			script.onload = () => resolve();
			document.head.appendChild(script);
		}
	});
}

/**
 * ResizeObserver 폴리필 로딩 (필요시)
 */
export function loadResizeObserverPolyfill(): Promise<void> {
	return new Promise((resolve) => {
		if ("ResizeObserver" in window) {
			resolve();
		} else {
			const script = document.createElement("script");
			script.src =
				"https://polyfill.io/v3/polyfill.min.js?features=ResizeObserver";
			script.onload = () => resolve();
			document.head.appendChild(script);
		}
	});
}

/**
 * 모든 필요한 폴리필을 한번에 로딩
 */
export async function loadAllPolyfills(): Promise<void> {
	const promises: Promise<void>[] = [];

	// IntersectionObserver가 필요한 경우
	if (!("IntersectionObserver" in window)) {
		promises.push(loadIntersectionObserverPolyfill());
	}

	// ResizeObserver가 필요한 경우
	if (!("ResizeObserver" in window)) {
		promises.push(loadResizeObserverPolyfill());
	}

	await Promise.all(promises);
	console.log("🔧 브라우저 호환성 폴리필 로딩 완료");
}

/**
 * 브라우저 호환성 경고 표시
 */
export function showBrowserCompatibilityWarning(): void {
	// 매우 오래된 브라우저에서만 경고 표시
	const isOldBrowser = /MSIE [6-9]/.test(navigator.userAgent);

	if (isOldBrowser) {
		const warning = document.createElement("div");
		warning.innerHTML = `
			<div style="
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				background: #ff6b6b;
				color: white;
				padding: 10px;
				text-align: center;
				z-index: 10000;
				font-family: sans-serif;
			">
				⚠️ 현재 브라우저에서는 일부 기능이 제한될 수 있습니다. 
				최신 브라우저 사용을 권장합니다.
				<button onclick="this.parentElement.remove()" style="
					background: transparent;
					border: 1px solid white;
					color: white;
					margin-left: 10px;
					padding: 2px 8px;
					cursor: pointer;
				">닫기</button>
			</div>
		`;
		document.body.appendChild(warning);
	}
}
