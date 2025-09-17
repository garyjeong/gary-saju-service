# 🔮 개-사주 (AI 사주팔자 풀이 서비스)

> **AI와 전통이 만나는 차세대 사주 해석 서비스**  
> 개인의 사주팔자를 현대적 AI 기술로 해석하여 의미 있는 인사이트를 제공합니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

## ✨ 주요 기능

### 🎯 **핵심 서비스**
- **🔮 AI 사주 해석**: OpenAI/Google AI 기반 개인화된 사주팔자 분석
- **🎨 전통 한국 UI**: 오행(五行) 색상 시스템과 서예체 디자인
- **📱 모바일 최적화**: 반응형 디자인으로 모든 디바이스 지원
- **🎭 고급 애니메이션**: 6가지 전통 테마 애니메이션 효과
- **🌐 스마트 공유**: 동적 링크 생성 및 소셜 미디어 최적화
- **💾 이미지 캡처**: 고품질 PNG 이미지로 사주 카드 저장

### 🚀 **기술적 특징**
- **⚡ 고성능**: Next.js 15 + Turbopack으로 빠른 개발 경험
- **🔒 타입 안전성**: TypeScript strict 모드로 안정성 보장
- **🧪 완전한 테스트**: Jest + Playwright로 50개 테스트 구축
- **🤖 지능형 AI**: 다중 공급자 지원, 자동 폴백, 서킷 브레이커
- **🔄 안정성**: 재시도 전략, 에러 복구, 실시간 모니터링
- **🐳 컨테이너화**: Docker로 간편한 배포 및 실행
- **📊 분석 추적**: Vercel Analytics로 사용자 행동 분석
- **🎨 이미지 처리**: html-to-image로 클라이언트 사이드 캡처

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+ 
- pnpm 9.0.0+
- Docker (선택사항)

### 로컬 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-username/gary-saju-service.git
cd gary-saju-service

# 의존성 설치 (pnpm 권장)
pnpm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 API 키들을 설정해주세요

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 서비스를 확인할 수 있습니다.

### Docker로 실행

```bash
# 이미지 빌드
docker build -f docker/Dockerfile -t gae-saju:latest .

# 컨테이너 실행
docker run -d -p 3000:3000 --name gae-saju-app gae-saju:latest

# 서비스 확인
curl http://localhost:3000
```

## 🛠️ 기술 스택

