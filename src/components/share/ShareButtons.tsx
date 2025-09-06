"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
	Share2, 
	Download, 
	Copy, 
	MessageCircle, 
	Facebook, 
	Twitter,
	Smartphone,
	ExternalLink
} from "lucide-react";
import { 
	generateSocialShareUrls, 
	copyToClipboard, 
	nativeShare, 
	isMobileDevice,
	addUTMParameters 
} from "@/lib/share/share-utils";
import { extractShareData } from "@/lib/share/share-utils";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";

interface ShareButtonsProps {
	sajuResult: SajuResult;
	sajuInput: SajuInputType;
	aiInterpretation?: any;
	onDownload?: () => void;
}

export default function ShareButtons({ 
	sajuResult, 
	sajuInput, 
	aiInterpretation,
	onDownload 
}: ShareButtonsProps) {
	const [isSharing, setIsSharing] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	
	React.useEffect(() => {
		setIsMobile(isMobileDevice());
	}, []);

	const shareData = extractShareData(sajuResult, sajuInput, aiInterpretation);
	const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
	const socialUrls = generateSocialShareUrls(currentUrl, shareData);

	// 네이티브 공유 (모바일)
	const handleNativeShare = async () => {
		if (isSharing) return;
		
		setIsSharing(true);
		try {
			const title = `${shareData.name}님의 사주 - 개-사주`;
			const text = `${shareData.dominantElement} 기운 중심의 ${shareData.keywords.join(', ')} 성향. AI가 해석한 나만의 사주를 확인해보세요!`;
			
			const success = await nativeShare({
				title,
				text,
				url: addUTMParameters(currentUrl, 'native_share')
			});

			if (success) {
				toast({
					title: "공유 완료!",
					description: "성공적으로 공유되었습니다.",
				});
			} else {
				// 폴백: 클립보드 복사
				await handleCopyLink();
			}
		} catch (error) {
			console.error('네이티브 공유 오류:', error);
			await handleCopyLink();
		} finally {
			setIsSharing(false);
		}
	};

	// 링크 복사
	const handleCopyLink = async () => {
		const utmUrl = addUTMParameters(currentUrl, 'link_share');
		const success = await copyToClipboard(utmUrl);
		
		if (success) {
			toast({
				title: "링크 복사됨!",
				description: "클립보드에 복사되었습니다. 어디든 붙여넣어 공유하세요.",
			});
		} else {
			toast({
				title: "복사 실패",
				description: "링크를 수동으로 복사해주세요.",
				variant: "destructive",
			});
		}
	};

	// 소셜 미디어 공유
	const handleSocialShare = (platform: keyof typeof socialUrls) => {
		const url = addUTMParameters(socialUrls[platform], platform);
		
		// 새 창에서 열기
		const popup = window.open(
			url,
			`share_${platform}`,
			'width=600,height=400,scrollbars=yes,resizable=yes'
		);

		// 팝업이 차단된 경우 직접 이동
		if (!popup) {
			window.open(url, '_blank');
		}

		toast({
			title: "공유하기",
			description: `${platform}으로 공유 창이 열렸습니다.`,
		});
	};

	return (
		<div className="space-y-8">
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
							onClick={onDownload}
							size="lg"
							className="w-full gap-3 gradient-button text-white py-4 text-lg rounded-xl"
							disabled={!onDownload}
						>
							<Download className="w-5 h-5" />
							PNG 이미지로 저장
						</Button>
					</CardContent>
				</Card>
				<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			</div>

			{/* 네이티브 공유 (모바일에서만) */}
			{isMobile && (
				<div className="relative group">
					<Card className="modern-card group-hover:scale-[1.02] transition-all duration-300">
						<CardContent className="p-8 space-y-6">
							<div className="flex items-center gap-4">
								<div className="relative">
									<div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<Smartphone className="w-8 h-8 text-accent" />
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-serif font-medium text-foreground">빠른 공유</h3>
									<p className="text-sm text-muted-foreground">
										설치된 앱으로 바로 공유하기
									</p>
								</div>
							</div>
							<Button
								onClick={handleNativeShare}
								size="lg"
								className="w-full gap-3 gradient-button text-white py-4 text-lg rounded-xl"
								disabled={isSharing}
							>
								<Share2 className="w-5 h-5" />
								{isSharing ? "공유 중..." : "앱으로 공유하기"}
							</Button>
						</CardContent>
					</Card>
				</div>
			)}

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
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('facebook')}
							>
								<Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								페이스북
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('twitter')}
							>
								<Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								트위터
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('kakao')}
							>
								<MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								카카오톡
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('line')}
							>
								<ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								라인
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
