/**
 * QA 테스트 대시보드
 * 브라우저 호환성, 공유 기능, 성능 등을 종합 테스트
 */

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import BrowserCompatibilityTest from '@/components/qa/BrowserCompatibilityTest';
import PerformanceOptimization from '@/components/qa/PerformanceOptimization';
import { 
  Monitor, 
  Smartphone, 
  TestTube, 
  Share2, 
  Image, 
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'passed' | 'failed';
  component?: React.ReactNode;
  externalUrl?: string;
}

export default function QATestPage() {
  const [currentTest, setCurrentTest] = useState<string>('overview');

  const testSuites: TestSuite[] = [
    {
      id: 'browser-compat',
      name: '브라우저 호환성',
      description: 'Chrome, Safari, Firefox, Edge에서의 기능 지원 확인',
      icon: <Monitor className="w-5 h-5" />,
      status: 'pending',
      component: <BrowserCompatibilityTest />
    },
    {
      id: 'mobile-responsive',
      name: '모바일 반응형',
      description: 'iOS/Android 기기에서의 UI/UX 검증',
      icon: <Smartphone className="w-5 h-5" />,
      status: 'pending',
      externalUrl: '/'
    },
    {
      id: 'share-functionality',
      name: '공유 기능 테스트',
      description: '동적 링크, OG 이미지, 소셜 공유 동작 확인',
      icon: <Share2 className="w-5 h-5" />,
      status: 'pending',
      externalUrl: '/test-share'
    },
    {
      id: 'image-capture',
      name: '이미지 캡처',
      description: 'html-to-image 품질 및 성능 테스트',
      icon: <Image className="w-5 h-5" />,
      status: 'pending',
      externalUrl: '/result'
    },
    {
      id: 'performance',
      name: '성능 최적화',
      description: '실시간 성능 모니터링 및 최적화 테스트',
      icon: <TestTube className="w-5 h-5" />,
      status: 'pending',
      component: <PerformanceOptimization />
    }
  ];

  const getStatusColor = (status: TestSuite['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: TestSuite['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">접근 제한</h2>
            <p className="text-muted-foreground mb-4">
              QA 테스트 도구는 개발 환경에서만 사용할 수 있습니다.
            </p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <TestTube className="w-8 h-8 text-primary" />
              QA 테스트 대시보드
            </h1>
            <p className="text-muted-foreground">
              브라우저 호환성, 기능 동작, 성능을 종합 검증합니다.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              홈으로
            </Button>
          </Link>
        </div>

        <Tabs value={currentTest} onValueChange={setCurrentTest} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="browser-compat">브라우저</TabsTrigger>
            <TabsTrigger value="mobile-responsive">모바일</TabsTrigger>
            <TabsTrigger value="share-functionality">공유</TabsTrigger>
            <TabsTrigger value="image-capture">이미지</TabsTrigger>
            <TabsTrigger value="performance">성능</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📋 테스트 개요</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {testSuites.map((suite) => (
                    <Card key={suite.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {suite.icon}
                            <span className="font-medium text-sm">{suite.name}</span>
                          </div>
                          {getStatusIcon(suite.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground mb-3">
                          {suite.description}
                        </p>
                        <div className="flex gap-2">
                          {suite.component ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => setCurrentTest(suite.id)}
                            >
                              테스트 실행
                            </Button>
                          ) : (
                            <Link href={suite.externalUrl || '#'} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full gap-1">
                                <ExternalLink className="w-3 h-3" />
                                테스트 페이지
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                      
                      {/* 상태 표시 */}
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(suite.status)}`} />
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 체크리스트 */}
            <Card>
              <CardHeader>
                <CardTitle>✅ QA 체크리스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">🖥️ 데스크톱 브라우저</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Chrome (최신 2개 버전)
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Safari (최신 2개 버전)
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Firefox (최신 2개 버전)
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Edge (최신 2개 버전)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">📱 모바일 환경</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        iOS Safari (iPhone)
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        iOS Safari (iPad)
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Android Chrome
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Samsung Internet
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">🔗 공유 기능</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        동적 공유 링크 생성
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        OG 이미지 표시
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        클립보드 복사
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        네이티브 공유 (모바일)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">🎨 이미지 캡처</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        고화질 PNG 생성
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        빠른 렌더링 속도
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        폰트 정상 표시
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        반응형 크기 조정
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 브라우저 호환성 테스트 */}
          <TabsContent value="browser-compat">
            <BrowserCompatibilityTest />
          </TabsContent>

          {/* 모바일 반응형 테스트 */}
          <TabsContent value="mobile-responsive">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  모바일 반응형 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">📱 테스트 방법</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>브라우저 개발자 도구(F12)를 열어주세요</li>
                    <li>디바이스 툴바 토글(Ctrl+Shift+M)을 활성화하세요</li>
                    <li>다양한 디바이스 크기에서 테스트해보세요</li>
                    <li>터치 이벤트와 스와이프 동작을 확인하세요</li>
                  </ol>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">📱 테스트할 디바이스</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• iPhone 14 Pro (393×852)</li>
                        <li>• iPhone SE (375×667)</li>
                        <li>• iPad Air (820×1180)</li>
                        <li>• Galaxy S22 (360×780)</li>
                        <li>• Galaxy Tab S8 (753×1037)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">🎯 확인 항목</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 텍스트 가독성 및 크기</li>
                        <li>• 버튼 터치 영역 (44px 이상)</li>
                        <li>• 스크롤 및 오버플로우</li>
                        <li>• 이미지 및 미디어 크기</li>
                        <li>• 네비게이션 사용성</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Link href="/" target="_blank">
                    <Button className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      홈페이지 테스트
                    </Button>
                  </Link>
                  <Link href="/input" target="_blank">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      입력 페이지 테스트
                    </Button>
                  </Link>
                  <Link href="/result" target="_blank">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      결과 페이지 테스트
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 공유 기능 테스트 */}
          <TabsContent value="share-functionality">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  공유 기능 종합 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/test-share" target="_blank">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <TestTube className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium">공유 데이터 관리</h4>
                        <p className="text-xs text-muted-foreground">로컬스토리지 테스트</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/result" target="_blank">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Share2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium">공유 버튼 테스트</h4>
                        <p className="text-xs text-muted-foreground">실제 공유 동작</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/api/og?name=테스트&element=목&keywords=창의적,성실한&summary=테스트용 사주 카드입니다" target="_blank">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Image className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <h4 className="font-medium">OG 이미지 테스트</h4>
                        <p className="text-xs text-muted-foreground">동적 이미지 생성</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">🧪 테스트 시나리오</h4>
                  <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                    <li>사주 입력 후 결과 페이지에서 공유 버튼 클릭</li>
                    <li>각 소셜 플랫폼별 공유 URL 동작 확인</li>
                    <li>생성된 공유 링크 접속하여 메타데이터 확인</li>
                    <li>이미지 캡처 및 다운로드 기능 테스트</li>
                    <li>모바일에서 네이티브 공유 기능 확인</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 이미지 캡처 테스트 */}
          <TabsContent value="image-capture">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  이미지 캡처 성능 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🎯 확인 포인트</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• <strong>화질</strong>: 텍스트가 선명하게 렌더링되는가?</li>
                    <li>• <strong>속도</strong>: 캡처가 3초 이내에 완료되는가?</li>
                    <li>• <strong>폰트</strong>: 웹폰트가 정상적으로 표시되는가?</li>
                    <li>• <strong>레이아웃</strong>: CSS 스타일이 올바르게 적용되는가?</li>
                    <li>• <strong>크기</strong>: 파일 크기가 적절한가? (1-3MB)</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Link href="/result" target="_blank">
                    <Button className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      결과 페이지에서 테스트
                    </Button>
                  </Link>
                  <Link href="/share/test0001" target="_blank">
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      공유 페이지에서 테스트
                    </Button>
                  </Link>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">⚡ 성능 최적화 팁</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 캡처 전 2초 대기하여 폰트 로딩 완료</li>
                    <li>• pixelRatio를 2로 설정하여 고해상도 지원</li>
                    <li>• cacheBust로 스타일 재계산 강제 실행</li>
                    <li>• backgroundColor로 투명도 문제 해결</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 성능 최적화 테스트 */}
          <TabsContent value="performance">
            <PerformanceOptimization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
