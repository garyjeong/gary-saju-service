/**
 * AI 클라이언트 통합 인터페이스
 * 모든 AI 공급자에 대한 공통 인터페이스 정의
 */

import { AIProvider, AIProviderConfig } from "./ai-config";

/**
 * 통합 AI 요청 인터페이스
 */
export interface UnifiedAIRequest {
	prompt: string;
	model?: string;
	maxTokens?: number;
	temperature?: number;
	systemMessage?: string;
	metadata?: {
		userId?: string;
		sessionId?: string;
		requestId?: string;
		context?: Record<string, any>;
	};
}

/**
 * 통합 AI 응답 인터페이스
 */
export interface UnifiedAIResponse {
	content: string;
	provider: AIProvider;
	model: string;
	usage: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
	metadata: {
		requestId?: string;
		responseTime: number;
		finishReason: "stop" | "length" | "error" | "timeout";
		cached?: boolean;
		retryCount?: number;
	};
	rawResponse?: any; // 원본 응답 (디버깅용)
}

/**
 * AI 클라이언트 에러 인터페이스
 */
export interface AIClientError extends Error {
	provider: AIProvider;
	errorCode: string;
	statusCode?: number;
	retryable: boolean;
	details?: Record<string, any>;
}

/**
 * AI 클라이언트 인터페이스
 */
export interface IAIClient {
	readonly provider: AIProvider;
	readonly config: AIProviderConfig;

	/**
	 * AI 모델에게 요청을 보냅니다
	 */
	generateCompletion(request: UnifiedAIRequest): Promise<UnifiedAIResponse>;

	/**
	 * 클라이언트 상태를 확인합니다
	 */
	healthCheck(): Promise<{
		healthy: boolean;
		latency?: number;
		error?: string;
	}>;

	/**
	 * 사용량 및 제한 정보를 조회합니다
	 */
	getUsageInfo(): Promise<{
		requests: {
			used: number;
			limit: number;
			remaining: number;
		};
		tokens: {
			used: number;
			limit: number;
			remaining: number;
		};
		resetTime?: Date;
	}>;

	/**
	 * 클라이언트를 정리합니다
	 */
	cleanup(): Promise<void>;
}

/**
 * AI 클라이언트 팩토리 인터페이스
 */
export interface IAIClientFactory {
	/**
	 * 지정된 공급자의 클라이언트를 생성합니다
	 */
	createClient(provider: AIProvider, config: AIProviderConfig): IAIClient;

	/**
	 * 지원되는 공급자 목록을 반환합니다
	 */
	getSupportedProviders(): AIProvider[];
}

/**
 * AI 서비스 에러 클래스
 */
export class AIServiceError extends Error implements AIClientError {
	constructor(
		message: string,
		public provider: AIProvider,
		public errorCode: string,
		public retryable: boolean = false,
		public statusCode?: number,
		public details?: Record<string, any>
	) {
		super(message);
		this.name = "AIServiceError";
	}
}

/**
 * 공통 에러 코드 정의
 */
export const AI_ERROR_CODES = {
	// 인증 관련
	AUTH_INVALID_API_KEY: "AUTH_INVALID_API_KEY",
	AUTH_QUOTA_EXCEEDED: "AUTH_QUOTA_EXCEEDED",
	AUTH_RATE_LIMITED: "AUTH_RATE_LIMITED",

	// 요청 관련
	REQUEST_INVALID_PARAMS: "REQUEST_INVALID_PARAMS",
	REQUEST_TOO_LARGE: "REQUEST_TOO_LARGE",
	REQUEST_TIMEOUT: "REQUEST_TIMEOUT",

	// 모델 관련
	MODEL_NOT_FOUND: "MODEL_NOT_FOUND",
	MODEL_OVERLOADED: "MODEL_OVERLOADED",
	MODEL_MAINTENANCE: "MODEL_MAINTENANCE",

	// 네트워크 관련
	NETWORK_ERROR: "NETWORK_ERROR",
	NETWORK_TIMEOUT: "NETWORK_TIMEOUT",

	// 서버 관련
	SERVER_ERROR: "SERVER_ERROR",
	SERVER_UNAVAILABLE: "SERVER_UNAVAILABLE",

	// 기타
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
	PARSING_ERROR: "PARSING_ERROR",
} as const;

