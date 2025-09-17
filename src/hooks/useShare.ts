/**
 * 개-사주 공유 기능 통합 훅
 * SNS 공유, 링크 복사, 이미지 캡처 등 모든 공유 기능을 관리
 */

import { useState, useCallback, useRef } from "react";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import {
	extractShareData,
	generateShareUrl,
	generateSocialShareUrls,
	generateShareId,
} from "@/lib/share/share-utils";
import { trackSajuEvent } from "@/lib/analytics/vercel-analytics";
import {
	storeShareData,
	generateFullShareUrl,
} from "@/lib/share/share-storage";

// 공유 데이터 타입 정의
export interface ShareData {
	name: string;
	dominantElement: string;
	keywords: string[];
	birthInfo: string;
	tone: "formal" | "casual" | "poetic";
	summary: string;
}

// 공유 방법 타입
export type ShareMethod =
	| "copy-link"
	| "download-image"
	| "native-share"
	| "kakao"
	| "twitter"
	| "facebook"
	| "line"
	| "instagram";

// 에러 타입
export type ShareErrorType =
	| "GENERATION_FAILED"
	| "CAPTURE_FAILED"
	| "CLIPBOARD_DENIED"
	| "SHARE_CANCELLED"
	| "NETWORK_ERROR"
	| "UNSUPPORTED_FEATURE";

export interface ShareError {
	type: ShareErrorType;
	message: string;
	retry?: () => void;
}

// 공유 상태
export interface ShareState {
	shareData: ShareData | null;
	shareUrl: string | null;
	ogImageUrl: string | null;
	socialUrls: Record<string, string> | null;
	isGenerating: boolean;
	isCapturing: boolean;
	isCopying: boolean;
	isSharing: boolean;
	error: ShareError | null;
	lastSharedMethod: ShareMethod | null;
	capturedImage: Blob | null;
}

// 공유 생성 파라미터
export interface GenerateShareParams {
	sajuResult: SajuResult;
	sajuInput: SajuInputType;
	aiInterpretation?: any;
}

// 공유 메서드
export interface ShareMethods {
	generateShareData: (params: GenerateShareParams) => Promise<ShareData>;
	copyLink: () => Promise<boolean>;
	captureImage: (
		element: HTMLElement,
		filename?: string
	) => Promise<Blob | null>;
	shareToSocial: (platform: ShareMethod) => void;
	shareNative: () => Promise<boolean>;
	downloadImage: (blob?: Blob, filename?: string) => void;
	reset: () => void;
	clearError: () => void;
}

/**
 * useShare 훅 - 공유 기능 통합 관리
 */
