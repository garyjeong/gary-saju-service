"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, Zap, Sun, Moon, Sunrise, Sunset, RefreshCw, Eye, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 시간대별 운세 타입
interface TimeBasedFortune {
	timeRange: string;
	period: string;
	fortune: string;
	luckyElement: string;
	advice: string;
	score: number;
	icon: typeof Sun;
	color: string;
	luckyNumbers: number[];
	keywords: string[];
	detailedFortune: string;
	caution: string;
}

// 🌟 다양한 운세 배열 (같은 시간대에도 다른 운세)
const getRandomFortuneVariant = (baseData: any, hour: number, variantIndex: number = 0) => {
	const variants = {
		morning: [
			{
				fortune: "새로운 시작과 희망의 기운이 가득한 시간입니다",
				advice: "새로운 일을 시작하기에 좋은 시간입니다",
				detailedFortune: "목의 기운이 강해 성장과 발전의 에너지가 충만합니다. 창의적인 아이디어가 떠오르기 쉬운 시간이니 새로운 프로젝트를 시작해보세요.",
				keywords: ["시작", "성장", "창의"],
				caution: "서두르지 말고 차근차근 진행하세요",
				luckyNumbers: [3, 8, 15]
			},
			{
				fortune: "활력과 생명력이 넘치는 상승 기운의 시간입니다",
				advice: "운동이나 건강 관리에 집중해보세요",
				detailedFortune: "동방 청룡의 기운이 강해 체력과 정신력이 모두 상승합니다. 새로운 인연을 만나거나 중요한 연락이 올 가능성이 높습니다.",
				keywords: ["활력", "건강", "인연"],
				caution: "과도한 자신감은 금물입니다",
				luckyNumbers: [7, 14, 21]
			}
		],
		afternoon: [
			{
				fortune: "활발한 에너지와 성취의 기운이 강한 시간입니다",
				advice: "중요한 결정과 실행에 좋은 시간입니다",
				detailedFortune: "화의 기운이 절정에 달해 추진력과 결단력이 최고조입니다. 미뤄둔 일들을 해결하거나 중요한 미팅을 잡기에 최적의 시간입니다.",
				keywords: ["성취", "결정", "추진"],
				caution: "감정적인 판단보다는 이성적 사고를",
				luckyNumbers: [2, 9, 16]
			},
			{
				fortune: "열정과 성공의 기운이 최고조에 달한 황금 시간입니다",
				advice: "승부를 건다면 지금이 기회입니다",
				detailedFortune: "남방 주작의 기운으로 리더십과 카리스마가 빛납니다. 프레젠테이션이나 중요한 발표, 협상에서 좋은 결과를 얻을 수 있습니다.",
				keywords: ["열정", "성공", "리더십"],
				caution: "너무 공격적이면 반발을 부를 수 있어요",
				luckyNumbers: [5, 12, 19]
			}
		],
		evening: [
			{
				fortune: "성찰과 계획을 세우기에 좋은 차분한 시간입니다",
				advice: "하루를 정리하고 내일을 준비하세요",
				detailedFortune: "금의 기운이 강해 정리정돈과 마무리에 적합합니다. 중요한 서류를 정리하거나 미래 계획을 세우기에 좋은 시간입니다.",
				keywords: ["성찰", "정리", "계획"],
				caution: "너무 완벽주의에 빠지지 마세요",
				luckyNumbers: [4, 11, 18]
			},
			{
				fortune: "지혜와 통찰력이 빛나는 황혼의 시간입니다",
				advice: "독서나 학습에 집중해보세요",
				detailedFortune: "서방 백호의 기운으로 분석력과 판단력이 향상됩니다. 복잡한 문제를 해결하거나 중요한 결론을 내리기에 적합한 시간입니다.",
				keywords: ["지혜", "분석", "결론"],
				caution: "비관적 사고에 빠지지 않도록 주의",
				luckyNumbers: [6, 13, 20]
			}
		],
		night: [
			{
				fortune: "깊은 통찰과 영감이 찾아오는 신비로운 시간입니다",
				advice: "명상과 휴식으로 에너지를 충전하세요",
				detailedFortune: "수의 기운이 강해 직감과 영감이 예민해집니다. 예술적 영감을 얻거나 중요한 아이디어가 떠오를 수 있는 시간입니다.",
				keywords: ["직감", "영감", "휴식"],
				caution: "부정적인 생각은 멀리하세요",
				luckyNumbers: [1, 10, 17]
			},
			{
				fortune: "무의식의 지혜가 깨어나는 신성한 밤의 시간입니다",
				advice: "조용한 곳에서 내면의 소리에 귀 기울여보세요",
				detailedFortune: "북방 현무의 기운으로 깊은 성찰과 정신적 성장이 가능합니다. 중요한 깨달음을 얻거나 인생의 방향을 재정립할 수 있습니다.",
				keywords: ["성찰", "깨달음", "성장"],
				caution: "과도한 고민은 오히려 독이 됩니다",
				luckyNumbers: [8, 15, 22]
			}
		]
	};

	let timeKey: keyof typeof variants;
	if (hour >= 6 && hour < 12) timeKey = 'morning';
	else if (hour >= 12 && hour < 18) timeKey = 'afternoon';
	else if (hour >= 18 && hour < 24) timeKey = 'evening';
	else timeKey = 'night';

	const selectedVariant = variants[timeKey][variantIndex % variants[timeKey].length];
	
	return {
		...baseData,
		...selectedVariant
	};
};

