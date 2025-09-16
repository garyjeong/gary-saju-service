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
 * 동적 공유 페이지 URL 생성
 */
export function generateShareUrl(
	shareData: ReturnType<typeof extractShareData>,
	baseUrl: string = ""
) {
	// 고유 ID 생성 (실제로는 데이터베이스 ID를 사용)
	const shareId = generateShareId(shareData);

	const params = new URLSearchParams({
		name: shareData.name,
		element: shareData.dominantElement,
		keywords: shareData.keywords.join(","),
		tone: shareData.tone,
		birthInfo: shareData.birthInfo,
		summary: shareData.summary,
	});

	return `${baseUrl}/share/${shareId}?${params.toString()}`;
}

/**
 * 공유 ID 생성 (간단한 해시 기반)
 */
function generateShareId(
	shareData: ReturnType<typeof extractShareData>
): string {
	const dataString = `${shareData.name}-${shareData.dominantElement}-${shareData.birthInfo}`;

	// 간단한 해시 함수 (실제로는 더 복잡한 로직 필요)
	let hash = 0;
	for (let i = 0; i < dataString.length; i++) {
		const char = dataString.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // 32bit 정수로 변환
	}

	return Math.abs(hash).toString(36).substring(0, 8);
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
	urlObj.searchParams.set("utm_term", `${Date.now()}`); // 타임스탬프 추가
	return urlObj.toString();
}

/**
 * 🌟 공유 이벤트 트래킹 (Vercel Analytics 연동)
 */
export function trackShareEvent(
	platform: string,
	shareData: ReturnType<typeof extractShareData>,
	userId?: string
) {
	try {
		// Vercel Analytics 이벤트 트래킹
		if (typeof window !== "undefined" && (window as any).va) {
			(window as any).va("track", "share", {
				platform,
				element: shareData.dominantElement,
				user_name: shareData.name,
				keywords: shareData.keywords.join(","),
				birth_info: shareData.birthInfo,
				tone: shareData.tone,
				user_id: userId,
				timestamp: new Date().toISOString(),
			});
		}

		// 로컬 스토리지에 공유 기록 저장
		const shareHistory = getShareHistory();
		const newShare = {
			id: generateShareId(shareData),
			platform,
			timestamp: Date.now(),
			data: shareData,
		};

		shareHistory.push(newShare);

		// 최근 10개만 유지
		if (shareHistory.length > 10) {
			shareHistory.splice(0, shareHistory.length - 10);
		}

		localStorage.setItem("saju_share_history", JSON.stringify(shareHistory));

		console.log(
			`📊 공유 트래킹: ${platform}로 ${shareData.name}님의 ${shareData.dominantElement} 사주 공유`
		);
	} catch (error) {
		console.error("공유 트래킹 실패:", error);
	}
}

/**
 * 공유 기록 조회
 */
export function getShareHistory(): Array<{
	id: string;
	platform: string;
	timestamp: number;
	data: ReturnType<typeof extractShareData>;
}> {
	try {
		if (typeof window === "undefined") return [];

		const history = localStorage.getItem("saju_share_history");
		return history ? JSON.parse(history) : [];
	} catch (error) {
		console.error("공유 기록 조회 실패:", error);
		return [];
	}
}

/**
 * 인기 공유 통계 분석
 */
export function getShareStats() {
	const history = getShareHistory();

	// 플랫폼별 공유 수
	const platformStats = history.reduce((acc, share) => {
		acc[share.platform] = (acc[share.platform] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	// 오행별 공유 수
	const elementStats = history.reduce((acc, share) => {
		const element = share.data.dominantElement;
		acc[element] = (acc[element] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	// 최근 7일 공유 수
	const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const recentShares = history.filter((share) => share.timestamp > weekAgo);

	return {
		total: history.length,
		platforms: platformStats,
		elements: elementStats,
		recentCount: recentShares.length,
		lastShare: history[history.length - 1]?.timestamp || null,
	};
}

/**
 * 🌟 A/B 테스트용 공유 버전 선택
 */
export function getShareVariant(): "classic" | "modern" | "traditional" {
	// 간단한 A/B 테스트 로직 (실제로는 더 정교한 시스템 필요)
	const variants = ["classic", "modern", "traditional"] as const;
	const hash = Math.abs(Date.now() % 3);
	return variants[hash];
}

/**
 * 🌟 공유 성과 분석 리포트 생성
 */
export function generateShareReport() {
	const stats = getShareStats();
	const history = getShareHistory();

	// 가장 인기 있는 플랫폼
	const topPlatform =
		Object.entries(stats.platforms).sort(([, a], [, b]) => b - a)[0]?.[0] ||
		"unknown";

	// 가장 많이 공유된 오행
	const topElement =
		Object.entries(stats.elements).sort(([, a], [, b]) => b - a)[0]?.[0] ||
		"unknown";

	// 평균 공유 간격 (일)
	const avgInterval =
		history.length > 1
			? (Date.now() - history[0].timestamp) /
			  (history.length - 1) /
			  (24 * 60 * 60 * 1000)
			: 0;

	return {
		summary: {
			totalShares: stats.total,
			recentShares: stats.recentCount,
			topPlatform,
			topElement,
			avgIntervalDays: Math.round(avgInterval * 10) / 10,
		},
		recommendations: [
			stats.recentCount === 0
				? "최근 공유가 없습니다. SNS 활동을 늘려보세요!"
				: null,
			topPlatform === "kakao"
				? "카카오톡 공유가 인기입니다. 카카오 최적화를 강화하세요."
				: null,
			stats.total < 5
				? "공유 기능을 더 활용해보세요. 친구들과 사주를 나눠보세요!"
				: null,
		].filter(Boolean),
		details: stats,
	};
}
