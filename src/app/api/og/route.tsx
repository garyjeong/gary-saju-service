/**
 * 개-사주 동적 OG 이미지 생성 API
 * 사주 결과를 기반으로 공유용 이미지를 동적으로 생성
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * OG 이미지 생성 API
 * URL: /api/og?name=홍길동&element=화&keywords=창의적,열정적&tone=casual
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // URL 파라미터 추출
    const name = searchParams.get('name') || '익명';
    const element = searchParams.get('element') || '미지';
    const keywords = searchParams.get('keywords')?.split(',') || ['신비로운'];
    const tone = searchParams.get('tone') || 'casual';
    const birthInfo = searchParams.get('birthInfo') || '1990년생';

    // 오행별 색상 및 이모지
    const elementConfig: Record<string, { color: string; bgColor: string; emoji: string }> = {
      '목': { color: '#059669', bgColor: '#dcfce7', emoji: '🌳' },
      '화': { color: '#dc2626', bgColor: '#fef2f2', emoji: '🔥' },
      '토': { color: '#d97706', bgColor: '#fefbeb', emoji: '🏔️' },
      '금': { color: '#7c2d12', bgColor: '#fef7ed', emoji: '⚔️' },
      '수': { color: '#1d4ed8', bgColor: '#eff6ff', emoji: '🌊' },
      '미지': { color: '#6b7280', bgColor: '#f9fafb', emoji: '✨' },
    };

    const config = elementConfig[element] || elementConfig['미지'];

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${config.bgColor} 0%, #ffffff 50%, ${config.bgColor} 100%)`,
            fontFamily: 'system-ui',
            position: 'relative',
          }}
        >
          {/* 배경 패턴 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: `radial-gradient(circle at 20% 80%, ${config.color} 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, ${config.color} 0%, transparent 50%),
                          radial-gradient(circle at 40% 40%, ${config.color} 0%, transparent 50%)`,
            }}
          />

          {/* 메인 카드 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `2px solid ${config.color}20`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '800px',
              width: '90%',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* 브랜드 로고 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${config.color}, #6366f1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                ✨
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${config.color}, #6366f1)`,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                개-사주
              </div>
            </div>

            {/* 이름과 정보 */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '16px',
              }}
            >
              {name}님의 사주
            </div>

            <div
              style={{
                fontSize: '20px',
                color: '#6b7280',
                marginBottom: '40px',
              }}
            >
              {birthInfo} • AI 개인화 해석
            </div>

            {/* 주요 오행 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px',
                padding: '20px 32px',
                borderRadius: '24px',
                background: config.bgColor,
                border: `2px solid ${config.color}30`,
              }}
            >
              <div style={{ fontSize: '32px' }}>{config.emoji}</div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: config.color,
                }}
              >
                {element} 기운 중심
              </div>
            </div>

            {/* 키워드들 */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              {keywords.slice(0, 3).map((keyword, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '20px',
                    background: `${config.color}15`,
                    color: config.color,
                    fontSize: '18px',
                    fontWeight: '600',
                  }}
                >
                  {keyword}
                </div>
              ))}
            </div>

            {/* 톤별 메시지 */}
            <div
              style={{
                fontSize: '18px',
                color: '#4b5563',
                fontStyle: 'italic',
                lineHeight: '1.6',
                maxWidth: '600px',
              }}
            >
              {tone === 'casual' && "친근하고 편안한 AI 해석으로 나의 운명을 알아보세요 😊"}
              {tone === 'formal' && "정통 사주명리학을 바탕으로 한 전문적인 해석을 제공합니다"}
              {tone === 'poetic' && "아름다운 문체로 펼쳐지는 나만의 운명 이야기를 만나보세요 🌸"}
            </div>
          </div>

          {/* 하단 CTA */}
          <div
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              color: '#6b7280',
            }}
          >
            <div style={{ fontSize: '20px' }}>✨</div>
            <span>gae-saju.vercel.app에서 무료로 확인해보세요</span>
            <div style={{ fontSize: '20px' }}>✨</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('OG 이미지 생성 실패:', error);
    
    // 폴백 이미지 응답
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f3e8ff, #ffffff)',
            fontFamily: 'system-ui',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#7c3aed',
              marginBottom: '20px',
            }}
          >
            개-사주
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#6b7280',
            }}
          >
            AI가 해석하는 나만의 사주
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
