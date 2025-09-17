/**
 * 개-사주 공유 페이지 클라이언트 컴포넌트
 * 로컬스토리지에서 공유 데이터를 조회하고 표시
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import SajuShareCard from '@/components/share/SajuShareCard';
import ShareButtons from '@/components/share/ShareButtons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { FadeInSection } from '@/components/ui/page-transition';
import { getShareData, validateShareId, StoredShareData } from '@/lib/share/share-storage';
import { Card, CardContent } from '@/components/ui/card';

interface ShareData {
  name: string;
  dominantElement: string;
  keywords: string[];
  birthInfo: string;
  summary: string;
  tone: 'formal' | 'casual' | 'poetic';
}

export default function SharePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [storedShare, setStoredShare] = useState<StoredShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shareId = params?.id as string;

  useEffect(() => {
    const loadShareData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 공유 ID 유효성 검증
        if (!shareId || !validateShareId(shareId)) {
          setError('잘못된 공유 링크입니다.');
          return;
        }

        // 로컬 스토리지에서 공유 데이터 조회
        const stored = getShareData(shareId);
        
        if (stored) {
          // 저장된 데이터가 있으면 사용
          setStoredShare(stored);
          setShareData(stored.data);
          console.log(`📖 저장된 공유 데이터 로드: ${shareId} (조회수: ${stored.views})`);
        } else {
          // 저장된 데이터가 없으면 URL 파라미터로 폴백
          const urlName = searchParams?.get('name');
          const urlElement = searchParams?.get('element');
          const urlKeywords = searchParams?.get('keywords');
          const urlSummary = searchParams?.get('summary');
          const urlBirthInfo = searchParams?.get('birthInfo');
          const urlTone = searchParams?.get('tone');

          if (urlName && urlElement) {
            const fallbackData: ShareData = {
              name: urlName,
              dominantElement: urlElement,
              keywords: urlKeywords?.split(',') || ['신비로운', '독특한'],
              birthInfo: urlBirthInfo || '',
              summary: urlSummary || '특별한 사주입니다.',
              tone: (urlTone as ShareData['tone']) || 'casual',
            };
            setShareData(fallbackData);
            console.log(`🔄 URL 파라미터로 폴백: ${shareId}`);
          } else {
            setError('공유 데이터를 찾을 수 없습니다.');
          }
        }
      } catch (err) {
        console.error('공유 데이터 로드 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadShareData();
  }, [shareId, searchParams]);

  const handleRetry = () => {
    window.location.reload();
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="modern-card p-8 max-w-md mx-auto text-center">
          <CardContent className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-serif font-medium text-foreground">공유 데이터 로딩 중...</h3>
              <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="modern-card border-destructive/20 bg-destructive/5 p-8 max-w-md mx-auto text-center">
          <CardContent className="space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-serif font-medium text-foreground">오류 발생</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  다시 시도
                </Button>
                <Link href="/input">
                  <Button className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    사주 입력하러 가기
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!shareData) {
    return notFound();
  }

  // 임시 사주 객체 생성
  const mockSajuResult = {
    elements: {
      [shareData.dominantElement.toLowerCase()]: { score: 100 }
    },
    interpretation: {
      personality: shareData.keywords,
      summary: shareData.summary || '균형 잡힌 사주입니다.'
    }
  };

  const mockSajuInput = {
    name: shareData.name,
    birthDate: new Date().toISOString(),
    birthTime: '정오',
    gender: 'other' as const
  };

  return (
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

      {/* 🌟 공유 통계 (저장된 데이터가 있을 때만) */}
      {storedShare && storedShare.views > 1 && (
        <FadeInSection delay={0.15} className="mb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span>👁️ {storedShare.views}명이 이 사주를 확인했습니다</span>
            </div>
          </div>
        </FadeInSection>
      )}

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
        {/* 🌟 공유 카드 (메인) */}
        <FadeInSection delay={0.2} className="lg:col-span-2">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="title-calligraphy text-4xl md:text-5xl">
                {shareData.name}님의 사주
              </h1>
              <p className="subtitle-traditional text-lg md:text-xl">
                {shareData.dominantElement} 기운의 특별한 해석
              </p>
            </div>

            {/* 실제 공유 카드 */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <SajuShareCard
                  sajuResult={mockSajuResult as any}
                  sajuInput={mockSajuInput as any}
                  aiInterpretation={{ summary: shareData.summary }}
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
                    {shareData.keywords.map((keyword, index) => (
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
                      {shareData.summary || `${shareData.dominantElement} 기운이 강한 당신은 독특한 매력과 잠재력을 가지고 있습니다.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🌟 출생정보 (있을 때만) */}
              {shareData.birthInfo && (
                <div className="text-center pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">
                    📅 {shareData.birthInfo}
                  </p>
                </div>
              )}
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
              aiInterpretation={{ summary: shareData.summary }}
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

            {/* 🌟 저장된 데이터 정보 */}
            {storedShare && (
              <div className="text-xs text-muted-foreground text-center space-y-1 p-4 bg-muted/50 rounded-xl">
                <p>생성 시간: {new Date(storedShare.timestamp).toLocaleString('ko-KR')}</p>
                <p>공유 ID: {shareId}</p>
              </div>
            )}
          </div>
        </FadeInSection>
      </div>
    </main>
  );
}
