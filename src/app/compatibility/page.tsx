"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageTransition from "@/components/ui/page-transition";
import CompatibilityInputForm from "@/components/compatibility/CompatibilityInputForm";
import CompatibilityResult from "@/components/compatibility/CompatibilityResult";
import { CompatibilityCalculator } from "@/lib/compatibility/compatibility-calculator";
import { CompatibilityInput, CompatibilityResult as CompatibilityResultType } from "@/lib/compatibility/types";
import { SajuCalculator } from "@/lib/saju/calculator";
import { 
	Heart, 
	Users, 
	Sparkles, 
	AlertCircle,
	ArrowLeft,
	Calculator,
	Clock,
	Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompatibilityPage() {
	const [currentView, setCurrentView] = useState<"input" | "result">("input");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [result, setResult] = useState<CompatibilityResultType | null>(null);
	const [error, setError] = useState<string | null>(null);

	// 📊 상성 분석 실행
	const handleAnalyze = async (data: any) => {
		setIsAnalyzing(true);
		setError(null);

		try {
			// 분석 시간을 시뮬레이션 (실제로는 복잡한 계산)
			await new Promise(resolve => setTimeout(resolve, 2000));

			// 폼 데이터를 CompatibilityInput 타입으로 변환
			const input: CompatibilityInput = {
				relationshipType: data.relationshipType,
				person1: {
					name: data.person1.name,
					birthDate: data.person1.birthDate,
					birthTime: data.person1.birthTime,
					gender: data.person1.gender
				},
				person2: {
					name: data.person2.name,
					birthDate: data.person2.birthDate,
					birthTime: data.person2.birthTime,
					gender: data.person2.gender
				}
			};

			const calculator = new CompatibilityCalculator();
			const analysisResult = await calculator.analyzeCompatibility(input);

			setResult(analysisResult);
			setCurrentView("result");
		} catch (err) {
			console.error("상성 분석 중 오류:", err);
			setError("상성 분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
		} finally {
			setIsAnalyzing(false);
		}
	};

	// 🔄 새로운 분석 시작
	const handleNewAnalysis = () => {
		setCurrentView("input");
		setResult(null);
		setError(null);
	};

	return (
		<PageTransition variant="mystical" className="min-h-screen bg-gradient-to-br from-background via-background to-saju-cosmic-nebula/5">
			<div className="container mx-auto px-4 py-8">
				{/* 🌟 헤더 */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<div className="flex items-center justify-center gap-4 mb-6">
						<motion.div
							className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
							whileHover={{ scale: 1.05, rotate: 5 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
						>
							<Heart className="w-8 h-8 text-primary" />
						</motion.div>
						<div className="text-left">
							<h1 className="text-4xl font-serif font-bold gradient-text">
								사주 궁합 분석
							</h1>
							<p className="text-lg text-muted-foreground mt-2">
								두 사람의 사주를 통해 상성을 분석합니다
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Users className="w-4 h-4" />
							<span>두 사람 사주 비교</span>
						</div>
						<div className="flex items-center gap-2">
							<Calculator className="w-4 h-4" />
							<span>오행 상생상극 분석</span>
						</div>
						<div className="flex items-center gap-2">
							<Sparkles className="w-4 h-4" />
							<span>관계별 맞춤 해석</span>
						</div>
					</div>
				</motion.div>

				{/* 🚨 에러 메시지 */}
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="max-w-4xl mx-auto mb-8"
						>
							<Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription className="font-medium">
									{error}
								</AlertDescription>
							</Alert>
						</motion.div>
					)}
				</AnimatePresence>

				{/* 📈 분석 진행 중 */}
				<AnimatePresence>
					{isAnalyzing && (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
						>
							<Card className="hanji-card border-none shadow-2xl max-w-md w-full mx-4">
								<CardContent className="p-8 text-center">
									<motion.div
										className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
										animate={{ rotate: 360 }}
										transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
									>
										<Sparkles className="w-8 h-8 text-primary" />
									</motion.div>
									
									<h3 className="text-xl font-serif font-semibold mb-3">
										상성 분석 중...
									</h3>
									
									<div className="space-y-3 text-sm text-muted-foreground">
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.5 }}
											className="flex items-center justify-center gap-2"
										>
											<Clock className="w-4 h-4" />
											<span>사주팔자 계산 중</span>
										</motion.div>
										
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 1.0 }}
											className="flex items-center justify-center gap-2"
										>
											<Calculator className="w-4 h-4" />
											<span>오행 상생상극 분석 중</span>
										</motion.div>
										
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 1.5 }}
											className="flex items-center justify-center gap-2"
										>
											<Sparkles className="w-4 h-4" />
											<span>종합 해석 생성 중</span>
										</motion.div>
									</div>
									
									<div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
										<Loader2 className="w-3 h-3 animate-spin" />
										<span>잠시만 기다려 주세요...</span>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>

				{/* 📝 메인 컨텐츠 */}
				<div className="space-y-8">
					<AnimatePresence mode="wait">
						{currentView === "input" && (
							<motion.div
								key="input"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.4 }}
							>
								<CompatibilityInputForm
									onSubmit={handleAnalyze}
									isLoading={isAnalyzing}
								/>
							</motion.div>
						)}

						{currentView === "result" && result && (
							<motion.div
								key="result"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.4 }}
								className="space-y-6"
							>
								{/* 뒤로가기 버튼 */}
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									<Button
										variant="ghost"
										onClick={handleNewAnalysis}
										className="gap-2 text-muted-foreground hover:text-foreground"
									>
										<ArrowLeft className="w-4 h-4" />
										새로운 분석하기
									</Button>
								</motion.div>

								<CompatibilityResult
									result={result}
									onNewAnalysis={handleNewAnalysis}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* 📚 정보 섹션 */}
				{currentView === "input" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.6 }}
						className="mt-16 max-w-4xl mx-auto"
					>
						<Card className="hanji-card border-none shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-center">
									<Sparkles className="w-5 h-5 text-primary" />
									상성 분석이란?
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
									<div className="space-y-3">
										<div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
											<Users className="w-6 h-6 text-primary" />
										</div>
										<h3 className="font-serif font-semibold">사주 비교</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											두 사람의 사주팔자를 분석하여 
											타고난 성향과 기질을 비교합니다
										</p>
									</div>
									
									<div className="space-y-3">
										<div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
											<Calculator className="w-6 h-6 text-primary" />
										</div>
										<h3 className="font-serif font-semibold">오행 분석</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											목화토금수 오행의 상생상극 관계를 
											통해 조화로운 정도를 계산합니다
										</p>
									</div>
									
									<div className="space-y-3">
										<div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
											<Heart className="w-6 h-6 text-primary" />
										</div>
										<h3 className="font-serif font-semibold">관계별 해석</h3>
										<p className="text-sm text-muted-foreground leading-relaxed">
											연애, 결혼, 사업 등 관계 목적에 
											맞는 구체적인 조언을 제공합니다
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)}
			</div>
		</PageTransition>
	);
}