export function useShare(): [ShareState, ShareMethods] {
	const [state, setState] = useState<ShareState>({
		shareData: null,
		shareUrl: null,
		ogImageUrl: null,
		socialUrls: null,
		isGenerating: false,
		isCapturing: false,
		isCopying: false,
		isSharing: false,
		error: null,
		lastSharedMethod: null,
		capturedImage: null,
	});

	// 에러 생성 헬퍼
	const createError = useCallback(
		(type: ShareErrorType, message: string, retry?: () => void): ShareError => {
			return { type, message, retry };
		},
		[]
	);

	// 상태 업데이트 헬퍼
	const updateState = useCallback((updates: Partial<ShareState>) => {
		setState((prev) => ({ ...prev, ...updates }));
	}, []);

	/**
	 * 공유 데이터 생성
	 */
	const generateShareData = useCallback(
		async (params: GenerateShareParams): Promise<ShareData> => {
			updateState({ isGenerating: true, error: null });

			try {
				// 공유용 데이터 추출
				const shareData = extractShareData(
					params.sajuResult,
					params.sajuInput,
					params.aiInterpretation
				);

				// 공유 ID 생성 및 데이터 저장
				const shareId = generateShareId(shareData);
				const baseUrl =
					typeof window !== "undefined" ? window.location.origin : "";

				// 로컬 스토리지에 공유 데이터 저장
				const stored = storeShareData(shareId, shareData, {
					source: "result_page",
					platform: "web",
					userAgent:
						typeof window !== "undefined" ? navigator.userAgent : undefined,
				});

				if (!stored) {
					console.warn("공유 데이터 저장 실패, URL 파라미터 방식으로 폴백");
				}

				// 깔끔한 공유 URL 생성 (ID 기반)
				const shareUrl = stored
					? generateFullShareUrl(shareId, baseUrl)
					: generateShareUrl(shareData, baseUrl); // 폴백

				// OG 이미지 URL 생성
				const ogParams = new URLSearchParams({
					name: shareData.name,
					element: shareData.dominantElement,
					keywords: shareData.keywords.join(","),
					summary: shareData.summary,
					birthInfo: shareData.birthInfo,
					tone: shareData.tone,
				});
				const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

				// 소셜 공유 URL들 생성
				const socialUrls = generateSocialShareUrls(shareUrl, shareData);

				updateState({
					shareData,
					shareUrl,
					ogImageUrl,
					socialUrls,
					isGenerating: false,
				});

				// 분석 추적
				trackSajuEvent.shareGenerated({
					platform: "general",
					hasAI: !!params.aiInterpretation,
					element: shareData.dominantElement,
				});

				console.log(`✨ 공유 링크 생성 완료: ${shareUrl}`);
				return shareData;
			} catch (error) {
				const shareError = createError(
					"GENERATION_FAILED",
					"공유 데이터 생성에 실패했습니다. 다시 시도해주세요.",
					() => generateShareData(params)
				);

				updateState({
					isGenerating: false,
					error: shareError,
				});

				throw shareError;
			}
		},
		[updateState, createError]
	);

	/**
	 * 링크 복사
	 */
	const copyLink = useCallback(async (): Promise<boolean> => {
		if (!state.shareUrl) {
			const error = createError(
				"GENERATION_FAILED",
				"공유 링크가 생성되지 않았습니다."
			);
			updateState({ error });
			return false;
		}

		updateState({ isCopying: true, error: null });

		try {
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(state.shareUrl);
			} else {
				// 폴백: 임시 텍스트 영역 생성
				const textArea = document.createElement("textarea");
				textArea.value = state.shareUrl;
				textArea.style.position = "fixed";
				textArea.style.opacity = "0";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				document.execCommand("copy");
				document.body.removeChild(textArea);
			}

			updateState({
				isCopying: false,
				lastSharedMethod: "copy-link",
			});

			// 분석 추적
			trackSajuEvent.shareCompleted({
				platform: "copy-link",
				success: true,
			});

			return true;
		} catch (error) {
			const shareError = createError(
				"CLIPBOARD_DENIED",
				"클립보드 복사에 실패했습니다. 브라우저 설정을 확인해주세요.",
				() => copyLink()
			);

			updateState({
				isCopying: false,
				error: shareError,
			});

			return false;
		}
	}, [state.shareUrl, updateState, createError]);

	/**
	 * 이미지 캡처 (html-to-image 사용)
	 */
	const captureImage = useCallback(
		async (element: HTMLElement, filename?: string): Promise<Blob | null> => {
			updateState({ isCapturing: true, error: null });

			try {
				// 동적 import로 html-to-image 로드
				const { toBlob } = await import("html-to-image");

				const blob = await toBlob(element, {
					quality: 0.9,
					backgroundColor: "#ffffff",
					pixelRatio: 2, // 고해상도
					skipAutoScale: true,
					cacheBust: true,
				});

				if (!blob) {
					throw new Error("이미지 생성 실패");
				}

				updateState({
					isCapturing: false,
					capturedImage: blob,
					lastSharedMethod: "download-image",
				});

				// 분석 추적
				trackSajuEvent.shareCompleted({
					platform: "image-capture",
					success: true,
				});

				return blob;
			} catch (error) {
				const shareError = createError(
					"CAPTURE_FAILED",
					"이미지 캡처에 실패했습니다. 다시 시도해주세요.",
					() => captureImage(element, filename)
				);

				updateState({
					isCapturing: false,
					error: shareError,
				});

				return null;
			}
		},
		[updateState, createError]
	);

	/**
	 * 네이티브 공유 API 사용
	 */
	const shareNative = useCallback(async (): Promise<boolean> => {
		if (!navigator.share) {
			const error = createError(
				"UNSUPPORTED_FEATURE",
				"이 브라우저는 공유 기능을 지원하지 않습니다."
			);
			updateState({ error });
			return false;
		}

		if (!state.shareData || !state.shareUrl) {
			const error = createError(
				"GENERATION_FAILED",
				"공유할 데이터가 없습니다."
			);
			updateState({ error });
			return false;
		}

		updateState({ isSharing: true, error: null });

		try {
			await navigator.share({
				title: `${state.shareData.name}님의 사주 - 개-사주`,
				text: `${
					state.shareData.dominantElement
				} 기운 중심의 ${state.shareData.keywords.join(", ")} 성향`,
				url: state.shareUrl,
			});

			updateState({
				isSharing: false,
				lastSharedMethod: "native-share",
			});

			// 분석 추적
			trackSajuEvent.shareCompleted({
				platform: "native-share",
				success: true,
			});

			return true;
		} catch (error: any) {
			// 사용자가 취소한 경우는 에러로 처리하지 않음
			if (error.name === "AbortError") {
				updateState({ isSharing: false });
				return false;
			}

			const shareError = createError(
				"SHARE_CANCELLED",
				"공유가 취소되었거나 실패했습니다.",
				() => shareNative()
			);

			updateState({
				isSharing: false,
				error: shareError,
			});

			return false;
		}
	}, [state.shareData, state.shareUrl, updateState, createError]);

	/**
	 * 소셜 플랫폼별 공유
	 */
	const shareToSocial = useCallback(
		(platform: ShareMethod) => {
			if (!state.socialUrls) {
				const error = createError(
					"GENERATION_FAILED",
					"공유 링크가 생성되지 않았습니다."
				);
				updateState({ error });
				return;
			}

			const platformUrls: Record<string, string> = state.socialUrls;
			const shareUrl = platformUrls[platform];

			if (!shareUrl) {
				const error = createError(
					"UNSUPPORTED_FEATURE",
					`${platform} 공유를 지원하지 않습니다.`
				);
				updateState({ error });
				return;
			}

			// 새 창에서 공유 페이지 열기
			const width = 600;
			const height = 400;
			const left = (window.innerWidth - width) / 2;
			const top = (window.innerHeight - height) / 2;

			window.open(
				shareUrl,
				`share-${platform}`,
				`width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
			);

			updateState({ lastSharedMethod: platform });

			// 분석 추적
			trackSajuEvent.shareCompleted({
				platform,
				success: true,
			});
		},
		[state.socialUrls, updateState, createError]
	);

	/**
	 * 이미지 다운로드
	 */
	const downloadImage = useCallback(
		(blob?: Blob, filename?: string) => {
			const imageBlob = blob || state.capturedImage;

			if (!imageBlob) {
				const error = createError(
					"CAPTURE_FAILED",
					"다운로드할 이미지가 없습니다."
				);
				updateState({ error });
				return;
			}

			const url = URL.createObjectURL(imageBlob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename || `${state.shareData?.name || "사주"}-결과.png`;

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// 메모리 정리
			setTimeout(() => URL.revokeObjectURL(url), 100);

			// 분석 추적
			trackSajuEvent.shareCompleted({
				platform: "image-download",
				success: true,
			});
		},
		[state.capturedImage, state.shareData, createError, updateState]
	);

	/**
	 * 상태 초기화
	 */
	const reset = useCallback(() => {
		setState({
			shareData: null,
			shareUrl: null,
			ogImageUrl: null,
			socialUrls: null,
			isGenerating: false,
			isCapturing: false,
			isCopying: false,
			isSharing: false,
			error: null,
			lastSharedMethod: null,
			capturedImage: null,
		});
	}, []);

	/**
	 * 에러 클리어
	 */
	const clearError = useCallback(() => {
		updateState({ error: null });
	}, [updateState]);

	const methods: ShareMethods = {
		generateShareData,
		copyLink,
		captureImage,
		shareToSocial,
		shareNative,
		downloadImage,
		reset,
		clearError,
	};

	return [state, methods];
}
