/**
 * AI API 테스트 스크립트
 * Google AI API가 제대로 동작하는지 확인
 */

import { interpretationEnhancer } from "./interpretation-enhancer";
import { AIInterpretationRequest } from "./google-ai-client";

/**
 * 테스트용 더미 사주 데이터
 */
const dummySajuData = {
	pillars: {
		year: { heavenly: "갑", earthly: "자" },
		month: { heavenly: "을", earthly: "해" },
		day: { heavenly: "병", earthly: "인" },
		time: { heavenly: "정", earthly: "사" },
	},
	elements: {
		wood: { score: 30, description: "목기운이 적당함" },
		fire: { score: 40, description: "화기운이 강함" },
		earth: { score: 20, description: "토기운이 부족함" },
		metal: { score: 25, description: "금기운이 약함" },
		water: { score: 35, description: "수기운이 보통" },
	},
	interpretation: {
		personality: ["창의적", "열정적", "직관적"],
		strengths: ["리더십", "창의력", "추진력"],
		challenges: ["성급함", "감정 기복"],
		summary: "불기운이 강한 창의적 성향의 사주",
	},
};

/**
 * 기본 AI 해석 테스트
 */
export async function testBasicInterpretation() {
	console.log("🧪 기본 AI 해석 테스트 시작...");

	try {
		const request: AIInterpretationRequest = {
			sajuResult: dummySajuData,
		};

		const result = await interpretationEnhancer.enhanceInterpretation(request);
		console.log("✅ 기본 해석 성공!");
		console.log("📊 처리 시간:", result.metadata.processingTime, "ms");
		console.log("🤖 모델:", result.metadata.model);
		console.log("🎯 개인화 결과:", result.enhancedInterpretation);

		return result;
	} catch (error) {
		console.error("❌ 기본 해석 실패:", error);
		throw error;
	}
}

/**
 * 개인화 프로필 포함 테스트
 */
export async function testPersonalizedInterpretation() {
	console.log("🧪 개인화 AI 해석 테스트 시작...");

	try {
		const request: AIInterpretationRequest = {
			sajuResult: dummySajuData,
			userProfile: {
				age: 28,
				gender: "female",
				interests: ["career", "love", "growth"],
				tone: "casual",
			},
		};

		const result = await interpretationEnhancer.enhanceInterpretation(request);
		console.log("✅ 개인화 해석 성공!");
		console.log("📊 처리 시간:", result.metadata.processingTime, "ms");
		console.log("🤖 모델:", result.metadata.model);
		console.log("🎯 개인화 결과:", result.enhancedInterpretation);

		return result;
	} catch (error) {
		console.error("❌ 개인화 해석 실패:", error);
		throw error;
	}
}

/**
 * 캐싱 테스트
 */
export async function testCaching() {
	console.log("🧪 캐싱 시스템 테스트 시작...");

	try {
		const request: AIInterpretationRequest = {
			sajuResult: dummySajuData,
			userProfile: {
				age: 30,
				gender: "male",
				tone: "formal",
			},
		};

		// 첫 번째 요청
		console.log("1️⃣ 첫 번째 요청 (캐시 MISS 예상)");
		const firstResult = await interpretationEnhancer.enhanceInterpretation(
			request
		);
		console.log(
			"📊 첫 번째 처리 시간:",
			firstResult.metadata.processingTime,
			"ms"
		);
		console.log("💾 캐시됨:", firstResult.metadata.cached);

		// 두 번째 요청 (동일한 데이터)
		console.log("2️⃣ 두 번째 요청 (캐시 HIT 예상)");
		const secondResult = await interpretationEnhancer.enhanceInterpretation(
			request
		);
		console.log(
			"📊 두 번째 처리 시간:",
			secondResult.metadata.processingTime,
			"ms"
		);
		console.log("💾 캐시됨:", secondResult.metadata.cached);

		if (
			firstResult.metadata.processingTime > secondResult.metadata.processingTime
		) {
			console.log("✅ 캐싱이 정상 동작합니다!");
		} else {
			console.log("⚠️ 캐싱 성능 개선 확인 필요");
		}

		return { firstResult, secondResult };
	} catch (error) {
		console.error("❌ 캐싱 테스트 실패:", error);
		throw error;
	}
}

/**
 * 전체 테스트 실행
 */
export async function runAllTests() {
	console.log("🚀 AI API 전체 테스트 시작\n");

	try {
		await testBasicInterpretation();
		console.log("\n" + "=".repeat(50) + "\n");

		await testPersonalizedInterpretation();
		console.log("\n" + "=".repeat(50) + "\n");

		await testCaching();
		console.log("\n✅ 모든 테스트 완료!");
	} catch (error) {
		console.error("\n❌ 테스트 중 오류 발생:", error);
		process.exit(1);
	}
}
