"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Crown, Zap } from "lucide-react";
import { SajuResult } from "@/lib/saju/types";
import { SajuInputType } from "@/lib/saju/validation";
import { extractShareData } from "@/lib/share/share-utils";

interface SajuShareCardProps {
	sajuResult: SajuResult;
	sajuInput: SajuInputType;
	aiInterpretation?: any;
	className?: string;
}

// 🌟 전통 한국 오행 색상 시스템 (사주나우 테마)
const elementColors: Record<string, { 
	bg: string; 
	gradient: string; 
	text: string; 
	border: string; 
	shadow: string; 
	emoji: string; 
	bgClass: string;
	borderClass: string;
}> = {
	'목': { 
		bg: 'bg-saju-wood/20', 
		gradient: 'from-saju-wood/10 to-saju-wood/30',
		text: 'text-saju-wood', 
		border: 'border-saju-wood/30',
		shadow: 'shadow-saju-wood/20',
		emoji: '🌳',
		bgClass: 'bg-saju-wood',
		borderClass: 'border-saju-wood'
	},
	'화': { 
		bg: 'bg-saju-fire/20', 
		gradient: 'from-saju-fire/10 to-saju-fire/30',
		text: 'text-saju-fire', 
		border: 'border-saju-fire/30',
		shadow: 'shadow-saju-fire/20',
		emoji: '🔥',
		bgClass: 'bg-saju-fire',
		borderClass: 'border-saju-fire'
	},
	'토': { 
		bg: 'bg-saju-earth/20', 
		gradient: 'from-saju-earth/10 to-saju-earth/30',
		text: 'text-saju-earth', 
		border: 'border-saju-earth/30',
		shadow: 'shadow-saju-earth/20',
		emoji: '🏔️',
		bgClass: 'bg-saju-earth',
		borderClass: 'border-saju-earth'
	},
	'금': { 
		bg: 'bg-saju-metal/20', 
		gradient: 'from-saju-metal/10 to-saju-metal/30',
		text: 'text-saju-metal', 
		border: 'border-saju-metal/30',
		shadow: 'shadow-saju-metal/20',
		emoji: '⚔️',
		bgClass: 'bg-saju-metal',
		borderClass: 'border-saju-metal'
	},
	'수': { 
		bg: 'bg-saju-water/20', 
		gradient: 'from-saju-water/10 to-saju-water/30',
		text: 'text-saju-water', 
		border: 'border-saju-water/30',
		shadow: 'shadow-saju-water/20',
		emoji: '🌊',
		bgClass: 'bg-saju-water',
		borderClass: 'border-saju-water'
	},
};

