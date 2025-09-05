"use client";

interface LuckData {
	year: number;
	theme: string;
	score: number;
	keywords: readonly string[];
}

interface LuckTimelineProps {
	yearlyLuck: readonly LuckData[];
	className?: string;
}

export default function LuckTimeline({ yearlyLuck, className }: LuckTimelineProps) {
	const maxScore = Math.max(...yearlyLuck.map((data) => data.score));

	return (
		<div className={className}>
			<div className="space-y-6">
				{/* 타임라인 차트 */}
				<div className="relative">
					<div className="flex items-end justify-between gap-2 h-32">
						{yearlyLuck.map((data, index) => (
							<div key={data.year} className="flex-1 flex flex-col items-center gap-2">
								<div className="relative w-full h-full flex flex-col justify-end">
									<div
										className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500 hover:opacity-80"
										style={{
											height: `${(data.score / maxScore) * 100}%`,
											minHeight: "8px",
										}}
									/>
								</div>
								<div className="text-center space-y-1">
									<p className="text-sm font-mono font-medium">{data.year}</p>
									<p className="text-xs text-muted-foreground">{data.score}점</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* 상세 정보 */}
				<div className="grid gap-4">
					{yearlyLuck.map((data) => (
						<div
							key={data.year}
							className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
						>
							<div className="flex-shrink-0">
								<div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
									<span className="text-sm font-mono font-bold">
										{data.year.toString().slice(-2)}
									</span>
								</div>
							</div>
							<div className="flex-1 space-y-2">
								<div>
									<h4 className="font-serif font-medium text-foreground">
										{data.theme}
									</h4>
									<p className="text-sm text-muted-foreground">
										운세 점수: {data.score}점
									</p>
								</div>
								<div className="flex flex-wrap gap-1">
									{data.keywords.map((keyword) => (
										<span
											key={keyword}
											className="px-2 py-1 text-xs bg-accent/20 text-accent-foreground rounded-md"
										>
											{keyword}
										</span>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
