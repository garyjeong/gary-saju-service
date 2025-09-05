"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileSelect } from "@/components/ui/mobile-select";
import { MobileTimePicker } from "@/components/ui/mobile-time-picker";
import { EnhancedLoading, useStepLoading } from "@/components/ui/enhanced-loading";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SajuInputSchema, SajuInputType } from "@/lib/saju/validation";
import { calculateSaju } from "@/lib/saju/calculator";
import { Calendar, Clock, ArrowRight, User, Loader2, Smartphone, AlertCircle, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InputPage() {
	const router = useRouter();
	const [isCalculating, setIsCalculating] = useState(false);
	const [calculationError, setCalculationError] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	
	// 단계별 로딩 관리
	const { currentStep, progress, nextStep, reset: resetLoading } = useStepLoading();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
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

	// 모바일 환경 감지
	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
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
			nextStep(); // 1단계: 정보 분석
			await new Promise(resolve => setTimeout(resolve, 800));
			
			nextStep(); // 2단계: 사주팔자 계산
			await new Promise(resolve => setTimeout(resolve, 1200));
			
			// 실제 사주 계산 수행
			const result = calculateSaju({
				name: data.name,
				birthDate: data.birthDate,
				birthTime: data.birthTime,
				gender: data.gender,
			});
			
			nextStep(); // 3단계: 오행 분석
			await new Promise(resolve => setTimeout(resolve, 800));
			
			nextStep(); // 4단계: 해석 생성
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// 결과를 세션 스토리지에 저장
			sessionStorage.setItem("sajuResult", JSON.stringify(result));
			sessionStorage.setItem("sajuInput", JSON.stringify(data));
			
			nextStep(); // 5단계: 완료
			await new Promise(resolve => setTimeout(resolve, 300));
			
			// 결과 페이지로 이동
			router.push("/result");
		} catch (error) {
			console.error("사주 계산 오류:", error);
			setCalculationError(
				error instanceof Error 
					? error.message 
					: "사주 계산 중 오류가 발생했습니다. 다시 시도해주세요."
			);
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
				<Header />
				<div className="container mx-auto px-4 py-8">
					<EnhancedLoading
						currentStep={currentStep}
						progress={progress}
						variant="card"
						className="max-w-2xl mx-auto"
					/>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />

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

					{/* 입력 폼 */}
					<Card className="glass-card shadow-2xl border-none relative overflow-hidden">
						{/* Background Gradient */}
						<div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3"></div>
						
						<CardHeader className="pb-6 relative z-10">
							<CardTitle className="flex items-center gap-4 text-xl">
								<div className="relative group">
									<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<User className="w-6 h-6 text-primary" />
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
								<div className="space-y-1">
									<div className="font-serif gradient-text">기본 정보</div>
									<div className="text-sm text-muted-foreground font-normal">AI 분석을 위한 필수 정보입니다</div>
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

							{/* 이름 */}
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
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
								<Label className="text-sm font-medium">성별 *</Label>
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

							{/* 제출 버튼 */}
							<div className="pt-8">
								<div className="relative group">
									<Button
										type="submit"
										size="lg"
										className={cn(
											"w-full gap-3 py-6 text-xl rounded-2xl font-medium transition-all duration-300",
											isCalculating 
												? "bg-muted text-muted-foreground cursor-not-allowed" 
												: "gradient-button text-white shadow-xl group-hover:shadow-2xl group-hover:scale-[1.02]"
										)}
										disabled={isCalculating}
									>
										{isCalculating ? (
											<>
												<Loader2 className="w-6 h-6 animate-spin" />
												AI가 사주를 분석하고 있습니다...
											</>
										) : (
											<>
												<Brain className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
												AI 사주 풀이 시작하기
												<ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
											</>
										)}
									</Button>
									{!isCalculating && (
										<div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/40 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									)}
								</div>
							</div>
						</form>
						</CardContent>
					</Card>

					{/* 안내 사항 - Enhanced */}
					<Card className="mt-12 glass-card border-none relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5"></div>
						<CardContent className="p-8 relative z-10">
							<h3 className="font-serif font-medium text-foreground mb-6 flex items-center gap-3">
								<div className="relative group">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<AlertCircle className="w-5 h-5 text-accent" />
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
								<div className="space-y-1">
									<div className="text-lg">입력 시 참고사항</div>
									<div className="text-sm text-muted-foreground font-normal">정확한 분석을 위한 가이드입니다</div>
								</div>
							</h3>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 group hover:bg-primary/10 transition-colors duration-300">
									<div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
									<span className="text-sm text-muted-foreground leading-relaxed">
										생년월일은 <strong className="text-foreground">양력 기준</strong>으로 입력해 주세요
									</span>
								</div>
								<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 group hover:bg-accent/10 transition-colors duration-300">
									<div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent to-accent/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
									<span className="text-sm text-muted-foreground leading-relaxed">
										출생 시간이 정확할수록 더 <strong className="text-foreground">정밀한 AI 분석</strong>이 가능합니다
									</span>
								</div>
								<div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 group hover:bg-primary/10 transition-colors duration-300">
									<div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
									<span className="text-sm text-muted-foreground leading-relaxed">
										입력한 정보는 <strong className="text-foreground">저장되지 않으며</strong>, 세션에서만 사용됩니다
									</span>
								</div>
								<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 group hover:bg-accent/10 transition-colors duration-300">
									<div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent to-accent/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
									<span className="text-sm text-muted-foreground leading-relaxed">
										모든 AI 개인화 서비스는 <strong className="text-foreground">완전 무료</strong>로 제공됩니다
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 네비게이션 - Enhanced */}
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
						<Button asChild variant="outline" size="lg" className="modern-card px-6 py-3 rounded-xl group">
							<Link href="/" className="flex items-center gap-2">
								<ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform duration-300" />
								홈으로 돌아가기
							</Link>
						</Button>
						<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group hover:bg-accent/10">
							<Link href="/result" className="flex items-center gap-2">
								결과 예시 보기
								<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
							</Link>
						</Button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
