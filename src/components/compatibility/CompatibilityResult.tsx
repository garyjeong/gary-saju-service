"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CompatibilityResult as CompatibilityResultType } from "@/lib/compatibility/types";
import { 
	Heart, 
	Users, 
	Star, 
	Shield, 
	Lightbulb,
	TrendingUp,
	AlertTriangle,
	Sparkles,
	Scale,
	ChevronRight,
	Download,
	Share2,
	RefreshCw,
	Eye,
	EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

// 🎨 오행 색상 매핑
const ELEMENT_COLORS = {
	wood: "text-green-600 bg-green-50 dark:bg-green-950/20",
	fire: "text-red-600 bg-red-50 dark:bg-red-950/20",
	earth: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20",
	metal: "text-gray-600 bg-gray-50 dark:bg-gray-950/20",
	water: "text-blue-600 bg-blue-50 dark:bg-blue-950/20"
} as const;

const ELEMENT_NAMES = {
	wood: "목(木)",
	fire: "화(火)",
	earth: "토(土)",
	metal: "금(金)",
	water: "수(水)"
} as const;

// 🎯 점수별 등급
const getScoreGrade = (score: number) => {
	if (score >= 90) return { grade: "매우 좋음", color: "text-green-600", icon: "🌟" };
	if (score >= 80) return { grade: "좋음", color: "text-blue-600", icon: "⭐" };
	if (score >= 70) return { grade: "보통", color: "text-yellow-600", icon: "✨" };
	if (score >= 60) return { grade: "주의", color: "text-orange-600", icon: "⚠️" };
	return { grade: "노력 필요", color: "text-red-600", icon: "💪" };
};

interface CompatibilityResultProps {
	result: CompatibilityResultType;
	onNewAnalysis: () => void;
	className?: string;
}

export default function CompatibilityResult({
	result,
	onNewAnalysis,
	className
}: CompatibilityResultProps) {
	const [selectedTab, setSelectedTab] = useState("overview");
	const [showDetailedElements, setShowDetailedElements] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const overallGrade = getScoreGrade(result.score.overall);

	// 🔄 새로고침 효과
	const handleRefresh = () => {
		setIsRefreshing(true);
		setTimeout(() => {
			setIsRefreshing(false);
			onNewAnalysis();
		}, 1000);
	};

	// 📊 진행률 애니메이션
	const progressVariants = {
		hidden: { width: 0 },
		visible: (value: number) => ({
			width: `${value}%`,
			transition: { duration: 1.5, ease: "easeOut", delay: 0.5 }
		})
	};

	return (
		<div className={cn("max-w-6xl mx-auto space-y-8", className)}>
			{/* 🌟 전체 점수 헤더 */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<Card className="hanji-card border-none shadow-2xl relative overflow-hidden">
					{/* 배경 효과 */}
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-saju-traditional-gold/20 to-transparent rounded-bl-full"></div>
					
					<CardHeader className="pb-6 relative z-10">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<motion.div
									className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
									whileHover={{ scale: 1.05, rotate: 5 }}
									transition={{ type: "spring", stiffness: 400, damping: 17 }}
								>
									<Heart className="w-8 h-8 text-primary" />
								</motion.div>
								<div>
									<h1 className="text-2xl font-serif font-bold gradient-text">
										{result.input.person1.name} ♡ {result.input.person2.name}
									</h1>
									<p className="text-muted-foreground">
										{result.input.relationshipType === "romance" && "연애 궁합"}
										{result.input.relationshipType === "marriage" && "결혼 궁합"}
										{result.input.relationshipType === "business" && "사업 파트너"}
										{result.input.relationshipType === "friendship" && "우정"}
									</p>
								</div>
							</div>
							
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="icon"
									onClick={handleRefresh}
									disabled={isRefreshing}
									className="rounded-xl"
								>
									<RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={onNewAnalysis}
									className="rounded-xl"
								>
									<Users className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</CardHeader>
					
					<CardContent className="relative z-10">
						{/* 전체 점수 */}
						<div className="text-center mb-6">
							<motion.div
								className="inline-flex items-center gap-3 p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
								initial={{ scale: 0.8, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
							>
								<span className="text-4xl">{overallGrade.icon}</span>
								<div>
									<div className="text-4xl font-bold gradient-text">
										{result.score.overall}점
									</div>
									<div className={cn("text-lg font-semibold", overallGrade.color)}>
										{overallGrade.grade}
									</div>
								</div>
							</motion.div>
						</div>

						{/* 핵심 요약 */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.6 }}
							className="p-6 bg-gradient-to-r from-background/80 to-background/60 rounded-2xl border border-border/50"
						>
							<h3 className="font-serif font-semibold text-lg mb-3 flex items-center gap-2">
								<Sparkles className="w-5 h-5 text-primary" />
								상성 한줄 요약
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{result.interpretation.summary}
							</p>
						</motion.div>
					</CardContent>
				</Card>
			</motion.div>

			{/* 📊 상세 분석 탭 */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8, duration: 0.6 }}
			>
				<Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-1">
						<TabsTrigger value="overview" className="rounded-xl font-medium">전체</TabsTrigger>
						<TabsTrigger value="elements" className="rounded-xl font-medium">오행</TabsTrigger>
						<TabsTrigger value="details" className="rounded-xl font-medium">상세</TabsTrigger>
						<TabsTrigger value="advice" className="rounded-xl font-medium">조언</TabsTrigger>
					</TabsList>

					{/* 전체 탭 */}
					<TabsContent value="overview" className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* 전체 점수 */}
							<ScoreCard
								title="전체 점수"
								score={result.score.overall}
								icon={Star}
								description="종합 상성 점수"
								delay={0}
							/>
							
							{/* 오행 조화 */}
							<ScoreCard
								title="오행 조화"
								score={result.score.fiveElementsHarmony}
								icon={Scale}
								description="다섯 원소의 균형"
								delay={0.1}
							/>
							
							{/* 음양 조화 */}
							<ScoreCard
								title="음양 조화"
								score={result.score.yinYang}
								icon={Users}
								description="음양의 균형"
								delay={0.2}
							/>
							
							{/* 특별 점수 */}
							<ScoreCard
								title="특별 점수"
								score={Math.max(...Object.values(result.score.elements))}
								icon={Sparkles}
								description="가장 강한 연결"
								delay={0.3}
							/>
						</div>

						{/* 두 사람 사주 비교 */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<PersonSajuCard
								person={result.input.person1}
								saju={result.person1Saju}
								title="첫 번째 사람"
							/>
							<PersonSajuCard
								person={result.input.person2}
								saju={result.person2Saju}
								title="두 번째 사람"
							/>
						</div>
					</TabsContent>

					{/* 오행 탭 */}
					<TabsContent value="elements" className="space-y-6">
						<Card className="hanji-card border-none shadow-lg">
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Scale className="w-5 h-5" />
									오행 상성 분석
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowDetailedElements(!showDetailedElements)}
									className="gap-2"
								>
									{showDetailedElements ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									{showDetailedElements ? "간단히" : "자세히"}
								</Button>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{Object.entries(result.elementComparison).map(([element, data], index) => (
										<motion.div
											key={element}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="p-4 rounded-2xl border border-border/50 bg-gradient-to-r from-background/80 to-background/60"
										>
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-3">
													<Badge className={cn("px-3 py-1 rounded-xl", ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS])}>
														{ELEMENT_NAMES[element as keyof typeof ELEMENT_NAMES]}
													</Badge>
													<span className="font-medium">조화도 {data.harmony}점</span>
												</div>
												<div className={cn("text-sm font-medium", getScoreGrade(data.harmony).color)}>
													{getScoreGrade(data.harmony).grade}
												</div>
											</div>
											
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">
														{result.input.person1.name}: {data.p1}
													</span>
													<span className="text-muted-foreground">
														{result.input.person2.name}: {data.p2}
													</span>
												</div>
												<Progress 
													value={data.harmony} 
													className="h-2" 
													style={{ 
														"--progress-background": 
															element === "wood" ? "#16a34a" :
															element === "fire" ? "#dc2626" :
															element === "earth" ? "#ca8a04" :
															element === "metal" ? "#6b7280" :
															"#2563eb"
													} as React.CSSProperties}
												/>
											</div>

											<AnimatePresence>
												{showDetailedElements && (
													<motion.div
														initial={{ opacity: 0, height: 0 }}
														animate={{ opacity: 1, height: "auto" }}
														exit={{ opacity: 0, height: 0 }}
														className="mt-4 pt-4 border-t border-border/30"
													>
														<div className="text-sm text-muted-foreground space-y-1">
															<p>• 상생/상극 관계를 고려한 종합 분석</p>
															<p>• 두 사람의 {ELEMENT_NAMES[element as keyof typeof ELEMENT_NAMES]} 기운이 
																{data.harmony >= 70 ? " 잘 어우러집니다" : 
																 data.harmony >= 50 ? " 보통 수준으로 조화됩니다" : 
																 " 조화가 필요합니다"}</p>
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* 상세 탭 */}
					<TabsContent value="details" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* 장점 */}
							<Card className="hanji-card border-none shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-green-600">
										<TrendingUp className="w-5 h-5" />
										강점과 장점
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-64">
										<div className="space-y-3">
											{result.interpretation.strengths.map((strength, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
												>
													<div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
														<span className="text-xs font-semibold text-green-600">
															{index + 1}
														</span>
													</div>
													<p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
														{strength}
													</p>
												</motion.div>
											))}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>

							{/* 주의사항 */}
							<Card className="hanji-card border-none shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-orange-600">
										<AlertTriangle className="w-5 h-5" />
										주의사항
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ScrollArea className="h-64">
										<div className="space-y-3">
											{result.interpretation.challenges.map((challenge, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.1 }}
													className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800"
												>
													<div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0 mt-0.5">
														<AlertTriangle className="w-3 h-3 text-orange-600" />
													</div>
													<p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
														{challenge}
													</p>
												</motion.div>
											))}
										</div>
									</ScrollArea>
								</CardContent>
							</Card>
						</div>

						{/* 관계별 특별 분석 */}
						{result.interpretation.relationshipSpecific[result.input.relationshipType] && (
							<Card className="hanji-card border-none shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Heart className="w-5 h-5 text-primary" />
										{result.input.relationshipType === "romance" && "연애 관계 특별 분석"}
										{result.input.relationshipType === "marriage" && "결혼 관계 특별 분석"}
										{result.input.relationshipType === "business" && "사업 관계 특별 분석"}
										{result.input.relationshipType === "friendship" && "우정 관계 특별 분석"}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{result.interpretation.relationshipSpecific[result.input.relationshipType]!.map((item, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.1 }}
												className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
											>
												<ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
												<p className="text-sm leading-relaxed">{item}</p>
											</motion.div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* 조언 탭 */}
					<TabsContent value="advice" className="space-y-6">
						<Card className="hanji-card border-none shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lightbulb className="w-5 h-5 text-yellow-500" />
									맞춤 조언
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{result.interpretation.advice.map((advice, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: index * 0.15 }}
											className="p-5 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800"
										>
											<div className="flex items-start gap-4">
												<div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
													<Lightbulb className="w-4 h-4 text-yellow-600" />
												</div>
												<div className="flex-1">
													<p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
														{advice}
													</p>
												</div>
											</div>
										</motion.div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</motion.div>

			{/* 🔄 액션 버튼 */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.2, duration: 0.6 }}
				className="flex flex-col sm:flex-row gap-4 justify-center"
			>
				<Button
					size="lg"
					onClick={onNewAnalysis}
					className="gap-3 py-6 text-lg rounded-2xl stamp-button text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]"
				>
					<Users className="w-6 h-6" />
					다른 사람과 분석하기
				</Button>

				<div className="flex justify-center gap-4">
					<Button
						variant="outline"
						size="lg"
						onClick={() => {
							if (navigator.share) {
								navigator.share({
									title: `${result.input.person1.name}과 ${result.input.person2.name}의 궁합 분석`,
									text: `우리의 궁합 점수는 ${result.score.overall}점! 상성 분석을 확인해보세요.`,
									url: window.location.href
								});
							}
						}}
						className="gap-2"
					>
						<Share2 className="w-4 h-4" />
						공유하기
					</Button>
				</div>
			</motion.div>
		</div>
	);
}

// 📊 점수 카드 컴포넌트
function ScoreCard({ 
	title, 
	score, 
	icon: Icon, 
	description, 
	delay 
}: { 
	title: string; 
	score: number; 
	icon: any; 
	description: string; 
	delay: number; 
}) {
	const grade = getScoreGrade(score);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.6 }}
		>
			<Card className="hanji-card border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-4">
						<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
							<Icon className="w-6 h-6 text-primary" />
						</div>
						<div className="text-right">
							<div className="text-2xl font-bold gradient-text">{score}</div>
							<div className={cn("text-xs font-medium", grade.color)}>
								{grade.grade}
							</div>
						</div>
					</div>
					<div>
						<h3 className="font-serif font-semibold mb-1">{title}</h3>
						<p className="text-xs text-muted-foreground">{description}</p>
					</div>
					<div className="mt-4">
						<Progress value={score} className="h-2" />
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}

// 👤 개인 사주 카드 컴포넌트
function PersonSajuCard({ person, saju, title }: { person: any; saju: any; title: string }) {
	return (
		<Card className="hanji-card border-none shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
						<Users className="w-5 h-5 text-primary" />
					</div>
					{person.name}
					<Badge variant="outline" className="ml-auto">
						{person.gender === "male" ? "남성" : "여성"}
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* 생년월일 정보 */}
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">생년월일</span>
							<div className="font-medium">{person.birthDate}</div>
						</div>
						<div>
							<span className="text-muted-foreground">출생시간</span>
							<div className="font-medium">{person.birthTime}</div>
						</div>
					</div>

					{/* 사주팔자 (간단 표시) */}
					{saju.pillars && (
						<div className="space-y-2">
							<h4 className="text-sm font-semibold text-muted-foreground">사주팔자</h4>
							<div className="grid grid-cols-4 gap-2">
								{saju.pillars.map((pillar: any, index: number) => (
									<div key={index} className="text-center">
										<div className="text-xs text-muted-foreground mb-1">
											{["연주", "월주", "일주", "시주"][index]}
										</div>
										<div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
											<div className="text-xs font-bold">{pillar.heavenStem}</div>
											<div className="text-xs">{pillar.earthBranch}</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
