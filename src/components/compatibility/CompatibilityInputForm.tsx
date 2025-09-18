"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileSelect } from "@/components/ui/mobile-select";
import { MobileTimePicker } from "@/components/ui/mobile-time-picker";
import { Badge } from "@/components/ui/badge";
import { SajuInputSchema } from "@/lib/saju/validation";
import { RelationshipType } from "@/lib/compatibility/types";
import { 
	Users, 
	Heart, 
	Circle, 
	Briefcase, 
	UserPlus,
	ArrowRight,
	ArrowLeft,
	Check,
	Calendar,
	Clock,
	User
} from "lucide-react";
import { cn } from "@/lib/utils";

// 📝 폼 스키마
const CompatibilityInputSchema = z.object({
	relationshipType: z.enum(["romance", "marriage", "business", "friendship"]),
	person1: SajuInputSchema,
	person2: SajuInputSchema
});

type CompatibilityInputType = z.infer<typeof CompatibilityInputSchema>;

// 🎭 관계 타입 정보
const RELATIONSHIP_TYPES = {
	romance: {
		icon: Heart,
		label: "연애 궁합",
		description: "로맨틱한 관계의 상성을 분석합니다",
		color: "text-pink-500",
		bgColor: "bg-pink-50 dark:bg-pink-950/20"
	},
	marriage: {
		icon: Circle,
		label: "결혼 궁합",
		description: "평생 함께할 부부 관계의 상성을 분석합니다",
		color: "text-purple-500",
		bgColor: "bg-purple-50 dark:bg-purple-950/20"
	},
	business: {
		icon: Briefcase,
		label: "사업 파트너",
		description: "비즈니스 관계의 상성을 분석합니다",
		color: "text-blue-500",
		bgColor: "bg-blue-50 dark:bg-blue-950/20"
	},
	friendship: {
		icon: UserPlus,
		label: "우정",
		description: "친구 관계의 상성을 분석합니다",
		color: "text-green-500",
		bgColor: "bg-green-50 dark:bg-green-950/20"
	}
} as const;

// 📋 단계 정의
const STEPS = [
	{ id: 1, title: "관계 타입", description: "어떤 관계인지 선택해주세요", icon: Users },
	{ id: 2, title: "첫 번째 사람", description: "첫 번째 사람의 정보를 입력해주세요", icon: User },
	{ id: 3, title: "두 번째 사람", description: "두 번째 사람의 정보를 입력해주세요", icon: User },
	{ id: 4, title: "확인", description: "정보를 확인하고 분석을 시작해주세요", icon: Check }
] as const;

interface CompatibilityInputFormProps {
	onSubmit: (data: CompatibilityInputType) => void;
	isLoading?: boolean;
	className?: string;
}

