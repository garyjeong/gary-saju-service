"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Sparkles, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* 404 에러 페이지 */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto text-center">
					{/* 헤더 섹션 */}
					<div className="relative mb-16">
						{/* Background Effects */}
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 floating delay-100 blur-sm"></div>
						<div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 floating delay-300 blur-sm"></div>
						<div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 floating delay-500 blur-sm"></div>

						<div className="relative z-10 space-y-8">
							{/* 404 숫자 */}
							<div className="relative">
								<h1 className="text-8xl md:text-9xl font-serif font-bold gradient-text opacity-90">
									404
								</h1>
								<div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-3xl opacity-50"></div>
							</div>

							{/* 에러 메시지 */}
							<div className="space-y-4">
								<div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl backdrop-blur-lg border border-white/10">
									<AlertCircle className="w-6 h-6 text-primary" />
									<h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
										페이지를 찾을 수 없습니다
									</h2>
								</div>
								<p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
									요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
									<br />
									아래 링크를 통해 다른 페이지로 이동해보세요.
								</p>
							</div>
						</div>
					</div>

					{/* 추천 액션 카드들 */}
					<div className="grid md:grid-cols-3 gap-8 mb-16">

						<Card className="glass-card border-none group hover:scale-105 transition-all duration-300">
							<CardContent className="p-8 text-center space-y-6">
								<div className="relative">
									<div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
										<Sparkles className="w-8 h-8 text-accent" />
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
								<div className="space-y-3">
									<h3 className="text-xl font-serif font-medium text-foreground">AI 사주 분석</h3>
									<p className="text-sm text-muted-foreground">
										지금 바로 나만의 사주를 AI로 분석해보세요
									</p>
								</div>
								<Button asChild variant="outline" size="lg" className="w-full modern-card">
									<Link href="/input">
										<Sparkles className="w-4 h-4 mr-2" />
										사주 분석하기
									</Link>
								</Button>
							</CardContent>
						</Card>

					</div>

					{/* 네비게이션 */}
					<div className="flex justify-center">
						<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group">
							<Link href="javascript:history.back()" className="flex items-center gap-2">
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
								이전 페이지로
							</Link>
						</Button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
