"use client";

import { cn } from "@/lib/utils";

interface Pillar {
	name: string;
	stem: string;
	branch: string;
}

interface SajuDisplayProps {
	pillars: Pillar[];
}

const pillarColors = {
	"년주": "bg-red-500/20 text-red-700 border-red-200",
	"월주": "bg-blue-500/20 text-blue-700 border-blue-200",
	"일주": "bg-green-500/20 text-green-700 border-green-200",
	"시주": "bg-purple-500/20 text-purple-700 border-purple-200",
};

export default function SajuDisplay({ pillars }: SajuDisplayProps) {
	return (
		<div className="grid grid-cols-4 gap-3">
			{pillars.map((pillar, index) => (
				<div
					key={index}
					className="relative overflow-hidden"
				>
					<div className="text-center space-y-3">
						<div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
							{pillar.name}
						</div>
						
						<div className="relative">
							<div className="space-y-2">
								<div className="relative group">
									<div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
										{pillar.stem}
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
								
								<div className="relative group">
									<div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center font-bold text-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
										{pillar.branch}
									</div>
									<div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
								</div>
							</div>
							
							<div className="mt-3 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
