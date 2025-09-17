/**
 * 브라우저 호환성 테스트 컴포넌트
 * 공유 기능의 브라우저별 동작을 검증
 */

"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  Image,
  Share2,
  Copy,
  Download
} from 'lucide-react';

interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  userAgent: string;
  vendor: string;
}

interface FeatureTest {
  name: string;
  description: string;
  icon: React.ReactNode;
  test: () => Promise<boolean> | boolean;
  status: 'pending' | 'passed' | 'failed' | 'testing';
  details?: string;
}

export default function BrowserCompatibilityTest() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [features, setFeatures] = useState<FeatureTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 브라우저 정보 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const vendor = navigator.vendor || '';
      
      // 브라우저 감지
      let browserName = 'Unknown';
      let browserVersion = 'Unknown';
      
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/(\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }

      setBrowserInfo({
        name: browserName,
        version: browserVersion,
        platform: navigator.platform,
        userAgent,
        vendor
      });

      // 기능 테스트 목록 초기화
      setFeatures([
        {
          name: 'Clipboard API',
          description: '클립보드 복사 기능 지원',
          icon: <Copy className="w-4 h-4" />,
          test: () => !!navigator.clipboard && !!navigator.clipboard.writeText,
          status: 'pending'
        },
        {
          name: 'Web Share API',
          description: '네이티브 공유 기능 지원',
          icon: <Share2 className="w-4 h-4" />,
          test: () => !!navigator.share,
          status: 'pending'
        },
        {
          name: 'Local Storage',
          description: '로컬 스토리지 사용 가능',
          icon: <Monitor className="w-4 h-4" />,
          test: () => {
            try {
              const testKey = '_browsertest_';
              localStorage.setItem(testKey, 'test');
              localStorage.removeItem(testKey);
              return true;
            } catch {
              return false;
            }
          },
          status: 'pending'
        },
        {
          name: 'Canvas API',
          description: 'html-to-image를 위한 캔버스 지원',
          icon: <Image className="w-4 h-4" />,
          test: () => !!document.createElement('canvas').getContext,
          status: 'pending'
        },
        {
          name: 'Fetch API',
          description: '네트워크 요청 기능',
          icon: <Wifi className="w-4 h-4" />,
          test: () => !!window.fetch,
          status: 'pending'
        },
        {
          name: 'Intersection Observer',
          description: '스크롤 애니메이션 지원',
          icon: <Monitor className="w-4 h-4" />,
          test: () => !!window.IntersectionObserver,
          status: 'pending'
        },
        {
          name: 'CSS Grid',
          description: '현대적 레이아웃 지원',
          icon: <Monitor className="w-4 h-4" />,
          test: () => {
            const element = document.createElement('div');
            element.style.display = 'grid';
            return element.style.display === 'grid';
          },
          status: 'pending'
        },
        {
          name: 'ES6 Modules',
          description: '모던 JavaScript 지원',
          icon: <Globe className="w-4 h-4" />,
          test: () => {
            try {
              new Function('import("")');
              return true;
            } catch {
              return false;
            }
          },
          status: 'pending'
        }
      ]);
    }
  }, []);

  // 모든 테스트 실행
  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < features.length; i++) {
      // 개별 테스트 시작 표시
      setFeatures(prev => prev.map((feature, index) => 
        index === i ? { ...feature, status: 'testing' } : feature
      ));

      await new Promise(resolve => setTimeout(resolve, 300)); // 시각적 효과

      try {
        const result = await Promise.resolve(features[i].test());
        
        setFeatures(prev => prev.map((feature, index) => 
          index === i ? { 
            ...feature, 
            status: result ? 'passed' : 'failed',
            details: result ? '지원됨' : '지원되지 않음'
          } : feature
        ));
      } catch (error) {
        setFeatures(prev => prev.map((feature, index) => 
          index === i ? { 
            ...feature, 
            status: 'failed',
            details: `테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          } : feature
        ));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: FeatureTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: FeatureTest['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500 hover:bg-green-600">통과</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      case 'testing':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">테스트 중</Badge>;
      default:
        return <Badge variant="secondary">대기</Badge>;
    }
  };

  const passedCount = features.filter(f => f.status === 'passed').length;
  const failedCount = features.filter(f => f.status === 'failed').length;
  const totalCount = features.length;

  return (
    <div className="space-y-8">
      {/* 브라우저 정보 */}
      {browserInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              브라우저 환경 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">브라우저</span>
                <p className="font-medium">{browserInfo.name} {browserInfo.version}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">플랫폼</span>
                <p className="font-medium">{browserInfo.platform}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">벤더</span>
                <p className="font-medium">{browserInfo.vendor || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">모바일</span>
                <p className="font-medium">
                  {/Mobile|Android|iPhone|iPad/.test(browserInfo.userAgent) ? '예' : '아니오'}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <span className="text-sm text-muted-foreground">User Agent</span>
              <p className="text-xs font-mono mt-1 p-2 bg-muted rounded break-all">
                {browserInfo.userAgent}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 테스트 결과 요약 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            기능 호환성 테스트
          </CardTitle>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                테스트 중...
              </>
            ) : (
              '전체 테스트 실행'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {/* 요약 통계 */}
          {(passedCount > 0 || failedCount > 0) && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">{passedCount}개 통과</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium">{failedCount}개 실패</span>
              </div>
              <div className="ml-auto">
                <Badge variant="outline">
                  {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}% 호환성
                </Badge>
              </div>
            </div>
          )}

          {/* 개별 테스트 결과 */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <div>
                    <h4 className="font-medium">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    {feature.details && (
                      <p className="text-xs text-muted-foreground mt-1">{feature.details}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(feature.status)}
                  {getStatusBadge(feature.status)}
                </div>
              </div>
            ))}
          </div>

          {/* 권장사항 */}
          {failedCount > 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">⚠️ 호환성 문제 발견</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {features
                  .filter(f => f.status === 'failed')
                  .map(feature => (
                    <li key={feature.name}>
                      • <strong>{feature.name}</strong>: 일부 기능이 제한될 수 있습니다.
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {passedCount === totalCount && totalCount > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ 완전 호환</h4>
              <p className="text-sm text-green-700">
                모든 기능이 이 브라우저에서 정상 동작합니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
