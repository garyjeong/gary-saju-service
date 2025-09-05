/**
 * 개-사주 AI 응답 캐싱 시스템
 * API 비용 최적화를 위한 intelligent caching
 */

import {
	AIInterpretationRequest,
	AIInterpretationResponse,
} from "./openai-client";

/**
 * 캐시 엔트리 타입
 */
interface CacheEntry {
	data: AIInterpretationResponse;
	timestamp: number;
	accessCount: number;
	lastAccessed: number;
}

/**
 * 캐시 매니저 클래스
 */
export class CacheManager {
	private cache = new Map<string, CacheEntry>();
	private readonly maxSize = 1000; // 최대 캐시 엔트리 수
	private readonly ttl = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
	private readonly cleanupInterval = 60 * 60 * 1000; // 1시간마다 정리

	constructor() {
		// 주기적 캐시 정리
		setInterval(() => this.cleanup(), this.cleanupInterval);
	}

	/**
	 * 캐시 키 생성
	 */
	private generateCacheKey(request: AIInterpretationRequest): string {
		const { sajuResult, userProfile } = request;

		// 사주 기본 정보로 키 생성
		const pillarsKey = JSON.stringify(sajuResult.pillars);
		const elementsKey = JSON.stringify(sajuResult.elements);

		// 사용자 프로필 고려 (옵셔널)
		const profileKey = userProfile
			? JSON.stringify({
					age: userProfile.age ? Math.floor(userProfile.age / 10) * 10 : null, // 10년 단위로 그룹화
					gender: userProfile.gender,
					tone: userProfile.tone,
					interests: userProfile.interests?.sort(), // 정렬해서 순서 무관하게
			  })
			: "default";

		// SHA-256 대신 간단한 해시 생성
		const combinedString = `${pillarsKey}|${elementsKey}|${profileKey}`;
		return this.simpleHash(combinedString);
	}

	/**
	 * 간단한 해시 함수
	 */
	private simpleHash(str: string): string {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // 32bit 정수로 변환
		}
		return Math.abs(hash).toString(36);
	}

	/**
	 * 캐시에서 데이터 조회
	 */
	get(request: AIInterpretationRequest): AIInterpretationResponse | null {
		const key = this.generateCacheKey(request);
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// TTL 체크
		if (Date.now() - entry.timestamp > this.ttl) {
			this.cache.delete(key);
			return null;
		}

		// 액세스 정보 업데이트
		entry.accessCount++;
		entry.lastAccessed = Date.now();

		// 캐시된 데이터임을 표시
		const cachedResponse = {
			...entry.data,
			metadata: {
				...entry.data.metadata,
				cached: true,
				cacheHit: true,
			},
		};

		return cachedResponse;
	}

	/**
	 * 캐시에 데이터 저장
	 */
	set(
		request: AIInterpretationRequest,
		response: AIInterpretationResponse
	): void {
		const key = this.generateCacheKey(request);

		// 캐시 크기 제한 확인
		if (this.cache.size >= this.maxSize) {
			this.evictLeastUsed();
		}

		const entry: CacheEntry = {
			data: response,
			timestamp: Date.now(),
			accessCount: 1,
			lastAccessed: Date.now(),
		};

		this.cache.set(key, entry);
	}

	/**
	 * 가장 적게 사용된 엔트리 제거 (LRU)
	 */
	private evictLeastUsed(): void {
		let leastUsedKey: string | null = null;
		let leastUsedScore = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			// 점수 = 액세스 횟수 / 경과 시간 (낮을수록 제거 대상)
			const age = Date.now() - entry.timestamp;
			const score = entry.accessCount / (age / 1000 / 60 / 60); // 시간당 액세스

			if (score < leastUsedScore) {
				leastUsedScore = score;
				leastUsedKey = key;
			}
		}

		if (leastUsedKey) {
			this.cache.delete(leastUsedKey);
		}
	}

	/**
	 * 만료된 캐시 정리
	 */
	private cleanup(): void {
		const now = Date.now();
		const toDelete: string[] = [];

		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > this.ttl) {
				toDelete.push(key);
			}
		}

		toDelete.forEach((key) => this.cache.delete(key));

		console.log(`Cache cleanup: ${toDelete.length} expired entries removed`);
	}

	/**
	 * 캐시 통계 조회
	 */
	getStats() {
		const entries = Array.from(this.cache.values());
		const now = Date.now();

		return {
			totalEntries: this.cache.size,
			maxSize: this.maxSize,
			ttlHours: this.ttl / (1000 * 60 * 60),
			averageAge:
				entries.length > 0
					? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) /
					  entries.length /
					  1000 /
					  60
					: 0,
			totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
			memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
		};
	}

	/**
	 * 캐시 히트율 계산
	 */
	private hitCount = 0;
	private missCount = 0;

	recordHit(): void {
		this.hitCount++;
	}

	recordMiss(): void {
		this.missCount++;
	}

	getHitRate(): number {
		const total = this.hitCount + this.missCount;
		return total > 0 ? this.hitCount / total : 0;
	}

	/**
	 * 특정 키 패턴으로 캐시 삭제
	 */
	invalidatePattern(pattern: string): number {
		let deletedCount = 0;

		for (const key of this.cache.keys()) {
			if (key.includes(pattern)) {
				this.cache.delete(key);
				deletedCount++;
			}
		}

		return deletedCount;
	}

	/**
	 * 전체 캐시 삭제
	 */
	clear(): void {
		this.cache.clear();
		this.hitCount = 0;
		this.missCount = 0;
	}

	/**
	 * 캐시 크기 조정
	 */
	resize(newMaxSize: number): void {
		if (newMaxSize < this.cache.size) {
			// 크기가 줄어들면 LRU 방식으로 제거
			while (this.cache.size > newMaxSize) {
				this.evictLeastUsed();
			}
		}
	}
}

// 싱글톤 캐시 매니저 인스턴스
export const cacheManager = new CacheManager();

/**
 * 캐시 헬퍼 함수들
 */
export function getCachedInterpretation(
	request: AIInterpretationRequest
): AIInterpretationResponse | null {
	const result = cacheManager.get(request);

	if (result) {
		cacheManager.recordHit();
		console.log("Cache HIT for AI interpretation");
	} else {
		cacheManager.recordMiss();
		console.log("Cache MISS for AI interpretation");
	}

	return result;
}

export function setCachedInterpretation(
	request: AIInterpretationRequest,
	response: AIInterpretationResponse
): void {
	cacheManager.set(request, response);
	console.log("Cached AI interpretation");
}

export function getCacheStats() {
	return {
		...cacheManager.getStats(),
		hitRate: cacheManager.getHitRate(),
	};
}
