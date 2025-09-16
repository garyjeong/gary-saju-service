/**
 * 개-사주 모바일 최적화 시간 선택 컴포넌트
 * 터치 친화적 인터페이스
 */

'use client';

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface MobileTimePickerProps {
	value?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
	placeholder?: string;
}

export const MobileTimePicker = React.forwardRef<
	HTMLDivElement,
	MobileTimePickerProps
>(({
	value,
	onValueChange,
	disabled = false,
	className,
	placeholder = "시간을 선택해 주세요",
	...props
}, ref) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [isMobile, setIsMobile] = React.useState(false);
	
	React.useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// 시간 옵션 생성 (30분 간격)
	const timeOptions = React.useMemo(() => {
		const options = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
				options.push({
					value: timeString,
					label: timeString,
					period: hour < 12 ? '오전' : '오후',
					displayHour: hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
				});
			}
		}
		return options;
	}, []);

	const selectedTime = timeOptions.find(option => option.value === value);

	const handleTimeSelect = (selectedValue: string) => {
		onValueChange?.(selectedValue);
		setIsOpen(false);
	};

	// 모바일 네이티브 time input 사용 (한국 전통 스타일)
	if (isMobile) {
		return (
			<div ref={ref} className={cn("relative", className)} {...props}>
				<input
					type="time"
					value={value || ''}
					onChange={(e) => onValueChange?.(e.target.value)}
					disabled={disabled}
					className={cn(
						// 🌟 한국 전통 한지 스타일 배경
						"w-full h-12 px-4 py-3 text-base bg-card text-card-foreground",
						"border-2 border-korea-white-500/20 rounded-xl",
						// 🌟 전통 그림자 효과 (안정적 호버)
						"shadow-sm hover:shadow-md hover:border-korea-yellow/30 transition-all duration-300",
						// 🌟 포커스 상태 - 전통 금색 테두리
						"focus:outline-none focus:ring-2 focus:ring-korea-yellow/30 focus:border-korea-red/50",
						// 🌟 비활성화 상태
						"disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
						"appearance-none cursor-pointer",
						// 🌟 다크 모드 대응
						"dark:bg-card dark:border-korea-black-500/30 dark:focus:border-korea-yellow/50"
					)}
					style={{
						fontSize: '16px', // iOS zoom 방지
						backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
					}}
				/>
				
				{/* 🌟 한국 전통 시계 아이콘 */}
				<div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
					<div className="w-6 h-6 rounded-full bg-korea-yellow/10 flex items-center justify-center">
						<Clock className="h-4 w-4 text-korea-red" />
					</div>
				</div>
			</div>
		);
	}

	// 데스크톱 커스텀 시간 선택기 (한국 전통 스타일)
	return (
		<div ref={ref} className={cn("relative", className)} {...props}>
			{/* 🌟 한국 전통 한지 카드 스타일 버튼 */}
			<button
				type="button"
				disabled={disabled}
				className={cn(
					// 🌟 기본 레이아웃
					"w-full h-12 px-4 py-3 text-left font-medium",
					"flex items-center justify-between",
					// 🌟 한국 전통 한지 배경
					"bg-card text-card-foreground border-2 border-korea-white-500/20",
					"rounded-xl shadow-sm transition-all duration-300",
					// 🌟 호버 상태 - 안정적인 시각적 피드백
					"hover:shadow-md hover:border-korea-yellow/30",
					// 🌟 포커스 상태 - 전통 금색 테두리
					"focus:outline-none focus:ring-2 focus:ring-korea-yellow/30 focus:border-korea-red/50",
					// 🌟 활성 상태 (열린 상태)
					isOpen && "border-korea-red/50 shadow-md",
					// 🌟 비활성화 상태
					"disabled:cursor-not-allowed disabled:opacity-60",
					// 🌟 텍스트 상태
					!selectedTime && "text-foreground-muted",
					// 🌟 다크 모드 대응
					"dark:bg-card dark:border-korea-black-500/30 dark:hover:border-korea-yellow/30"
				)}
				onClick={() => !disabled && setIsOpen(!isOpen)}
				style={{
					backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
				}}
			>
				<span className="flex items-center gap-3">
					{/* 🌟 전통 시계 아이콘 */}
					<div className="w-6 h-6 rounded-full bg-korea-yellow/10 flex items-center justify-center">
						<Clock className="h-4 w-4 text-korea-red" />
					</div>
					{selectedTime ? (
						<span className="text-base">
							{selectedTime.period} {selectedTime.displayHour}:{selectedTime.value.split(':')[1]}
						</span>
					) : (
						<span className="text-base">{placeholder}</span>
					)}
				</span>
			</button>

			{/* 🌟 한국 전통 시간 선택 모달 */}
			{isOpen && (
				<>
					{/* 백드롭 */}
					<div
						className="fixed inset-0 z-40 bg-korea-black/20 backdrop-blur-sm"
						onClick={() => setIsOpen(false)}
					/>
					
					{/* 🌟 한지 스타일 시간 선택 패널 */}
					<div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50">
						<div className={cn(
							// 🌟 한지 카드 배경
							"bg-card border-2 border-korea-white-500/20 rounded-2xl",
							"shadow-2xl backdrop-blur-sm max-h-96",
							// 🌟 애니메이션
							"animate-in zoom-in-95 duration-200",
							// 🌟 다크 모드
							"dark:bg-card dark:border-korea-black-500/30"
						)}
						style={{
							backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
						}}>
							<div className="p-6">
								{/* 🌟 모달 헤더 */}
								<div className="mb-6 text-center">
									<h3 className="text-xl font-bold text-card-foreground mb-2">
										⏰ 시간 선택
									</h3>
									<p className="text-sm text-foreground-muted">
										30분 단위로 선택 가능합니다
									</p>
								</div>
								
								{/* 🌟 시간 그리드 - 한국 전통 스타일 */}
								<div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
									{timeOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											className={cn(
											// 🌟 기본 스타일
											"h-14 flex flex-col items-center justify-center",
											"rounded-xl border-2 transition-all duration-200",
											"hover:shadow-md",
												// 🌟 선택된 상태
												value === option.value 
													? "bg-korea-red/10 border-korea-red text-korea-red font-bold shadow-md" 
													: "bg-card border-korea-white-500/20 text-card-foreground hover:border-korea-yellow/30",
												// 🌟 다크 모드
												"dark:bg-card dark:border-korea-black-500/30"
											)}
											onClick={() => handleTimeSelect(option.value)}
											style={{
												backgroundImage: value === option.value 
													? 'linear-gradient(135deg, rgba(215,53,2,0.1) 0%, rgba(215,53,2,0.05) 100%)'
													: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
											}}
										>
											<span className={cn(
												"text-xs font-medium",
												value === option.value ? "text-korea-red/80" : "text-foreground-muted"
											)}>
												{option.period}
											</span>
											<span className="text-sm font-bold">
												{option.displayHour}:{option.value.split(':')[1]}
											</span>
										</button>
									))}
								</div>
								
								{/* 🌟 전통 스타일 닫기 버튼 */}
								<div className="mt-6 flex justify-center">
									<button
										type="button"
										className={cn(
											"px-6 py-2 rounded-xl font-medium transition-all duration-200",
											"bg-korea-yellow/10 text-korea-red border-2 border-korea-yellow/20",
											"hover:bg-korea-yellow/20 hover:border-korea-yellow/30 hover:shadow-md"
										)}
										onClick={() => setIsOpen(false)}
									>
										선택 완료
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
});

MobileTimePicker.displayName = "MobileTimePicker";
