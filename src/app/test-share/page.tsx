/**
 * 개발용 공유 기능 테스트 페이지
 * 로컬스토리지 기반 공유 시스템 테스트
 */

"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { 
  createTestShareData, 
  getAllStoredShares, 
  getShareStats,
  cleanupExpiredShares,
  StoredShareData 
} from '@/lib/share/share-storage';
import { ExternalLink, Trash2, RefreshCw, Plus, BarChart3 } from 'lucide-react';

export default function TestSharePage() {
  const [shares, setShares] = useState<StoredShareData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    const allShares = getAllStoredShares();
    const shareStats = getShareStats();
    setShares(allShares);
    setStats(shareStats);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTestData = () => {
    createTestShareData(5);
    loadData();
  };

  const handleCleanup = () => {
    const removed = cleanupExpiredShares();
    alert(`${removed}개의 만료된 공유 데이터가 삭제되었습니다.`);
    loadData();
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-xl font-bold text-destructive mb-2">접근 제한</h2>
            <p>이 페이지는 개발 환경에서만 접근할 수 있습니다.</p>
            <Link href="/" className="inline-block mt-4">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 공유 기능 테스트</h1>
          <p className="text-muted-foreground">로컬스토리지 기반 공유 시스템 개발 도구</p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleCreateTestData} className="gap-2">
            <Plus className="w-4 h-4" />
            테스트 데이터 생성
          </Button>
          <Button onClick={loadData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            새로고침
          </Button>
          <Button onClick={handleCleanup} variant="outline" className="gap-2">
            <Trash2 className="w-4 h-4" />
            정리
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 통계 */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                공유 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">총 공유</span>
                      <Badge variant="secondary">{stats?.total || 0}개</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">총 조회수</span>
                      <Badge variant="secondary">{stats?.totalViews || 0}회</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">평균 조회수</span>
                      <Badge variant="secondary">{stats?.averageViews?.toFixed(1) || '0'}회</Badge>
                    </div>
                  </div>

                  {/* 인기 공유 */}
                  {stats?.mostPopular && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">👑 인기 공유</h4>
                      <p className="text-sm">{stats.mostPopular.name}님</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.mostPopular.views}회 조회
                      </p>
                    </div>
                  )}

                  {/* 오행 분포 */}
                  {stats?.elementDistribution && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">🔮 오행 분포</h4>
                      <div className="space-y-1">
                        {Object.entries(stats.elementDistribution).map(([element, count]) => (
                          <div key={element} className="flex justify-between text-xs">
                            <span>{element}</span>
                            <span>{count as number}개</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 공유 리스트 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>공유된 사주 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border rounded-lg space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : shares.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>저장된 공유 데이터가 없습니다.</p>
                  <p className="text-sm mt-2">테스트 데이터를 생성해보세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shares.map((share) => (
                    <div key={share.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{share.data.name}님의 사주</h3>
                            <Badge variant="outline">{share.data.dominantElement}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              {share.views}회 조회
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {share.data.keywords.slice(0, 3).map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {share.data.summary}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground space-x-4">
                              <span>ID: {share.id}</span>
                              <span>생성: {new Date(share.timestamp).toLocaleDateString('ko-KR')}</span>
                              {share.lastViewed !== share.timestamp && (
                                <span>조회: {new Date(share.lastViewed).toLocaleDateString('ko-KR')}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link href={`/share/${share.id}`} target="_blank">
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            보기
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 사용 방법 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📖 사용 방법</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ol className="space-y-2">
              <li><strong>테스트 데이터 생성:</strong> "테스트 데이터 생성" 버튼을 클릭하여 5개의 샘플 공유 데이터를 생성합니다.</li>
              <li><strong>공유 링크 테스트:</strong> 각 항목의 "보기" 버튼을 클릭하여 공유 페이지를 확인합니다.</li>
              <li><strong>조회수 증가:</strong> 공유 페이지를 방문할 때마다 조회수가 자동으로 증가합니다.</li>
              <li><strong>통계 확인:</strong> 좌측 통계 패널에서 전체 공유 현황을 확인할 수 있습니다.</li>
              <li><strong>데이터 정리:</strong> "정리" 버튼으로 30일 이상 된 공유 데이터를 제거할 수 있습니다.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
