"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { trackSajuEvent, trackUserBehavior, PagePerformanceTracker } from "@/lib/analytics/vercel-analytics";
import { Button } from "@/components/ui/button";
import { SajuResultSkeleton } from "@/components/ui/enhanced-loading";
import Header from "@/components/layout/Header";
import PageTransition, { FadeInSection, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import { FloatingThemeToggle } from "@/components/ui/theme-toggle";
import TabNavigation from "@/components/saju/TabNavigation";
import SajuCard, { ElementBadge } from "@/components/saju/SajuCard";
import ElementChart from "@/components/saju/ElementChart";
import LuckTimeline from "@/components/saju/LuckTimeline";
import RealtimeFortuneWidget from "@/components/saju/RealtimeFortuneWidget";
import { DUMMY_SAJU_RESULT } from "@/data/dummy";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import { useAIInterpretation, UserProfile } from "@/hooks/useAIInterpretation";
import { Share2, ArrowLeft, Download, Loader2, Smartphone, Sparkles, Stars, Zap } from "lucide-react";
import { AIStageLoading } from "@/components/ui/ai-loading";
import { AIServiceError } from "@/components/ui/enhanced-error";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ShareButtons from "@/components/share/ShareButtons";

const tabs = [
	{ id: "basic", label: "기본 풀이", description: "성격 & 특성" },
	{ id: "elements", label: "오행 분석", description: "균형 & 에너지" },
	{ id: "timeline", label: "운세 흐름", description: "시기별 운세" },
];

// 🌟 애니메이션 설정
const cardRevealVariants = {
	hidden: { 
		opacity: 0, 
		y: 50, 
		rotateY: -15,
		scale: 0.9 
	},
	visible: (index: number) => ({
		opacity: 1,
		y: 0,
		rotateY: 0,
		scale: 1,
		transition: {
			delay: index * 0.3,
			duration: 0.6,
			type: "spring",
			stiffness: 100,
			damping: 12
		}
	})
};

const staggeredContainerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
			delayChildren: 0.3
		}
	}
};

const mysticalGlowVariants = {
	initial: { 
		boxShadow: "0 0 20px rgba(45, 80, 22, 0.3)" 
	},
	animate: { 
		boxShadow: [
			"0 0 20px rgba(45, 80, 22, 0.3)",
			"0 0 40px rgba(45, 80, 22, 0.6)",
			"0 0 20px rgba(45, 80, 22, 0.3)"
		],
		transition: {
			duration: 3,
			repeat: Infinity,
			ease: "easeInOut"
		}
	}
};

