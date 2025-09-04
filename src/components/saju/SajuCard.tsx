"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SajuCardProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	className?: string;
	variant?: "default" | "interpretation" | "data";
}

export default function SajuCard({
	title,
	subtitle,
	children,
	className,
	variant = "default",
}: SajuCardProps) {
	return (
		<Card
			className={cn(
				"w-full transition-all duration-200",
				variant === "interpretation" &&
					"bg-secondary/50 border-accent/20 shadow-sm",
				variant === "data" && "bg-muted/30 border-muted-foreground/20",
				className,
			)}
		>
			<CardHeader className="pb-3">
				<div className="space-y-1">
					<CardTitle
						className={cn(
							"text-lg font-serif",
							variant === "interpretation"
								? "text-accent-foreground"
								: "text-foreground",
						)}
					>
						{title}
					</CardTitle>
					{subtitle && (
						<p className="text-sm text-muted-foreground font-mono">{subtitle}</p>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-0">{children}</CardContent>
		</Card>
	);
}

interface ElementBadgeProps {
	element: string;
	color: string;
	score?: number;
	className?: string;
}

export function ElementBadge({
	element,
	color,
	score,
	className,
}: ElementBadgeProps) {
	return (
		<Badge
			variant="secondary"
			className={cn(
				"flex items-center gap-2 px-3 py-1 font-medium",
				className,
			)}
		>
			<div
				className="w-3 h-3 rounded-full border"
				style={{ backgroundColor: color }}
			/>
			<span className="font-serif">{element}</span>
			{score !== undefined && (
				<span className="text-xs font-mono opacity-70">{score}%</span>
			)}
		</Badge>
	);
}
