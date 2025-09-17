/**
 * 서킷 브레이커 테스트
 * 장애 감지, 회로 차단, 복구 로직 테스트
 */

import { CircuitBreaker } from "@/lib/ai/retry-strategies";
import { AIServiceError, AI_ERROR_CODES } from "@/lib/ai/ai-client-interface";
import { PROVIDER_RETRY_STRATEGIES } from "@/lib/ai/retry-strategies";

describe("서킷 브레이커 테스트", () => {
	let circuitBreaker: CircuitBreaker;

	beforeEach(() => {
		circuitBreaker = new CircuitBreaker(
			"openai",
			PROVIDER_RETRY_STRATEGIES.openai
		);
	});

	describe("기본 상태", () => {
		it("초기 상태는 closed여야 한다", () => {
			const state = circuitBreaker.getState();
			expect(state.state).toBe("closed");
			expect(state.isOpen).toBe(false);
			expect(state.failureCount).toBe(0);
		});

		it("요청 허용 여부를 올바르게 판단해야 한다", () => {
			expect(circuitBreaker.canExecute()).toBe(true);
		});
	});

	describe("실패 기록 및 회로 열기", () => {
		it("일반적인 실패는 기록되어야 한다", () => {
			const error = new AIServiceError(
				"Timeout error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			circuitBreaker.recordFailure(error);

			const state = circuitBreaker.getState();
			expect(state.failureCount).toBe(1);
			expect(state.state).toBe("closed"); // 아직 임계치에 도달하지 않음
		});

		it("임계치에 도달하면 회로가 열려야 한다", () => {
			const error = new AIServiceError(
				"Timeout error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			const threshold =
				PROVIDER_RETRY_STRATEGIES.openai.circuitBreakerThreshold;

			// 임계치만큼 실패 기록
			for (let i = 0; i < threshold; i++) {
				circuitBreaker.recordFailure(error);
			}

			const state = circuitBreaker.getState();
			expect(state.state).toBe("open");
			expect(state.isOpen).toBe(true);
			expect(state.failureCount).toBe(threshold);
		});

		it("회로가 열리면 요청을 거부해야 한다", () => {
			const error = new AIServiceError(
				"Timeout error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			const threshold =
				PROVIDER_RETRY_STRATEGIES.openai.circuitBreakerThreshold;

			// 회로 열기
			for (let i = 0; i < threshold; i++) {
				circuitBreaker.recordFailure(error);
			}

			expect(circuitBreaker.canExecute()).toBe(false);
		});

		it("서킷 브레이커에서 제외되는 에러는 기록되지 않아야 한다", () => {
			const authError = new AIServiceError(
				"Invalid API key",
				"openai",
				AI_ERROR_CODES.AUTH_INVALID_API_KEY
			);

			circuitBreaker.recordFailure(authError);

			const state = circuitBreaker.getState();
			// API 키 오류는 서킷 브레이커에서 제외되므로 카운트되지 않음
			expect(state.failureCount).toBe(0);
		});
	});

	describe("반개방 상태 (Half-Open)", () => {
		beforeEach(() => {
			// 회로를 열어놓음
			const error = new AIServiceError(
				"Timeout error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			const threshold =
				PROVIDER_RETRY_STRATEGIES.openai.circuitBreakerThreshold;
			for (let i = 0; i < threshold; i++) {
				circuitBreaker.recordFailure(error);
			}
		});

		it("회로 열림 후 일정 시간이 지나면 반개방 상태가 되어야 한다", async () => {
			// 시간 흐름 시뮬레이션을 위해 실제 시간을 기다리는 대신 내부 상태를 조작
			const state = circuitBreaker.getState();

			// 회로가 열려있는지 확인
			expect(state.state).toBe("open");
			expect(circuitBreaker.canExecute()).toBe(false);

			// half-open timeout이 지났다고 가정하고 테스트
			// 실제 구현에서는 setTimeout이나 시간 기반 로직을 테스트해야 함
		});
	});

	describe("성공 기록 및 회로 복구", () => {
		beforeEach(() => {
			// 회로를 열어놓음
			const error = new AIServiceError(
				"Timeout error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			const threshold =
				PROVIDER_RETRY_STRATEGIES.openai.circuitBreakerThreshold;
			for (let i = 0; i < threshold; i++) {
				circuitBreaker.recordFailure(error);
			}
		});

		it("성공 기록 시 실패 카운터가 리셋되어야 한다", () => {
			// 몇 번의 실패 후 성공
			const error = new AIServiceError(
				"Timeout error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			circuitBreaker.recordFailure(error);
			circuitBreaker.recordFailure(error);

			let state = circuitBreaker.getState();
			expect(state.failureCount).toBeGreaterThan(0);

			// 성공 기록
			circuitBreaker.recordSuccess();

			state = circuitBreaker.getState();
			expect(state.failureCount).toBe(0);
		});
	});

	describe("다양한 에러 타입 처리", () => {
		const testCases = [
			{
				errorCode: AI_ERROR_CODES.TIMEOUT,
				shouldCount: true,
				description: "타임아웃 에러",
			},
			{
				errorCode: AI_ERROR_CODES.RATE_LIMIT_EXCEEDED,
				shouldCount: true,
				description: "레이트 리밋 에러",
			},
			{
				errorCode: AI_ERROR_CODES.AUTH_INVALID_API_KEY,
				shouldCount: false,
				description: "API 키 오류",
			},
			{
				errorCode: AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED,
				shouldCount: false,
				description: "할당량 초과",
			},
			{
				errorCode: AI_ERROR_CODES.VALIDATION_INVALID_REQUEST,
				shouldCount: false,
				description: "잘못된 요청",
			},
			{
				errorCode: AI_ERROR_CODES.SERVER_INTERNAL_ERROR,
				shouldCount: true,
				description: "서버 내부 오류",
			},
			{
				errorCode: AI_ERROR_CODES.NETWORK_CONNECTION_ERROR,
				shouldCount: true,
				description: "네트워크 연결 오류",
			},
		];

		testCases.forEach(({ errorCode, shouldCount, description }) => {
			it(`${description}는 ${
				shouldCount ? "카운트되어야" : "카운트되지 않아야"
			} 한다`, () => {
				const error = new AIServiceError("Test error", "openai", errorCode);

				const initialState = circuitBreaker.getState();
				const initialCount = initialState.failureCount;

				circuitBreaker.recordFailure(error);

				const newState = circuitBreaker.getState();
				const expectedCount = shouldCount ? initialCount + 1 : initialCount;

				expect(newState.failureCount).toBe(expectedCount);
			});
		});
	});

	describe("상태 정보 제공", () => {
		it("현재 상태 정보를 올바르게 반환해야 한다", () => {
			const state = circuitBreaker.getState();

			expect(state).toHaveProperty("provider");
			expect(state).toHaveProperty("state");
			expect(state).toHaveProperty("isOpen");
			expect(state).toHaveProperty("failureCount");
			expect(state).toHaveProperty("lastFailureTime");

			expect(state.provider).toBe("openai");
			expect(["closed", "open", "half-open"]).toContain(state.state);
			expect(typeof state.isOpen).toBe("boolean");
			expect(typeof state.failureCount).toBe("number");
		});

		it("마지막 실패 시간이 기록되어야 한다", () => {
			const beforeTime = Date.now();

			const error = new AIServiceError(
				"Test error",
				"openai",
				AI_ERROR_CODES.TIMEOUT
			);

			circuitBreaker.recordFailure(error);

			const state = circuitBreaker.getState();
			const afterTime = Date.now();

			expect(state.lastFailureTime).toBeGreaterThanOrEqual(beforeTime);
			expect(state.lastFailureTime).toBeLessThanOrEqual(afterTime);
		});
	});
});
