"use client";

import Link from "next/link";
import { Github, Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="w-full border-t bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* 브랜드 정보 */}
					<div className="space-y-3">
						<h3 className="text-lg font-serif font-medium text-foreground">
							개-사주
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							전통 사주를 현대적이고 감성적인 UI로
							<br />
							쉽고 재미있게 체험하세요
						</p>
					</div>

					{/* 링크 */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium text-foreground">서비스</h4>
						<div className="space-y-2">
							<Link
								href="/input"
								className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								사주 입력
							</Link>
							<Link
								href="/result"
								className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								결과 보기
							</Link>
							<Link
								href="/share"
								className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								공유하기
							</Link>
						</div>
					</div>

					{/* 개발 정보 */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium text-foreground">개발</h4>
						<div className="space-y-2">
							<a
								href="https://github.com/garyjeong/saju-project"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<Github className="w-4 h-4" />
								GitHub
							</a>
							<p className="text-xs text-muted-foreground">
								오픈소스 · 포트폴리오 프로젝트
							</p>
						</div>
					</div>
				</div>

				{/* 하단 정보 */}
				<div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="text-xs text-muted-foreground">
						© 2024 개-사주. Made with{" "}
						<Heart className="w-3 h-3 inline mx-1 text-red-500" /> for
						learning.
					</p>
					<p className="text-xs text-muted-foreground">
						사주 계산 로직:{" "}
						<a
							href="https://github.com/garyjeong/saju-project"
							target="_blank"
							rel="noopener noreferrer"
							className="underline hover:text-foreground"
						>
							saju-project
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
