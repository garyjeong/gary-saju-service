"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileSelect } from "@/components/ui/mobile-select";
import { MobileTimePicker } from "@/components/ui/mobile-time-picker";
import { EnhancedLoading, useStepLoading } from "@/components/ui/enhanced-loading";
import PageTransition, { FadeInSection } from "@/components/ui/page-transition";
import { FloatingThemeToggle } from "@/components/ui/theme-toggle";
import { SajuInputSchema, SajuInputType } from "@/lib/saju/validation";
import { calculateSaju } from "@/lib/saju/calculator";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Loader2, Smartphone, AlertCircle, Brain, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackSajuEvent, PagePerformanceTracker } from "@/lib/analytics/vercel-analytics";

// 마법사 단계 정의
const WIZARD_STEPS = [
	{ id: 1, title: "기본 정보", description: "이름과 성별을 알려주세요", icon: User },
	{ id: 2, title: "생년월일", description: "언제 태어나셨나요?", icon: Calendar },
	{ id: 3, title: "출생시간", description: "몇 시에 태어나셨나요?", icon: Clock },
	{ id: 4, title: "확인", description: "정보를 확인해주세요", icon: Check },
] as const;

export default function InputPage() {
	const router = useRouter();
	const [wizardStep, setWizardStep] = useState(1);
	const [isCalculating, setIsCalculating] = useState(false);
	const [calculationError, setCalculationError] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	
	// 계산 과정 로딩 관리
	const { currentStep: loadingStep, progress, nextStep: nextLoadingStep, reset: resetLoading } = useStepLoading();
	
	// 마법사 네비게이션 함수
	const goToNextStep = () => {
		if (wizardStep < WIZARD_STEPS.length) {
			setWizardStep(prev => prev + 1);
		}
	};
	
	const goToPrevStep = () => {
		if (wizardStep > 1) {
			setWizardStep(prev => prev - 1);
		}
	};
	
	const isFirstStep = wizardStep === 1;
	const isLastStep = wizardStep === WIZARD_STEPS.length;
	const currentStepData = WIZARD_STEPS.find(step => step.id === wizardStep)!;

	// 단계별 다음 버튼 핸들러
	const handleNext = async () => {
		const formData = getValues();
		
		// 단계별 검증
		switch (wizardStep) {
			case 1:
				// 기본 정보 검증
				if (!formData.name || !formData.gender) {
					setCalculationError("이름과 성별을 입력해주세요.");
					return;
				}
				break;
			case 2:
				// 생년월일 검증
				if (!formData.birthDate) {
					setCalculationError("생년월일을 입력해주세요.");
					return;
				}
				break;
			case 3:
				// 출생시간 검증
				if (!formData.birthTime) {
					setCalculationError("출생시간을 입력해주세요.");
					return;
				}
				break;
		}
		
		setCalculationError(null);
		
		if (isLastStep) {
			// 마지막 단계에서는 실제 계산 수행
			await onSubmit(formData);
		} else {
			// 다음 단계로 이동
			goToNextStep();
		}
	};

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		getValues,
		formState: { errors },
	} = useForm<SajuInputType>({
		resolver: zodResolver(SajuInputSchema),
		defaultValues: {
			name: "",
			birthDate: "",
			birthTime: "",
			gender: undefined,
		},
	});

	const watchedGender = watch("gender");
	const watchedBirthTime = watch("birthTime");

	// 모바일 환경 감지 및 분석 추적
	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		// 사주 입력 페이지 방문 추적
		trackSajuEvent.inputStart();
		
		// 성능 측정 시작
		const performanceTracker = new PagePerformanceTracker('input');
		
		return () => {
			window.removeEventListener('resize', checkMobile);
			performanceTracker.complete();
		};
	}, []);

	const onSubmit = async (data: SajuInputType) => {
		setIsCalculating(true);
		setCalculationError(null);
		resetLoading();

		try {
			// 모든 필드가 입력되었는지 확인
			if (!data.name || !data.birthDate || !data.birthTime || !data.gender) {
				throw new Error("모든 필수 정보를 입력해주세요.");
			}

		// 단계별 계산 시뮬레이션
		nextLoadingStep(); // 1단계: 정보 분석
		await new Promise(resolve => setTimeout(resolve, 800));
		
		nextLoadingStep(); // 2단계: 사주팔자 계산
		await new Promise(resolve => setTimeout(resolve, 1200));
		
		// 실제 사주 계산 수행
		const result = calculateSaju({
			name: data.name,
			birthDate: data.birthDate,
			birthTime: data.birthTime,
			gender: data.gender,
		});
		
		nextLoadingStep(); // 3단계: 오행 분석
		await new Promise(resolve => setTimeout(resolve, 800));
		
		nextLoadingStep(); // 4단계: 해석 생성
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		// 결과를 세션 스토리지에 저장
		sessionStorage.setItem("sajuResult", JSON.stringify(result));
		sessionStorage.setItem("sajuInput", JSON.stringify(data));
		
		// 사주 계산 완료 추적
		trackSajuEvent.calculationComplete({
			birthYear: new Date(data.birthDate).getFullYear(),
			gender: data.gender,
			hasTime: !!data.birthTime,
		});
		
		nextLoadingStep(); // 5단계: 완료
		await new Promise(resolve => setTimeout(resolve, 300));
		
		// 결과 페이지로 이동
		router.push("/result");
		} catch (error) {
			console.error("사주 계산 오류:", error);
			const errorMessage = error instanceof Error 
				? error.message 
				: "사주 계산 중 오류가 발생했습니다. 다시 시도해주세요.";
			
			setCalculationError(errorMessage);
			
			// 에러 추적
			trackSajuEvent.error('calculation', errorMessage);
		} finally {
			setIsCalculating(false);
		}
	};

	// 성별 옵션
	const genderOptions = [
		{ value: 'male', label: '남성' },
		{ value: 'female', label: '여성' }
	];

	// 로딩 상태일 때 로딩 화면 렌더링
	if (isCalculating) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<EnhancedLoading
						currentStep={loadingStep}
						progress={progress}
						variant="card"
						className="max-w-2xl mx-auto"
					/>
				</div>
			</div>
		);
	}

	return (
		<PageTransition variant="mystical">
			<div className="min-h-screen bg-background">
				{/* 🌙 테마 토글 버튼 */}
				<FloatingThemeToggle />

				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto">
					{/* 페이지 헤더 - Enhanced */}
					<div className="text-center space-y-6 mb-12">
						<div className="relative">
							<div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl backdrop-blur-sm">
								{isMobile && <Smartphone className="w-5 h-5 text-primary" />}
								<Brain className="w-6 h-6 text-primary" />
								<h1 className="text-3xl font-serif font-bold gradient-text">
									AI 사주 분석 시작
								</h1>
							</div>
							<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-30"></div>
						</div>
						<div className="space-y-3">
							<p className="text-xl text-muted-foreground">
								나만의 운명을 AI가 개인화하여 해석해 드립니다
							</p>
							<p className="text-lg text-foreground font-medium">
								정확한 생년월일과 시간을 입력해 주세요
							</p>
						</div>
						{isMobile && (
							<div className="flex items-center justify-center gap-2 text-sm text-accent bg-accent/10 px-4 py-2 rounded-full">
								<AlertCircle className="w-4 h-4" />
								<span>모바일 최적화 화면</span>
							</div>
						)}
					</div>

					{/* 🌟 마법사 Progress Bar */}
					<div className="mb-12">
						<div className="flex items-center justify-between mb-6">
							{WIZARD_STEPS.map((step, index) => {
								const isActive = step.id === wizardStep;
								const isCompleted = step.id < wizardStep;
								const StepIcon = step.icon;
								
								return (
									<div key={step.id} className="flex items-center">
										<div className="flex flex-col items-center">
											<motion.div
												className={cn(
													"w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
													isCompleted
														? "bg-saju-traditional-gold border-saju-traditional-gold text-saju-traditional-black"
														: isActive
														? "bg-primary border-primary text-primary-foreground animate-mystic-glow"
														: "bg-background border-muted text-muted-foreground"
												)}
												whileHover={{ scale: 1.05 }}
												animate={isActive ? { scale: [1, 1.05, 1] } : {}}
												transition={{ duration: 2, repeat: Infinity }}
											>
												{isCompleted ? (
													<Check className="w-5 h-5" />
												) : (
													<StepIcon className="w-5 h-5" />
												)}
											</motion.div>
											<div className="mt-2 text-center">
												<div className={cn(
													"text-xs font-medium",
													isActive ? "text-primary" : isCompleted ? "text-saju-traditional-gold" : "text-muted-foreground"
												)}>
													{step.title}
												</div>
											</div>
										</div>
										{index < WIZARD_STEPS.length - 1 && (
											<div className={cn(
												"flex-1 h-0.5 mx-4 transition-colors duration-300",
												step.id < wizardStep ? "bg-saju-traditional-gold" : "bg-muted"
											)} />
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* 🌟 마법사 카드 */}
					<Card className="hanji-card shadow-2xl border-none relative overflow-hidden min-h-[500px]">
						{/* Background Gradient */}
						<div className="absolute inset-0 bg-gradient-to-br from-saju-cosmic-nebula/10 via-background to-saju-cosmic-starlight/10"></div>
						
						<CardHeader className="pb-6 relative z-10">
							<CardTitle className="flex items-center gap-4 text-xl">
								<motion.div 
									className="relative group"
									whileHover={{ scale: 1.1 }}
									transition={{ type: "spring", stiffness: 400, damping: 17 }}
								>
									<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
										<currentStepData.icon className="w-6 h-6 text-primary" />
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</motion.div>
								<div className="space-y-1">
									<motion.div 
										className="font-serif gradient-text"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										key={wizardStep}
									>
										{currentStepData.title}
									</motion.div>
									<motion.div 
										className="text-sm text-muted-foreground font-normal"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.1 }}
										key={`desc-${wizardStep}`}
									>
										{currentStepData.description}
									</motion.div>
								</div>
							</CardTitle>
						</CardHeader>
						<CardContent className="relative z-10">
													<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* 에러 메시지 */}
							{calculationError && (
								<div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
									{calculationError}
								</div>
							)}

							{/* 🌟 단계별 컨텐츠 */}
							<AnimatePresence mode="wait">
								<motion.div
									key={wizardStep}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.3 }}
									className="space-y-6"
								>
									{wizardStep === 1 && (
										<>
											{/* 이름 */}
											<div className="space-y-2">
												<Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
													<User className="w-4 h-4" />
													이름 *
												</Label>
								<Input
									id="name"
									type="text"
									placeholder="홍길동"
									{...register("name")}
									className={cn(
										"text-base",
										isMobile && "text-[16px]", // iOS zoom 방지
										errors.name && "border-destructive"
									)}
									disabled={isCalculating}
									style={isMobile ? { fontSize: '16px' } : undefined}
									autoComplete="name"
								/>
								{errors.name && (
									<p className="text-sm text-destructive">{errors.name.message}</p>
								)}
							</div>

											{/* 성별 */}
											<div className="space-y-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<User className="w-4 h-4" />
													성별 *
												</Label>
								<MobileSelect
									value={watchedGender}
									placeholder="성별을 선택해 주세요"
									options={genderOptions}
									onValueChange={(value) => setValue("gender", value as "male" | "female")}
									disabled={isCalculating}
									error={!!errors.gender}
								/>
								{errors.gender && (
									<p className="text-sm text-destructive">{errors.gender.message}</p>
								)}
							</div>

										</>
									)}

									{wizardStep === 2 && (
										<>
											{/* 생년월일 */}
											<div className="space-y-2">
												<Label htmlFor="birthDate" className="text-sm font-medium flex items-center gap-2">
													<Calendar className="w-4 h-4" />
													생년월일 *
												</Label>
								<Input
									id="birthDate"
									type="date"
									{...register("birthDate")}
									className={cn(
										"text-base",
										isMobile && "text-[16px]", // iOS zoom 방지
										errors.birthDate && "border-destructive"
									)}
									max={new Date().toISOString().split("T")[0]}
									disabled={isCalculating}
									style={isMobile ? { fontSize: '16px' } : undefined}
								/>
								{errors.birthDate && (
									<p className="text-sm text-destructive">{errors.birthDate.message}</p>
								)}
								<p className="text-xs text-muted-foreground">
									양력 기준으로 입력해 주세요
								</p>
							</div>

										</>
									)}

									{wizardStep === 3 && (
										<>
											{/* 출생시간 */}
											<div className="space-y-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Clock className="w-4 h-4" />
													출생 시간 *
												</Label>
								<MobileTimePicker
									value={watchedBirthTime}
									onValueChange={(value) => setValue("birthTime", value)}
									disabled={isCalculating}
									placeholder="시간을 선택해 주세요"
								/>
								{errors.birthTime && (
									<p className="text-sm text-destructive">{errors.birthTime.message}</p>
								)}
								<p className="text-xs text-muted-foreground">
									{isMobile 
										? "터치하여 시간을 선택해 주세요"
										: "정확한 시간을 모르시면 가장 가까운 시간으로 선택해 주세요"
									}
								</p>
							</div>

										</>
									)}

									{wizardStep === 4 && (
										<>
											{/* 최종 확인 */}
											<div className="space-y-4 p-6 bg-gradient-to-br from-saju-cosmic-starlight/10 to-saju-cosmic-purple/10 rounded-2xl">
												<h3 className="font-serif text-lg font-semibold text-center mb-4">입력 정보 확인</h3>
												
												<div className="grid gap-4">
													<div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
														<span className="text-sm text-muted-foreground">이름</span>
														<span className="font-medium">{watch("name") || "미입력"}</span>
													</div>
													<div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
														<span className="text-sm text-muted-foreground">성별</span>
														<span className="font-medium">
															{watch("gender") === "male" ? "남성" : watch("gender") === "female" ? "여성" : "미선택"}
														</span>
													</div>
													<div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
														<span className="text-sm text-muted-foreground">생년월일</span>
														<span className="font-medium">{watch("birthDate") || "미입력"}</span>
													</div>
													<div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
														<span className="text-sm text-muted-foreground">출생시간</span>
														<span className="font-medium">{watch("birthTime") || "미입력"}</span>
													</div>
												</div>
											</div>
										</>
									)}
								</motion.div>
							</AnimatePresence>

							{/* 🌟 네비게이션 버튼 */}
							<div className="pt-8 flex gap-4">
								{!isFirstStep && (
									<Button
										type="button"
										variant="outline"
										size="lg"
										onClick={goToPrevStep}
										className="flex-1 gap-2 py-6 text-lg rounded-2xl"
										disabled={isCalculating}
									>
										<ArrowLeft className="w-5 h-5" />
										이전
									</Button>
								)}
								
								<Button
									type="button"
									size="lg"
									onClick={handleNext}
									className={cn(
										"gap-3 py-6 text-lg rounded-2xl font-medium transition-all duration-300",
										isFirstStep ? "flex-1" : "flex-[2]",
										isCalculating 
											? "bg-muted text-muted-foreground cursor-not-allowed" 
											: "stamp-button text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]"
									)}
									disabled={isCalculating}
								>
									{isCalculating ? (
										<>
											<Loader2 className="w-6 h-6 animate-spin" />
											AI가 사주를 분석하고 있습니다...
										</>
									) : isLastStep ? (
										<>
											<Brain className="w-6 h-6" />
											사주 분석 시작하기
											<Star className="w-6 h-6" />
										</>
									) : (
										<>
											다음
											<ArrowRight className="w-6 h-6" />
										</>
									)}
								</Button>
							</div>
						</form>
						</CardContent>
					</Card>


				</div>
				</div>
			</div>
		</PageTransition>
	);
}