// 🌟 시간대별 운세 데이터
const getTimeBasedFortune = (hour: number, variantIndex: number = 0): TimeBasedFortune => {
	let baseData: Omit<TimeBasedFortune, 'fortune' | 'advice' | 'detailedFortune' | 'keywords' | 'caution' | 'luckyNumbers'>;
	
	if (hour >= 6 && hour < 12) {
		baseData = {
			timeRange: "06:00 - 12:00",
			period: "아침 (巳時-午時)",
			luckyElement: "목(木)",
			score: 85,
			icon: Sunrise,
			color: "saju-wood"
		};
	} else if (hour >= 12 && hour < 18) {
		baseData = {
			timeRange: "12:00 - 18:00",
			period: "오후 (未時-酉時)",
			luckyElement: "화(火)",
			score: 92,
			icon: Sun,
			color: "saju-fire"
		};
	} else if (hour >= 18 && hour < 24) {
		baseData = {
			timeRange: "18:00 - 24:00",
			period: "저녁 (戌時-亥時)",
			luckyElement: "금(金)",
			score: 78,
			icon: Sunset,
			color: "saju-metal"
		};
	} else {
		baseData = {
			timeRange: "00:00 - 06:00",
			period: "새벽 (子時-寅時)",
			luckyElement: "수(水)",
			score: 68,
			icon: Moon,
			color: "saju-water"
		};
	}

	return getRandomFortuneVariant(baseData, hour, variantIndex);
};

// 🌟 운세 점수별 색상
const getScoreColor = (score: number) => {
	if (score >= 90) return "text-saju-traditional-gold";
	if (score >= 80) return "text-saju-fire";
	if (score >= 70) return "text-saju-wood";
	return "text-saju-water";
};

interface RealtimeFortuneWidgetProps {
	className?: string;
}

