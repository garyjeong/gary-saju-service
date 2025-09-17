/**
 * 개-사주 동적 공유 페이지
 * 개인별 사주 정보가 포함된 공유 전용 페이지
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SajuShareCard from '@/components/share/SajuShareCard';
import ShareButtons from '@/components/share/ShareButtons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import PageTransition, { FadeInSection } from '@/components/ui/page-transition';
import { validateShareId } from '@/lib/share/share-storage';
import SharePageContent from '@/components/share/SharePageContent';

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    name?: string;
    element?: string;
    keywords?: string;
    birthInfo?: string;
    summary?: string;
    tone?: 'formal' | 'casual' | 'poetic';
  }>;
}

// 🌟 동적 메타데이터 생성 (각 공유마다 개인화)
export async function generateMetadata({ 
  params, 
  searchParams 
}: SharePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { name, element, keywords, summary, birthInfo } = resolvedSearchParams;
  
  // 기본값 설정
  const userName = name || '익명';
  const userElement = element || '미지';
  const userKeywords = keywords?.split(',') || ['신비로운', '독특한'];
  const userSummary = summary || '나만의 특별한 사주';
  const userBirthInfo = birthInfo || '';

  // SEO 최적화된 제목과 설명
  const title = `${userName}님의 사주 - ${userElement} 기운 | 개-사주`;
  const description = `${userName}님은 ${userElement} 기운 중심의 ${userKeywords.join(', ')} 성향을 가지고 있습니다. ${userSummary} AI가 해석한 개인화된 사주를 확인해보세요.`;
  
  // 동적 OG 이미지 URL 생성
  const ogImageUrl = `/api/og?name=${encodeURIComponent(userName)}&element=${encodeURIComponent(userElement)}&keywords=${encodeURIComponent(keywords || '')}&summary=${encodeURIComponent(userSummary)}&birthInfo=${encodeURIComponent(userBirthInfo)}`;
  const fullOgImageUrl = `https://gary-saju-service.vercel.app${ogImageUrl}`;

  return {
    title,
    description,
    keywords: [
      '사주', 'AI 사주', '사주 해석', userName + ' 사주',
      userElement + ' 기운', ...userKeywords,
      '무료 사주', '개인화 사주', '한국 전통 사주'
    ],
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      title,
      description,
      url: `https://gary-saju-service.vercel.app/share/${resolvedParams.id}`,
      siteName: '개-사주',
      images: [
        {
          url: fullOgImageUrl,
          width: 1200,
          height: 630,
          alt: `${userName}님의 사주 - ${userElement} 기운`,
          type: 'image/png',
        },
        // Instagram용 정사각형 이미지
        {
          url: fullOgImageUrl + '&format=square',
          width: 1080,
          height: 1080,
          alt: `${userName}님의 사주 카드`,
          type: 'image/png',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullOgImageUrl],
      creator: '@gaesaju',
      site: '@gaesaju',
    },
    // 추가 소셜 미디어 메타태그
    other: {
      // 카카오톡 공유 최적화
      'kakao:title': title,
      'kakao:description': description,
      'kakao:image': fullOgImageUrl,
      'kakao:type': 'website',
      
      // 네이버 블로그 최적화
      'naver-site-verification': process.env.NAVER_SITE_VERIFICATION || '',
      
      // Facebook 추가 최적화
      'fb:app_id': process.env.FACEBOOK_APP_ID || '',
      'article:author': '개-사주',
      'article:publisher': '개-사주',
      
      // Pinterest 최적화
      'pinterest:title': title,
      'pinterest:description': description,
      'pinterest:image': fullOgImageUrl,
    },
    alternates: {
      canonical: `https://gary-saju-service.vercel.app/share/${resolvedParams.id}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
  };
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 공유 ID 기본 검증 (서버에서)
  if (!id || !/^[a-z0-9]{8}$/.test(id)) {
    notFound();
  }

  return (
    <PageTransition variant="mystical">
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* 클라이언트 컴포넌트에서 로컬스토리지 기반 데이터 로딩 */}
        <SharePageContent />

        <Footer />
      </div>
    </PageTransition>
  );
}

// 🌟 Static Params Generation (필요시)
export function generateStaticParams() {
  // 인기 공유 ID들을 미리 생성할 수 있음
  return [];
}