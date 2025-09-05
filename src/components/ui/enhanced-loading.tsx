/**
 * 개-사주 향상된 로딩 컴포넌트
 * 단계별 로딩 메시지와 스켈레톤 UI
 */

'use client';

import * as React from "react";
import { Loader2, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface LoadingStep {
	id: string;
	message: string;
	duration?: number; // 밀리초
}

export interface EnhancedLoadingProps {
	steps?: LoadingStep[];
	currentStep?: string;
	progress?: number; // 0-100
	className?: string;
	showProgress?: boolean;
	showSteps?: boolean;
	variant?: 'default' | 'card' | 'minimal';
}

const DEFAULT_STEPS: LoadingStep[] = [
	{ id: 'parsing', message: '생년월일 정보를 분석하고 있습니다...', duration: 1000 },
	{ id: 'calculating', message: '사주팔자를 계산하고 있습니다...', duration: 2000 },
	{ id: 'elements', message: '오행의 균형을 분석하고 있습니다...', duration: 1500 },
	{ id: 'interpreting', message: '개인화된 해석을 생성하고 있습니다...', duration: 2000 },
	{ id: 'finalizing', message: '결과를 정리하고 있습니다...', duration: 500 }
];

export function EnhancedLoading({
	steps = DEFAULT_STEPS,
	currentStep,
	progress,
	className,
	showProgress = true,
	showSteps = true,
	variant = 'default'
}: EnhancedLoadingProps) {
	const [activeStepIndex, setActiveStepIndex] = React.useState(0);
	const [autoProgress, setAutoProgress] = React.useState(0);

	// 자동 진행 로직
	React.useEffect(() => {
		if (currentStep) {
			const stepIndex = steps.findIndex(step => step.id === currentStep);
			if (stepIndex !== -1) {
				setActiveStepIndex(stepIndex);
			}
		}
	}, [currentStep, steps]);

	// 자동 프로그레스 애니메이션
	React.useEffect(() => {
		if (progress === undefined) {
			const interval = setInterval(() => {
				setAutoProgress(prev => {
					const increment = Math.random() * 3 + 1;
					return Math.min(prev + increment, 100);
				});
			}, 200);

			return () => clearInterval(interval);
		}
	}, [progress]);

	const currentProgress = progress !== undefined ? progress : autoProgress;
	const activeStep = steps[activeStepIndex];

	const renderContent = () => (
		<>
			{/* 로딩 아이콘 */}
			<div className="flex justify-center mb-6">
				<div className="relative">
					<Loader2 className="w-12 h-12 animate-spin text-primary" />
					<div className="absolute inset-0 flex items-center justify-center">
						<Star className="w-4 h-4 text-accent animate-pulse" />
					</div>
				</div>
			</div>

			{/* 현재 단계 메시지 */}
			{showSteps && activeStep && (
				<div className="text-center mb-6">
					<h3 className="text-lg font-medium text-foreground mb-2">
						{activeStep.message}
					</h3>
					<div className="flex items-center justify-center gap-1">
						{steps.map((_, index) => (
							<div
								key={index}
								className={cn(
									"w-2 h-2 rounded-full transition-colors duration-300",
									index <= activeStepIndex ? "bg-primary" : "bg-muted"
								)}
							/>
						))}
					</div>
				</div>
			)}

			{/* 프로그레스 바 */}
			{showProgress && (
				<div className="space-y-2">
					<div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
							style={{ width: `${currentProgress}%` }}
						/>
					</div>
					<p className="text-sm text-muted-foreground text-center">
						{Math.round(currentProgress)}% 완료
					</p>
				</div>
			)}

			{/* 장식적 요소 */}
			<div className="flex justify-center mt-6">
				<div className="flex gap-1">
					{[...Array(3)].map((_, i) => (
						<Sparkles
							key={i}
							className={cn(
								"w-3 h-3 text-accent/60",
								"animate-pulse"
							)}
							style={{
								animationDelay: `${i * 0.2}s`,
								animationDuration: '1.5s'
							}}
						/>
					))}
				</div>
			</div>
		</>
	);

	if (variant === 'card') {
		return (
			<div className={cn("flex justify-center items-center min-h-[400px]", className)}>
				<Card className="w-full max-w-md">
					<CardContent className="p-8">
						{renderContent()}
					</CardContent>
				</Card>
			</div>
		);
	}

	if (variant === 'minimal') {
		return (
			<div className={cn("text-center space-y-4", className)}>
				<Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
				{activeStep && (
					<p className="text-sm text-muted-foreground">
						{activeStep.message}
					</p>
				)}
			</div>
		);
	}

	return (
		<div className={cn("text-center space-y-6 p-8", className)}>
			{renderContent()}
		</div>
	);
}

/**
 * 사주 결과 로딩용 스켈레톤 UI
 */
export function SajuResultSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("space-y-6", className)}>
			{/* 헤더 스켈레톤 */}
			<div className="text-center space-y-4">
				<div className="h-8 bg-muted rounded animate-pulse w-48 mx-auto" />
				<div className="flex justify-center gap-2">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
					))}
				</div>
				<div className="h-4 bg-muted rounded animate-pulse w-32 mx-auto" />
			</div>

			{/* 탭 네비게이션 스켈레톤 */}
			<div className="flex justify-center gap-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-10 w-24 bg-muted rounded animate-pulse" />
				))}
			</div>

			{/* 컨텐츠 스켈레톤 */}
			<div className="space-y-4">
				<Card>
					<CardContent className="p-6">
						<div className="space-y-3">
							<div className="h-6 bg-muted rounded animate-pulse w-32" />
							<div className="h-4 bg-muted rounded animate-pulse w-full" />
							<div className="h-4 bg-muted rounded animate-pulse w-3/4" />
							<div className="h-4 bg-muted rounded animate-pulse w-5/6" />
						</div>
					</CardContent>
				</Card>

				<div className="grid md:grid-cols-2 gap-4">
					{[...Array(2)].map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6">
								<div className="space-y-3">
									<div className="h-5 bg-muted rounded animate-pulse w-24" />
									<div className="space-y-2">
										{[...Array(3)].map((_, j) => (
											<div key={j} className="h-3 bg-muted rounded animate-pulse w-full" />
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * 단계별 로딩 관리 훅
 */
export function useStepLoading(steps: LoadingStep[] = DEFAULT_STEPS) {
	const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
	const [progress, setProgress] = React.useState(0);
	const [isComplete, setIsComplete] = React.useState(false);

	const nextStep = React.useCallback(() => {
		setCurrentStepIndex(prev => {
			const next = Math.min(prev + 1, steps.length - 1);
			setProgress((next / (steps.length - 1)) * 100);
			
			if (next >= steps.length - 1) {
				setTimeout(() => setIsComplete(true), 500);
			}
			
			return next;
		});
	}, [steps.length]);

	const reset = React.useCallback(() => {
		setCurrentStepIndex(0);
		setProgress(0);
		setIsComplete(false);
	}, []);

	const currentStep = steps[currentStepIndex];

	return {
		currentStep: currentStep?.id,
		currentStepMessage: currentStep?.message,
		currentStepIndex,
		progress,
		isComplete,
		nextStep,
		reset
	};
}
