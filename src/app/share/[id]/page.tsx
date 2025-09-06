/**
 * 개-사주 개별 공유 페이지
 * URL: /share/[id] 형태로 특정 사주 결과를 공유
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ShareResultPageProps {
	params: Promise<{ id: string }>;
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params, searchParams }: ShareResultPageProps): Promise<Metadata> {
	const { id } = await params;
	const search = await searchParams;
	
	// URL 파라미터에서 공유 정보 추출
	const name = typeof search?.name === 'string' ? search.name : '익명';
	const element = typeof search?.element === 'string' ? search.element : '미지';
	const keywords = typeof search?.keywords === 'string' ? search.keywords.split(',') : ['신비로운'];
	const birthInfo = typeof search?.birthInfo === 'string' ? search.birthInfo : '';

	const title = `${name}님의 사주 - 개-사주`;
	const description = `${element} 기운 중심의 ${keywords.join(', ')} 성향. AI가 해석한 ${name}님만의 특별한 사주를 확인해보세요!`;
	
	// OG 이미지 URL 생성
	const baseUrl = process.env.VERCEL_URL 
		? `https://${process.env.VERCEL_URL}` 
		: process.env.NODE_ENV === 'development'
		? 'http://localhost:3001'
		: 'https://gae-saju.vercel.app';

	const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({
		name,
		element,
		keywords: keywords.join(','),
		birthInfo,
		tone: typeof search?.tone === 'string' ? search.tone : 'casual',
	}).toString()}`;

	return {
		title,
		description,
		keywords: ['사주', 'AI사주', '운세', element + '기운', ...keywords],
		authors: [{ name: '개-사주 팀' }],
		openGraph: {
			title,
			description,
			type: 'article',
			locale: 'ko_KR',
			siteName: '개-사주',
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [ogImageUrl],
		},
		robots: {
			index: true,
			follow: true,
		},
		alternates: {
			canonical: `/share/${id}`,
		},
	};
}

export default async function ShareResultPage({ params, searchParams }: ShareResultPageProps) {
	const { id } = await params;
	const search = await searchParams;
	
	// ID 유효성 검사 (간단한 형태)
	if (!id || id.length < 1) {
		notFound();
	}

	const name = typeof search?.name === 'string' ? search.name : '익명';
	const element = typeof search?.element === 'string' ? search.element : '미지';
	const keywords = typeof search?.keywords === 'string' ? search.keywords.split(',') : ['신비로운'];
	const birthInfo = typeof search?.birthInfo === 'string' ? search.birthInfo : '';

	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					{/* 공유 카드 프리뷰 */}
					<div className="glass-card p-12 rounded-3xl">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
								<span className="text-2xl font-serif font-bold gradient-text">개-사주</span>
							</div>
							
							<h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
								{name}님의 사주
							</h1>
							
							{birthInfo && (
								<p className="text-lg text-muted-foreground">
									{birthInfo}
								</p>
							)}
							
							<div className="flex items-center justify-center gap-4">
								<div className="text-2xl font-bold text-primary">
									{element} 기운 중심
								</div>
							</div>
							
							<div className="flex flex-wrap justify-center gap-2">
								{keywords.slice(0, 3).map((keyword, index) => (
									<span
										key={index}
										className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl text-sm font-medium"
									>
										{keyword}
									</span>
								))}
							</div>
							
							<div className="pt-6 space-y-4">
								<p className="text-lg text-muted-foreground">
									나도 내 사주를 확인해보고 싶다면?
								</p>
								
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<a
										href="/input"
										className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-2xl hover:scale-105 transition-all duration-300"
									>
										무료로 내 사주 보기
									</a>
									<a
										href="/"
										className="inline-flex items-center justify-center px-8 py-4 border border-muted-foreground/20 rounded-2xl hover:bg-muted/10 transition-colors duration-300"
									>
										서비스 소개
									</a>
								</div>
							</div>
						</div>
					</div>
					
					<div className="text-xs text-muted-foreground">
						🔮 AI가 개인화하여 해석하는 무료 사주 서비스
					</div>
				</div>
			</div>
		</div>
	);
}
