"use client";

import { SAJU_COLORS } from "@/constants/brand";

interface ElementChartProps {
	elements: {
		wood: { score: number; description: string };
		fire: { score: number; description: string };
		earth: { score: number; description: string };
		metal: { score: number; description: string };
		water: { score: number; description: string };
	};
	className?: string;
}

export default function ElementChart({ elements, className }: ElementChartProps) {
	const elementData = [
		{
			name: "목(木)",
			value: elements.wood.score,
			color: SAJU_COLORS.elements.목.color,
			description: elements.wood.description,
		},
		{
			name: "화(火)",
			value: elements.fire.score,
			color: SAJU_COLORS.elements.화.color,
			description: elements.fire.description,
		},
		{
			name: "토(土)",
			value: elements.earth.score,
			color: SAJU_COLORS.elements.토.color,
			description: elements.earth.description,
		},
		{
			name: "금(金)",
			value: elements.metal.score,
			color: SAJU_COLORS.elements.금.color,
			description: elements.metal.description,
		},
		{
			name: "수(水)",
			value: elements.water.score,
			color: SAJU_COLORS.elements.수.color,
			description: elements.water.description,
		},
	];

	const maxValue = Math.max(...elementData.map((d) => d.value)) || 1; // 0으로 나누기 방지

	return (
		<div className={className}>
			<div className="space-y-6">
				{/* 막대 차트 */}
				<div className="space-y-4">
					{elementData.map((element) => (
						<div key={element.name} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded"
										style={{ backgroundColor: element.color }}
									/>
									<span className="font-serif font-medium text-foreground">
										{element.name}
									</span>
								</div>
								<span className="font-mono text-sm font-medium">
									{element.value}%
								</span>
							</div>
							<div className="w-full bg-muted rounded-full h-3">
								<div
									className="h-3 rounded-full transition-all duration-500 ease-out"
									style={{
										backgroundColor: element.color,
										width: `${(element.value / maxValue) * 100}%`,
									}}
								/>
							</div>
							<p className="text-xs text-muted-foreground">
								{element.description}
							</p>
						</div>
					))}
				</div>

				{/* 원형 차트 (간단한 도넛 차트) */}
				<div className="flex justify-center">
					<div className="relative w-48 h-48">
						<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
							{elementData.map((element, index) => {
								const total = elementData.reduce((sum, el) => sum + el.value, 0) || 1; // 0으로 나누기 방지
								const percentage = (element.value / total) * 100;
								const offset = elementData
									.slice(0, index)
									.reduce((sum, el) => sum + (el.value / total) * 100, 0);

								return (
									<circle
										key={element.name}
										cx="50"
										cy="50"
										r="35"
										fill="none"
										stroke={element.color}
										strokeWidth="8"
										strokeDasharray={`${percentage * 2.2} ${220 - percentage * 2.2}`}
										strokeDashoffset={-offset * 2.2}
										className="transition-all duration-500"
									/>
								);
							})}
						</svg>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center">
								<p className="text-xs text-muted-foreground">오행 균형</p>
								<p className="text-lg font-serif font-medium">
									{elementData.reduce((max, current) =>
										current.value > max.value ? current : max
									).name}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
