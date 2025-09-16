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
  const resolvedSearchParams = await searchParams;
  const { name, element, keywords, summary, birthInfo, tone } = resolvedSearchParams;

  // 필수 정보가 없으면 404
  if (!name || !element) {
    notFound();
  }

  // 공유 데이터 재구성 (URL 파라미터로부터)
  const shareData = {
    name,
    dominantElement: element,
    keywords: keywords?.split(',') || [],
    birthInfo: birthInfo || '',
    summary: summary || '',
    tone: tone || 'casual' as const,
  };

  // 임시 사주 객체 생성 (실제로는 ID로 데이터 조회해야 함)
  const mockSajuResult = {
    elements: {
      [element.toLowerCase()]: { score: 100 }
    },
    interpretation: {
      personality: keywords?.split(',') || [],
      summary: summary || '균형 잡힌 사주입니다.'
    }
  };

  const mockSajuInput = {
    name,
    birthDate: new Date().toISOString(),
    birthTime: '정오',
    gender: 'other' as const
  };

  return (
    <PageTransition variant="mystical">
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 md:py-16">
          {/* 🌟 헤더 네비게이션 */}
          <FadeInSection delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <Link href="/input">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-3 hanji-card hover:scale-105 transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  내 사주 보기
                </Button>
              </Link>
              
              <Link href="/">
                <Button 
                  size="lg" 
                  className="gap-3 stamp-button hover:scale-105 transition-all duration-300"
                >
                  <ExternalLink className="w-5 h-5" />
                  개-사주 시작하기
                </Button>
              </Link>
            </div>
          </FadeInSection>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            {/* 🌟 공유 카드 (메인) */}
            <FadeInSection delay={0.2} className="lg:col-span-2">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="title-calligraphy text-4xl md:text-5xl">
                    {name}님의 사주
                  </h1>
                  <p className="subtitle-traditional text-lg md:text-xl">
                    {element} 기운의 특별한 해석
                  </p>
                </div>

                {/* 실제 공유 카드 */}
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <SajuShareCard
                      sajuResult={mockSajuResult as any}
                      sajuInput={mockSajuInput as any}
                      aiInterpretation={{ summary }}
                      className="transform hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* 🌟 상세 해석 섹션 */}
                <div className="hanji-card p-8 space-y-6">
                  <h2 className="text-2xl font-serif font-bold text-center emphasis-mystic">
                    상세 해석
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-serif font-semibold text-foreground">
                        🌟 주요 특징
                      </h3>
                      <div className="space-y-2">
                        {keywords?.split(',').map((keyword, index) => (
                          <div 
                            key={keyword}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="saju-interpretation">{keyword}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-serif font-semibold text-foreground">
                        🔮 AI 해석
                      </h3>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-saju-cosmic-starlight/10 to-saju-cosmic-nebula/10 border border-saju-cosmic-starlight/20">
                        <p className="saju-interpretation">
                          {summary || `${element} 기운이 강한 당신은 독특한 매력과 잠재력을 가지고 있습니다.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* 🌟 공유 버튼들 (사이드바) */}
            <FadeInSection delay={0.4} className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-serif font-bold emphasis-mystic">
                    친구들과 공유하기
                  </h2>
                  <p className="text-muted-foreground">
                    나만의 특별한 사주를 자랑해보세요
                  </p>
                </div>

                <ShareButtons
                  sajuResult={mockSajuResult as any}
                  sajuInput={mockSajuInput as any}
                  aiInterpretation={{ summary }}
                />

                {/* 🌟 추가 액션 */}
                <div className="hanji-card p-6 text-center space-y-4">
                  <h3 className="font-serif font-semibold text-foreground">
                    더 자세한 해석이 필요하신가요?
                  </h3>
                  <Link href="/input">
                    <Button 
                      size="lg" 
                      className="w-full stamp-button"
                    >
                      AI 개인화 해석 받기
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeInSection>
          </div>
        </main>

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