"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="w-9 h-9 rounded-xl bg-card border border-border animate-pulse" />
		);
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			className="w-9 h-9 rounded-xl border-border/50 hover:border-border bg-card/80 backdrop-blur-sm hover:bg-card transition-all duration-300"
		>
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">테마 전환</span>
		</Button>
	);
}

interface FloatingThemeToggleProps {
	className?: string;
}

export function FloatingThemeToggle({ className }: FloatingThemeToggleProps) {
	return (
		<div className={`fixed top-6 right-6 z-50 ${className || ""}`}>
			<ThemeToggle />
		</div>
	);
}
