"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, ArrowLeft, Zap, WifiOff, Clock, Shield } from "lucide-react";

interface EnhancedErrorProps {
	title?: string;
	message?: string;
	type?: "network" | "timeout" | "quota" | "permission" | "validation" | "server" | "unknown";
	onRetry?: () => void;
	onBack?: () => void;
	className?: string;
	showIcon?: boolean;
}

const errorConfig = {
	network: {
		icon: WifiOff,
		color: "text-orange-500",
		bgColor: "bg-orange-500/10",
		title: "네트워크 연결 오류",
		message: "인터넷 연결을 확인하고 다시 시도해주세요.",
		actionText: "다시 시도",
	},
	timeout: {
		icon: Clock,
		color: "text-yellow-500",
		bgColor: "bg-yellow-500/10", 
		title: "요청 시간 초과",
		message: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
		actionText: "다시 시도",
	},
	quota: {
		icon: Zap,
		color: "text-red-500",
		bgColor: "bg-red-500/10",
		title: "AI 서비스 한도 초과",
		message: "일시적으로 AI 해석 서비스 사용량이 초과되었습니다. 잠시 후 다시 이용해주세요.",
		actionText: "기본 해석으로 계속",
	},
	permission: {
		icon: Shield,
		color: "text-purple-500", 
		bgColor: "bg-purple-500/10",
		title: "접근 권한 오류",
		message: "해당 기능에 대한 접근 권한이 없습니다.",
		actionText: "다시 시도",
	},
	validation: {
		icon: AlertTriangle,
		color: "text-amber-500",
		bgColor: "bg-amber-500/10",
		title: "입력 정보 오류",
		message: "입력하신 정보에 문제가 있습니다. 다시 확인해주세요.",
		actionText: "다시 입력",
	},
	server: {
		icon: AlertTriangle,
		color: "text-red-500",
		bgColor: "bg-red-500/10",
		title: "서버 오류",
		message: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
		actionText: "다시 시도",
	},
	unknown: {
		icon: AlertTriangle,
		color: "text-gray-500",
		bgColor: "bg-gray-500/10",
		title: "알 수 없는 오류",
		message: "예상치 못한 오류가 발생했습니다. 지속적으로 문제가 발생하면 고객센터에 문의해주세요.",
		actionText: "다시 시도",
	},
};

export default function EnhancedError({
	title,
	message,
	type = "unknown",
	onRetry,
	onBack,
	className,
	showIcon = true,
}: EnhancedErrorProps) {
	const config = errorConfig[type];
	const Icon = config.icon;

	return (
		<div className={cn(
			"flex flex-col items-center justify-center p-8 space-y-6 text-center",
			className
		)}>
			{/* 아이콘 */}
			{showIcon && (
				<div className="relative">
					<div className={cn(
						"w-20 h-20 rounded-3xl flex items-center justify-center",
						config.bgColor
					)}>
						<Icon className={cn("w-10 h-10", config.color)} />
					</div>
					
					{/* 글로우 효과 */}
					<div className={cn(
						"absolute -inset-2 rounded-3xl blur-xl opacity-20",
						config.bgColor
					)}></div>
				</div>
			)}

			{/* 메시지 */}
			<div className="space-y-3 max-w-md">
				<h3 className="text-xl font-serif font-semibold text-foreground">
					{title || config.title}
				</h3>
				<p className="text-muted-foreground leading-relaxed">
					{message || config.message}
				</p>
			</div>

			{/* 액션 버튼들 */}
			<div className="flex flex-col sm:flex-row gap-3">
				{onRetry && (
					<Button 
						onClick={onRetry}
						className="gradient-button text-white rounded-2xl px-6 py-3 flex items-center gap-2"
					>
						<RefreshCw className="w-4 h-4" />
						{config.actionText}
					</Button>
				)}
				
				{onBack && (
					<Button 
						variant="outline" 
						onClick={onBack}
						className="rounded-2xl px-6 py-3 flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						이전으로
					</Button>
				)}

				{!onRetry && !onBack && (
					<Button 
						onClick={() => window.location.reload()}
						className="gradient-button text-white rounded-2xl px-6 py-3 flex items-center gap-2"
					>
						<RefreshCw className="w-4 h-4" />
						새로고침
					</Button>
				)}
			</div>

			{/* 추가 안내 */}
			{type === "quota" && (
				<div className="mt-4 p-4 bg-muted/50 rounded-2xl max-w-md">
					<p className="text-sm text-muted-foreground">
						💡 <strong>팁:</strong> AI 해석 서비스가 일시적으로 제한되어도 기본 사주 해석은 계속 이용하실 수 있습니다.
					</p>
				</div>
			)}
			
			{type === "network" && (
				<div className="mt-4 p-4 bg-muted/50 rounded-2xl max-w-md">
					<p className="text-sm text-muted-foreground">
						🔧 <strong>해결 방법:</strong> Wi-Fi 연결 상태를 확인하거나 모바일 데이터로 다시 시도해보세요.
					</p>
				</div>
			)}
		</div>
	);
}

/**
 * 인라인 에러 컴포넌트 (작은 공간용)
 */
export function InlineError({ 
	message, 
	onRetry, 
	type = "unknown" 
}: { 
	message: string; 
	onRetry?: () => void; 
	type?: keyof typeof errorConfig;
}) {
	const config = errorConfig[type];
	const Icon = config.icon;

	return (
		<div className="flex items-center justify-between p-4 bg-destructive/10 rounded-2xl border border-destructive/20">
			<div className="flex items-center gap-3">
				<Icon className={cn("w-5 h-5", config.color)} />
				<span className="text-sm text-foreground">{message}</span>
			</div>
			{onRetry && (
				<Button 
					size="sm" 
					variant="ghost" 
					onClick={onRetry}
					className="text-xs hover:bg-destructive/20"
				>
					<RefreshCw className="w-3 h-3 mr-1" />
					재시도
				</Button>
			)}
		</div>
	);
}

/**
 * AI 서비스 에러를 위한 특화된 컴포넌트
 */
export function AIServiceError({ 
	error,
	onRetry,
	onFallback 
}: { 
	error: string;
	onRetry?: () => void;
	onFallback?: () => void;
}) {
	// 에러 메시지 기반으로 타입 자동 감지
	const getErrorType = (errorMessage: string): keyof typeof errorConfig => {
		if (errorMessage.includes("quota") || errorMessage.includes("limit")) return "quota";
		if (errorMessage.includes("timeout") || errorMessage.includes("시간")) return "timeout";
		if (errorMessage.includes("network") || errorMessage.includes("연결")) return "network";
		if (errorMessage.includes("permission") || errorMessage.includes("권한")) return "permission";
		if (errorMessage.includes("validation") || errorMessage.includes("유효")) return "validation";
		if (errorMessage.includes("server") || errorMessage.includes("서버")) return "server";
		return "unknown";
	};

	const errorType = getErrorType(error.toLowerCase());

	return (
		<div className="space-y-4">
			<EnhancedError
				type={errorType}
				message={error}
				onRetry={onRetry}
				showIcon={true}
			/>
			
			{/* AI 서비스 전용 폴백 옵션 */}
			{onFallback && (
				<div className="flex justify-center">
					<Button 
						variant="ghost" 
						onClick={onFallback}
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						기본 해석으로 계속하기 →
					</Button>
				</div>
			)}
		</div>
	);
}