export default function ResultPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("basic");
	const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);
	const [sajuInput, setSajuInput] = useState<SajuInputType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [aiStage, setAiStage] = useState<"analyzing" | "enhancing" | "personalizing" | "finalizing">("analyzing");
	
	// 🌟 애니메이션 상태
	const [showCards, setShowCards] = useState(false);
	const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false, false]);
	const controls = useAnimation();
	
	// 🌟 이미지 캡처용 ref
	const captureRef = React.useRef<HTMLDivElement>(null);
	
	// 🌟 카드 순차 공개 함수
	const startCardRevealSequence = () => {
		const pillars = ["년주", "월주", "일주", "시주"];
		
		pillars.forEach((_, index) => {
			setTimeout(() => {
				setRevealedCards(prev => {
					const newRevealed = [...prev];
					newRevealed[index] = true;
					return newRevealed;
				});
			}, index * 800); // 0.8초 간격으로 순차 공개
		});
	};
	
	// AI 해석 훅
	const { 
		enhanceInterpretation, 
		getMergedInterpretation, 
		isLoading: isAILoading, 
		isEnhanced,
		error: aiError 
	} = useAIInterpretation();

	// 모바일 환경 감지
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	useEffect(() => {
		// 세션 스토리지에서 사주 결과와 입력 데이터 가져오기
		try {
			const resultData = sessionStorage.getItem("sajuResult");
			const inputData = sessionStorage.getItem("sajuInput");

			if (resultData && inputData) {
				const result = JSON.parse(resultData);
				const input = JSON.parse(inputData);
				
				setSajuResult(result);
				setSajuInput(input);
				
				// AI 해석 자동 실행 (사용자 설정 프로필로)
				if (result && !isEnhanced) {
					try {
						// 사용자가 설정한 AI 프로필 가져오기
						const aiProfileData = sessionStorage.getItem("aiProfile");
						let userProfile: UserProfile;
						
						if (aiProfileData) {
							userProfile = JSON.parse(aiProfileData);
						} else {
							// 백업용 기본 프로필
							userProfile = {
								age: input.birthYear ? new Date().getFullYear() - parseInt(input.birthYear) : undefined,
								gender: input.gender,
								tone: 'casual',
								interests: ['career', 'love']
							};
						}
						
						enhanceInterpretation(result, userProfile)
							.then((aiResult) => {
								// AI 해석 결과를 세션 스토리지에 저장 (공유용)
								if (aiResult) {
									sessionStorage.setItem("aiInterpretation", JSON.stringify(aiResult));
								}
							})
							.catch(error => {
								console.log('AI 해석 실패 (기본 해석 사용):', error);
							});
					} catch (error) {
						console.error('AI 프로필 로드 오류:', error);
					}
				}
			} else {
				// 데이터가 없으면 입력 페이지로 리다이렉트
				router.push("/input");
				return;
			}
		} catch (error) {
			console.error("사주 데이터 로드 오류:", error);
			router.push("/input");
			return;
		} finally {
			setIsLoading(false);
			// 🌟 카드 애니메이션 시작
			setTimeout(() => {
				setShowCards(true);
				startCardRevealSequence();
			}, 500);
		}
	}, [router, enhanceInterpretation, isEnhanced]);


	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Header />
				<div className="container mx-auto px-4 py-8">
					<SajuResultSkeleton />
				</div>
			</div>
		);
	}

	if (!sajuResult || !sajuInput) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<p className="text-foreground">사주 결과를 찾을 수 없습니다.</p>
					<Button asChild>
						<Link href="/input">사주 입력하러 가기</Link>
					</Button>
				</div>
			</div>
		);
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case "basic":
				return <BasicInterpretation result={sajuResult} />;
			case "elements":
				return <ElementsAnalysis result={sajuResult} />;
			case "timeline":
				return <TimelineAnalysis result={sajuResult} />;
			default:
				return <BasicInterpretation result={sajuResult} />;
		}
	};

	return (
		<PageTransition variant="mystical">
			<div className="min-h-screen bg-background">
				{/* 🌙 테마 토글 버튼 */}
				<FloatingThemeToggle />
				
				<Header showBack={true} backHref="/input" title="사주 결과" />

				{/* 상단 액션 버튼 영역 */}
				<section className="pt-20 pb-4">
					<div className="container mx-auto px-4">
						<div className="flex justify-end">
							<Button
								variant="outline"
								size="sm"
								onClick={() => router.push("/input")}
								className="text-sm px-4 py-2 rounded-xl border-primary/20 hover:bg-primary/5"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								다시 입력하기
							</Button>
						</div>
					</div>
				</section>

			{/* 사용자 정보 헤더 - 간소화됨 */}
			<section className="py-8">
				<div className="container mx-auto px-4">
					<div className="text-center space-y-6 max-w-2xl mx-auto">
						<div className="space-y-4">
							<h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
								{sajuInput.name}님의 사주 풀이
								{isEnhanced && (
									<Sparkles className="inline-block w-5 h-5 ml-2 text-accent" />
								)}
							</h1>

							{/* AI 해석 상태 표시 - 간소화됨 */}
							{isAILoading && (
								<div className="w-full max-w-md mx-auto">
									<AIStageLoading currentStage={aiStage} />
								</div>
							)}
							{/* AI 해석 완료 및 에러 상태 */}
							{!isAILoading && (
								<div className="space-y-3">
									{aiError && (
										<div className="max-w-md mx-auto">
											<AIServiceError 
												error={aiError}
												onRetry={() => {
													console.log("AI 해석 재시도");
												}}
												onFallback={() => {
													console.log("기본 해석으로 폴백");
												}}
											/>
										</div>
									)}
									{isEnhanced && !aiError && (
										<div className="flex items-center justify-center">
											<span className="text-accent text-sm font-medium">AI 개인화 해석</span>
										</div>
									)}
								</div>
							)}

							{/* 사주 배지들 - 간소화됨 */}
							<div className="flex flex-wrap justify-center gap-2">
								<ElementBadge
									element={sajuResult.basic.pillars.year.earthly}
									color="#8B4513"
								/>
								<ElementBadge
									element={sajuResult.basic.pillars.month.earthly}
									color="#228B22"
								/>
								<ElementBadge
									element={sajuResult.basic.pillars.day.earthly}
									color="#DC143C"
								/>
								<ElementBadge
									element={sajuResult.basic.pillars.time.earthly}
									color="#FF6347"
								/>
							</div>

							{/* 출생정보 - 간소화됨 */}
							<p className="text-muted-foreground text-sm">
								{sajuInput.birthYear}년 {sajuInput.birthMonth}월 {sajuInput.birthDay}일 {sajuInput.birthHour}:{sajuInput.birthMinute} 출생
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* 탭 네비게이션 */}
			<TabNavigation
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>

			{/* 🌟 실시간 운세 위젯 */}
			<section className="py-6">
				<div className="container mx-auto px-4">
					<motion.div 
						className="max-w-2xl mx-auto"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						<RealtimeFortuneWidget />
					</motion.div>
				</div>
			</section>

			{/* 탭 콘텐츠 - 캡처 영역 */}
			<section className="py-8" ref={captureRef}>
				<div className="container mx-auto px-4">
					{renderTabContent()}
				</div>
			</section>

			{/* 공유 및 저장 기능 */}
			<section className="relative py-12 md:py-16 overflow-hidden">
				{/* Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5"></div>
				
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-4xl mx-auto space-y-8">
						<div className="text-center space-y-4">
							<h3 className="text-2xl md:text-3xl font-serif font-bold gradient-text">
								결과를 공유하고 저장하세요
							</h3>
							<p className="text-lg text-muted-foreground">
								친구들과 나누고 소중한 추억으로 간직하세요
							</p>
						</div>

						{/* ShareButtons 컴포넌트 사용 */}
						{sajuResult && sajuInput && (
							<ShareButtons
								sajuResult={sajuResult}
								sajuInput={sajuInput}
								aiInterpretation={JSON.parse(sessionStorage.getItem("aiInterpretation") || "null")}
								captureElementRef={captureRef}
							/>
						)}
					</div>
				</div>
			</section>

			{/* 네비게이션 */}


		</div>
		</PageTransition>
	);
}

