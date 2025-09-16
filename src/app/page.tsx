"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingThemeToggle } from "@/components/ui/theme-toggle";
import SajuInputModal from "@/components/ui/saju-input-modal";
import { Sparkles } from "lucide-react";

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background">
			{/* 🌙 테마 토글 버튼 */}
			<FloatingThemeToggle />
			
			{/* 🌟 메인 히어로 섹션 */}
			<main className="container mx-auto px-6 py-16 md:py-24">
				{/* 센터 정렬된 메인 콘텐츠 */}
				<div className="max-w-4xl mx-auto text-center space-y-12">
					
					{/* 브랜드 로고 */}
					<div className="space-y-4">
						<div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-korea-red to-korea-yellow flex items-center justify-center shadow-xl">
							<Sparkles className="w-10 h-10 text-korea-white" />
						</div>
						<h1 className="text-5xl md:text-7xl font-bold text-foreground">
							개-사주
						</h1>
						<p className="text-xl md:text-2xl text-muted-foreground font-medium">
							AI가 풀어주는 나만의 사주 해석
						</p>
					</div>

					{/* 메인 설명 */}
					<div className="space-y-6 max-w-2xl mx-auto">
						<p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
							전통 사주명리학을 현대적으로 재해석하여 
							<strong className="text-korea-red"> 개인 맞춤형 </strong>
							운세 해석을 제공합니다.
						</p>
						<p className="text-muted-foreground">
							생년월일과 출생시간만으로 당신의 성격, 운세, 인생 방향을 알아보세요.
						</p>
					</div>

					{/* 메인 액션 버튼 */}
					<div className="space-y-6">
						<Button 
							size="lg" 
							className="bg-korea-red hover:bg-korea-red/90 text-korea-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
							onClick={() => setIsModalOpen(true)}
						>
							<Sparkles className="w-5 h-5 mr-3" />
							사주 분석 시작하기
						</Button>
						
						<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<span>✨ 완전 무료</span>
							<span>•</span>
							<span>⚡ 30초 완성</span>
							<span>•</span>
							<span>🎯 AI 개인화</span>
						</div>
					</div>
				</div>


			</main>

			{/* 사주 입력 모달 */}
			<SajuInputModal 
				isOpen={isModalOpen} 
				onClose={() => setIsModalOpen(false)} 
			/>
		</div>
	);
}