/**
 * 재시도 가능한 에러 코드 목록
 */
export const RETRYABLE_ERROR_CODES = [
	AI_ERROR_CODES.REQUEST_TIMEOUT,
	AI_ERROR_CODES.MODEL_OVERLOADED,
	AI_ERROR_CODES.NETWORK_ERROR,
	AI_ERROR_CODES.NETWORK_TIMEOUT,
	AI_ERROR_CODES.SERVER_ERROR,
	AI_ERROR_CODES.SERVER_UNAVAILABLE,
] as const;

/**
 * 에러 코드가 재시도 가능한지 확인
 */
export function isRetryableError(errorCode: string): boolean {
	return RETRYABLE_ERROR_CODES.includes(errorCode as any);
}

/**
 * 표준화된 에러 메시지 매핑
 */
export const ERROR_MESSAGES = {
	[AI_ERROR_CODES.AUTH_INVALID_API_KEY]: "API 키가 유효하지 않습니다",
	[AI_ERROR_CODES.AUTH_QUOTA_EXCEEDED]: "API 사용량 한도를 초과했습니다",
	[AI_ERROR_CODES.AUTH_RATE_LIMITED]: "요청 빈도 제한에 걸렸습니다",
	[AI_ERROR_CODES.REQUEST_INVALID_PARAMS]: "요청 매개변수가 유효하지 않습니다",
	[AI_ERROR_CODES.REQUEST_TOO_LARGE]: "요청 크기가 너무 큽니다",
	[AI_ERROR_CODES.REQUEST_TIMEOUT]: "요청 시간이 초과되었습니다",
	[AI_ERROR_CODES.MODEL_NOT_FOUND]: "요청한 모델을 찾을 수 없습니다",
	[AI_ERROR_CODES.MODEL_OVERLOADED]: "모델이 과부하 상태입니다",
	[AI_ERROR_CODES.MODEL_MAINTENANCE]: "모델이 점검 중입니다",
	[AI_ERROR_CODES.NETWORK_ERROR]: "네트워크 오류가 발생했습니다",
	[AI_ERROR_CODES.NETWORK_TIMEOUT]: "네트워크 연결 시간이 초과되었습니다",
	[AI_ERROR_CODES.SERVER_ERROR]: "서버 내부 오류가 발생했습니다",
	[AI_ERROR_CODES.SERVER_UNAVAILABLE]: "서비스가 일시적으로 사용할 수 없습니다",
	[AI_ERROR_CODES.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다",
	[AI_ERROR_CODES.PARSING_ERROR]: "응답 파싱 중 오류가 발생했습니다",
} as const;

/**
 * 에러 메시지 조회
 */
export function getErrorMessage(errorCode: string): string {
	return (
		ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ||
		ERROR_MESSAGES[AI_ERROR_CODES.UNKNOWN_ERROR]
	);
}

/**
 * 사용량 정보 기본값
 */
export const DEFAULT_USAGE_INFO = {
	requests: { used: 0, limit: 1000, remaining: 1000 },
	tokens: { used: 0, limit: 1000000, remaining: 1000000 },
} as const;

/**
 * 요청 ID 생성 유틸리티
 */
export function generateRequestId(): string {
	return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 토큰 수 추정 유틸리티 (간단한 추정)
 */
export function estimateTokens(text: string): number {
	// 한국어는 대략 1글자당 1.5토큰으로 추정
	// 영어는 대략 4글자당 1토큰으로 추정
	const koreanChars = (text.match(/[가-힣]/g) || []).length;
	const otherChars = text.length - koreanChars;

	return Math.round(koreanChars * 1.5 + otherChars / 4);
}

/**
 * 응답 시간 측정 유틸리티
 */
export class ResponseTimer {
	private startTime: number;

	constructor() {
		this.startTime = Date.now();
	}

	getElapsedTime(): number {
		return Date.now() - this.startTime;
	}

	reset(): void {
		this.startTime = Date.now();
	}
}