function BasicInterpretation({ result }: { result: SajuResult }) {
	const { interpretation, basic } = result;
	
	// AI 해석 훅 사용 (컴포넌트 외부에서 전달받을 수도 있지만 여기서는 별도 훅 사용)
	const { getMergedInterpretation, isEnhanced, aiModel } = useAIInterpretation();
	
	// AI 해석이 있으면 병합된 해석 사용, 없으면 기본 해석 사용
	const mergedInterpretation = getMergedInterpretation(interpretation);

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			{/* 🌟 기본 사주 정보 - 순차 애니메이션 */}
			<SajuCard title="사주 팔자" variant="data">
				<motion.div 
					className="grid grid-cols-2 md:grid-cols-4 gap-4"
					variants={staggeredContainerVariants}
					initial="hidden"
					animate="visible"
				>
					{[
						{ label: "년주", value: basic.birthInfo.year, delay: 0 },
						{ label: "월주", value: basic.birthInfo.month, delay: 0.3 },
						{ label: "일주", value: basic.birthInfo.day, delay: 0.6 },
						{ label: "시주", value: basic.birthInfo.time, delay: 0.9 }
					].map((pillar, index) => (
						<motion.div
							key={pillar.label}
							className="text-center space-y-1"
							variants={cardRevealVariants}
							custom={index}
							whileHover={{ 
								scale: 1.05, 
								rotateY: 5,
								transition: { duration: 0.2 }
							}}
						>
							<motion.div
								className="relative p-4 rounded-2xl bg-gradient-to-br from-saju-cosmic-starlight/10 to-saju-cosmic-purple/10 border border-saju-traditional-gold/20"
								variants={mysticalGlowVariants}
								initial="initial"
								animate="animate"
								style={{ transformStyle: "preserve-3d" }}
							>
								<motion.p 
									className="text-xs text-muted-foreground mb-2"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: pillar.delay + 0.2 }}
								>
									{pillar.label}
								</motion.p>
								<motion.p 
									className="font-serif font-bold text-lg md:text-xl gradient-text"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: pillar.delay + 0.4, type: "spring" }}
								>
									{pillar.value}
								</motion.p>
								
								{/* 🌟 신비로운 장식 요소 */}
								<motion.div
									className="absolute top-1 right-1 w-2 h-2 bg-saju-traditional-gold rounded-full"
									animate={{ 
										scale: [1, 1.2, 1],
										opacity: [0.5, 1, 0.5]
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										delay: pillar.delay
									}}
								/>
								<motion.div
									className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-saju-cosmic-starlight rounded-full"
									animate={{ 
										scale: [1, 1.3, 1],
										opacity: [0.3, 0.8, 0.3]
									}}
									transition={{
										duration: 2.5,
										repeat: Infinity,
										delay: pillar.delay + 0.5
									}}
								/>
							</motion.div>
						</motion.div>
					))}
				</motion.div>
			</SajuCard>

			{/* 한 줄 요약 */}
			{mergedInterpretation.summary && (
				<SajuCard title="사주 요약" variant="interpretation">
					<div className="space-y-2">
						<p className="text-base md:text-lg saju-interpretation text-center">
							{mergedInterpretation.summary}
						</p>
						{isEnhanced && (
							<div className="flex items-center justify-center gap-1 text-xs text-accent">
								<Sparkles className="w-3 h-3" />
								<span>AI 개인화 해석</span>
								{aiModel && <span>({aiModel})</span>}
							</div>
						)}
					</div>
				</SajuCard>
			)}

			{/* 성격 분석 */}
			<SajuCard title="성격과 특성" variant="interpretation">
				<div className="space-y-4">
					<div className="saju-interpretation">
						{Array.isArray(mergedInterpretation.personality) ? (
							mergedInterpretation.personality.map((text, index) => (
								<p key={index} className="mb-3 last:mb-0 text-sm md:text-base">
									{text}
								</p>
							))
						) : (
							<p className="text-sm md:text-base">{mergedInterpretation.personality}</p>
						)}
					</div>
				</div>
			</SajuCard>

			{/* AI 추가 해석 (AI 해석이 있을 때만 표시) */}
			{isEnhanced && mergedInterpretation.lifeAdvice && (
				<div className="grid md:grid-cols-2 gap-6">
					<SajuCard title="인생 조언" variant="interpretation">
						<p className="text-sm md:text-base saju-interpretation">
							{mergedInterpretation.lifeAdvice}
						</p>
					</SajuCard>
					<SajuCard title="진로 가이드" variant="interpretation">
						<p className="text-sm md:text-base saju-interpretation">
							{mergedInterpretation.careerGuidance}
						</p>
					</SajuCard>
				</div>
			)}

			{/* 관계 조언 (AI 해석) */}
			{isEnhanced && mergedInterpretation.relationshipTips && (
				<SajuCard title="인간관계 조언" variant="interpretation">
					<p className="text-sm md:text-base saju-interpretation">
						{mergedInterpretation.relationshipTips}
					</p>
				</SajuCard>
			)}

			{/* 장단점 */}
			<div className="grid md:grid-cols-2 gap-6">
				<SajuCard title="주요 강점">
					<ul className="space-y-2">
						{(Array.isArray(mergedInterpretation.strengths) 
							? mergedInterpretation.strengths 
							: [mergedInterpretation.strengths]
						).map((strength, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-xs md:text-sm"
							>
								<div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
								<span>{strength}</span>
							</li>
						))}
					</ul>
				</SajuCard>

				<SajuCard title="개선점">
					<ul className="space-y-2">
						{(Array.isArray(mergedInterpretation.challenges) 
							? mergedInterpretation.challenges 
							: [mergedInterpretation.challenges]
						).map((challenge, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-xs md:text-sm"
							>
								<div className="w-2 h-2 bg-muted-foreground rounded-full flex-shrink-0" />
								<span>{challenge}</span>
							</li>
						))}
					</ul>
				</SajuCard>
			</div>
		</div>
	);
}

function ElementsAnalysis({ result }: { result: SajuResult }) {
	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<SajuCard title="오행 균형 분석" variant="data">
				<ElementChart elements={result.elements} />
			</SajuCard>
		</div>
	);
}

function TimelineAnalysis({ result }: { result: SajuResult }) {
	// 더미 데이터 사용 (실제 운세 타임라인은 추후 구현)
	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<SajuCard title="운세 참고사항" variant="interpretation">
				<div className="text-center space-y-2">
					<h3 className="text-xl font-serif font-medium">
						오행 기반 운세 분석
					</h3>
					<p className="text-sm text-muted-foreground saju-interpretation">
						현재는 기본 오행 분석을 제공합니다. 
						상세한 대운 분석은 추후 업데이트 예정입니다.
					</p>
				</div>
			</SajuCard>

			<SajuCard title="연도별 운세 흐름" variant="data">
				<LuckTimeline yearlyLuck={DUMMY_SAJU_RESULT.luck.yearly} />
			</SajuCard>
		</div>
	);
}
