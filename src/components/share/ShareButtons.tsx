"use client";

import React, { useEffect, useRef } from "react";
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
	ExternalLink,
	Loader2,
	AlertCircle
} from "lucide-react";
import { useShare } from "@/hooks/useShare";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";

interface ShareButtonsProps {
	sajuResult: SajuResult;
	sajuInput: SajuInputType;
	aiInterpretation?: any;
	captureElementRef?: React.RefObject<HTMLElement>;
}

export default function ShareButtons({ 
	sajuResult, 
	sajuInput, 
	aiInterpretation,
	captureElementRef
}: ShareButtonsProps) {
	const [shareState, shareMethods] = useShare();
	// 모바일 기기 및 공유 기능 감지
	const [deviceInfo, setDeviceInfo] = React.useState({
		isMobile: false,
		hasNativeShare: false,
		isIOS: false,
		isAndroid: false,
		canInstall: false
	});
	const shareDataInitialized = React.useRef(false);
	
	React.useEffect(() => {
		const detectDevice = () => {
			const userAgent = navigator.userAgent;
			const isMobileDevice = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
			const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
			const isAndroidDevice = /Android/.test(userAgent);
			const hasWebShare = !!navigator.share;
			const canInstallPWA = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;

			setDeviceInfo({
				isMobile: isMobileDevice,
				hasNativeShare: hasWebShare,
				isIOS: isIOSDevice,
				isAndroid: isAndroidDevice,
				canInstall: canInstallPWA
			});
		};
		
		detectDevice();
		window.addEventListener('resize', detectDevice);
		return () => window.removeEventListener('resize', detectDevice);
	}, []);

	// 컴포넌트 마운트 시 공유 데이터 생성
	React.useEffect(() => {
		if (!shareDataInitialized.current && sajuResult && sajuInput) {
			shareMethods.generateShareData({
				sajuResult,
				sajuInput,
				aiInterpretation
			});
			shareDataInitialized.current = true;
		}
	}, [sajuResult, sajuInput, aiInterpretation, shareMethods]);

	// 에러 상태 처리
	React.useEffect(() => {
		if (shareState.error) {
			toast({
				title: "오류 발생",
				description: shareState.error.message,
				variant: "destructive",
				action: shareState.error.retry ? (
					<Button 
						onClick={shareState.error.retry} 
						variant="outline" 
						size="sm"
					>
						재시도
					</Button>
				) : undefined
			});
		}
	}, [shareState.error]);

	// 네이티브 공유 (모바일)
	const handleNativeShare = async () => {
		const success = await shareMethods.shareNative();
		if (success) {
			toast({
				title: "공유 완료!",
				description: "성공적으로 공유되었습니다.",
			});
		}
	};

	// 링크 복사
	const handleCopyLink = async () => {
		const success = await shareMethods.copyLink();
		if (success) {
			toast({
				title: "링크 복사됨!",
				description: "클립보드에 복사되었습니다. 어디든 붙여넣어 공유하세요.",
			});
		}
	};

	// 이미지 캡처 및 다운로드
	const handleDownloadImage = async () => {
		if (!captureElementRef?.current) {
			toast({
				title: "오류 발생",
				description: "캡처할 요소를 찾을 수 없습니다.",
				variant: "destructive",
			});
			return;
		}

		const blob = await shareMethods.captureImage(captureElementRef.current);
		if (blob) {
			shareMethods.downloadImage(blob);
			toast({
				title: "다운로드 완료!",
				description: "이미지가 저장되었습니다.",
			});
		}
	};

	// 소셜 미디어 공유
	const handleSocialShare = (platform: string) => {
		shareMethods.shareToSocial(platform as any);
		
		const platformNames: Record<string, string> = {
			facebook: '페이스북',
			twitter: '트위터',
			kakao: '카카오톡',
			line: '라인',
			linkedin: '링크드인',
			telegram: '텔레그램',
			band: '네이버 밴드',
			whatsapp: '왓츠앱'
		};

		toast({
			title: "공유하기",
			description: `${platformNames[platform] || platform}으로 공유 창이 열렸습니다.`,
		});
	};

	// 공유 데이터 생성 중일 때 로딩 표시
	if (shareState.isGenerating || !shareState.shareData) {
		return (
			<div className="space-y-8">
				<Card className="modern-card">
					<CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
						<Loader2 className="w-12 h-12 animate-spin text-primary" />
						<div className="text-center">
							<h3 className="text-lg font-serif font-medium text-foreground">공유 준비 중...</h3>
							<p className="text-sm text-muted-foreground">
								공유 링크와 이미지를 생성하고 있습니다
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// 에러 상태 표시
	if (shareState.error && !shareState.shareData) {
		return (
			<div className="space-y-8">
				<Card className="modern-card border-destructive/20 bg-destructive/5">
					<CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
						<AlertCircle className="w-12 h-12 text-destructive" />
						<div className="text-center">
							<h3 className="text-lg font-serif font-medium text-foreground">공유 기능 오류</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{shareState.error.message}
							</p>
							{shareState.error.retry && (
								<Button 
									onClick={shareState.error.retry}
									variant="outline"
									className="gap-2"
								>
									<Loader2 className="w-4 h-4" />
									다시 시도
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

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
							onClick={handleDownloadImage}
							size="lg"
							className="w-full gap-3 gradient-button text-white py-4 text-lg rounded-xl"
							disabled={shareState.isCapturing || !captureElementRef?.current}
						>
							{shareState.isCapturing ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									이미지 생성 중...
								</>
							) : (
								<>
									<Download className="w-5 h-5" />
									PNG 이미지로 저장
								</>
							)}
						</Button>
					</CardContent>
				</Card>
				<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			</div>

			{/* 네이티브 공유 (모바일에서만) */}
			{deviceInfo.hasNativeShare && (
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
									<h3 className="text-lg font-serif font-medium text-foreground">
										{deviceInfo.isIOS ? 'iOS 공유' : deviceInfo.isAndroid ? 'Android 공유' : '빠른 공유'}
									</h3>
									<p className="text-sm text-muted-foreground">
										{deviceInfo.isIOS ? 'AirDrop, 메시지 등으로 공유' : 
										 deviceInfo.isAndroid ? '설치된 앱으로 바로 공유' : 
										 '설치된 앱으로 바로 공유하기'}
									</p>
								</div>
							</div>
							<Button
								onClick={handleNativeShare}
								size="lg"
								className="w-full gap-3 gradient-button text-white py-4 text-lg rounded-xl"
								disabled={shareState.isSharing}
							>
								{shareState.isSharing ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										공유 중...
									</>
								) : (
									<>
										<Share2 className="w-5 h-5" />
										{deviceInfo.isIOS ? 'iOS 공유하기' : deviceInfo.isAndroid ? 'Android 공유하기' : '앱으로 공유하기'}
									</>
								)}
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
							disabled={shareState.isCopying}
						>
							{shareState.isCopying ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									복사 중...
								</>
							) : (
								<>
									<Copy className="w-5 h-5" />
									링크 복사하기
								</>
							)}
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
								disabled={shareState.isGenerating || !shareState.socialUrls}
							>
								<Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								페이스북
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('twitter')}
								disabled={shareState.isGenerating || !shareState.socialUrls}
							>
								<Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								트위터
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('kakao')}
								disabled={shareState.isGenerating || !shareState.socialUrls}
							>
								<MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
								카카오톡
							</Button>
							<Button 
								variant="outline" 
								size="lg" 
								className="gap-3 py-4 rounded-xl modern-card group"
								onClick={() => handleSocialShare('line')}
								disabled={shareState.isGenerating || !shareState.socialUrls}
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
