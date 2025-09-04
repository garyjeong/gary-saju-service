"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TabNavigation from "@/components/saju/TabNavigation";
import SajuCard, { ElementBadge } from "@/components/saju/SajuCard";
import ElementChart from "@/components/saju/ElementChart";
import LuckTimeline from "@/components/saju/LuckTimeline";
import { DUMMY_SAJU_RESULT } from "@/data/dummy";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import { Share2, ArrowLeft, Download, Loader2 } from "lucide-react";
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

	useEffect(() => {
		// 세션 스토리지에서 사주 결과와 입력 데이터 가져오기
		try {
			const resultData = sessionStorage.getItem("sajuResult");
			const inputData = sessionStorage.getItem("sajuInput");

			if (resultData && inputData) {
				setSajuResult(JSON.parse(resultData));
				setSajuInput(JSON.parse(inputData));
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
	}, [router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<Loader2 className="w-8 h-8 animate-spin mx-auto" />
					<p className="text-muted-foreground">사주 결과를 불러오는 중...</p>
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
		<div className="min-h-screen bg-background">
			<Header />

			{/* 사용자 정보 헤더 */}
			<section className="bg-gradient-to-br from-primary/5 to-accent/5 py-8">
				<div className="container mx-auto px-4">
					<div className="text-center space-y-4">
						<h1 className="text-3xl font-serif font-bold text-foreground">
							{sajuInput.name}님의 사주 풀이
						</h1>
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
						<p className="text-muted-foreground">
							{sajuInput.birthDate} {sajuInput.birthTime} 출생
						</p>
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

			{/* 액션 버튼 */}
			<section className="py-8 bg-secondary/30">
				<div className="container mx-auto px-4 text-center">
					<div className="space-y-4">
						<h3 className="text-xl font-serif font-medium text-foreground">
							결과를 공유하거나 저장하세요
						</h3>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button asChild size="lg" className="gap-2">
								<Link href="/share">
									<Share2 className="w-5 h-5" />
									SNS 공유하기
								</Link>
							</Button>
							<Button variant="outline" size="lg" className="gap-2">
								<Download className="w-5 h-5" />
								이미지로 저장
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* 네비게이션 */}
			<section className="py-4">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center">
						<Button asChild variant="outline">
							<Link href="/input">
								<ArrowLeft className="w-4 h-4 mr-2" />
								다시 입력하기
							</Link>
						</Button>
						<Button asChild variant="ghost">
							<Link href="/">홈으로 돌아가기</Link>
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

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			{/* 기본 사주 정보 */}
			<SajuCard title="사주 팔자" variant="data">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">년주</p>
						<p className="font-serif font-medium">
							{basic.birthInfo.year}
						</p>
					</div>
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">월주</p>
						<p className="font-serif font-medium">
							{basic.birthInfo.month}
						</p>
					</div>
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">일주</p>
						<p className="font-serif font-medium">
							{basic.birthInfo.day}
						</p>
					</div>
					<div className="text-center space-y-1">
						<p className="text-xs text-muted-foreground">시주</p>
						<p className="font-serif font-medium">
							{basic.birthInfo.time}
						</p>
					</div>
				</div>
			</SajuCard>

			{/* 한 줄 요약 */}
			{interpretation.summary && (
				<SajuCard title="사주 요약" variant="interpretation">
					<p className="text-lg saju-interpretation text-center">
						{interpretation.summary}
					</p>
				</SajuCard>
			)}

			{/* 성격 분석 */}
			<SajuCard title="성격과 특성" variant="interpretation">
				<div className="space-y-4">
					<div className="saju-interpretation">
						{interpretation.personality.map((text, index) => (
							<p key={index} className="mb-3 last:mb-0">
								{text}
							</p>
						))}
					</div>
				</div>
			</SajuCard>

			{/* 장단점 */}
			<div className="grid md:grid-cols-2 gap-6">
				<SajuCard title="주요 강점">
					<ul className="space-y-2">
						{interpretation.strengths.map((strength, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-sm"
							>
								<div className="w-2 h-2 bg-accent rounded-full" />
								{strength}
							</li>
						))}
					</ul>
				</SajuCard>

				<SajuCard title="개선점">
					<ul className="space-y-2">
						{interpretation.challenges.map((challenge, index) => (
							<li
								key={index}
								className="flex items-center gap-2 text-sm"
							>
								<div className="w-2 h-2 bg-muted-foreground rounded-full" />
								{challenge}
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
