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

// 🌊 부드러운 슬라이드 전환
const smoothSlideTransition = {
	initial: {
		opacity: 0,
		x: 60,
		filter: "blur(8px)"
	},
	animate: {
		opacity: 1,
		x: 0,
		filter: "blur(0px)",
		transition: {
			duration: 0.6,
			ease: [0.25, 0.46, 0.45, 0.94],
			staggerChildren: 0.08
		}
	},
	exit: {
		opacity: 0,
		x: -60,
		filter: "blur(8px)",
		transition: {
			duration: 0.4,
			ease: "easeIn"
		}
	}
};

// ⚡ 빠른 스케일 전환 
const quickScaleTransition = {
	initial: {
		opacity: 0,
		scale: 1.1,
		filter: "blur(10px)"
	},
	animate: {
		opacity: 1,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			duration: 0.4,
			ease: "easeOut",
			staggerChildren: 0.05
		}
	},
	exit: {
		opacity: 0,
		scale: 0.9,
		filter: "blur(5px)",
		transition: {
			duration: 0.3,
			ease: "easeIn"
		}
	}
};

// 🌀 회전 페이드 전환
const rotationFadeTransition = {
	initial: {
		opacity: 0,
		rotateY: -30,
		scale: 0.9,
		filter: "brightness(0.7)"
	},
	animate: {
		opacity: 1,
		rotateY: 0,
		scale: 1,
		filter: "brightness(1)",
		transition: {
			duration: 0.7,
			ease: [0.23, 1, 0.32, 1],
			staggerChildren: 0.12
		}
	},
	exit: {
		opacity: 0,
		rotateY: 30,
		scale: 1.1,
		filter: "brightness(1.3)",
		transition: {
			duration: 0.5,
			ease: "easeInOut"
		}
	}
};

interface PageTransitionProps {
	children: React.ReactNode;
	className?: string;
	variant?: "default" | "mystical" | "smooth-slide" | "quick-scale" | "rotation-fade";
}

export default function PageTransition({ 
	children, 
	className = "",
	variant = "default" 
}: PageTransitionProps) {
	const pathname = usePathname();
	
	// 🌟 variant별 애니메이션 선택
	const getVariants = () => {
		switch (variant) {
			case "mystical":
				return mysticalTransition;
			case "smooth-slide":
				return smoothSlideTransition;
			case "quick-scale":
				return quickScaleTransition;
			case "rotation-fade":
				return rotationFadeTransition;
			default:
				return pageVariants;
		}
	};
	
	const variants = getVariants();

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

// 🌟 마이크로 인터랙션 variants
const microInteractionVariants = {
	button: {
		rest: { 
			scale: 1, 
			boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
			filter: "brightness(1)"
		},
		hover: { 
			scale: 1.02, 
			boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
			filter: "brightness(1.05)",
			transition: { duration: 0.2, ease: "easeOut" }
		},
		tap: { 
			scale: 0.98,
			boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
			filter: "brightness(0.95)",
			transition: { duration: 0.1, ease: "easeIn" }
		}
	},
	card: {
		rest: { 
			scale: 1, 
			rotateY: 0,
			boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
			filter: "brightness(1)"
		},
		hover: { 
			scale: 1.03, 
			rotateY: 2,
			boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
			filter: "brightness(1.02)",
			transition: { 
				duration: 0.3, 
				ease: "easeOut",
				type: "spring",
				stiffness: 300,
				damping: 20
			}
		}
	},
	link: {
		rest: { 
			scale: 1,
			color: "inherit"
		},
		hover: { 
			scale: 1.05,
			transition: { duration: 0.2, ease: "easeOut" }
		},
		tap: { 
			scale: 0.95,
			transition: { duration: 0.1, ease: "easeIn" }
		}
	},
	icon: {
		rest: { 
			scale: 1, 
			rotate: 0,
			filter: "brightness(1)"
		},
		hover: { 
			scale: 1.1, 
			rotate: 5,
			filter: "brightness(1.2)",
			transition: { 
				duration: 0.2, 
				ease: "easeOut",
				type: "spring",
				stiffness: 400,
				damping: 15
			}
		},
		tap: { 
			scale: 0.9, 
			rotate: -5,
			filter: "brightness(0.8)",
			transition: { duration: 0.1, ease: "easeIn" }
		}
	}
};

// 🌟 마이크로 인터랙션 컴포넌트
export function MicroInteraction({
	children,
	type = "button",
	className = "",
	disabled = false,
	...props
}: {
	children: React.ReactNode;
	type?: keyof typeof microInteractionVariants;
	className?: string;
	disabled?: boolean;
	[key: string]: any;
}) {
	const variants = microInteractionVariants[type];
	
	return (
		<motion.div
			className={className}
			variants={variants}
			initial="rest"
			whileHover={disabled ? "rest" : "hover"}
			whileTap={disabled ? "rest" : "tap"}
			animate="rest"
			style={{ transformStyle: "preserve-3d" }}
			{...props}
		>
			{children}
		</motion.div>
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

// 🌟 로딩 상태 전환 컴포넌트
export function LoadingTransition({
	isLoading,
	loadingContent,
	children,
	className = ""
}: {
	isLoading: boolean;
	loadingContent: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`relative ${className}`}>
			<AnimatePresence mode="wait">
				{isLoading ? (
					<motion.div
						key="loading"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.1 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
						className="absolute inset-0 flex items-center justify-center z-50"
					>
						{loadingContent}
					</motion.div>
				) : (
					<motion.div
						key="content"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.4, ease: "easeOut" }}
					>
						{children}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// 🌟 스크롤 기반 애니메이션 훅
export function useScrollAnimation() {
	const [isVisible, setIsVisible] = React.useState(false);
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.unobserve(entry.target);
				}
			},
			{ threshold: 0.1 }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, []);

	return { ref, isVisible };
}

// 🌟 스크롤 애니메이션 컴포넌트
export function ScrollReveal({
	children,
	className = "",
	delay = 0,
	direction = "up"
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "down" | "left" | "right";
}) {
	const { ref, isVisible } = useScrollAnimation();

	const getInitialPosition = () => {
		switch (direction) {
			case "up": return { y: 50 };
			case "down": return { y: -50 };
			case "left": return { x: 50 };
			case "right": return { x: -50 };
			default: return { y: 50 };
		}
	};

	return (
		<motion.div
			ref={ref}
			className={className}
			initial={{ 
				opacity: 0,
				...getInitialPosition()
			}}
			animate={isVisible ? {
				opacity: 1,
				x: 0,
				y: 0
			} : {}}
			transition={{
				duration: 0.6,
				delay,
				ease: "easeOut"
			}}
		>
			{children}
		</motion.div>
	);
}
