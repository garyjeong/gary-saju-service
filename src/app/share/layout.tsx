/**
 * 개-사주 공유 페이지 레이아웃
 * 동적 OG 메타데이터 생성
 */

import { Metadata } from 'next';

// 기본 메타데이터
export const metadata: Metadata = {
	title: '사주 카드 공유하기 - 개-사주',
	description: 'AI가 해석한 나만의 사주 카드를 친구들과 공유해보세요. SNS에서 화제가 될 특별한 사주 이야기!',
	keywords: ['사주', 'AI사주', '운세', '사주공유', '개사주', '사주카드'],
	openGraph: {
		title: '개-사주 - AI가 해석하는 나만의 사주',
		description: 'AI 개인화 해석으로 더 정확하고 재미있는 사주를 경험해보세요.',
		type: 'website',
		locale: 'ko_KR',
		siteName: '개-사주',
	},
	twitter: {
		card: 'summary_large_image',
		title: '개-사주 - AI가 해석하는 나만의 사주',
		description: 'AI 개인화 해석으로 더 정확하고 재미있는 사주를 경험해보세요.',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
		},
	},
	alternates: {
		canonical: '/share',
	},
};

export default function ShareLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
