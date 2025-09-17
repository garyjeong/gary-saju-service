/**
 * 개-사주 공유 데이터 저장소
 * 클라이언트 사이드 저장소 및 향후 서버 API 연동 대비
 */

import { extractShareData } from "./share-utils";

// 공유 데이터 타입 정의
export interface StoredShareData {
	id: string;
	data: ReturnType<typeof extractShareData>;
	timestamp: number;
	views: number;
	lastViewed: number;
	metadata?: {
		userAgent?: string;
		source?: string;
		platform?: string;
	};
}

// 로컬 스토리지 키
const STORAGE_KEY = "saju_shared_data";
const MAX_STORED_SHARES = 50; // 최대 저장 개수

/**
 * 공유 데이터 저장
 */
export function storeShareData(
	shareId: string,
	shareData: ReturnType<typeof extractShareData>,
	metadata?: StoredShareData["metadata"]
): boolean {
	try {
		if (typeof window === "undefined") return false;

		const existingData = getAllStoredShares();
		const now = Date.now();

		// 새로운 공유 데이터 생성
		const newShare: StoredShareData = {
			id: shareId,
			data: shareData,
			timestamp: now,
			views: 0,
			lastViewed: now,
			metadata: {
				userAgent: navigator.userAgent,
				source: "web",
				platform: "client",
				...metadata,
			},
		};

		// 기존 데이터 업데이트 또는 새 데이터 추가
		const updatedData = existingData.filter((item) => item.id !== shareId);
		updatedData.unshift(newShare);

		// 최대 개수 제한
		if (updatedData.length > MAX_STORED_SHARES) {
			updatedData.splice(MAX_STORED_SHARES);
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

		console.log(
			`📊 공유 데이터 저장: ${shareId} (${shareData.name}님의 ${shareData.dominantElement} 사주)`
		);
		return true;
	} catch (error) {
		console.error("공유 데이터 저장 실패:", error);
		return false;
	}
}

/**
 * 공유 데이터 조회
 */
export function getShareData(shareId: string): StoredShareData | null {
	try {
		if (typeof window === "undefined") return null;

		const allData = getAllStoredShares();
		const shareData = allData.find((item) => item.id === shareId);

		if (shareData) {
			// 조회수 증가 및 마지막 조회 시간 업데이트
			shareData.views += 1;
			shareData.lastViewed = Date.now();

			// 업데이트된 데이터 저장
			const updatedData = allData.map((item) =>
				item.id === shareId ? shareData : item
			);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

			console.log(
				`📈 공유 데이터 조회: ${shareId} (조회수: ${shareData.views})`
			);
		}

		return shareData || null;
	} catch (error) {
		console.error("공유 데이터 조회 실패:", error);
		return null;
	}
}

/**
 * 모든 저장된 공유 데이터 조회
 */
export function getAllStoredShares(): StoredShareData[] {
	try {
		if (typeof window === "undefined") return [];

		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("전체 공유 데이터 조회 실패:", error);
		return [];
	}
}

/**
 * 공유 데이터 삭제
 */
export function deleteShareData(shareId: string): boolean {
	try {
		if (typeof window === "undefined") return false;

		const allData = getAllStoredShares();
		const filteredData = allData.filter((item) => item.id !== shareId);

		localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));

		console.log(`🗑️ 공유 데이터 삭제: ${shareId}`);
		return true;
	} catch (error) {
		console.error("공유 데이터 삭제 실패:", error);
		return false;
	}
}

/**
 * 만료된 공유 데이터 정리 (30일 이상 된 것)
 */
export function cleanupExpiredShares(): number {
	try {
		if (typeof window === "undefined") return 0;

		const allData = getAllStoredShares();
		const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

		const validData = allData.filter((item) => item.timestamp > thirtyDaysAgo);
		const removedCount = allData.length - validData.length;

		if (removedCount > 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(validData));
			console.log(`🧹 만료된 공유 데이터 정리: ${removedCount}개 삭제`);
		}

		return removedCount;
	} catch (error) {
		console.error("공유 데이터 정리 실패:", error);
		return 0;
	}
}

/**
 * 공유 통계 조회
 */
