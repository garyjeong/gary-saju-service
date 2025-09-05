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
} from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* 히어로 섹션 */}
			<section className="relative py-16 lg:py-24 overflow-hidden">
				<div className="container mx-auto px-4">
					<div className="text-center space-y-6 max-w-4xl mx-auto">
						<div className="space-y-4">
							<Badge
								variant="secondary"
								className="px-4 py-2 text-sm font-medium"
							>
								<Sparkles className="w-4 h-4 mr-2" />
								전통과 현대의 만남
							</Badge>
							<h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight">
								개-사주
							</h1>
							<p className="text-xl md:text-2xl text-muted-foreground font-light">
								전통 사주를 현대적이고 감성적인 UI로
								<br />
								쉽고 재미있게 체험하세요
							</p>
						</div>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Button asChild size="lg" className="gap-2">
								<Link href="/input">
									<Clock className="w-5 h-5" />
									사주 보기 시작
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg" className="gap-2">
								<Link href="/result">
									<BarChart3 className="w-5 h-5" />
									결과 예시 보기
								</Link>
							</Button>
						</div>
					</div>
				</div>

				{/* 배경 장식 */}
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
			</section>

			{/* 오늘의 운세 위젯 */}
			<section className="py-12 bg-secondary/30">
				<div className="container mx-auto px-4">
					<Card className="max-w-2xl mx-auto">
						<CardContent className="p-6">
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
									<Star className="w-6 h-6 text-accent-foreground" />
								</div>
								<div className="flex-1 space-y-2">
									<div className="flex items-center justify-between">
										<h3 className="font-serif font-medium text-foreground">
											오늘의 키워드
										</h3>
										<span className="text-sm text-muted-foreground">
											{DUMMY_TODAY_FORTUNE.date}
										</span>
									</div>
									<div className="space-y-2">
										<p className="text-lg font-medium text-accent-foreground">
											{DUMMY_TODAY_FORTUNE.keyword}
										</p>
										<p className="text-sm text-muted-foreground">
											{DUMMY_TODAY_FORTUNE.description}
										</p>
										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground">
												운세 점수:
											</span>
											<Badge variant="secondary" className="font-mono">
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
			<section className="py-16">
				<div className="container mx-auto px-4">
					<div className="text-center space-y-4 mb-12">
						<h2 className="text-3xl font-serif font-bold text-foreground">
							개-사주의 특별함
						</h2>
						<p className="text-lg text-muted-foreground">
							MZ 세대를 위한 감성적이고 직관적인 사주 서비스
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="text-center p-6 hover:shadow-lg transition-shadow">
							<CardContent className="space-y-4">
								<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
									<Clock className="w-8 h-8 text-primary" />
								</div>
								<div className="space-y-2">
									<h3 className="text-xl font-serif font-medium">간편한 입력</h3>
									<p className="text-sm text-muted-foreground">
										생년월일과 시간만 입력하면
										<br />
										즉시 상세한 사주 풀이를 확인
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="text-center p-6 hover:shadow-lg transition-shadow">
							<CardContent className="space-y-4">
								<div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
									<BarChart3 className="w-8 h-8 text-accent-foreground" />
								</div>
								<div className="space-y-2">
									<h3 className="text-xl font-serif font-medium">시각적 분석</h3>
									<p className="text-sm text-muted-foreground">
										오행 균형과 운세 흐름을
										<br />
										아름다운 차트로 한눈에 파악
									</p>
								</div>
							</CardContent>
						</Card>

						<Card className="text-center p-6 hover:shadow-lg transition-shadow">
							<CardContent className="space-y-4">
								<div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto">
									<Share2 className="w-8 h-8 text-secondary-foreground" />
								</div>
								<div className="space-y-2">
									<h3 className="text-xl font-serif font-medium">SNS 공유</h3>
									<p className="text-sm text-muted-foreground">
										나만의 사주 카드를 생성해
										<br />
										친구들과 재미있게 공유하세요
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA 섹션 */}
			<section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
				<div className="container mx-auto px-4 text-center">
					<div className="space-y-6 max-w-2xl mx-auto">
						<h2 className="text-3xl font-serif font-bold text-foreground">
							지금 바로 시작해보세요
						</h2>
						<p className="text-lg text-muted-foreground">
							무료로 제공되는 개-사주 서비스로
							<br />
							나의 운명을 더 깊이 이해해보세요
						</p>
						<Button asChild size="lg" className="gap-2">
							<Link href="/input">
								사주 풀이 시작하기
								<ArrowRight className="w-5 h-5" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
