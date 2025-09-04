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
					{/* 페이지 헤더 */}
					<div className="text-center space-y-4 mb-8">
						<h1 className="text-3xl font-serif font-bold text-foreground">
							사주 카드 공유하기
						</h1>
						<p className="text-lg text-muted-foreground">
							나만의 사주 카드를 친구들과 공유해보세요
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8 items-start">
						{/* 사주 카드 미리보기 */}
						<div className="space-y-4">
							<h2 className="text-xl font-serif font-medium text-foreground">
								공유 카드 미리보기
							</h2>

							<Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-2 border-accent/20 shadow-2xl">
								<CardContent className="p-8 text-center space-y-6">
									{/* 브랜드 로고 */}
									<div className="flex items-center justify-center gap-2">
										<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
											<Sparkles className="w-5 h-5 text-primary-foreground" />
										</div>
										<span className="text-lg font-serif font-medium">
											사주나우
										</span>
									</div>

									{/* 메인 정보 */}
									<div className="space-y-4">
										<h3 className="text-2xl font-serif font-bold text-foreground">
											{DUMMY_SHARE_CARD.title}
										</h3>
										<p className="text-sm font-mono text-muted-foreground">
											{DUMMY_SHARE_CARD.subtitle}
										</p>
									</div>

									{/* 주요 키워드 */}
									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">
											나의 특성
										</p>
										<div className="flex flex-wrap justify-center gap-2">
											{DUMMY_SHARE_CARD.keyWords.map((keyword) => (
												<Badge
													key={keyword}
													variant="secondary"
													className="px-3 py-1"
												>
													{keyword}
												</Badge>
											))}
										</div>
									</div>

									{/* 주요 원소 */}
									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">
											주도적 오행
										</p>
										<div className="flex items-center justify-center gap-3">
											<div
												className="w-6 h-6 rounded-full border-2 border-white"
												style={{
													backgroundColor: DUMMY_SHARE_CARD.luckyColor,
												}}
											/>
											<span className="text-lg font-serif font-medium">
												{DUMMY_SHARE_CARD.dominantElement}
											</span>
										</div>
									</div>

									{/* 한 줄 설명 */}
									<div className="pt-4 border-t border-border/50">
										<p className="text-sm font-serif text-foreground/80">
											"{DUMMY_SHARE_CARD.description}"
										</p>
									</div>

									{/* 푸터 */}
									<div className="text-xs text-muted-foreground opacity-60">
										사주나우에서 무료로 확인해보세요
									</div>
								</CardContent>
							</Card>
						</div>

						{/* 공유 옵션 */}
						<div className="space-y-6">
							<h2 className="text-xl font-serif font-medium text-foreground">
								공유 방법 선택
							</h2>

							{/* 다운로드 */}
							<Card>
								<CardContent className="p-6 space-y-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
											<Download className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h3 className="font-medium">이미지로 저장</h3>
											<p className="text-sm text-muted-foreground">
												카드를 이미지로 다운로드
											</p>
										</div>
									</div>
									<Button
										onClick={handleDownloadImage}
										className="w-full gap-2"
									>
										<Download className="w-4 h-4" />
										PNG 이미지로 저장
									</Button>
								</CardContent>
							</Card>

							{/* 링크 공유 */}
							<Card>
								<CardContent className="p-6 space-y-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
											<Copy className="w-6 h-6 text-accent-foreground" />
										</div>
										<div>
											<h3 className="font-medium">링크 공유</h3>
											<p className="text-sm text-muted-foreground">
												URL을 복사해서 어디든 공유
											</p>
										</div>
									</div>
									<Button
										onClick={handleCopyLink}
										variant="outline"
										className="w-full gap-2"
									>
										<Copy className="w-4 h-4" />
										링크 복사하기
									</Button>
								</CardContent>
							</Card>

							{/* SNS 공유 */}
							<Card>
								<CardContent className="p-6 space-y-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center">
											<Share2 className="w-6 h-6 text-secondary-foreground" />
										</div>
										<div>
											<h3 className="font-medium">SNS 공유</h3>
											<p className="text-sm text-muted-foreground">
												소셜 미디어에 바로 공유
											</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<Button variant="outline" className="gap-2">
											<Instagram className="w-4 h-4" />
											인스타그램
										</Button>
										<Button variant="outline" className="gap-2">
											<MessageCircle className="w-4 h-4" />
											카카오톡
										</Button>
									</div>
								</CardContent>
							</Card>

							{/* 추가 안내 */}
							<Card className="bg-secondary/30">
								<CardContent className="p-4">
									<h4 className="font-medium text-foreground mb-2">
										💡 공유 팁
									</h4>
									<ul className="space-y-1 text-sm text-muted-foreground">
										<li>• 이미지로 저장하면 더 선명하게 공유할 수 있어요</li>
										<li>• 링크 공유 시 친구들도 자신의 사주를 확인할 수 있어요</li>
										<li>• 인스타그램 스토리로 공유하면 반응이 좋아요!</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* 네비게이션 */}
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-8 border-t border-border">
						<Button asChild variant="outline">
							<Link href="/result">
								<ArrowLeft className="w-4 h-4 mr-2" />
								결과로 돌아가기
							</Link>
						</Button>
						<div className="flex gap-3">
							<Button asChild variant="ghost">
								<Link href="/input">다시 입력하기</Link>
							</Button>
							<Button asChild variant="ghost">
								<Link href="/">홈으로</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
