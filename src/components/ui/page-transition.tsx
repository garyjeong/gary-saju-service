"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// 🌟 페이지 전환 애니메이션 variants
const pageVariants = {
	initial: {
		opacity: 0,
		x: 20,
		scale: 0.98
	},
	animate: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			duration: 0.5,
			ease: "easeOut",
			staggerChildren: 0.1
		}
	},
	exit: {
		opacity: 0,
		x: -20,
		scale: 0.98,
		transition: {
			duration: 0.3,
			ease: "easeIn"
		}
	}
};

// 🌟 신비로운 전환 효과 variants
const mysticalTransition = {
	initial: {
		opacity: 0,
		y: 30,
		rotateX: -15,
		scale: 0.95
	},
	animate: {
		opacity: 1,
		y: 0,
		rotateX: 0,
		scale: 1,
		transition: {
			duration: 0.8,
			ease: [0.23, 1, 0.32, 1], // custom cubic-bezier
			staggerChildren: 0.15
		}
	},
	exit: {
		opacity: 0,
		y: -30,
		rotateX: 15,
		scale: 1.05,
		transition: {
			duration: 0.5,
			ease: "easeInOut"
		}
	}
};

// 🌟 배경 전환 효과 variants
const backgroundVariants = {
	initial: {
		opacity: 0,
		background: "radial-gradient(circle at 50% 50%, rgba(139, 102, 66, 0.05) 0%, transparent 70%)"
	},
	animate: {
		opacity: 1,
		background: [
			"radial-gradient(circle at 50% 50%, rgba(139, 102, 66, 0.05) 0%, transparent 70%)",
			"radial-gradient(circle at 30% 30%, rgba(184, 156, 118, 0.08) 0%, transparent 60%)",
			"radial-gradient(circle at 70% 70%, rgba(139, 102, 66, 0.06) 0%, transparent 80%)"
		],
		transition: {
			duration: 2,
			ease: "easeInOut",
			times: [0, 0.5, 1]
		}
	}
};

interface PageTransitionProps {
	children: React.ReactNode;
	className?: string;
	variant?: "default" | "mystical";
}

export default function PageTransition({ 
	children, 
	className = "",
	variant = "default" 
}: PageTransitionProps) {
	const pathname = usePathname();
	const variants = variant === "mystical" ? mysticalTransition : pageVariants;

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={pathname}
				className={`relative ${className}`}
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
				style={{ transformStyle: "preserve-3d" }}
			>
				{/* 🌟 배경 애니메이션 */}
				{variant === "mystical" && (
					<motion.div
						className="absolute inset-0 pointer-events-none"
						variants={backgroundVariants}
						initial="initial"
						animate="animate"
						style={{
							background: "radial-gradient(circle at 50% 50%, rgba(139, 102, 66, 0.05) 0%, transparent 70%)"
						}}
					/>
				)}
				
				{/* 페이지 콘텐츠 */}
				<motion.div
					className="relative z-10"
					variants={{
						initial: { opacity: 0 },
						animate: { 
							opacity: 1,
							transition: {
								delay: variant === "mystical" ? 0.2 : 0.1,
								duration: 0.6,
								staggerChildren: 0.1
							}
						}
					}}
				>
					{children}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

// 🌟 섹션별 애니메이션 컴포넌트
export function FadeInSection({ 
	children, 
	delay = 0,
	className = "" 
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ 
				delay,
				duration: 0.6,
				ease: "easeOut"
			}}
		>
			{children}
		</motion.div>
	);
}

// 🌟 스태거 애니메이션 컨테이너
export function StaggerContainer({ 
	children, 
	className = "",
	staggerDelay = 0.1 
}: {
	children: React.ReactNode;
	className?: string;
	staggerDelay?: number;
}) {
	return (
		<motion.div
			className={className}
			initial="hidden"
			animate="visible"
			variants={{
				visible: {
					transition: {
						staggerChildren: staggerDelay
					}
				}
			}}
		>
			{children}
		</motion.div>
	);
}

// 🌟 스태거 아이템
export function StaggerItem({ 
	children, 
	className = "" 
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: { 
					opacity: 1, 
					y: 0,
					transition: {
						duration: 0.5,
						ease: "easeOut"
					}
				}
			}}
		>
			{children}
		</motion.div>
	);
}
