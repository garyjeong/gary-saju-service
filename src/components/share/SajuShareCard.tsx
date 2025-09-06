"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import { extractShareData } from "@/lib/share/share-utils";

interface SajuShareCardProps {
	sajuResult: SajuResult;
	sajuInput: SajuInputType;
	aiInterpretation?: any;
	className?: string;
}

const elementColors: Record<string, { bg: string; text: string; emoji: string }> = {
	'목': { bg: 'bg-green-100', text: 'text-green-700', emoji: '🌳' },
	'화': { bg: 'bg-red-100', text: 'text-red-700', emoji: '🔥' },
	'토': { bg: 'bg-yellow-100', text: 'text-yellow-700', emoji: '🏔️' },
	'금': { bg: 'bg-gray-100', text: 'text-gray-700', emoji: '⚔️' },
	'수': { bg: 'bg-blue-100', text: 'text-blue-700', emoji: '🌊' },
};

export default function SajuShareCard({ 
	sajuResult, 
	sajuInput, 
	aiInterpretation, 
	className = "" 
}: SajuShareCardProps) {
	const shareData = extractShareData(sajuResult, sajuInput, aiInterpretation);
	const elementConfig = elementColors[shareData.dominantElement] || elementColors['수'];

	return (
		<Card className={`glass-card border-none shadow-2xl overflow-hidden ${className}`}>
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
						{shareData.name}님의 사주
					</h3>
					<p className="text-base font-mono text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl">
						{shareData.birthInfo}
					</p>
				</div>

				{/* 주요 오행 */}
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
							<div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-lg ${elementConfig.bg}`}>
								{elementConfig.emoji}
							</div>
							<div className={`absolute -inset-1 rounded-full blur-md opacity-30 ${elementConfig.bg}`}></div>
						</div>
						<span className={`text-2xl font-serif font-bold ${elementConfig.text}`}>
							{shareData.dominantElement} 기운
						</span>
					</div>
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
						{shareData.keywords.map((keyword, index) => (
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

				{/* AI 요약 */}
				{shareData.summary && (
					<div className="relative pt-6">
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-muted-foreground/50 to-transparent"></div>
						<p className="text-lg font-serif text-foreground/90 italic leading-relaxed">
							"{shareData.summary}"
						</p>
					</div>
				)}

				{/* 푸터 */}
				<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
					<Sparkles className="w-3 h-3" />
					<span>개-사주에서 무료로 확인해보세요</span>
					<Sparkles className="w-3 h-3" />
				</div>
			</CardContent>
		</Card>
	);
}
