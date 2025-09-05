"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SajuResultSkeleton } from "@/components/ui/enhanced-loading";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TabNavigation from "@/components/saju/TabNavigation";
import SajuCard, { ElementBadge } from "@/components/saju/SajuCard";
import ElementChart from "@/components/saju/ElementChart";
import LuckTimeline from "@/components/saju/LuckTimeline";
import { DUMMY_SAJU_RESULT } from "@/data/dummy";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import { useAIInterpretation } from "@/hooks/useAIInterpretation";
import { Share2, ArrowLeft, Download, Loader2, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const tabs = [
	{ id: "basic", label: "기본 풀이", description: "성격 & 특성" },
	{ id: "elements", label: "오행 분석", description: "균형 & 에너지" },
	{ id: "timeline", label: "운세 흐름", description: "시기별 운세" },
];

export default function ResultPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("basic");
	const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);
	const [sajuInput, setSajuInput] = useState<SajuInputType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	
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
				
				// AI 해석 자동 실행 (기본 프로필로)
				if (result && !isEnhanced) {
					enhanceInterpretation(result, {
						age: input.birthDate ? new Date().getFullYear() - new Date(input.birthDate).getFullYear() : undefined,
						gender: input.gender,
						tone: 'casual',
						interests: ['career', 'love']
					}).catch(error => {
						console.log('AI 해석 실패 (기본 해석 사용):', error);
					});
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
		}
	}, [router, enhanceInterpretation, isEnhanced]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Header />
				<div className="container mx-auto px-4 py-8">
					<SajuResultSkeleton />
				</div>
				<Footer />
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
		<div className="min-h-screen bg-background">
			<Header />

			{/* 사용자 정보 헤더 - Enhanced */}
			<section className="relative py-12 md:py-16 overflow-hidden">
				{/* Background Effects */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/3 to-primary/5"></div>
				<div className="absolute top-0 left-0 w-full h-full opacity-30">
					<div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 floating delay-100 blur-sm"></div>
					<div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 floating delay-300 blur-sm"></div>
					<div className="absolute bottom-10 left-1/3 w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 floating delay-500 blur-sm"></div>
				</div>

				<div className="container mx-auto px-4 relative z-10">
					<div className="text-center space-y-8 max-w-4xl mx-auto">
						<div className="space-y-6">
							<div className="relative">
								<div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl backdrop-blur-lg border border-white/10">
									{isMobile && <Smartphone className="w-6 h-6 text-primary" />}
									<h1 className="text-3xl md:text-5xl font-serif font-bold gradient-text">
										{sajuInput.name}님의 사주 풀이
									</h1>
									{isEnhanced && (
										<Sparkles className="w-6 h-6 text-accent animate-pulse" />
									)}
								</div>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50"></div>
							</div>

							{/* AI 해석 상태 표시 */}
							{isAILoading && (
								<div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl backdrop-blur-sm">
									<Loader2 className="w-5 h-5 animate-spin text-primary" />
									<span className="text-primary font-medium">AI 개인화 해석 생성 중...</span>
								</div>
							)}
							{isEnhanced && !isAILoading && (
								<div className="inline-flex items-center gap-3 px-6 py-3 bg-accent/10 rounded-2xl backdrop-blur-sm">
									<Sparkles className="w-5 h-5 text-accent" />
									<span className="text-accent font-medium">AI 개인화 해석 적용됨</span>
								</div>
							)}

							{/* 사주 배지들 */}
							<div className="flex flex-wrap justify-center gap-3">
								<div className="relative group">
									<ElementBadge
										element={sajuResult.basic.pillars.year.earthly}
										color="#8B4513"
									/>
									<div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>
								<div className="relative group">
									<ElementBadge
										element={sajuResult.basic.pillars.month.earthly}
										color="#228B22"
									/>
									<div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>
								<div className="relative group">
									<ElementBadge
										element={sajuResult.basic.pillars.day.earthly}
										color="#DC143C"
									/>
									<div className="absolute -inset-1 bg-gradient-to-r from-red-400/20 to-rose-400/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>
								<div className="relative group">
									<ElementBadge
										element={sajuResult.basic.pillars.time.earthly}
										color="#FF6347"
									/>
									<div className="absolute -inset-1 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-lg md:text-xl text-muted-foreground">
									{sajuInput.birthDate} {sajuInput.birthTime} 출생
								</p>
								<p className="text-sm text-muted-foreground">
									AI가 분석한 개인화 사주 해석입니다
								</p>
							</div>
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

			{/* 탭 콘텐츠 */}
			<section className="py-8">
				<div className="container mx-auto px-4">
					{renderTabContent()}
				</div>
			</section>

			{/* 액션 버튼 - Enhanced */}
			<section className="relative py-12 md:py-16 overflow-hidden">
				{/* Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5"></div>
				
				<div className="container mx-auto px-4 text-center relative z-10">
					<div className="max-w-4xl mx-auto space-y-8">
						<div className="space-y-4">
							<h3 className="text-2xl md:text-3xl font-serif font-bold gradient-text">
								결과를 공유하고 저장하세요
							</h3>
							<p className="text-lg text-muted-foreground">
								친구들과 나누고 소중한 추억으로 간직하세요
							</p>
						</div>

						<div className={cn(
							"flex justify-center gap-4 md:gap-6",
							isMobile ? "flex-col max-w-sm mx-auto" : "flex-row"
						)}>
							<div className="relative group">
								<Button asChild size="lg" className="gradient-button text-white px-8 py-4 text-lg rounded-2xl shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
									<Link href="/share" className="flex items-center gap-3">
										<Share2 className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
										SNS 공유하기
									</Link>
								</Button>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/40 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>

							<div className="relative group">
								<Button 
									variant="outline" 
									size="lg" 
									className="modern-card px-8 py-4 text-lg rounded-2xl backdrop-blur-sm group-hover:scale-105 transition-all duration-300"
									onClick={() => {
										// TODO: 이미지 저장 기능 구현
										alert('이미지 저장 기능은 곧 제공될 예정입니다!');
									}}
								>
									<Download className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
									이미지로 저장
								</Button>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>
						
						{/* AI 재해석 버튼 */}
						{!isAILoading && (
							<div className="pt-4">
								<Button
									variant="ghost"
									size="lg"
									className="glass-card gap-3 px-6 py-3 rounded-xl group hover:bg-accent/10 transition-all duration-300"
									onClick={() => {
										if (sajuResult) {
											enhanceInterpretation(sajuResult, {
												age: sajuInput?.birthDate ? new Date().getFullYear() - new Date(sajuInput.birthDate).getFullYear() : undefined,
												gender: sajuInput?.gender,
												tone: 'poetic',
												interests: ['growth', 'creativity']
											});
										}
									}}
								>
									<Sparkles className="w-5 h-5 text-accent group-hover:scale-110 transition-transform duration-300" />
									AI 해석 새로고침
								</Button>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* 네비게이션 - Enhanced */}
			<section className="py-8">
				<div className="container mx-auto px-4">
					<div className={cn(
						"flex items-center gap-6",
						isMobile ? "flex-col" : "justify-between"
					)}>
						<Button asChild variant="outline" size="lg" className="modern-card px-6 py-3 rounded-xl group">
							<Link href="/input" className="flex items-center gap-2">
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
								다시 입력하기
							</Link>
						</Button>
						<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group hover:bg-primary/10">
							<Link href="/" className="flex items-center gap-2">
								홈으로 돌아가기
								<ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<Footer />
		</div>
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
			{/* 기본 사주 정보 */}
			<SajuCard title="사주 팔자" variant="data">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">년주</p>
						<p className="font-serif font-medium text-sm md:text-base">
							{basic.birthInfo.year}
						</p>
					</div>
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">월주</p>
						<p className="font-serif font-medium text-sm md:text-base">
							{basic.birthInfo.month}
						</p>
					</div>
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">일주</p>
						<p className="font-serif font-medium text-sm md:text-base">
							{basic.birthInfo.day}
						</p>
					</div>
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">시주</p>
						<p className="font-serif font-medium text-sm md:text-base">
							{basic.birthInfo.time}
						</p>
					</div>
				</div>
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

			<SajuCard title="연도별 운세 흐름 (예시)" variant="data">
				<LuckTimeline yearlyLuck={DUMMY_SAJU_RESULT.luck.yearly} />
			</SajuCard>
		</div>
	);
}
