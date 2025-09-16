"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
	showBack?: boolean;
	backHref?: string;
	title?: string;
	minimal?: boolean;
}

export default function Header({ 
	showBack = false, 
	backHref = "/", 
	title,
	minimal = false 
}: HeaderProps) {
	// 메인 페이지에서는 Header를 완전히 숨김
	if (minimal) {
		return null;
	}

	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* 뒤로가기 버튼 */}
					{showBack && (
						<Link 
							href={backHref}
							className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
						>
							<ArrowLeft className="w-4 h-4" />
							<span className="text-sm font-medium">뒤로</span>
						</Link>
					)}

					{/* 페이지 제목 */}
					{title && (
						<h1 className="text-lg font-semibold text-foreground">
							{title}
						</h1>
					)}

					{/* 로고 (우측 또는 중앙) */}
					<Link href="/" className="flex items-center gap-2">
						<span className="text-lg font-bold text-foreground">
							개-사주
						</span>
					</Link>
				</div>
			</div>
		</header>
	);
}
