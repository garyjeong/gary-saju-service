"use client";

import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FortunePeriod {
	period: string;
	description: string;
}

interface FortunePeriodsDisplayProps {
	periods: FortunePeriod[];
}

const getTrendIcon = (description: string) => {
	const lowerDesc = description.toLowerCase();
	if (lowerDesc.includes("좋") || lowerDesc.includes("상승") || lowerDesc.includes("발전")) {
		return <TrendingUp className="w-4 h-4 text-green-500" />;
	}
	if (lowerDesc.includes("나쁘") || lowerDesc.includes("하락") || lowerDesc.includes("어려")) {
		return <TrendingDown className="w-4 h-4 text-red-500" />;
	}
	return <Minus className="w-4 h-4 text-yellow-500" />;
};

const getTrendColor = (description: string) => {
	const lowerDesc = description.toLowerCase();
	if (lowerDesc.includes("좋") || lowerDesc.includes("상승") || lowerDesc.includes("발전")) {
		return "from-green-400/10 to-emerald-500/10 border-green-200/20";
	}
	if (lowerDesc.includes("나쁘") || lowerDesc.includes("하락") || lowerDesc.includes("어려")) {
		return "from-red-400/10 to-rose-500/10 border-red-200/20";
	}
	return "from-yellow-400/10 to-amber-500/10 border-yellow-200/20";
};

export default function FortunePeriodsDisplay({ periods }: FortunePeriodsDisplayProps) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<div className="flex items-center justify-center gap-2 mb-2">
					<Calendar className="w-5 h-5 text-primary" />
					<h3 className="text-lg font-semibold">대운 흐름</h3>
				</div>
				<p className="text-sm text-muted-foreground">
					10년 주기로 변화하는 인생의 흐름을 살펴보세요
				</p>
			</div>
			
			<div className="relative">
				{/* Timeline line */}
				<div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-primary/50"></div>
				
				<div className="space-y-4">
					{periods.map((period, index) => (
						<div
							key={index}
							className={cn(
								"relative flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r backdrop-blur-sm border group hover:scale-[1.02] transition-all duration-300",
								getTrendColor(period.description)
							)}
						>
							{/* Timeline dot */}
							<div className="relative z-10 flex-shrink-0">
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
									{getTrendIcon(period.description)}
								</div>
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
							</div>
							
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-2">
									<h4 className="font-semibold text-base">{period.period}</h4>
									<span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
										10년 주기
									</span>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{period.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
			
			<div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
				<div className="text-center">
					<h4 className="font-semibold mb-2 text-primary">대운 가이드</h4>
					<p className="text-sm text-muted-foreground">
						각 대운은 10년간 지속되며, 그 시기의 특성과 주의사항을 미리 알고 준비하면 
						더 나은 인생을 설계할 수 있습니다.
					</p>
				</div>
			</div>
		</div>
	);
}