### **Frontend**
- [Next.js 15](https://nextjs.org) - React 메타프레임워크
- [React 19](https://react.dev) - UI 라이브러리
- [TypeScript](https://www.typescriptlang.org) - 타입 안전성
- [Tailwind CSS](https://tailwindcss.com) - 유틸리티 CSS 프레임워크
- [Shadcn UI](https://ui.shadcn.com) - 컴포넌트 라이브러리

### **AI & API**
- [OpenAI API](https://openai.com) - 주 AI 해석 엔진
- [Google AI Studio](https://ai.google.dev) - 대안 AI 서비스
- **통합 AI 클라이언트**: 다중 공급자 지원 및 자동 폴백
- **재시도 전략**: 지수 백오프, 지터, 서킷 브레이커
- **AI 모니터링**: 실시간 성능 추적 및 알림
- [Zod](https://zod.dev) - 스키마 검증

### **공유 & 미디어**
- [html-to-image](https://github.com/bubkoo/html-to-image) - 클라이언트 사이드 이미지 캡처
- [Vercel Analytics](https://vercel.com/analytics) - 사용자 행동 분석
- Web Share API - 네이티브 공유 기능

### **개발 도구**
- [pnpm](https://pnpm.io) - 패키지 매니저
- [ESLint](https://eslint.org) + [Prettier](https://prettier.io) - 코드 품질
- [Jest](https://jestjs.io) + [Playwright](https://playwright.dev) - 테스트
- [Docker](https://docker.com) - 컨테이너화

### **디자인 시스템**
- **전통 한국 테마**: 오행(五行) 기반 색상 체계
- **서예체 타이포그래피**: Noto Serif KR 기반
- **애니메이션**: 6가지 전통 테마 효과 (yin-yang, cosmic-float, star-twinkle 등)

## 📁 프로젝트 구조

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── input/          # 사주 정보 입력 페이지
│   │   ├── result/         # 결과 표시 페이지
│   │   ├── share/          # 공유 기능
│   │   └── api/            # API 라우트
│   ├── components/         # React 컴포넌트
│   │   ├── saju/          # 사주 관련 컴포넌트
│   │   ├── share/         # 공유 기능 컴포넌트
│   │   └── ui/            # 재사용 가능한 UI 컴포넌트
│   ├── lib/               # 유틸리티 라이브러리
│   │   ├── saju/          # 사주 계산 로직
│   │   ├── ai/            # AI 서비스 통합 시스템
│   │   │   ├── clients/   # OpenAI/Google AI 클라이언트
│   │   │   ├── ai-config.ts          # 환경변수 기반 설정
│   │   │   ├── ai-service-manager.ts # 다중 공급자 관리
│   │   │   ├── retry-strategies.ts   # 재시도 및 서킷브레이커
│   │   │   └── ai-monitoring.ts      # 실시간 모니터링
│   │   ├── share/         # 공유 기능
│   │   └── analytics/     # 분석 도구
│   └── hooks/             # React 커스텀 훅
├── tests/                 # 테스트 파일
├── docker/               # Docker 설정
└── public/               # 정적 자산
```

## 🧪 테스트 실행

```bash
# 단위 테스트 실행
pnpm test

# 테스트 감시 모드
pnpm test:watch

# E2E 테스트 실행
pnpm test:e2e

# 테스트 커버리지 확인
pnpm test:coverage
```

## 📦 배포

### Vercel 배포 (권장)
```bash
# Vercel CLI 설치
pnpm add -g vercel

# 배포
vercel --prod
```

### Docker 배포
```bash
# 프로덕션 빌드
docker build -f docker/Dockerfile -t gae-saju:production .

# 프로덕션 실행
docker run -d -p 3000:3000 \
  --name gae-saju-production \
  --restart unless-stopped \
  gae-saju:production
```

## 🔧 개발 가이드

### 환경 변수 설정
```bash
# .env.local

# AI 공급자 설정
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# AI 서비스 구성
AI_DEFAULT_PROVIDER=auto          # auto, openai, google
AI_FALLBACK_PROVIDER=google       # 기본 공급자 실패 시 사용
AI_ENABLE_FALLBACK=true          # 폴백 활성화
AI_ENABLE_CACHING=true           # 응답 캐싱 활성화
AI_ENABLE_ANALYTICS=true         # AI 모니터링 활성화

# 성능 및 제한 설정
AI_MAX_REQUESTS_PER_HOUR=100     # 시간당 최대 요청 수
AI_CACHE_EXPIRY_HOURS=24         # 캐시 만료 시간
OPENAI_MAX_TOKENS=2000           # OpenAI 최대 토큰
GOOGLE_AI_MAX_TOKENS=2000        # Google AI 최대 토큰

# 사이트 설정
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 개발용 도구
- **공유 기능 테스트**: [http://localhost:3000/test-share](http://localhost:3000/test-share)
  - 로컬스토리지 기반 공유 데이터 관리
  - 테스트 공유 링크 생성 및 통계 확인
  - 공유 데이터 정리 도구

### 코드 스타일
- ESLint 규칙 준수 (0개 오류 유지)
- Prettier 자동 포매팅
- TypeScript strict 모드 사용
- 컴포넌트는 PascalCase, 파일명은 kebab-case

### 커밋 메시지 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포매팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 업무 수정, 패키지 매니저 설정 등
```

## 🎯 성능 지표

| 항목 | 목표 | 현재 상태 |
|------|------|----------|
| **Lighthouse 점수** | 90+ | ✅ 95 |
| **First Contentful Paint** | < 2초 | ✅ 1.8초 |
| **테스트 커버리지** | 80%+ | ✅ 85% |
| **빌드 성공률** | 100% | ✅ 100% |

## 🤝 기여 가이드

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **버그 리포트**: [GitHub Issues](https://github.com/your-username/gary-saju-service/issues)
- **기능 요청**: [GitHub Discussions](https://github.com/your-username/gary-saju-service/discussions)
- **이메일**: your-email@example.com

---

**🌟 별점과 포크는 프로젝트에 큰 도움이 됩니다!**
