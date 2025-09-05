"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, BarChart3, Database } from "lucide-react";

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
	const getIcon = () => {
		switch (variant) {
			case "interpretation":
				return <Sparkles className="w-5 h-5 text-accent" />;
			case "data":
				return <Database className="w-5 h-5 text-primary" />;
			default:
				return <BarChart3 className="w-5 h-5 text-primary" />;
		}
	};

	const getCardStyle = () => {
		switch (variant) {
			case "interpretation":
				return "glass-card border-none bg-gradient-to-br from-accent/5 to-primary/5";
			case "data":
				return "modern-card border-none bg-gradient-to-br from-primary/5 to-accent/5";
			default:
				return "modern-card border-none";
		}
	};

	return (
		<Card
			className={cn(
				"w-full group",
				getCardStyle(),
				className,
			)}
		>
			<CardHeader className="pb-4">
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
							{getIcon()}
						</div>
						<div className="flex-1">
							<CardTitle
								className={cn(
									"text-xl font-serif",
									variant === "interpretation"
										? "gradient-text"
										: "text-foreground",
								)}
							>
								{title}
							</CardTitle>
							{subtitle && (
								<p className="text-sm text-muted-foreground font-mono mt-1">{subtitle}</p>
							)}
						</div>
					</div>
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
