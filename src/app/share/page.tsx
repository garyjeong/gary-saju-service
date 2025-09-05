"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { DUMMY_SHARE_CARD, DUMMY_USER } from "@/data/dummy";
import {
	Share2,
	Download,
	Copy,
	MessageCircle,
	Instagram,
	ArrowLeft,
	Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function SharePage() {
	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		alert("링크가 복사되었습니다!");
	};

	const handleDownloadImage = () => {
		// 실제로는 canvas를 사용해서 이미지 생성
		alert("이미지 다운로드 기능 (구현 예정)");
	};

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* 페이지 헤더 - Enhanced */}
					<div className="text-center space-y-8 mb-16">
						<div className="relative">
							<div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl backdrop-blur-lg border border-white/10">
								<Share2 className="w-6 h-6 text-primary" />
								<h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text">
									사주 카드 공유하기
								</h1>
								<Sparkles className="w-6 h-6 text-accent" />
							</div>
							<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50"></div>
						</div>
						<div className="space-y-3">
							<p className="text-xl text-muted-foreground">
								나만의 특별한 사주 카드를 친구들과 공유해보세요
							</p>
							<p className="text-lg text-foreground font-medium">
								SNS에서 화제가 될 준비 되셨나요? ✨
							</p>
						</div>
					</div>

					<div className="grid lg:grid-cols-2 gap-8 items-start">
						{/* 사주 카드 미리보기 - Enhanced */}
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
									<Download className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-xl font-serif font-medium gradient-text">
										공유 카드 미리보기
									</h2>
									<p className="text-sm text-muted-foreground">SNS에 올라갈 카드입니다</p>
								</div>
							</div>

							<div className="relative group">
								<Card className="glass-card border-none shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
									{/* Background Gradient */}
									<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10"></div>
									
									<CardContent className="p-10 text-center space-y-8 relative z-10">
										{/* 브랜드 로고 */}
										<div className="flex items-center justify-center gap-3">
											<div className="relative">
												<div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
													<Sparkles className="w-6 h-6 text-white" />
												</div>
												<div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-md opacity-30"></div>
											</div>
											<span className="text-2xl font-serif font-bold gradient-text">
												개-사주
											</span>
										</div>

										{/* 메인 정보 */}
										<div className="space-y-4">
											<h3 className="text-3xl font-serif font-bold text-foreground">
												{DUMMY_SHARE_CARD.title}
											</h3>
											<p className="text-base font-mono text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl">
												{DUMMY_SHARE_CARD.subtitle}
											</p>
										</div>

										{/* 주요 키워드 */}
										<div className="space-y-4">
											<div className="flex items-center justify-center gap-2">
												<div className="w-2 h-2 rounded-full bg-accent"></div>
												<p className="text-sm font-medium text-accent">
													나의 특성
												</p>
												<div className="w-2 h-2 rounded-full bg-accent"></div>
											</div>
											<div className="flex flex-wrap justify-center gap-3">
												{DUMMY_SHARE_CARD.keyWords.map((keyword, index) => (
													<Badge
														key={keyword}
														variant="secondary"
														className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border-none font-medium hover:scale-110 transition-transform duration-300"
														style={{ animationDelay: `${index * 100}ms` }}
													>
														{keyword}
													</Badge>
												))}
											</div>
										</div>

										{/* 주요 원소 */}
										<div className="space-y-4">
											<div className="flex items-center justify-center gap-2">
												<div className="w-2 h-2 rounded-full bg-primary"></div>
												<p className="text-sm font-medium text-primary">
													주도적 오행
												</p>
												<div className="w-2 h-2 rounded-full bg-primary"></div>
											</div>
											<div className="flex items-center justify-center gap-4">
												<div className="relative">
													<div
														className="w-8 h-8 rounded-full border-4 border-white shadow-lg"
														style={{
															backgroundColor: DUMMY_SHARE_CARD.luckyColor,
														}}
													/>
													<div className="absolute -inset-1 rounded-full blur-md opacity-30" style={{backgroundColor: DUMMY_SHARE_CARD.luckyColor}}></div>
												</div>
												<span className="text-2xl font-serif font-bold gradient-text">
													{DUMMY_SHARE_CARD.dominantElement}
												</span>
											</div>
										</div>

										{/* 한 줄 설명 */}
										<div className="relative pt-6">
											<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-muted-foreground/50 to-transparent"></div>
											<p className="text-lg font-serif text-foreground/90 italic leading-relaxed">
												"{DUMMY_SHARE_CARD.description}"
											</p>
										</div>

										{/* 푸터 */}
										<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
											<Sparkles className="w-3 h-3" />
											<span>개-사주에서 무료로 확인해보세요</span>
											<Sparkles className="w-3 h-3" />
										</div>
									</CardContent>
								</Card>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>

						{/* 공유 옵션 - Enhanced */}
						<div className="space-y-8">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
									<Share2 className="w-5 h-5 text-accent" />
								</div>
								<div>
									<h2 className="text-xl font-serif font-medium gradient-text">
										공유 방법 선택
									</h2>
									<p className="text-sm text-muted-foreground">원하는 방법으로 공유해보세요</p>
								</div>
							</div>

							{/* 다운로드 */}
							<div className="relative group">
								<Card className="glass-card border-none group-hover:scale-[1.02] transition-all duration-300">
									<CardContent className="p-8 space-y-6">
										<div className="flex items-center gap-4">
											<div className="relative">
												<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
													<Download className="w-8 h-8 text-primary" />
												</div>
												<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-serif font-medium text-foreground">이미지로 저장</h3>
												<p className="text-sm text-muted-foreground">
													고품질 PNG 이미지로 카드를 다운로드하세요
												</p>
											</div>
										</div>
										<Button
											onClick={handleDownloadImage}
											size="lg"
											className="w-full gap-3 gradient-button text-white py-4 text-lg rounded-xl"
										>
											<Download className="w-5 h-5" />
											PNG 이미지로 저장
										</Button>
									</CardContent>
								</Card>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>

							{/* 링크 공유 */}
							<div className="relative group">
								<Card className="modern-card group-hover:scale-[1.02] transition-all duration-300">
									<CardContent className="p-8 space-y-6">
										<div className="flex items-center gap-4">
											<div className="relative">
												<div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
													<Copy className="w-8 h-8 text-accent" />
												</div>
												<div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-serif font-medium text-foreground">링크 공유</h3>
												<p className="text-sm text-muted-foreground">
													URL을 복사해서 어디든 간편하게 공유하세요
												</p>
											</div>
										</div>
										<Button
											onClick={handleCopyLink}
											variant="outline"
											size="lg"
											className="w-full gap-3 py-4 text-lg rounded-xl modern-card"
										>
											<Copy className="w-5 h-5" />
											링크 복사하기
										</Button>
									</CardContent>
								</Card>
							</div>

							{/* SNS 공유 */}
							<div className="relative group">
								<Card className="modern-card group-hover:scale-[1.02] transition-all duration-300">
									<CardContent className="p-8 space-y-6">
										<div className="flex items-center gap-4">
											<div className="relative">
												<div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
													<Share2 className="w-8 h-8 text-primary" />
												</div>
												<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-serif font-medium text-foreground">SNS 공유</h3>
												<p className="text-sm text-muted-foreground">
													소셜 미디어에 바로 공유해서 화제를 만들어보세요
												</p>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<Button variant="outline" size="lg" className="gap-3 py-4 rounded-xl modern-card group">
												<Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
												인스타그램
											</Button>
											<Button variant="outline" size="lg" className="gap-3 py-4 rounded-xl modern-card group">
												<MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
												카카오톡
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* 추가 안내 - Enhanced */}
							<Card className="glass-card border-none bg-gradient-to-r from-accent/5 to-primary/5">
								<CardContent className="p-8">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
											<Sparkles className="w-4 h-4 text-accent" />
										</div>
										<h4 className="text-lg font-serif font-medium gradient-text">
											공유 팁
										</h4>
									</div>
									<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
										<div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 group hover:bg-primary/10 transition-colors duration-300">
											<div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
											<span className="text-sm text-muted-foreground leading-relaxed">
												이미지로 저장하면 더 <strong className="text-foreground">선명하게</strong> 공유할 수 있어요
											</span>
										</div>
										<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 group hover:bg-accent/10 transition-colors duration-300">
											<div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent to-accent/60 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
											<span className="text-sm text-muted-foreground leading-relaxed">
												링크 공유 시 친구들도 자신의 <strong className="text-foreground">사주를 확인</strong>할 수 있어요
											</span>
										</div>
										<div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 group hover:bg-primary/10 transition-colors duration-300 sm:col-span-2 lg:col-span-1 xl:col-span-2">
											<div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
											<span className="text-sm text-muted-foreground leading-relaxed">
												인스타그램 스토리로 공유하면 <strong className="text-foreground">반응이 폭발적</strong>이에요! 🔥
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* 네비게이션 - Enhanced */}
					<div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-16 pt-8">
						<Button asChild variant="outline" size="lg" className="modern-card px-6 py-3 rounded-xl group">
							<Link href="/result" className="flex items-center gap-2">
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
								결과로 돌아가기
							</Link>
						</Button>
						<div className="flex flex-col sm:flex-row gap-4">
							<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group hover:bg-primary/10">
								<Link href="/input" className="flex items-center gap-2">
									다시 입력하기
									<ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
								</Link>
							</Button>
							<Button asChild variant="ghost" size="lg" className="px-6 py-3 rounded-xl group hover:bg-accent/10">
								<Link href="/" className="flex items-center gap-2">
									홈으로 돌아가기
									<ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
