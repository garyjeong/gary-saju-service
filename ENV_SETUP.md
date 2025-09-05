# 🔑 개-사주 API Key 설정 가이드

## 🎉 현재 상태: API Key 불필요!

**개-사주는 현재 어떤 API Key도 없이 완전히 동작합니다.**

- ✅ **사주 계산**: manseryeok 라이브러리 (로컬)
- ✅ **데이터 저장**: sessionStorage (브라우저)
- ✅ **UI 표시**: 완성된 컴포넌트들

---

## 배포 시 자동 설정

### Vercel 배포 환경 (자동)
Vercel에 배포하면 자동으로 주입되는 환경 변수들

```bash
VERCEL_URL=auto_generated
VERCEL_ENV=production|preview|development
```

**설정 방법:** Vercel 배포 시 자동 생성됨

---

## 향후 기능 확장 시 필요한 API Keys

### 1. OpenAI API (선택사항)
AI 기반 사주 해석 개선을 위한 API

```bash
OPENAI_API_KEY=sk-your_openai_api_key
```

**용도:** 더 정교한 사주 해석 및 개인화된 조언 생성
**획득:** [OpenAI Platform](https://platform.openai.com)

### 2. Google Analytics (선택사항)
사용자 분석 및 통계를 위한 서비스

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**용도:** 사용자 행동 분석, 페이지 방문 통계
**획득:** [Google Analytics](https://analytics.google.com)

### 3. Sentry (선택사항)
에러 모니터링 및 성능 추적

```bash
SENTRY_DSN=https://your-sentry-dsn
```

**용도:** 실시간 에러 추적, 성능 모니터링
**획득:** [Sentry](https://sentry.io)

### 4. 소셜 로그인 (향후 구현)
사용자 인증 및 편의성 향상

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

**용도:** 간편 로그인, 사용자 프로필 연동

### 5. 이메일 서비스 (향후 구현)
사주 결과 이메일 전송용

```bash
# Resend (추천)
RESEND_API_KEY=re_your_resend_api_key

# 또는 SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**용도:** 사주 결과 이메일 발송, 알림 서비스

---

## 설정 방법

### 로컬 개발 환경
1. 프로젝트 루트에 `.env.local` 파일 생성
2. 필요한 환경 변수 추가
3. 개발 서버 재시작

```bash
# .env.local 예시
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Vercel 배포 환경
1. Vercel Dashboard → Project Settings → Environment Variables
2. 각 환경별로 필요한 변수 추가
3. Production, Preview, Development 환경 구분 설정

---

## 우선순위별 설정 가이드

### 🔴 즉시 필요 (MVP 완성용)
1. **Supabase** - 데이터베이스 기능 활성화

### 🟡 단기 추가 (1-2주 내)
2. **Google Analytics** - 사용자 분석
3. **Sentry** - 에러 모니터링

### 🟢 장기 계획 (1-2개월 내)
4. **OpenAI API** - AI 해석 고도화
5. **소셜 로그인** - 사용자 편의성
6. **이메일 서비스** - 결과 공유 확장

---

## 보안 주의사항

### ✅ 안전한 관리
- `.env.local` 파일은 절대 Git에 커밋하지 않기
- API Key는 정기적으로 로테이션
- 불필요한 권한은 최소화

### ❌ 주의사항
- Client-side에서 사용하지 않을 Key는 `NEXT_PUBLIC_` 접두사 사용 금지
- 개발환경과 프로덕션 환경의 Key 분리 관리
- API Key 노출 시 즉시 재발급

---

현재 가장 우선적으로 필요한 것은 **Supabase API Key** 설정입니다. 
나머지는 기능 확장에 따라 단계적으로 추가하시면 됩니다.
