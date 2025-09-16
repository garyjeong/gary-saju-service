"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AlertTriangle, RefreshCw, ArrowLeft, Sparkles, Bug } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		// 에러를 로그에 기록
		console.error("Application error:", error);
	}, [error]);

	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* 에러 페이지 */}
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto text-center">
					{/* 헤더 섹션 */}
					<div className="relative mb-16">
						{/* Background Effects */}
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 floating delay-100 blur-sm"></div>
						<div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400/20 to-red-400/20 floating delay-300 blur-sm"></div>
						<div className="absolute bottom-0 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-red-400/30 to-orange-400/30 floating delay-500 blur-sm"></div>

						<div className="relative z-10 space-y-8">
							{/* 에러 아이콘 */}
							<div className="relative">
								<div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto">
									<AlertTriangle className="w-12 h-12 text-red-500" />
								</div>
								<div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl blur-3xl opacity-50"></div>
							</div>

							{/* 에러 메시지 */}
							<div className="space-y-6">
								<div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl backdrop-blur-lg border border-red-200/20">
									<Bug className="w-6 h-6 text-red-500" />
									<h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
										문제가 발생했습니다
									</h1>
								</div>
								<div className="space-y-4">
									<p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
										예상치 못한 오류가 발생했습니다. 
										<br />
										페이지를 새로고침하거나 잠시 후 다시 시도해보세요.
									</p>
									{process.env.NODE_ENV === "development" && (
										<details className="text-left mt-6 p-4 bg-muted/30 rounded-xl">
											<summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
												개발자 정보 (클릭하여 펼치기)
											</summary>
											<pre className="text-xs text-muted-foreground overflow-auto">
												{error.message}
												{error.digest && (
													<>
														{"\n"}Digest: {error.digest}
													</>
												)}
											</pre>
										</details>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* 액션 카드들 */}
					<div className="grid md:grid-cols-2 gap-8 mb-16">
						<Card className="glass-card border-none group hover:scale-105 transition-all duration-300">
							<CardContent className="p-8 text-center space-y-6">
								<div className="relative">
									<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
										<RefreshCw className="w-8 h-8 text-primary" />
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
								<div className="space-y-3">
									<h3 className="text-xl font-serif font-medium text-foreground">다시 시도</h3>
									<p className="text-sm text-muted-foreground">
										페이지를 새로고침하여 문제를 해결해보세요
									</p>
								</div>
								<Button 
									onClick={reset}
									size="lg" 
									className="w-full gradient-button text-white group"
								>
									<RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
									페이지 새로고침
								</Button>
							</CardContent>
						</Card>

					</div>

					{/* 추천 액션 */}
					<Card className="glass-card border-none bg-gradient-to-r from-accent/5 to-primary/5">
						<CardContent className="p-8">
							<div className="flex items-center gap-3 mb-6">
								<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
									<Sparkles className="w-4 h-4 text-accent" />
								</div>
								<h4 className="text-lg font-serif font-medium gradient-text">
									이런 기능들을 시도해보세요
								</h4>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 group hover:bg-primary/10 transition-colors duration-300">
									<div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
									<div className="text-left">
										<div className="text-sm font-medium text-foreground">AI 사주 분석</div>
										<div className="text-xs text-muted-foreground">개인화된 사주 해석을 받아보세요</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 네비게이션 */}
					<div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
						<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group">
							<Link href="javascript:history.back()" className="flex items-center gap-2">
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
								이전 페이지로
							</Link>
						</Button>
						<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group hover:bg-primary/10">
							<Link href="/input" className="flex items-center gap-2">
								사주 분석하러 가기
								<Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
							</Link>
						</Button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
