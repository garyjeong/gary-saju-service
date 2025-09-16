"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, Zap, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

// 🌟 시간대별 운세 데이터
const getTimeBasedFortune = (hour: number): TimeBasedFortune => {
	if (hour >= 6 && hour < 12) {
		return {
			timeRange: "06:00 - 12:00",
			period: "아침 (巳時-午時)",
			fortune: "새로운 시작과 희망의 기운이 가득한 시간입니다",
			luckyElement: "목(木)",
			advice: "새로운 일을 시작하기에 좋은 시간입니다",
			score: 85,
			icon: Sunrise,
			color: "saju-wood"
		};
	} else if (hour >= 12 && hour < 18) {
		return {
			timeRange: "12:00 - 18:00",
			period: "오후 (未時-酉時)",
			fortune: "활발한 에너지와 성취의 기운이 강한 시간입니다",
			luckyElement: "화(火)",
			advice: "중요한 결정과 실행에 좋은 시간입니다",
			score: 92,
			icon: Sun,
			color: "saju-fire"
		};
	} else if (hour >= 18 && hour < 24) {
		return {
			timeRange: "18:00 - 24:00",
			period: "저녁 (戌時-亥時)",
			fortune: "성찰과 계획을 세우기에 좋은 차분한 시간입니다",
			luckyElement: "금(金)",
			advice: "하루를 정리하고 내일을 준비하세요",
			score: 78,
			icon: Sunset,
			color: "saju-metal"
		};
	} else {
		return {
			timeRange: "00:00 - 06:00",
			period: "새벽 (子時-寅時)",
			fortune: "깊은 통찰과 영감이 찾아오는 신비로운 시간입니다",
			luckyElement: "수(水)",
			advice: "명상과 휴식으로 에너지를 충전하세요",
			score: 68,
			icon: Moon,
			color: "saju-water"
		};
	}
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
						setFortune(getTimeBasedFortune(currentHour));
						setIsUpdating(false);
					}, 500);
				}
				
				return now;
			});
		};

		// 초기 로드
		const currentHour = new Date().getHours();
		setFortune(getTimeBasedFortune(currentHour));
		
		const interval = setInterval(updateTime, 60000); // 1분마다 업데이트

		return () => clearInterval(interval);
	}, []); // 빈 의존성 배열로 수정

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
						<h3 className="font-serif font-bold text-lg gradient-text">실시간 운세</h3>
						<p className="text-sm text-muted-foreground">
							{fortune.timeRange} · {fortune.period}
						</p>
					</div>
				</div>
				
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

					{/* 행운의 원소 */}
					<motion.div 
						className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-background/50 to-background/80 border border-border/50"
						whileHover={{ scale: 1.02 }}
					>
						<Star className="w-5 h-5 text-saju-traditional-gold" />
						<div>
							<span className="text-sm text-muted-foreground">행운의 원소: </span>
							<span className={cn("font-medium", `text-${fortune.color}`)}>
								{fortune.luckyElement}
							</span>
						</div>
					</motion.div>
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
