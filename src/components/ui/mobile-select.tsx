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

	// 모바일 네이티브 select 렌더링
	if (isMobile) {
		return (
			<div className="relative">
				<select
					value={value || ''}
					onChange={(e) => onValueChange?.(e.target.value)}
					disabled={disabled}
					className={cn(
						"w-full h-11 px-3 py-2 text-base bg-background border rounded-md",
						"focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
						"disabled:cursor-not-allowed disabled:opacity-50",
						error && "border-destructive focus:ring-destructive",
						"appearance-none cursor-pointer",
						className
					)}
					style={{
						fontSize: '16px', // iOS zoom 방지
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
						>
							{option.label}
						</option>
					))}
				</select>
				
				{/* 커스텀 아이콘 */}
				<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</div>
			</div>
		);
	}

	// 데스크톱 커스텀 select 렌더링
	return (
		<div className="relative">
			<Button
				ref={ref}
				type="button"
				variant="outline"
				role="combobox"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				disabled={disabled}
				className={cn(
					"w-full justify-between text-left font-normal h-11",
					!selectedOption && "text-muted-foreground",
					error && "border-destructive",
					className
				)}
				onClick={() => setIsOpen(!isOpen)}
				onKeyDown={handleKeyDown}
				{...props}
			>
				<span className="truncate">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				{isOpen ? (
					<ChevronUp className="h-4 w-4 opacity-50" />
				) : (
					<ChevronDown className="h-4 w-4 opacity-50" />
				)}
			</Button>

			{/* 드롭다운 리스트 */}
			{isOpen && (
				<>
					{/* 오버레이 */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
					
					{/* 옵션 리스트 */}
					<div
						className={cn(
							"absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg",
							"max-h-60 overflow-auto"
						)}
						role="listbox"
					>
						{options.map((option) => (
							<button
								key={option.value}
								type="button"
								role="option"
								aria-selected={value === option.value}
								disabled={option.disabled}
								className={cn(
									"w-full px-3 py-2 text-left text-sm transition-colors",
									"hover:bg-accent hover:text-accent-foreground",
									"focus:bg-accent focus:text-accent-foreground",
									"disabled:cursor-not-allowed disabled:opacity-50",
									value === option.value && "bg-accent text-accent-foreground"
								)}
								onClick={() => handleSelect(option.value)}
							>
								<div className="flex items-center">
									<span className="flex-1 truncate">{option.label}</span>
									{value === option.value && (
										<Check className="h-4 w-4 ml-2" />
									)}
								</div>
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
});

MobileSelect.displayName = "MobileSelect";
