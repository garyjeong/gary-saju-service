/**
 * 개-사주 모바일 최적화 Select 컴포넌트
 * 터치 인터랙션 및 모바일 UX 개선
 */

'use client';

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface MobileSelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface MobileSelectProps {
	value?: string;
	placeholder?: string;
	options: MobileSelectOption[];
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	className?: string;
	error?: boolean;
}

export const MobileSelect = React.forwardRef<
	HTMLButtonElement,
	MobileSelectProps
>(({
	value,
	placeholder = "선택해 주세요",
	options,
	onValueChange,
	disabled = false,
	className,
	error = false,
	...props
}, ref) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [isMobile, setIsMobile] = React.useState(false);
	
	React.useEffect(() => {
		// 모바일 환경 감지
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const selectedOption = options.find(option => option.value === value);

	const handleSelect = (selectedValue: string) => {
		onValueChange?.(selectedValue);
		setIsOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (disabled) return;

		switch (event.key) {
			case 'Enter':
			case 'Space':
				event.preventDefault();
				setIsOpen(!isOpen);
				break;
			case 'Escape':
				setIsOpen(false);
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
				} else {
					// 다음 옵션으로 이동
					const currentIndex = options.findIndex(opt => opt.value === value);
					const nextIndex = Math.min(currentIndex + 1, options.length - 1);
					if (nextIndex !== currentIndex) {
						handleSelect(options[nextIndex].value);
					}
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (isOpen) {
					const currentIndex = options.findIndex(opt => opt.value === value);
					const prevIndex = Math.max(currentIndex - 1, 0);
					if (prevIndex !== currentIndex) {
						handleSelect(options[prevIndex].value);
					}
				}
				break;
		}
	};

	// 모바일 네이티브 select 렌더링 (한국 전통 스타일)
	if (isMobile) {
		return (
			<div className="relative">
				<select
					value={value || ''}
					onChange={(e) => onValueChange?.(e.target.value)}
					disabled={disabled}
					className={cn(
						// 🌟 한국 전통 한지 스타일 배경
						"w-full h-12 px-4 py-3 text-base bg-card text-card-foreground",
						"border-2 border-korea-white-500/20 rounded-xl",
						// 🌟 전통 그림자 효과 (움직임 없는 안정적 호버)
						"shadow-sm hover:shadow-md hover:border-korea-yellow/30 transition-all duration-300",
						// 🌟 포커스 상태 - 전통 금색 테두리
						"focus:outline-none focus:ring-2 focus:ring-korea-yellow/30 focus:border-korea-red/50",
						// 🌟 비활성화 상태
						"disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
						// 🌟 에러 상태 - 전통 적색
						error && "border-korea-red focus:ring-korea-red/30",
						"appearance-none cursor-pointer",
						// 🌟 다크 모드 대응
						"dark:bg-card dark:border-korea-black-500/30 dark:focus:border-korea-yellow/50",
						className
					)}
					style={{
						fontSize: '16px', // iOS zoom 방지
						backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
					}}
				>
					<option value="" disabled>
						{placeholder}
					</option>
					{options.map((option) => (
						<option
							key={option.value}
							value={option.value}
							disabled={option.disabled}
							className="bg-card text-card-foreground py-2"
						>
							{option.label}
						</option>
					))}
				</select>
				
				{/* 🌟 한국 전통 화살표 아이콘 */}
				<div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
					<div className="w-6 h-6 rounded-full bg-korea-yellow/10 flex items-center justify-center">
						<ChevronDown className="h-4 w-4 text-korea-red" />
					</div>
				</div>
			</div>
		);
	}

	// 데스크톱 커스텀 select 렌더링 (한국 전통 스타일)
	return (
		<div className="relative">
			{/* 🌟 한국 전통 한지 카드 스타일 버튼 */}
			<button
				ref={ref}
				type="button"
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
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
					// 🌟 에러 상태
					error && "border-korea-red ring-korea-red/20",
					// 🌟 텍스트 상태
					!selectedOption && "text-foreground-muted",
					// 🌟 다크 모드 대응
					"dark:bg-card dark:border-korea-black-500/30 dark:hover:border-korea-yellow/30",
					className
				)}
				onClick={() => !disabled && setIsOpen(!isOpen)}
				onKeyDown={handleKeyDown}
				style={{
					backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
				}}
				{...props}
			>
				<span className="truncate text-base">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				
				{/* 🌟 한국 전통 스타일 아이콘 */}
				<div className="flex items-center ml-2">
					<div className={cn(
						"w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
						isOpen ? "bg-korea-red/10 rotate-180" : "bg-korea-yellow/10"
					)}>
						<ChevronDown className={cn(
							"h-4 w-4 transition-colors duration-300",
							isOpen ? "text-korea-red" : "text-korea-yellow-900"
						)} />
					</div>
				</div>
			</button>

			{/* 🌟 한국 전통 드롭다운 리스트 */}
			{isOpen && (
				<>
					{/* 오버레이 */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
					
					{/* 🌟 한지 스타일 옵션 리스트 */}
					<div
						className={cn(
							"absolute z-50 w-full mt-2",
							// 🌟 한지 카드 배경과 그림자
							"bg-card border-2 border-korea-white-500/20 rounded-xl",
							"shadow-xl backdrop-blur-sm",
							// 🌟 스크롤 영역
							"max-h-60 overflow-auto",
							// 🌟 애니메이션
							"animate-in slide-in-from-top-2 duration-200",
							// 🌟 다크 모드
							"dark:bg-card dark:border-korea-black-500/30"
						)}
						role="listbox"
						style={{
							backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
						}}
					>
						{options.map((option, index) => (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={value === option.value}
								disabled={option.disabled}
								className={cn(
									// 🌟 기본 레이아웃
									"w-full px-4 py-3 text-left text-base transition-all duration-200",
									"flex items-center justify-between",
									// 🌟 첫 번째와 마지막 항목 라운딩
									index === 0 && "rounded-t-xl",
									index === options.length - 1 && "rounded-b-xl",
									// 🌟 호버 상태 - 안정적인 색상 변화
									"hover:bg-korea-yellow/10 hover:text-korea-red",
									"focus:bg-korea-yellow/10 focus:text-korea-red focus:outline-none",
									// 🌟 선택된 상태
									value === option.value && "bg-korea-red/10 text-korea-red font-semibold",
									// 🌟 비활성화 상태
									"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
									// 🌟 다크 모드
									"dark:hover:bg-korea-yellow/20 dark:focus:bg-korea-yellow/20"
								)}
								onClick={() => !option.disabled && handleSelect(option.value)}
							>
								<span className="flex-1 truncate">{option.label}</span>
								{value === option.value && (
									<div className="w-5 h-5 rounded-full bg-korea-red/20 flex items-center justify-center ml-2">
										<Check className="h-3 w-3 text-korea-red" />
									</div>
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
});

MobileSelect.displayName = "MobileSelect";
