"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { DUMMY_TODAY_FORTUNE } from "@/data/dummy";
import {
	Sparkles,
	Clock,
	BarChart3,
	Share2,
	ArrowRight,
	Star,
	Brain,
	Heart,
	TrendingUp,
	Zap,
	Shield,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* 히어로 섹션 - DeepSeek Style */}
			<section className="relative py-20 lg:py-32 overflow-hidden">
				{/* Background Effects */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3"></div>
				
				{/* Floating Elements */}
				<div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 floating delay-100 blur-sm"></div>
				<div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 floating delay-300 blur-sm"></div>
				<div className="absolute bottom-20 left-1/3 w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 floating delay-500 blur-sm"></div>

				<div className="container mx-auto px-4 relative z-10">
					<div className="text-center space-y-8 max-w-6xl mx-auto">
						<div className="space-y-6">
							<Badge
								variant="secondary"
								className="glass-card px-6 py-3 text-sm font-medium border-none backdrop-blur-lg"
							>
								<Sparkles className="w-4 h-4 mr-2 text-primary" />
								AI × 전통 사주의 혁신적 만남
							</Badge>
							
							<h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight">
								<span className="gradient-text">개-사주</span>
							</h1>
							
							<p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light leading-relaxed max-w-4xl mx-auto">
								전통 사주명리학을 AI가 개인화하여
								<br />
								<span className="text-foreground font-medium">현대적이고 감성적으로</span> 새롭게 체험하세요
							</p>
						</div>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
							<Button asChild size="lg" className="gradient-button text-white px-10 py-5 text-lg rounded-2xl shadow-lg">
								<Link href="/input">
									<Brain className="w-5 h-5" />
									AI 사주 분석 시작
									<ArrowRight className="w-5 h-5" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="modern-card px-10 py-5 text-lg rounded-2xl backdrop-blur-sm">
								<Link href="/result">
									<BarChart3 className="w-5 h-5" />
									결과 예시 보기
								</Link>
							</Button>
						</div>

						{/* Feature Stats */}
						<div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
							<div className="text-center">
								<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
									<Brain className="w-8 h-8 text-primary" />
								</div>
								<div className="text-2xl md:text-3xl font-bold gradient-text">AI</div>
								<div className="text-sm text-muted-foreground">개인화 해석</div>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
									<Heart className="w-8 h-8 text-accent" />
								</div>
								<div className="text-2xl md:text-3xl font-bold gradient-text">전통</div>
								<div className="text-sm text-muted-foreground">사주명리학</div>
							</div>
							<div className="text-center">
								<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
									<Shield className="w-8 h-8 text-primary" />
								</div>
								<div className="text-2xl md:text-3xl font-bold gradient-text">무료</div>
								<div className="text-sm text-muted-foreground">완전 무료</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 오늘의 운세 위젯 - Glass Card */}
			<section className="py-16 relative">
				<div className="container mx-auto px-4">
					<Card className="glass-card max-w-2xl mx-auto border-none shadow-2xl">
						<CardContent className="p-8">
							<div className="flex items-start gap-6">
								<div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0">
									<Star className="w-8 h-8 text-accent" />
								</div>
								<div className="flex-1 space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-xl font-serif font-medium text-foreground">
											오늘의 키워드
										</h3>
										<span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
											{DUMMY_TODAY_FORTUNE.date}
										</span>
									</div>
									<div className="space-y-3">
										<p className="text-2xl font-medium gradient-text">
											{DUMMY_TODAY_FORTUNE.keyword}
										</p>
										<p className="text-muted-foreground leading-relaxed">
											{DUMMY_TODAY_FORTUNE.description}
										</p>
										<div className="flex items-center gap-3">
											<span className="text-sm text-muted-foreground">
												운세 점수:
											</span>
											<Badge variant="secondary" className="font-mono bg-gradient-to-r from-primary/10 to-accent/10 border-none">
												{DUMMY_TODAY_FORTUNE.score}점
											</Badge>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* 주요 기능 소개 */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center space-y-6 mb-16">
						<h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
							<span className="gradient-text">개-사주</span>의 특별함
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							MZ 세대를 위한 감성적이고 직관적인 AI 사주 서비스
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 lg:gap-12">
						<Card className="modern-card text-center p-8 group">
							<CardContent className="space-y-6">
								<div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
									<Zap className="w-10 h-10 text-primary" />
								</div>
								<div className="space-y-3">
									<h3 className="text-2xl font-serif font-medium">즉시 분석</h3>
									<p className="text-muted-foreground leading-relaxed">
										생년월일과 시간만 입력하면
										<br />
										AI가 즉시 개인화된 사주 해석을 제공
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="modern-card text-center p-8 group">
							<CardContent className="space-y-6">
								<div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
									<TrendingUp className="w-10 h-10 text-accent" />
								</div>
								<div className="space-y-3">
									<h3 className="text-2xl font-serif font-medium">시각적 분석</h3>
									<p className="text-muted-foreground leading-relaxed">
										오행 균형과 운세 흐름을
										<br />
										아름다운 차트와 그래프로 직관적 표현
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="modern-card text-center p-8 group">
							<CardContent className="space-y-6">
								<div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
									<Share2 className="w-10 h-10 text-primary" />
								</div>
								<div className="space-y-3">
									<h3 className="text-2xl font-serif font-medium">SNS 공유</h3>
									<p className="text-muted-foreground leading-relaxed">
										나만의 사주 카드를 자동 생성해
										<br />
										친구들과 재미있게 공유하고 소통
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA 섹션 - Glass Effect */}
			<section className="py-20 relative overflow-hidden">
				{/* Background */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"></div>
				
				<div className="container mx-auto px-4 text-center relative z-10">
					<div className="glass-card max-w-4xl mx-auto p-12 border-none">
						<div className="space-y-8">
							<div className="space-y-4">
								<h2 className="text-4xl md:text-5xl font-serif font-bold">
									<span className="gradient-text">지금 바로 시작하세요</span>
								</h2>
								<p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
									무료로 제공되는 AI 개인화 사주 서비스로
									<br />
									<span className="text-foreground font-medium">나의 운명을 더 깊이 이해</span>해보세요
								</p>
							</div>
							
							<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
								<Button asChild size="lg" className="gradient-button text-white px-12 py-6 text-xl rounded-2xl shadow-xl">
									<Link href="/input">
										<Brain className="w-6 h-6" />
										사주 풀이 시작하기
										<ArrowRight className="w-6 h-6" />
									</Link>
								</Button>
								<Button asChild variant="outline" size="lg" className="modern-card px-12 py-6 text-xl rounded-2xl">
									<Link href="/share">
										<Share2 className="w-6 h-6" />
										공유 예시 보기
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}