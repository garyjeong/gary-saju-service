"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Brain, Heart, Lightbulb } from "lucide-react";

interface AILoadingProps {
	className?: string;
	message?: string;
	subMessage?: string;
	progress?: number; // 0-100
	stage?: "analyzing" | "enhancing" | "personalizing" | "finalizing";
}

const stageConfig = {
	analyzing: {
		icon: Brain,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		message: "사주 정보를 분석하고 있습니다",
		subMessage: "전통 사주 이론을 바탕으로 해석 중...",
	},
	enhancing: {
		icon: Sparkles,
		color: "text-primary",
		bgColor: "bg-primary/10",
		message: "AI 해석을 생성하고 있습니다",
		subMessage: "개인화된 문체로 변환 중...",
	},
	personalizing: {
		icon: Heart,
		color: "text-accent",
		bgColor: "bg-accent/10",
		message: "개인 특성을 반영하고 있습니다",
		subMessage: "연령대와 관심사를 고려 중...",
	},
	finalizing: {
		icon: Lightbulb,
		color: "text-green-500",
		bgColor: "bg-green-500/10",
		message: "최종 해석을 완성하고 있습니다",
		subMessage: "조금만 더 기다려주세요...",
	},
};

export default function AILoading({ 
	className, 
	message, 
	subMessage, 
	progress = 0, 
	stage = "enhancing" 
}: AILoadingProps) {
	const config = stageConfig[stage];
	const Icon = config.icon;

	return (
		<div className={cn(
			"flex flex-col items-center justify-center p-8 space-y-6",
			className
		)}>
			{/* 아이콘 애니메이션 */}
			<div className="relative">
				<div className={cn(
					"w-20 h-20 rounded-3xl flex items-center justify-center",
					config.bgColor,
					"animate-pulse"
				)}>
					<Icon className={cn(
						"w-10 h-10 animate-bounce",
						config.color
					)} />
				</div>
				
				{/* 회전하는 링 */}
				<div className="absolute inset-0 rounded-3xl border-4 border-transparent border-t-primary/30 animate-spin"></div>
				
				{/* 글로우 효과 */}
				<div className={cn(
					"absolute -inset-2 rounded-3xl blur-xl opacity-30 animate-pulse",
					config.bgColor
				)}></div>
			</div>

			{/* 진행률 바 */}
			{progress > 0 && (
				<div className="w-full max-w-xs">
					<div className="h-2 bg-muted rounded-full overflow-hidden">
						<div 
							className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
							style={{ width: `${Math.min(progress, 100)}%` }}
						></div>
					</div>
					<div className="text-xs text-muted-foreground text-center mt-2">
						{Math.round(progress)}% 완료
					</div>
				</div>
			)}

			{/* 메시지 */}
			<div className="text-center space-y-2 max-w-md">
				<h3 className="text-lg font-medium gradient-text">
					{message || config.message}
				</h3>
				<p className="text-sm text-muted-foreground">
					{subMessage || config.subMessage}
				</p>
			</div>

			{/* 떠다니는 파티클 */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{[...Array(6)].map((_, i) => (
					<Sparkles
						key={i}
						className={cn(
							"absolute w-4 h-4 text-accent/30 animate-float",
							i % 2 === 0 ? "animation-delay-100" : "animation-delay-300"
						)}
						style={{
							left: `${20 + (i * 15)}%`,
							top: `${30 + ((i % 3) * 20)}%`,
							animationDelay: `${i * 0.5}s`,
						}}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * AI 해석 단계별 로딩 컴포넌트
 */
export function AIStageLoading({ currentStage }: { currentStage: keyof typeof stageConfig }) {
	const stages: (keyof typeof stageConfig)[] = ["analyzing", "enhancing", "personalizing", "finalizing"];
	const currentIndex = stages.indexOf(currentStage);
	const progress = ((currentIndex + 1) / stages.length) * 100;

	return (
		<div className="space-y-8">
			<AILoading stage={currentStage} progress={progress} />
			
			{/* 단계 표시 */}
			<div className="flex justify-center">
				<div className="flex items-center gap-4">
					{stages.map((stage, index) => {
						const config = stageConfig[stage];
						const Icon = config.icon;
						const isActive = index === currentIndex;
						const isCompleted = index < currentIndex;

						return (
							<div key={stage} className="flex items-center gap-2">
								<div className={cn(
									"w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
									isCompleted 
										? "bg-green-500/20 text-green-500"
										: isActive 
											? config.bgColor + " " + config.color + " animate-pulse"
											: "bg-muted/50 text-muted-foreground"
								)}>
									<Icon className="w-4 h-4" />
								</div>
								{index < stages.length - 1 && (
									<div className={cn(
										"w-8 h-0.5 transition-colors duration-300",
										index < currentIndex ? "bg-green-500/50" : "bg-muted"
									)} />
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

/**
 * 컴팩트 AI 로딩 인디케이터 (인라인용)
 */
export function CompactAILoading({ message = "AI 분석 중..." }: { message?: string }) {
	return (
		<div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl backdrop-blur-sm">
			<div className="relative">
				<Brain className="w-4 h-4 text-primary animate-pulse" />
				<div className="absolute inset-0 animate-ping">
					<Brain className="w-4 h-4 text-primary opacity-30" />
				</div>
			</div>
			<span className="text-sm font-medium text-primary">
				{message}
			</span>
		</div>
	);
}
