"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Element {
	name: string;
	score: number;
	color: string;
}

interface ElementsDisplayProps {
	elements: Element[];
}

const getElementEmoji = (element: string) => {
	switch (element) {
		case "목": return "🌳";
		case "화": return "🔥";
		case "토": return "🏔️";
		case "금": return "⚡";
		case "수": return "💧";
		default: return "⭐";
	}
};

const getElementGradient = (element: string) => {
	switch (element) {
		case "목": return "from-green-400/20 to-emerald-500/20";
		case "화": return "from-red-400/20 to-orange-500/20";
		case "토": return "from-yellow-400/20 to-amber-500/20";
		case "금": return "from-gray-400/20 to-slate-500/20";
		case "수": return "from-blue-400/20 to-cyan-500/20";
		default: return "from-primary/20 to-accent/20";
	}
};

const getProgressColor = (element: string) => {
	switch (element) {
		case "목": return "bg-green-500";
		case "화": return "bg-red-500";
		case "토": return "bg-yellow-500";
		case "금": return "bg-gray-500";
		case "수": return "bg-blue-500";
		default: return "bg-primary";
	}
};

export default function ElementsDisplay({ elements }: ElementsDisplayProps) {
	const maxScore = Math.max(...elements.map(e => e.score));
	
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-lg font-semibold mb-2">오행 균형도</h3>
				<p className="text-sm text-muted-foreground">
					각 오행의 비중과 균형 상태를 나타냅니다
				</p>
			</div>
			
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{elements.map((element, index) => {
					const percentage = maxScore > 0 ? (element.score / maxScore) * 100 : 0;
					
					return (
						<div
							key={index}
							className={cn(
								"relative p-4 rounded-2xl bg-gradient-to-br backdrop-blur-sm border border-white/10 group hover:scale-105 transition-all duration-300",
								getElementGradient(element.name)
							)}
						>
							<div className="flex items-center gap-3 mb-3">
								<div className="text-2xl">{getElementEmoji(element.name)}</div>
								<div className="flex-1">
									<div className="font-semibold text-lg">{element.name}</div>
									<div className="text-sm text-muted-foreground">점수: {element.score}</div>
								</div>
							</div>
							
							<div className="space-y-2">
								<div className="flex justify-between items-center text-sm">
									<span>비중</span>
									<span className="font-medium">{percentage.toFixed(1)}%</span>
								</div>
								<div className="relative">
									<Progress 
										value={percentage} 
										className="h-2 bg-white/20"
									/>
									<div 
										className={cn(
											"absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ease-out",
											getProgressColor(element.name)
										)}
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
							
							<div className="absolute -inset-px bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						</div>
					);
				})}
			</div>
			
			<div className="mt-6 p-4 bg-muted/30 rounded-xl">
				<div className="text-center">
					<h4 className="font-semibold mb-2">오행 해석</h4>
					<p className="text-sm text-muted-foreground">
						가장 강한 오행은 <strong>{elements.reduce((prev, current) => 
							prev.score > current.score ? prev : current
						).name}</strong>이며, 
						이는 당신의 기본 성향과 특성을 나타냅니다.
					</p>
				</div>
			</div>
		</div>
	);
}