export function getShareStats() {
	const allData = getAllStoredShares();

	// 총 조회수
	const totalViews = allData.reduce((sum, item) => sum + item.views, 0);

	// 가장 인기 있는 공유
	const mostPopular = allData.sort((a, b) => b.views - a.views)[0];

	// 최근 공유
	const recentShares = allData
		.sort((a, b) => b.timestamp - a.timestamp)
		.slice(0, 5);

	// 오행별 분포
	const elementDistribution = allData.reduce((acc, item) => {
		const element = item.data.dominantElement;
		acc[element] = (acc[element] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	// 월별 공유 수 (최근 6개월)
	const monthlyShares = allData.reduce((acc, item) => {
		const month = new Date(item.timestamp).toISOString().slice(0, 7); // YYYY-MM
		acc[month] = (acc[month] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	return {
		total: allData.length,
		totalViews,
		mostPopular: mostPopular
			? {
					id: mostPopular.id,
					name: mostPopular.data.name,
					element: mostPopular.data.dominantElement,
					views: mostPopular.views,
					timestamp: mostPopular.timestamp,
			  }
			: null,
		recentShares: recentShares.map((item) => ({
			id: item.id,
			name: item.data.name,
			element: item.data.dominantElement,
			timestamp: item.timestamp,
			views: item.views,
		})),
		elementDistribution,
		monthlyShares,
		averageViews: totalViews / Math.max(allData.length, 1),
	};
}

/**
 * 공유 URL 검증
 */
export function validateShareId(shareId: string): boolean {
	// 기본적인 ID 형식 검증 (8자리 알파뉴메릭)
	const shareIdPattern = /^[a-z0-9]{8}$/;
	return shareIdPattern.test(shareId);
}

/**
 * 공유 링크 생성 (전체 URL)
 */
export function generateFullShareUrl(
	shareId: string,
	baseUrl?: string
): string {
	const base =
		baseUrl ||
		(typeof window !== "undefined"
			? window.location.origin
			: "https://gary-saju-service.vercel.app");
	return `${base}/share/${shareId}`;
}

/**
 * 백업용 공유 데이터 내보내기
 */
export function exportShareData(): string {
	const allData = getAllStoredShares();
	const exportData = {
		version: "1.0",
		timestamp: Date.now(),
		data: allData,
		stats: getShareStats(),
	};

	return JSON.stringify(exportData, null, 2);
}

/**
 * 백업 데이터 가져오기
 */
export function importShareData(jsonData: string): boolean {
	try {
		const importData = JSON.parse(jsonData);

		if (!importData.data || !Array.isArray(importData.data)) {
			throw new Error("잘못된 백업 데이터 형식");
		}

		// 기존 데이터와 병합 (중복 제거)
		const existingData = getAllStoredShares();
		const existingIds = new Set(existingData.map((item) => item.id));

		const newData = importData.data.filter(
			(item: StoredShareData) => !existingIds.has(item.id)
		);

		const mergedData = [...existingData, ...newData];

		// 최대 개수 제한
		if (mergedData.length > MAX_STORED_SHARES) {
			mergedData.splice(MAX_STORED_SHARES);
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));

		console.log(`📥 공유 데이터 가져오기 완료: ${newData.length}개 추가`);
		return true;
	} catch (error) {
		console.error("공유 데이터 가져오기 실패:", error);
		return false;
	}
}

/**
 * 개발용: 테스트 공유 데이터 생성
 */
export function createTestShareData(count: number = 5): void {
	if (process.env.NODE_ENV !== "development") {
		console.warn("테스트 데이터는 개발 환경에서만 생성할 수 있습니다.");
		return;
	}

	const testData = [
		{
			name: "김민지",
			element: "목",
			keywords: ["창의적", "성실한", "배려심깊은"],
		},
		{ name: "박준호", element: "화", keywords: ["활발한", "리더십", "열정적"] },
		{ name: "이서연", element: "토", keywords: ["안정적", "신중한", "포용력"] },
		{
			name: "최동현",
			element: "금",
			keywords: ["논리적", "완벽주의", "책임감"],
		},
		{
			name: "정유나",
			element: "수",
			keywords: ["지혜로운", "직감적", "감성적"],
		},
	];

	for (let i = 0; i < Math.min(count, testData.length); i++) {
		const test = testData[i];
		const shareData = {
			name: test.name,
			dominantElement: test.element,
			keywords: test.keywords,
			birthInfo: `1995년 ${3 + i}월 ${10 + i}일 출생`,
			tone: "casual" as const,
			summary: `${test.element} 기운이 강한 ${test.keywords[0]} 성향`,
		};

		const shareId = `test${String(i + 1).padStart(4, "0")}`;
		storeShareData(shareId, shareData, {
			source: "test",
			platform: "development",
		});
	}

	console.log(`🧪 테스트 공유 데이터 ${count}개 생성 완료`);
}
