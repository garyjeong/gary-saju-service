"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SajuShareCard from "@/components/share/SajuShareCard";
import ShareButtons from "@/components/share/ShareButtons";
import { generateShareUrl, extractShareData, downloadFile } from "@/lib/share/share-utils";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import { toast } from "@/hooks/use-toast";
import {
	Share2,
	ArrowLeft,
	Sparkles,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import html2canvas from "html2canvas";

export default function SharePage() {
	const router = useRouter();
	const [sajuResult, setSajuResult] = useState<SajuResult | null>(null);
	const [sajuInput, setSajuInput] = useState<SajuInputType | null>(null);
	const [aiInterpretation, setAiInterpretation] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isGeneratingImage, setIsGeneratingImage] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// 세션 스토리지에서 사주 데이터 로드
		try {
			const resultData = sessionStorage.getItem("sajuResult");
			const inputData = sessionStorage.getItem("sajuInput");
			const aiData = sessionStorage.getItem("aiInterpretation");

			if (resultData && inputData) {
				setSajuResult(JSON.parse(resultData));
				setSajuInput(JSON.parse(inputData));
				
				if (aiData) {
					setAiInterpretation(JSON.parse(aiData));
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
	}, [router]);

	// 캔버스를 이용한 이미지 다운로드
	const handleDownloadImage = async () => {
		if (!cardRef.current || !sajuResult || !sajuInput) {
			toast({
				title: "다운로드 실패",
				description: "카드 데이터를 불러올 수 없습니다.",
				variant: "destructive",
			});
			return;
		}

		setIsGeneratingImage(true);

		try {
			// html2canvas로 카드 캡처
			const canvas = await html2canvas(cardRef.current, {
				backgroundColor: '#ffffff',
				scale: 2, // 고해상도
				logging: false,
				useCORS: true,
				allowTaint: true,
			});

			// Blob으로 변환하여 다운로드
			canvas.toBlob((blob) => {
				if (blob) {
					const shareData = extractShareData(sajuResult, sajuInput, aiInterpretation);
					const filename = `${shareData.name}_사주카드_${new Date().getTime()}.png`;
					downloadFile(blob, filename);
					
					toast({
						title: "이미지 저장 완료!",
						description: `${filename}으로 저장되었습니다.`,
					});
				} else {
					throw new Error("이미지 생성 실패");
				}
			}, 'image/png', 1.0);

		} catch (error) {
			console.error("이미지 생성 오류:", error);
			toast({
				title: "이미지 생성 실패",
				description: "다시 시도해주세요.",
				variant: "destructive",
			});
		} finally {
			setIsGeneratingImage(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background">
				<Header />
				<div className="container mx-auto px-4 py-8 flex items-center justify-center">
					<div className="text-center space-y-4">
						<Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
						<p className="text-muted-foreground">공유 데이터를 불러오는 중...</p>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (!sajuResult || !sajuInput) {
		return (
			<div className="min-h-screen bg-background">
				<Header />
				<div className="container mx-auto px-4 py-8 flex items-center justify-center">
					<div className="text-center space-y-4">
						<p className="text-foreground">공유할 사주 결과를 찾을 수 없습니다.</p>
						<Button asChild>
							<Link href="/input">사주 입력하러 가기</Link>
						</Button>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

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
						{/* 사주 카드 미리보기 */}
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
									<Share2 className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h2 className="text-xl font-serif font-medium gradient-text">
										공유 카드 미리보기
									</h2>
									<p className="text-sm text-muted-foreground">SNS에 올라갈 카드입니다</p>
								</div>
							</div>

							{/* 다운로드용 카드 */}
							<div className="relative group">
								<div ref={cardRef}>
									<SajuShareCard 
										sajuResult={sajuResult}
										sajuInput={sajuInput}
										aiInterpretation={aiInterpretation}
										className="group-hover:scale-105 transition-transform duration-300"
									/>
										</div>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>

						{/* 공유 옵션 */}
						<ShareButtons 
							sajuResult={sajuResult}
							sajuInput={sajuInput}
							aiInterpretation={aiInterpretation}
							onDownload={isGeneratingImage ? undefined : handleDownloadImage}
						/>
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
