/**
 * 개-사주 공유 관련 유틸리티 함수들
 */

import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";

/**
 * 사주 결과로부터 공유용 데이터 추출
 */
export function extractShareData(
	sajuResult: SajuResult,
	sajuInput: SajuInputType,
	aiInterpretation?: any
) {
	// 주요 오행 추출
	const elements = sajuResult.elements;
	const dominantElement =
		Object.entries(elements).sort(
			([, a], [, b]) => b.score - a.score
		)[0]?.[0] || "미지";

	// 오행을 한글로 변환
	const elementMap: Record<string, string> = {
		wood: "목",
		fire: "화",
		earth: "토",
		metal: "금",
		water: "수",
	};

	const dominantElementKo = elementMap[dominantElement] || "미지";

	// AI 해석에서 키워드 추출 (없으면 기본 해석에서)
	const keywords: string[] = [];

	if (aiInterpretation?.personality) {
		const personalityText = Array.isArray(aiInterpretation.personality)
			? aiInterpretation.personality.join(" ")
			: aiInterpretation.personality;

		// 간단한 키워드 추출 (형용사 위주)
		const keywordMatches = personalityText.match(
			/[가-힣]{2,4}적|[가-힣]{2,4}한|[가-힣]{2,4}스러운/g
		);
		if (keywordMatches) {
			keywords.push(...keywordMatches.slice(0, 3));
		}
	}

	// AI 키워드가 부족하면 기본 해석에서 추가
	if (keywords.length < 3 && sajuResult.interpretation?.personality) {
		const basicPersonality = Array.isArray(
			sajuResult.interpretation.personality
		)
			? sajuResult.interpretation.personality
			: [sajuResult.interpretation.personality];

		basicPersonality.forEach((trait) => {
			if (typeof trait === "string" && keywords.length < 3) {
				keywords.push(trait);
			}
		});
	}

	// 기본 키워드 (fallback)
	if (keywords.length === 0) {
		keywords.push("신비로운", "독특한", "특별한");
	}

	// 출생 정보 포맷
	const birthYear = new Date(sajuInput.birthDate).getFullYear();
	const birthInfo = `${birthYear}년 ${sajuInput.birthTime} 출생`;

	return {
		name: sajuInput.name,
		dominantElement: dominantElementKo,
		keywords: keywords.slice(0, 3),
		birthInfo,
		tone: "casual" as const, // AI 프로필에서 가져올 수도 있음
		summary:
			aiInterpretation?.summary ||
			sajuResult.interpretation?.summary ||
			"나만의 특별한 사주",
	};
}

/**
 * 공유용 URL 생성
 */
export function generateShareUrl(
	shareData: ReturnType<typeof extractShareData>,
	baseUrl: string = ""
) {
	const params = new URLSearchParams({
		name: shareData.name,
		element: shareData.dominantElement,
		keywords: shareData.keywords.join(","),
		tone: shareData.tone,
		birthInfo: shareData.birthInfo,
	});

	return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * 소셜 미디어별 공유 URL 생성
 */
export function generateSocialShareUrls(
	pageUrl: string,
	shareData: ReturnType<typeof extractShareData>
) {
	const title = `${shareData.name}님의 사주 - 개-사주`;
	const description = `${
		shareData.dominantElement
	} 기운 중심의 ${shareData.keywords.join(", ")} 성향. ${shareData.summary}`;
	const hashtags = [
		"개사주",
		"사주",
		"AI사주",
		"운세",
		shareData.dominantElement + "기운",
	];

	return {
		// 카카오톡
		kakao: `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(
			pageUrl
		)}&text=${encodeURIComponent(title + "\n" + description)}`,

		// 페이스북
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
			pageUrl
		)}`,

		// 트위터
		twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
			title + "\n" + description
		)}&url=${encodeURIComponent(pageUrl)}&hashtags=${encodeURIComponent(
			hashtags.join(",")
		)}`,

		// 링크드인
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
			pageUrl
		)}`,

		// 라인
		line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
			pageUrl
		)}&text=${encodeURIComponent(title)}`,

		// 텔레그램
		telegram: `https://t.me/share/url?url=${encodeURIComponent(
			pageUrl
		)}&text=${encodeURIComponent(title + "\n" + description)}`,

		// 네이버 밴드
		band: `https://band.us/plugin/share?body=${encodeURIComponent(
			title + "\n" + description + "\n" + pageUrl
		)}`,

		// WhatsApp
		whatsapp: `https://wa.me/?text=${encodeURIComponent(
			title + "\n" + description + "\n" + pageUrl
		)}`,
	};
}

/**
 * 클립보드 복사 (브라우저 호환성 고려)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			return true;
		} else {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "absolute";
			textArea.style.opacity = "0";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			const result = document.execCommand("copy");
			textArea.remove();
			return result;
		}
	} catch (error) {
		console.error("클립보드 복사 실패:", error);
		return false;
	}
}

/**
 * 브라우저에서 파일 다운로드
 */
export function downloadFile(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * 웹 공유 API 사용 (모바일에서)
 */
export async function nativeShare(shareData: {
	title: string;
	text: string;
	url: string;
}): Promise<boolean> {
	try {
		if (
			navigator.share &&
			navigator.canShare &&
			navigator.canShare(shareData)
		) {
			await navigator.share(shareData);
			return true;
		}
		return false;
	} catch (error) {
		console.error("네이티브 공유 실패:", error);
		return false;
	}
}

/**
 * 사용자 에이전트 기반 모바일 감지
 */
export function isMobileDevice(): boolean {
	if (typeof window === "undefined") return false;
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
}

/**
 * 공유 추적을 위한 UTM 파라미터 추가
 */
export function addUTMParameters(
	url: string,
	source: string,
	medium: string = "social",
	campaign: string = "saju_share"
) {
	const urlObj = new URL(url);
	urlObj.searchParams.set("utm_source", source);
	urlObj.searchParams.set("utm_medium", medium);
	urlObj.searchParams.set("utm_campaign", campaign);
	urlObj.searchParams.set("utm_content", "saju_card");
	return urlObj.toString();
}