export default function SajuShareCard({ 
	sajuResult, 
	sajuInput, 
	aiInterpretation, 
	className = "" 
}: SajuShareCardProps) {
	const shareData = extractShareData(sajuResult, sajuInput, aiInterpretation);
	const elementConfig = elementColors[shareData.dominantElement] || elementColors['수'];

	// 애니메이션 variants
	const cardVariants = {
		hidden: { opacity: 0, scale: 0.95, y: 20 },
		visible: { 
			opacity: 1, 
			scale: 1, 
			y: 0,
			transition: { 
				duration: 0.6, 
				ease: "easeOut",
				staggerChildren: 0.1 
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { 
			opacity: 1, 
			y: 0,
			transition: { duration: 0.4, ease: "easeOut" }
		}
	};

	return (
		<motion.div
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			className={className}
		>
			<Card className="hanji-card border-none shadow-2xl overflow-hidden relative group">
				{/* 🌟 전통 한지 배경 텍스처 */}
				<div className={`absolute inset-0 bg-gradient-to-br ${elementConfig.gradient} opacity-30`}></div>
				<div 
					className="absolute inset-0 opacity-20"
					style={{
						backgroundImage: `
							radial-gradient(circle at 25% 25%, ${elementConfig.bgClass.replace('bg-', 'var(--color-')}40 0%, transparent 50%),
							radial-gradient(circle at 75% 75%, ${elementConfig.bgClass.replace('bg-', 'var(--color-')}20 0%, transparent 50%)
						`
					}}
				></div>
				
				{/* 🌟 우주적 별빛 효과 */}
				<div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-saju-cosmic-starlight/60 animate-star-twinkle"></div>
				<div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-saju-cosmic-starlight/40 animate-star-twinkle" style={{ animationDelay: '1s' }}></div>
				<div className="absolute top-1/3 left-4 w-1.5 h-1.5 rounded-full bg-saju-cosmic-starlight/50 animate-star-twinkle" style={{ animationDelay: '2s' }}></div>
				
				<CardContent className="p-8 md:p-12 text-center space-y-8 relative z-10">
					{/* 🌟 브랜드 로고 (전통 도장 스타일) */}
					<motion.div 
						variants={itemVariants}
						className="flex items-center justify-center gap-4"
					>
						<div className="relative group/logo">
							<div className="w-16 h-16 bg-gradient-to-br from-saju-traditional-gold to-saju-traditional-red rounded-3xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-all duration-300 border-2 border-saju-traditional-gold/30">
								<Crown className="w-8 h-8 text-saju-traditional-white animate-mystic-glow" />
							</div>
							<div className="absolute -inset-2 bg-gradient-to-r from-saju-traditional-gold/30 to-saju-traditional-red/30 rounded-3xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500"></div>
						</div>
						<span className="text-3xl md:text-4xl font-serif font-black title-calligraphy">
							개-사주
						</span>
					</motion.div>

					{/* 🌟 메인 정보 (서예체 스타일) */}
					<motion.div variants={itemVariants} className="space-y-6">
						<h3 className="text-4xl md:text-5xl font-serif font-bold ink-text animate-ink-spread">
							{shareData.name}님의 사주
						</h3>
						<div className="relative">
							<p className="saju-data bg-gradient-to-r from-saju-traditional-white/80 to-saju-traditional-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-saju-traditional-gold/20 shadow-lg">
								{shareData.birthInfo}
							</p>
							<div className="absolute -inset-1 bg-gradient-to-r from-saju-traditional-gold/20 to-transparent rounded-2xl blur-sm"></div>
						</div>
					</motion.div>

					{/* 🌟 주요 오행 (전통 원소 표현) */}
					<motion.div variants={itemVariants} className="space-y-6">
						<div className="flex items-center justify-center gap-3">
							<Star className="w-4 h-4 text-saju-traditional-gold animate-star-twinkle" />
							<p className="label-calm text-saju-traditional-gold">
								주도적 오행
							</p>
							<Star className="w-4 h-4 text-saju-traditional-gold animate-star-twinkle" style={{ animationDelay: '0.5s' }} />
						</div>
						<div className="flex items-center justify-center gap-6">
							<motion.div 
								className="relative element-card p-4 rounded-3xl border-2 bg-gradient-to-br from-saju-traditional-white/90 to-saju-traditional-white/70 backdrop-blur-sm"
								whileHover={{ 
									scale: 1.1, 
									rotateY: 10,
									boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
								}}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<div className={`w-12 h-12 rounded-full ${elementConfig.bg} ${elementConfig.border} border-4 flex items-center justify-center text-2xl shadow-lg backdrop-blur-sm`}>
									{elementConfig.emoji}
								</div>
								<div className={`absolute -inset-1 rounded-3xl blur-lg opacity-0 hover:opacity-50 transition-opacity duration-300 ${elementConfig.bgClass}`}></div>
							</motion.div>
							<div className="text-center">
								<span className={`number-large ${elementConfig.text} drop-shadow-sm`}>
									{shareData.dominantElement}
								</span>
								<p className="label-calm mt-1">기운</p>
							</div>
						</div>
					</motion.div>

					{/* 🌟 주요 키워드 (전통 부적 스타일) */}
					<motion.div variants={itemVariants} className="space-y-6">
						<div className="flex items-center justify-center gap-3">
							<Zap className="w-4 h-4 text-saju-cosmic-starlight animate-star-twinkle" />
							<p className="label-calm text-saju-cosmic-starlight">
								나의 특성
							</p>
							<Zap className="w-4 h-4 text-saju-cosmic-starlight animate-star-twinkle" style={{ animationDelay: '0.7s' }} />
						</div>
						<div className="flex flex-wrap justify-center gap-4">
							{shareData.keywords.map((keyword, index) => (
								<motion.div
									key={keyword}
									variants={itemVariants}
									whileHover={{ 
										scale: 1.15, 
										rotate: index % 2 === 0 ? 3 : -3,
									}}
									className="stamp-button"
									style={{ animationDelay: `${index * 200}ms` }}
								>
									<Badge
										variant="secondary"
										className={`px-5 py-2.5 bg-gradient-to-br ${elementConfig.gradient} ${elementConfig.border} border-2 font-semibold text-base ${elementConfig.text} shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
									>
										{keyword}
									</Badge>
								</motion.div>
							))}
						</div>
					</motion.div>

					{/* 🌟 AI 요약 (한지 스크롤 스타일) */}
					{shareData.summary && (
						<motion.div variants={itemVariants} className="relative pt-8">
							<div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-saju-traditional-gold/50 to-transparent"></div>
							<div className="hanji-card p-6 bg-gradient-to-br from-saju-traditional-white/95 to-saju-traditional-white/85 backdrop-blur-sm border border-saju-traditional-gold/20 shadow-xl">
								<p className="saju-interpretation emphasis-mystic text-lg leading-relaxed">
									&ldquo;{shareData.summary}&rdquo;
								</p>
							</div>
						</motion.div>
					)}

					{/* 🌟 푸터 (전통 인장 스타일) */}
					<motion.div 
						variants={itemVariants}
						className="flex items-center justify-center gap-3 pt-4"
					>
						<Sparkles className="w-4 h-4 text-saju-cosmic-starlight animate-star-twinkle" />
						<span className="label-calm text-saju-cosmic-purple">
							개-사주에서 무료로 확인해보세요
						</span>
						<Sparkles className="w-4 h-4 text-saju-cosmic-starlight animate-star-twinkle" style={{ animationDelay: '1.5s' }} />
					</motion.div>

					{/* 🌟 장식 요소들 (우주적 오브) */}
					<div className="absolute top-8 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-saju-cosmic-nebula/30 to-saju-cosmic-purple/20 animate-cosmic-float opacity-60"></div>
					<div className="absolute bottom-12 right-12 w-6 h-6 rounded-full bg-gradient-to-br from-saju-cosmic-starlight/40 to-saju-cosmic-moonlight/30 animate-cosmic-float opacity-50" style={{ animationDelay: '2s' }}></div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
