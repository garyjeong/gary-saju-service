"use client";

import Link from "next/link";
import { Github, Heart, Sparkles, Brain, Share2 } from "lucide-react";

export default function Footer() {
	return (
		<footer className="w-full relative overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
			
			<div className="container mx-auto px-4 py-12 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
					{/* 브랜드 정보 - Enhanced */}
					<div className="space-y-6">
						<div className="flex items-center gap-3">
							<div className="relative">
								<div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
									<Sparkles className="w-6 h-6 text-white" />
								</div>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-md opacity-30"></div>
							</div>
							<h3 className="text-2xl font-serif font-bold gradient-text">
								개-사주
							</h3>
						</div>
						<p className="text-base text-muted-foreground leading-relaxed">
							전통 사주명리학을 AI가 개인화하여 현대적이고 감성적인 UI로 제공하는 혁신적인 서비스입니다
						</p>
						<div className="flex items-center gap-2 text-sm text-accent">
							<Brain className="w-4 h-4" />
							<span>AI × 전통의 만남</span>
						</div>
					</div>

					{/* 링크 - Enhanced */}
					<div className="space-y-6">
						<h4 className="text-lg font-serif font-medium gradient-text flex items-center gap-2">
							<Share2 className="w-4 h-4" />
							서비스
						</h4>
						<div className="space-y-4">
							<Link
								href="/input"
								className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 p-3 rounded-xl hover:bg-primary/5"
							>
								<div className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform duration-300"></div>
								AI 사주 분석
							</Link>
							<Link
								href="/share"
								className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 p-3 rounded-xl hover:bg-primary/5"
							>
								<div className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform duration-300"></div>
								SNS 공유하기
							</Link>
						</div>
					</div>

					{/* 개발 정보 - Enhanced */}
					<div className="space-y-6">
						<h4 className="text-lg font-serif font-medium gradient-text flex items-center gap-2">
							<Github className="w-4 h-4" />
							개발 정보
						</h4>
						<div className="space-y-4">
							<a
								href="https://github.com/garyjeong/saju-project"
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-all duration-300 p-3 rounded-xl hover:bg-muted/30"
							>
								<Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								GitHub Repository
							</a>
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm">
									<div className="w-2 h-2 rounded-full bg-green-500"></div>
									<span className="text-muted-foreground">오픈소스</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<div className="w-2 h-2 rounded-full bg-blue-500"></div>
									<span className="text-muted-foreground">포트폴리오 프로젝트</span>
								</div>
								<div className="flex items-center gap-2 text-sm">
									<div className="w-2 h-2 rounded-full bg-purple-500"></div>
									<span className="text-muted-foreground">100% 무료</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 하단 정보 - Enhanced */}
				<div className="mt-16 pt-8 relative">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-muted-foreground/50 to-transparent"></div>
					
					<div className="flex flex-col sm:flex-row items-center justify-between gap-6">
						<p className="text-sm text-muted-foreground flex items-center gap-1">
							© 2024 개-사주. Made with{" "}
							<Heart className="w-4 h-4 text-red-500 animate-pulse" /> for learning
						</p>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>사주 계산 로직:</span>
							<a
								href="https://github.com/garyjeong/saju-project"
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent hover:text-accent/80 transition-colors underline underline-offset-4"
							>
								saju-project
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
