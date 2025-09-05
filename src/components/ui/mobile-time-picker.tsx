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

	// 모바일 네이티브 time input 사용
	if (isMobile) {
		return (
			<div ref={ref} className={cn("relative", className)} {...props}>
				<input
					type="time"
					value={value || ''}
					onChange={(e) => onValueChange?.(e.target.value)}
					disabled={disabled}
					className={cn(
						"w-full h-11 px-3 py-2 text-base bg-background border rounded-md",
						"focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
						"disabled:cursor-not-allowed disabled:opacity-50",
						"appearance-none cursor-pointer"
					)}
					style={{
						fontSize: '16px', // iOS zoom 방지
					}}
				/>
				
				{/* 커스텀 아이콘 오버레이 */}
				<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
					<Clock className="h-4 w-4 text-muted-foreground" />
				</div>
			</div>
		);
	}

	// 데스크톱 커스텀 시간 선택기
	return (
		<div ref={ref} className={cn("relative", className)} {...props}>
			<Button
				type="button"
				variant="outline"
				disabled={disabled}
				className={cn(
					"w-full justify-between text-left font-normal h-11",
					!selectedTime && "text-muted-foreground"
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="flex items-center gap-2">
					<Clock className="h-4 w-4" />
					{selectedTime ? (
						<span>
							{selectedTime.period} {selectedTime.displayHour}:{selectedTime.value.split(':')[1]}
						</span>
					) : (
						placeholder
					)}
				</span>
			</Button>

			{/* 시간 선택 모달 */}
			{isOpen && (
				<>
					{/* 백드롭 */}
					<div
						className="fixed inset-0 z-40 bg-black/20"
						onClick={() => setIsOpen(false)}
					/>
					
					{/* 시간 선택 패널 */}
					<div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50">
						<Card className="max-h-96">
							<CardContent className="p-4">
								<div className="mb-4">
									<h3 className="text-lg font-semibold text-center">
										시간 선택
									</h3>
									<p className="text-sm text-muted-foreground text-center">
										30분 단위로 선택 가능합니다
									</p>
								</div>
								
								{/* 시간 그리드 */}
								<div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
									{timeOptions.map((option) => (
										<Button
											key={option.value}
											type="button"
											variant={value === option.value ? "default" : "outline"}
											size="sm"
											className="h-12 flex flex-col"
											onClick={() => handleTimeSelect(option.value)}
										>
											<span className="text-xs text-muted-foreground">
												{option.period}
											</span>
											<span className="font-medium">
												{option.displayHour}:{option.value.split(':')[1]}
											</span>
										</Button>
									))}
								</div>
								
								{/* 닫기 버튼 */}
								<div className="mt-4 flex justify-end">
									<Button
										type="button"
										variant="ghost"
										onClick={() => setIsOpen(false)}
									>
										닫기
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</>
			)}
		</div>
	);
});

MobileTimePicker.displayName = "MobileTimePicker";
