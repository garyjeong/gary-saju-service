"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export default function Header() {
	const { setTheme, theme } = useTheme();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				{/* 로고 */}
				<Link href="/" className="flex items-center gap-2 group">
					<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
						<Sparkles className="w-5 h-5 text-primary-foreground" />
					</div>
					<span className="text-xl font-serif font-medium text-foreground">
						개-사주
					</span>
				</Link>

				{/* 네비게이션 */}
				<nav className="hidden md:flex items-center gap-6">
					<Link
						href="/input"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						사주보기
					</Link>
					<Link
						href="/result"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						결과보기
					</Link>
				</nav>

				{/* 우측 액션 */}
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setTheme(theme === "light" ? "dark" : "light")}
						className="w-9 px-0"
					>
						<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">테마 전환</span>
					</Button>
					<Button asChild size="sm" className="hidden sm:inline-flex">
						<Link href="/input">사주 보기</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
