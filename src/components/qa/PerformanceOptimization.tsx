/**
 * 성능 최적화 컴포넌트
 * 이미지 캡처, 공유 기능 등의 성능을 실시간 모니터링 및 최적화
 */

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Image, 
  Timer,
  Cpu,
  Memory,
  Network,
  Target,
  Play,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: {
    good: number;
    needs_improvement: number;
  };
  description: string;
}

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  duration: number;
  score: number;
  details: string;
  metrics: PerformanceMetric[];
}

export default function PerformanceOptimization() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const testElementRef = useRef<HTMLDivElement>(null);

  // 성능 메트릭 초기화
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      name: 'Page Load Time',
      value: 0,
      unit: 'ms',
      threshold: { good: 2000, needs_improvement: 4000 },
      description: '페이지 로딩 완료까지의 시간'
    },
    {
      name: 'Image Capture Time',
      value: 0,
      unit: 'ms',
      threshold: { good: 3000, needs_improvement: 6000 },
      description: 'html-to-image 캡처 소요 시간'
    },
    {
      name: 'Share Link Generation',
      value: 0,
      unit: 'ms',
      threshold: { good: 500, needs_improvement: 1000 },
      description: '공유 링크 생성 소요 시간'
    },
    {
      name: 'Image File Size',
      value: 0,
      unit: 'KB',
      threshold: { good: 1024, needs_improvement: 3072 },
      description: '생성된 이미지 파일 크기'
    },
    {
      name: 'Memory Usage',
      value: 0,
      unit: 'MB',
      threshold: { good: 50, needs_improvement: 100 },
      description: '현재 메모리 사용량'
    }
  ]);

  // 초기 성능 정보 수집
  useEffect(() => {
    // Page Load Time 측정
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Memory Usage 측정 (지원하는 브라우저에서만)
    let memoryUsage = 0;
    if ('memory' in performance) {
      memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }

    setPerformanceMetrics(prev => prev.map(metric => {
      if (metric.name === 'Page Load Time') {
        return { ...metric, value: loadTime };
      }
      if (metric.name === 'Memory Usage') {
        return { ...metric, value: memoryUsage };
      }
      return metric;
    }));
  }, []);

  // 성능 테스트 목록
  const performanceTests: Omit<TestResult, 'status' | 'duration' | 'score' | 'details' | 'metrics'>[] = [
    {
      id: 'image-capture-speed',
      name: '이미지 캡처 속도 테스트'
    },
    {
      id: 'image-quality-test',
      name: '이미지 품질 테스트'
    },
    {
      id: 'share-link-performance',
      name: '공유 링크 생성 성능'
    },
    {
      id: 'memory-leak-test',
      name: '메모리 누수 검사'
    },
    {
      id: 'network-efficiency',
      name: '네트워크 효율성 테스트'
    }
  ];

  // 개별 테스트 실행
  const runSingleTest = async (testId: string): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      switch (testId) {
        case 'image-capture-speed':
          return await testImageCaptureSpeed(testId, startTime);
        case 'image-quality-test':
          return await testImageQuality(testId, startTime);
        case 'share-link-performance':
          return await testShareLinkPerformance(testId, startTime);
        case 'memory-leak-test':
          return await testMemoryLeak(testId, startTime);
        case 'network-efficiency':
          return await testNetworkEfficiency(testId, startTime);
        default:
          throw new Error(`Unknown test: ${testId}`);
      }
    } catch (error) {
      const endTime = performance.now();
      return {
        id: testId,
        name: performanceTests.find(t => t.id === testId)?.name || testId,
        status: 'failed',
        duration: endTime - startTime,
        score: 0,
        details: `테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        metrics: []
      };
    }
  };

  // 이미지 캡처 속도 테스트
  const testImageCaptureSpeed = async (testId: string, startTime: number): Promise<TestResult> => {
    if (!testElementRef.current) {
      throw new Error('테스트 요소를 찾을 수 없음');
    }

    // html-to-image 동적 로딩
    const { toBlob } = await import('html-to-image');
    
    const captureStart = performance.now();
    const blob = await toBlob(testElementRef.current, {
      quality: 0.9,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      skipAutoScale: true,
      cacheBust: true
    });
    const captureEnd = performance.now();
    
    const captureTime = captureEnd - captureStart;
    const fileSize = blob ? Math.round(blob.size / 1024) : 0;
    const endTime = performance.now();

    // 메트릭 업데이트
    setPerformanceMetrics(prev => prev.map(metric => {
      if (metric.name === 'Image Capture Time') {
        return { ...metric, value: captureTime };
      }
      if (metric.name === 'Image File Size') {
        return { ...metric, value: fileSize };
      }
      return metric;
    }));

    const score = captureTime < 3000 ? 90 : captureTime < 6000 ? 70 : 30;

    return {
      id: testId,
      name: '이미지 캡처 속도 테스트',
      status: 'completed',
      duration: endTime - startTime,
      score,
      details: `캡처 시간: ${captureTime.toFixed(2)}ms, 파일 크기: ${fileSize}KB`,
      metrics: [
        {
          name: 'Capture Time',
          value: captureTime,
          unit: 'ms',
          threshold: { good: 3000, needs_improvement: 6000 },
          description: 'html-to-image 캡처 소요 시간'
        },
        {
          name: 'File Size',
          value: fileSize,
          unit: 'KB',
          threshold: { good: 1024, needs_improvement: 3072 },
          description: '생성된 이미지 파일 크기'
        }
      ]
    };
  };

  // 이미지 품질 테스트
  const testImageQuality = async (testId: string, startTime: number): Promise<TestResult> => {
    // 다양한 설정으로 이미지 생성하여 품질 비교
    const qualityTests = [
      { quality: 0.8, pixelRatio: 1 },
      { quality: 0.9, pixelRatio: 2 },
      { quality: 1.0, pixelRatio: 2 }
    ];

    let bestConfig = qualityTests[1]; // 기본값
    let qualityScore = 75;

    if (testElementRef.current) {
      const { toBlob } = await import('html-to-image');
      
      for (const config of qualityTests) {
        try {
          const blob = await toBlob(testElementRef.current, {
            quality: config.quality,
            pixelRatio: config.pixelRatio,
            backgroundColor: '#ffffff'
          });

          if (blob) {
            const fileSize = blob.size / 1024; // KB
            
            // 품질 점수 계산 (파일 크기와 해상도 균형)
            if (fileSize < 2048 && config.pixelRatio >= 2) {
              bestConfig = config;
              qualityScore = 90;
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }

    const endTime = performance.now();

    return {
      id: testId,
      name: '이미지 품질 테스트',
      status: 'completed',
      duration: endTime - startTime,
      score: qualityScore,
      details: `최적 설정: 품질 ${bestConfig.quality}, 해상도 ${bestConfig.pixelRatio}x`,
      metrics: [
        {
          name: 'Optimal Quality',
          value: bestConfig.quality * 100,
          unit: '%',
          threshold: { good: 90, needs_improvement: 80 },
          description: '최적 이미지 품질 설정'
        },
        {
          name: 'Pixel Ratio',
          value: bestConfig.pixelRatio,
          unit: 'x',
          threshold: { good: 2, needs_improvement: 1 },
          description: '최적 픽셀 비율'
        }
      ]
    };
  };

  // 공유 링크 성능 테스트
  const testShareLinkPerformance = async (testId: string, startTime: number): Promise<TestResult> => {
    const linkGenStart = performance.now();
    
    // 공유 데이터 생성 시뮬레이션
    const testData = {
      name: '테스트',
      dominantElement: '목',
      keywords: ['창의적', '성실한', '배려심깊은'],
      birthInfo: '1995년 3월 15일 출생',
      tone: 'casual' as const,
      summary: '테스트용 사주 카드입니다.'
    };

    // 공유 ID 생성 시뮬레이션
    let hash = 0;
    const dataString = `${testData.name}-${testData.dominantElement}-${testData.birthInfo}`;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const shareId = Math.abs(hash).toString(36).substring(0, 8);

    const linkGenEnd = performance.now();
    const linkGenerationTime = linkGenEnd - linkGenStart;

    // localStorage 성능 테스트
    const storageStart = performance.now();
    try {
      localStorage.setItem('_perf_test_', JSON.stringify(testData));
      localStorage.removeItem('_perf_test_');
    } catch (error) {
      // 스토리지 실패
    }
    const storageEnd = performance.now();
    const storageTime = storageEnd - storageStart;

    const endTime = performance.now();

    // 메트릭 업데이트
    setPerformanceMetrics(prev => prev.map(metric => {
      if (metric.name === 'Share Link Generation') {
        return { ...metric, value: linkGenerationTime };
      }
      return metric;
    }));

    const score = linkGenerationTime < 500 ? 95 : linkGenerationTime < 1000 ? 80 : 50;

    return {
      id: testId,
      name: '공유 링크 생성 성능',
      status: 'completed',
      duration: endTime - startTime,
      score,
      details: `링크 생성: ${linkGenerationTime.toFixed(2)}ms, 스토리지: ${storageTime.toFixed(2)}ms`,
      metrics: [
        {
          name: 'Link Generation',
          value: linkGenerationTime,
          unit: 'ms',
          threshold: { good: 500, needs_improvement: 1000 },
          description: '공유 링크 생성 시간'
        },
        {
          name: 'Storage Performance',
          value: storageTime,
          unit: 'ms',
          threshold: { good: 10, needs_improvement: 50 },
          description: 'localStorage 작업 시간'
        }
      ]
    };
  };

  // 메모리 누수 테스트
  const testMemoryLeak = async (testId: string, startTime: number): Promise<TestResult> => {
    let score = 85;
    let details = '메모리 사용량이 정상 범위 내입니다.';

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
      const totalMemory = memory.totalJSHeapSize / 1024 / 1024; // MB
      const memoryRatio = (usedMemory / totalMemory) * 100;

      if (memoryRatio > 80) {
        score = 40;
        details = `메모리 사용률이 높습니다: ${memoryRatio.toFixed(1)}%`;
      } else if (memoryRatio > 60) {
        score = 70;
        details = `메모리 사용률이 다소 높습니다: ${memoryRatio.toFixed(1)}%`;
      } else {
        details = `메모리 사용률: ${memoryRatio.toFixed(1)}%`;
      }

      // 메트릭 업데이트
      setPerformanceMetrics(prev => prev.map(metric => {
        if (metric.name === 'Memory Usage') {
          return { ...metric, value: usedMemory };
        }
        return metric;
      }));
    } else {
      score = 75;
      details = '이 브라우저는 메모리 API를 지원하지 않습니다.';
    }

    const endTime = performance.now();

    return {
      id: testId,
      name: '메모리 누수 검사',
      status: 'completed',
      duration: endTime - startTime,
      score,
      details,
      metrics: []
    };
  };

  // 네트워크 효율성 테스트
  const testNetworkEfficiency = async (testId: string, startTime: number): Promise<TestResult> => {
    let score = 80;
    let details = '네트워크 상태를 확인했습니다.';

    // Connection API 확인
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;

      if (effectiveType === '4g' && downlink > 5) {
        score = 95;
        details = `빠른 네트워크 연결: ${effectiveType}, ${downlink}Mbps`;
      } else if (effectiveType === '3g' || downlink < 2) {
        score = 60;
        details = `느린 네트워크 연결: ${effectiveType}, ${downlink}Mbps`;
      } else {
        details = `네트워크 연결: ${effectiveType}, ${downlink}Mbps`;
      }
    } else {
      details = '이 브라우저는 네트워크 API를 지원하지 않습니다.';
    }

    const endTime = performance.now();

    return {
      id: testId,
      name: '네트워크 효율성 테스트',
      status: 'completed',
      duration: endTime - startTime,
      score,
      details,
      metrics: []
    };
  };

  // 전체 테스트 실행
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const test of performanceTests) {
      setCurrentTest(test.id);
      
      // 테스트 시작 상태로 업데이트
      setTestResults(prev => [...prev, {
        ...test,
        status: 'running',
        duration: 0,
        score: 0,
        details: '',
        metrics: []
      }]);

      try {
        const result = await runSingleTest(test.id);
        
        // 테스트 완료 상태로 업데이트
        setTestResults(prev => prev.map(item => 
          item.id === test.id ? result : item
        ));
      } catch (error) {
        // 테스트 실패 처리
        setTestResults(prev => prev.map(item => 
          item.id === test.id ? {
            ...item,
            status: 'failed',
            details: `테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          } : item
        ));
      }

      // 테스트 간 지연
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setCurrentTest(null);
    setIsRunning(false);
  };

  // 성능 점수 색상
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  // 메트릭 상태 색상
  const getMetricStatus = (value: number, threshold: { good: number; needs_improvement: number }) => {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs_improvement) return 'needs_improvement';
    return 'poor';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs_improvement': return 'text-amber-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* 성능 메트릭 개요 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            실시간 성능 메트릭
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceMetrics.map((metric) => {
              const status = getMetricStatus(metric.value, metric.threshold);
              const percentage = Math.min((metric.value / metric.threshold.needs_improvement) * 100, 100);
              
              return (
                <Card key={metric.name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{metric.name}</h4>
                    <Badge variant={status === 'good' ? 'default' : status === 'needs_improvement' ? 'secondary' : 'destructive'}>
                      {status === 'good' ? '좋음' : status === 'needs_improvement' ? '개선 필요' : '나쁨'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${getMetricColor(status)}`}>
                        {metric.value.toFixed(metric.unit === 'ms' ? 0 : 1)} {metric.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 테스트 실행 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            성능 테스트 실행
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Timer className="w-4 h-4 animate-pulse" />
                  테스트 중...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  전체 테스트 실행
                </>
              )}
            </Button>
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline"
              disabled={isRunning}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testResults.length > 0 && (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.name}</h4>
                    <div className="flex items-center gap-2">
                      {result.status === 'running' && <Timer className="w-4 h-4 animate-pulse text-blue-500" />}
                      {result.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {result.status === 'failed' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      
                      {result.status === 'completed' && (
                        <Badge variant={getScoreBadgeVariant(result.score)}>
                          {result.score}점
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{result.details}</p>
                  
                  {result.duration > 0 && (
                    <p className="text-xs text-muted-foreground">
                      실행 시간: {result.duration.toFixed(2)}ms
                    </p>
                  )}

                  {result.metrics && result.metrics.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {result.metrics.map((metric) => (
                        <div key={metric.name} className="text-xs">
                          <span className="font-medium">{metric.name}:</span>
                          <span className="ml-1">{metric.value.toFixed(1)} {metric.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 테스트용 요소 (숨김) */}
          <div ref={testElementRef} className="hidden">
            <div className="w-96 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-6">
              <h3 className="text-lg font-serif font-bold">테스트용 사주 카드</h3>
              <p className="text-sm text-muted-foreground mt-2">
                이 요소는 이미지 캡처 성능 테스트에 사용됩니다.
              </p>
              <div className="mt-4 space-y-2">
                <div className="w-full h-2 bg-primary/30 rounded"></div>
                <div className="w-3/4 h-2 bg-accent/30 rounded"></div>
                <div className="w-1/2 h-2 bg-primary/20 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최적화 권장사항 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              최적화 권장사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.some(r => r.score < 80) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">성능 개선 필요</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {testResults.filter(r => r.score < 80).map(result => (
                      <li key={result.id}>• {result.name}: 점수 개선 필요 ({result.score}점)</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">📈 성능 최적화 팁</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 이미지 캡처 전 폰트 로딩 완료 대기</li>
                    <li>• pixelRatio 2.0으로 고해상도 이미지 생성</li>
                    <li>• cacheBust로 최신 스타일 반영</li>
                    <li>• 백그라운드 색상 명시적 설정</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">🚀 권장 설정</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 이미지 품질: 0.9 (90%)</li>
                    <li>• 픽셀 비율: 2.0x</li>
                    <li>• 캡처 지연: 2초</li>
                    <li>• 최대 파일 크기: 3MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
