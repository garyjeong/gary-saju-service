"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
	const { setTheme, theme } = useTheme();

	return (
		<header className="sticky top-0 z-50 w-full glass-card border-none backdrop-blur-xl">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				{/* 로고 - Enhanced */}
				<Link href="/" className="flex items-center gap-3 group">
					<div className="relative">
						<div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
							<Sparkles className="w-6 h-6 text-white" />
						</div>
						<div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
					</div>
					<span className="text-2xl font-serif font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
						개-사주
					</span>
				</Link>

				{/* 네비게이션 - Enhanced */}
				<nav className="hidden md:flex items-center gap-8">
					<Link
						href="/input"
						className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 rounded-xl hover:bg-primary/10"
					>
						<span className="relative z-10">AI 사주 분석</span>
						<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					</Link>
					<Link
						href="/result"
						className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group px-4 py-2 rounded-xl hover:bg-accent/10"
					>
						<span className="relative z-10">결과 예시</span>
						<div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					</Link>
				</nav>

				{/* 우측 액션 - Enhanced */}
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setTheme(theme === "light" ? "dark" : "light")}
						className="w-10 h-10 rounded-xl hover:bg-muted/50 transition-all duration-300"
					>
						<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">테마 전환</span>
					</Button>
					<Button asChild size="sm" className="hidden sm:inline-flex gradient-button text-white px-6 py-2 rounded-xl shadow-lg group">
						<Link href="/input" className="flex items-center gap-2">
							<Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
							사주 보기
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
