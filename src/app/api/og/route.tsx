/**
 * 개-사주 동적 OG 이미지 생성 API
 * Next.js ImageResponse를 사용한 SNS 공유용 이미지 자동 생성
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// 오행별 색상 설정 (전통 한국 테마)
const elementColors = {
  목: { primary: '#2D5016', secondary: '#8FBC8F', bg: '#F0FFF0', emoji: '🌳' },
  화: { primary: '#D2691E', secondary: '#FF6347', bg: '#FFF8DC', emoji: '🔥' },
  토: { primary: '#8B4513', secondary: '#DEB887', bg: '#FDF5E6', emoji: '🏔️' },
  금: { primary: '#708090', secondary: '#C0C0C0', bg: '#F8F8FF', emoji: '⚔️' },
  수: { primary: '#191970', secondary: '#4169E1', bg: '#F0F8FF', emoji: '🌊' },
  미지: { primary: '#696969', secondary: '#A9A9A9', bg: '#F5F5F5', emoji: '✨' }
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // URL 파라미터에서 사주 정보 추출
    const name = searchParams.get('name') || '익명';
    const element = searchParams.get('element') || '미지';
    const keywords = searchParams.get('keywords')?.split(',') || ['신비로운', '독특한', '특별한'];
    const birthInfo = searchParams.get('birthInfo') || '';
    const tone = searchParams.get('tone') || 'casual';
    const summary = searchParams.get('summary') || '나만의 특별한 사주';

    // 해당 오행의 색상 테마 적용
    const colors = elementColors[element as keyof typeof elementColors] || elementColors['미지'];

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
            backgroundColor: colors.bg,
            fontFamily: 'system-ui, sans-serif',
            position: 'relative',
          }}
        >
          {/* 배경 그라디언트 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.secondary}20 100%)`,
            }}
          />

          {/* 전통 패턴 배경 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary} 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${colors.secondary} 0%, transparent 50%)`,
            }}
          />

          {/* 메인 콘텐츠 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 10,
              maxWidth: '900px',
              padding: '80px',
            }}
          >
            {/* 브랜드 로고 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '60px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  boxShadow: `0 20px 40px ${colors.primary}40`,
                }}
              >
                ✨
              </div>
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  backgroundClip: 'text',
                  color: 'transparent',
                  margin: 0,
                }}
              >
                개-사주
              </h1>
            </div>

            {/* 이름과 오행 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '30px',
                marginBottom: '50px',
              }}
            >
              <h2
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: colors.primary,
                  margin: 0,
                  textShadow: `2px 2px 4px ${colors.primary}20`,
                }}
              >
                {name}님의 사주
              </h2>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  background: 'white',
                  padding: '20px 40px',
                  borderRadius: '50px',
                  boxShadow: `0 10px 30px ${colors.primary}20`,
                  border: `3px solid ${colors.secondary}`,
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {colors.emoji}
                </div>
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: colors.primary,
                  }}
                >
                  {element} 기운
                </span>
              </div>
            </div>

            {/* 키워드 배지들 */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '50px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {keywords.slice(0, 3).map((keyword, index) => (
                <div
                  key={keyword}
                  style={{
                    background: `linear-gradient(135deg, ${colors.secondary}30 0%, ${colors.primary}20 100%)`,
                    color: colors.primary,
                    padding: '15px 30px',
                    borderRadius: '25px',
                    fontSize: '32px',
                    fontWeight: '600',
                    border: `2px solid ${colors.secondary}50`,
                    boxShadow: `0 8px 20px ${colors.primary}15`,
                  }}
                >
                  {keyword}
                </div>
              ))}
            </div>

            {/* 요약 */}
            {summary && (
              <div
                style={{
                  background: 'white',
                  padding: '30px 50px',
                  borderRadius: '20px',
                  fontSize: '28px',
                  color: colors.primary,
                  fontStyle: 'italic',
                  maxWidth: '700px',
                  textAlign: 'center',
                  boxShadow: `0 15px 35px ${colors.primary}20`,
                  border: `2px solid ${colors.secondary}30`,
                  marginBottom: '40px',
                }}
              >
                "{summary}"
              </div>
            )}

            {/* 출생 정보 */}
            {birthInfo && (
              <div
                style={{
                  background: `${colors.primary}10`,
                  color: colors.primary,
                  padding: '15px 30px',
                  borderRadius: '15px',
                  fontSize: '24px',
                  fontFamily: 'monospace',
                  marginBottom: '30px',
                }}
              >
                {birthInfo}
              </div>
            )}

            {/* 푸터 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '24px',
                color: colors.secondary,
                opacity: 0.8,
              }}
            >
              ✨ AI가 풀어주는 나만의 사주 해석 ✨
            </div>
          </div>

          {/* 장식 요소들 */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '50px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `${colors.secondary}30`,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '80px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `${colors.primary}20`,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '150px',
              right: '120px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `${colors.secondary}40`,
              opacity: 0.4,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (error) {
    console.error('OG 이미지 생성 실패:', error);
    
    // 에러 시 기본 이미지 반환
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
            backgroundColor: '#FDF6E3',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#8B4513',
              marginBottom: '40px',
            }}
          >
            개-사주
          </div>
          <div
            style={{
              fontSize: '48px',
              color: '#D2691E',
            }}
          >
            AI가 풀어주는 사주 해석
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}