export default function CompatibilityInputForm({
	onSubmit,
	isLoading = false,
	className
}: CompatibilityInputFormProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [isMobile, setIsMobile] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		getValues,
		formState: { errors }
	} = useForm<CompatibilityInputType>({
		resolver: zodResolver(CompatibilityInputSchema),
		defaultValues: {
			relationshipType: "romance",
			person1: {
				name: "",
				birthDate: "",
				birthTime: "",
				gender: undefined
			},
			person2: {
				name: "",
				birthDate: "",
				birthTime: "",
				gender: undefined
			}
		}
	});

	const watchedValues = watch();
	const currentStepData = STEPS.find(step => step.id === currentStep)!;

	// 모바일 환경 감지
	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// 🚀 네비게이션 함수
	const goToNextStep = () => {
		if (currentStep < STEPS.length) {
			setCurrentStep(prev => prev + 1);
		}
	};

	const goToPrevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const isFirstStep = currentStep === 1;
	const isLastStep = currentStep === STEPS.length;

	// ✅ 단계별 검증
	const validateCurrentStep = (): boolean => {
		const values = getValues();
		
		switch (currentStep) {
			case 1:
				return !!values.relationshipType;
			case 2:
				return !!(values.person1.name && values.person1.birthDate && values.person1.birthTime && values.person1.gender);
			case 3:
				return !!(values.person2.name && values.person2.birthDate && values.person2.birthTime && values.person2.gender);
			case 4:
				return true;
			default:
				return false;
		}
	};

	// 🎯 다음 버튼 핸들러
	const handleNext = () => {
		if (!validateCurrentStep()) {
			return;
		}

		if (isLastStep) {
			handleSubmit(onSubmit)();
		} else {
			goToNextStep();
		}
	};

	// 🎨 성별 옵션
	const genderOptions = [
		{ value: 'male', label: '남성' },
		{ value: 'female', label: '여성' }
	];

	return (
		<div className={cn("max-w-4xl mx-auto", className)}>
			{/* 🌟 단계 표시기 */}
			<div className="mb-12">
				<div className="flex items-center justify-between mb-6">
					{STEPS.map((step, index) => {
						const isActive = step.id === currentStep;
						const isCompleted = step.id < currentStep;
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
								{index < STEPS.length - 1 && (
									<div className={cn(
										"flex-1 h-0.5 mx-4 transition-colors duration-300",
										step.id < currentStep ? "bg-saju-traditional-gold" : "bg-muted"
									)} />
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* 🃏 메인 카드 */}
			<Card className="hanji-card shadow-2xl border-none relative overflow-hidden min-h-[600px]">
				{/* 배경 효과 */}
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
								key={currentStep}
							>
								{currentStepData.title}
							</motion.div>
							<motion.div 
								className="text-sm text-muted-foreground font-normal"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.1 }}
								key={`desc-${currentStep}`}
							>
								{currentStepData.description}
							</motion.div>
						</div>
					</CardTitle>
				</CardHeader>

				<CardContent className="relative z-10">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						{/* 🌟 단계별 컨텐츠 */}
						<AnimatePresence mode="wait">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.3 }}
								className="space-y-6"
							>
								{/* 1단계: 관계 타입 선택 */}
								{currentStep === 1 && (
									<div className="space-y-6">
										<div className="text-center mb-8">
											<h3 className="text-lg font-serif font-semibold mb-2">어떤 관계의 상성을 알아보고 싶으신가요?</h3>
											<p className="text-muted-foreground">관계 타입에 따라 분석 방식이 달라집니다</p>
										</div>
										
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{Object.entries(RELATIONSHIP_TYPES).map(([type, info]) => {
												const Icon = info.icon;
												const isSelected = watchedValues.relationshipType === type;
												
												return (
													<motion.div
														key={type}
														className={cn(
															"p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300",
															isSelected 
																? "border-primary bg-primary/5 shadow-lg" 
																: "border-border hover:border-primary/50 hover:bg-primary/5",
															info.bgColor
														)}
														onClick={() => setValue("relationshipType", type as RelationshipType)}
														whileHover={{ scale: 1.02 }}
														whileTap={{ scale: 0.98 }}
													>
														<div className="flex items-center gap-4">
															<div className={cn(
																"w-12 h-12 rounded-2xl flex items-center justify-center",
																isSelected ? "bg-primary/20" : "bg-background/50"
															)}>
																<Icon className={cn("w-6 h-6", info.color)} />
															</div>
															<div className="flex-1">
																<h4 className="font-serif font-semibold text-lg">{info.label}</h4>
																<p className="text-sm text-muted-foreground">{info.description}</p>
															</div>
															{isSelected && (
																<motion.div
																	initial={{ scale: 0 }}
																	animate={{ scale: 1 }}
																	className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
																>
																	<Check className="w-4 h-4 text-primary-foreground" />
																</motion.div>
															)}
														</div>
													</motion.div>
												);
											})}
										</div>
									</div>
								)}

								{/* 2단계: 첫 번째 사람 정보 */}
								{currentStep === 2 && (
									<PersonInfoForm
										personKey="person1"
										title="첫 번째 사람"
										register={register}
										setValue={setValue}
										watch={watch}
										errors={errors}
										genderOptions={genderOptions}
										isMobile={isMobile}
										isLoading={isLoading}
									/>
								)}

								{/* 3단계: 두 번째 사람 정보 */}
								{currentStep === 3 && (
									<PersonInfoForm
										personKey="person2"
										title="두 번째 사람"
										register={register}
										setValue={setValue}
										watch={watch}
										errors={errors}
										genderOptions={genderOptions}
										isMobile={isMobile}
										isLoading={isLoading}
									/>
								)}

								{/* 4단계: 최종 확인 */}
								{currentStep === 4 && (
									<div className="space-y-6">
										<div className="text-center mb-8">
											<h3 className="text-lg font-serif font-semibold mb-2">입력하신 정보를 확인해주세요</h3>
											<p className="text-muted-foreground">정보가 정확해야 더 정확한 분석 결과를 받을 수 있습니다</p>
										</div>

										{/* 관계 타입 */}
										<div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl">
											<div className="flex items-center gap-3">
												{watchedValues.relationshipType && (
													<>
														{React.createElement(RELATIONSHIP_TYPES[watchedValues.relationshipType].icon, {
															className: cn("w-6 h-6", RELATIONSHIP_TYPES[watchedValues.relationshipType].color)
														})}
														<span className="font-serif font-semibold">
															{RELATIONSHIP_TYPES[watchedValues.relationshipType].label}
														</span>
													</>
												)}
											</div>
										</div>

										{/* 두 사람 정보 요약 */}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<PersonSummary person={watchedValues.person1} title="첫 번째 사람" />
											<PersonSummary person={watchedValues.person2} title="두 번째 사람" />
										</div>
									</div>
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
									disabled={isLoading}
								>
									<ArrowLeft className="w-5 h-5" />
									이전
								</Button>
							)}
							
							<Button
								type="button"
								size="lg"
								onClick={handleNext}
								disabled={isLoading || !validateCurrentStep()}
								className={cn(
									"gap-3 py-6 text-lg rounded-2xl font-medium transition-all duration-300",
									isFirstStep ? "flex-1" : "flex-[2]",
									"stamp-button text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]"
								)}
							>
								{isLastStep ? (
									<>
										<Heart className="w-6 h-6" />
										상성 분석 시작하기
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
	);
}

// 👤 개인 정보 입력 폼 컴포넌트
function PersonInfoForm({
	personKey,
	title,
	register,
	setValue,
	watch,
	errors,
	genderOptions,
	isMobile,
	isLoading
}: any) {
	const watchedBirthTime = watch(`${personKey}.birthTime`);
	const watchedGender = watch(`${personKey}.gender`);

	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<h3 className="text-lg font-serif font-semibold mb-2">{title}의 정보를 입력해주세요</h3>
				<p className="text-muted-foreground">정확한 출생 정보가 중요합니다</p>
			</div>

			{/* 이름 */}
			<div className="space-y-2">
				<Label htmlFor={`${personKey}.name`} className="text-sm font-medium flex items-center gap-2">
					<User className="w-4 h-4" />
					이름 *
				</Label>
				<Input
					id={`${personKey}.name`}
					type="text"
					placeholder="홍길동"
					{...register(`${personKey}.name`)}
					className={cn(
						"text-base",
						isMobile && "text-[16px]",
						errors[personKey]?.name && "border-destructive"
					)}
					disabled={isLoading}
					style={isMobile ? { fontSize: '16px' } : undefined}
					autoComplete="name"
				/>
				{errors[personKey]?.name && (
					<p className="text-sm text-destructive">{errors[personKey].name.message}</p>
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
					onValueChange={(value) => setValue(`${personKey}.gender`, value as "male" | "female")}
					disabled={isLoading}
					error={!!errors[personKey]?.gender}
				/>
				{errors[personKey]?.gender && (
					<p className="text-sm text-destructive">{errors[personKey].gender.message}</p>
				)}
			</div>

			{/* 생년월일 */}
			<div className="space-y-2">
				<Label htmlFor={`${personKey}.birthDate`} className="text-sm font-medium flex items-center gap-2">
					<Calendar className="w-4 h-4" />
					생년월일 *
				</Label>
				<Input
					id={`${personKey}.birthDate`}
					type="date"
					{...register(`${personKey}.birthDate`)}
					className={cn(
						"text-base",
						isMobile && "text-[16px]",
						errors[personKey]?.birthDate && "border-destructive"
					)}
					max={new Date().toISOString().split("T")[0]}
					disabled={isLoading}
					style={isMobile ? { fontSize: '16px' } : undefined}
				/>
				{errors[personKey]?.birthDate && (
					<p className="text-sm text-destructive">{errors[personKey].birthDate.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					양력 기준으로 입력해 주세요
				</p>
			</div>

			{/* 출생시간 */}
			<div className="space-y-2">
				<Label className="text-sm font-medium flex items-center gap-2">
					<Clock className="w-4 h-4" />
					출생 시간 *
				</Label>
				<MobileTimePicker
					value={watchedBirthTime}
					onValueChange={(value) => setValue(`${personKey}.birthTime`, value)}
					disabled={isLoading}
					placeholder="시간을 선택해 주세요"
				/>
				{errors[personKey]?.birthTime && (
					<p className="text-sm text-destructive">{errors[personKey].birthTime.message}</p>
				)}
				<p className="text-xs text-muted-foreground">
					{isMobile 
						? "터치하여 시간을 선택해 주세요"
						: "정확한 시간을 모르시면 가장 가까운 시간으로 선택해 주세요"
					}
				</p>
			</div>
		</div>
	);
}

// 📋 개인 정보 요약 컴포넌트
function PersonSummary({ person, title }: { person: any; title: string }) {
	return (
		<div className="p-4 bg-gradient-to-br from-background/50 to-background/80 rounded-2xl border border-border/50">
			<h4 className="font-serif font-semibold mb-3">{title}</h4>
			<div className="space-y-2">
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground">이름</span>
					<span className="font-medium">{person.name || "미입력"}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground">성별</span>
					<span className="font-medium">
						{person.gender === "male" ? "남성" : person.gender === "female" ? "여성" : "미선택"}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground">생년월일</span>
					<span className="font-medium">{person.birthDate || "미입력"}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-sm text-muted-foreground">출생시간</span>
					<span className="font-medium">{person.birthTime || "미입력"}</span>
				</div>
			</div>
		</div>
	);
}