export default function RealtimeFortuneWidget({ className }: RealtimeFortuneWidgetProps) {
	const [currentTime, setCurrentTime] = useState(new Date());
	const [fortune, setFortune] = useState<TimeBasedFortune | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [fortuneVariantIndex, setFortuneVariantIndex] = useState(0);
	const [showDetailedView, setShowDetailedView] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// 🌟 실시간 시간 업데이트
	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const currentHour = now.getHours();
			
			setCurrentTime(prev => {
				const previousHour = prev.getHours();
				
				// 시간대가 바뀌면 운세 업데이트 애니메이션
				if (previousHour !== currentHour) {
					setIsUpdating(true);
					setTimeout(() => {
						setFortune(getTimeBasedFortune(currentHour, fortuneVariantIndex));
						setIsUpdating(false);
					}, 500);
				}
				
				return now;
			});
		};

		// 초기 로드
		const currentHour = new Date().getHours();
		setFortune(getTimeBasedFortune(currentHour, fortuneVariantIndex));
		
		const interval = setInterval(updateTime, 60000); // 1분마다 업데이트

		return () => clearInterval(interval);
	}, [fortuneVariantIndex]);

	// 🔄 운세 새로고침 함수
	const refreshFortune = () => {
		setIsRefreshing(true);
		const currentHour = new Date().getHours();
		const newVariantIndex = (fortuneVariantIndex + 1) % 2; // 0과 1 사이에서 변경
		
		setTimeout(() => {
			setFortuneVariantIndex(newVariantIndex);
			setFortune(getTimeBasedFortune(currentHour, newVariantIndex));
			setIsRefreshing(false);
		}, 800);
	};

	if (!fortune) return null;

	const FortuneIcon = fortune.icon;

	return (
		<motion.div
			className={cn(
				"hanji-card p-6 relative overflow-hidden",
				className
			)}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			{/* 🌟 배경 그라디언트 */}
			<div className="absolute inset-0 bg-gradient-to-br from-saju-cosmic-nebula/10 via-transparent to-saju-cosmic-starlight/10" />
			
			{/* 🌟 헤더 */}
			<div className="relative z-10 flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<motion.div
						className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20"
						whileHover={{ scale: 1.05 }}
						animate={{ 
							boxShadow: [
								"0 0 20px rgba(45, 80, 22, 0.3)",
								"0 0 30px rgba(45, 80, 22, 0.5)",
								"0 0 20px rgba(45, 80, 22, 0.3)"
							]
						}}
						transition={{ duration: 2, repeat: Infinity }}
					>
						<Clock className="w-6 h-6 text-primary" />
					</motion.div>
					<div>
						<div className="flex items-center gap-2">
							<h3 className="font-serif font-bold text-lg gradient-text">실시간 운세</h3>
							<Badge variant="secondary" className="text-xs">
								<Sparkles className="w-3 h-3 mr-1" />
								{fortuneVariantIndex === 0 ? "기본" : "확장"}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground">
							{fortune.timeRange} · {fortune.period}
						</p>
					</div>
				</div>
				
				<div className="flex items-center gap-3">
					{/* 컨트롤 버튼들 */}
					<div className="flex gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={refreshFortune}
							disabled={isRefreshing || isUpdating}
							className="w-8 h-8 p-0"
						>
							<motion.div
								animate={isRefreshing ? { rotate: 360 } : {}}
								transition={{ duration: 0.8, ease: "easeInOut" }}
							>
								<RefreshCw className="w-4 h-4" />
							</motion.div>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowDetailedView(!showDetailedView)}
							className="w-8 h-8 p-0"
						>
							<Eye className="w-4 h-4" />
						</Button>
					</div>
					
					{/* 점수 및 시간 */}
					<div className="text-right">
						<motion.p 
							className="text-sm text-muted-foreground"
							key={currentTime.toTimeString()}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
						>
							{currentTime.toLocaleTimeString('ko-KR', { 
								hour: '2-digit', 
								minute: '2-digit' 
							})}
						</motion.p>
						<motion.div 
							className={cn("text-2xl font-bold", getScoreColor(fortune.score))}
							animate={{ 
								scale: [1, 1.05, 1],
							}}
							transition={{ duration: 2, repeat: Infinity }}
						>
							{fortune.score}점
						</motion.div>
					</div>
				</div>
			</div>

			{/* 🌟 메인 컨텐츠 */}
			<AnimatePresence mode="wait">
				<motion.div
					key={fortune.period}
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.5 }}
					className="relative z-10"
				>
					{/* 아이콘과 운세 */}
					<div className="flex items-start gap-4 mb-4">
						<motion.div
							className={cn(
								"p-4 rounded-2xl border-2",
								`border-${fortune.color}/30 bg-${fortune.color}/10`
							)}
							whileHover={{ scale: 1.1 }}
							animate={{ 
								rotate: [0, 5, -5, 0],
							}}
							transition={{ duration: 4, repeat: Infinity }}
						>
							<FortuneIcon className={cn("w-8 h-8", `text-${fortune.color}`)} />
						</motion.div>
						
						<div className="flex-1">
							<p className="saju-interpretation text-base mb-2">
								{fortune.fortune}
							</p>
							<p className="text-sm text-muted-foreground">
								{fortune.advice}
							</p>
						</div>
					</div>

					{/* 키워드 태그들 */}
					<div className="flex flex-wrap gap-2 mb-4">
						{fortune.keywords.map((keyword, index) => (
							<motion.div
								key={keyword}
								className="px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1 * index }}
								whileHover={{ scale: 1.05 }}
							>
								<span className="text-xs font-medium gradient-text">#{keyword}</span>
							</motion.div>
						))}
					</div>

					{/* 행운의 원소와 숫자 */}
					<div className="grid grid-cols-2 gap-3 mb-4">
						<motion.div 
							className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-background/50 to-background/80 border border-border/50"
							whileHover={{ scale: 1.02 }}
						>
							<Star className="w-5 h-5 text-saju-traditional-gold" />
							<div>
								<span className="text-xs text-muted-foreground block">행운의 원소</span>
								<span className={cn("font-medium text-sm", `text-${fortune.color}`)}>
									{fortune.luckyElement}
								</span>
							</div>
						</motion.div>
						
						<motion.div 
							className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-background/50 to-background/80 border border-border/50"
							whileHover={{ scale: 1.02 }}
						>
							<Zap className="w-5 h-5 text-saju-traditional-gold" />
							<div>
								<span className="text-xs text-muted-foreground block">행운의 숫자</span>
								<span className="font-medium text-sm gradient-text">
									{fortune.luckyNumbers.join(', ')}
								</span>
							</div>
						</motion.div>
					</div>

					{/* 상세보기 토글 */}
					<AnimatePresence>
						{showDetailedView && (
							<motion.div
								className="space-y-3"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
							>
								{/* 상세 운세 */}
								<div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20">
									<div className="flex items-center gap-2 mb-2">
										<Info className="w-4 h-4 text-accent" />
										<span className="text-sm font-medium text-accent">상세 해석</span>
									</div>
									<p className="text-sm text-foreground/80 leading-relaxed">
										{fortune.detailedFortune}
									</p>
								</div>
								
								{/* 주의사항 */}
								<div className="p-4 rounded-xl bg-gradient-to-br from-destructive/5 to-orange-500/5 border border-destructive/20">
									<div className="flex items-center gap-2 mb-2">
										<Sparkles className="w-4 h-4 text-destructive" />
										<span className="text-sm font-medium text-destructive">주의사항</span>
									</div>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{fortune.caution}
									</p>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</AnimatePresence>

			{/* 🌟 업데이트 인디케이터 */}
			{isUpdating && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-br from-saju-cosmic-starlight/20 to-saju-cosmic-purple/20 flex items-center justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="p-4 rounded-2xl bg-background/90 border border-saju-traditional-gold/30"
						animate={{ scale: [1, 1.05, 1] }}
						transition={{ duration: 0.5, repeat: 2 }}
					>
						<Zap className="w-8 h-8 text-saju-traditional-gold" />
					</motion.div>
				</motion.div>
			)}

			{/* 🌟 장식 요소 */}
			<motion.div
				className="absolute top-2 right-2 w-2 h-2 bg-saju-cosmic-starlight rounded-full"
				animate={{ 
					scale: [1, 1.5, 1],
					opacity: [0.3, 1, 0.3]
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
				}}
			/>
			<motion.div
				className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-saju-traditional-gold rounded-full"
				animate={{ 
					scale: [1, 1.3, 1],
					opacity: [0.5, 0.9, 0.5]
				}}
				transition={{
					duration: 2.5,
					repeat: Infinity,
					delay: 1
				}}
			/>
		</motion.div>
	);
}
