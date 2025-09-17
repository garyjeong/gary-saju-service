# AI 공급자 설정 가이드

개-사주 서비스는 OpenAI와 Google AI를 지원하는 통합 AI 시스템을 제공합니다. 환경변수를 통해 AI 공급자를 설정하고 관리할 수 있습니다.

## 📋 목차

1. [기본 설정](#기본-설정)
2. [환경변수 설정](#환경변수-설정)
3. [공급자별 상세 설정](#공급자별-상세-설정)
4. [고급 기능](#고급-기능)
5. [문제 해결](#문제-해결)
6. [모니터링](#모니터링)

## 🚀 기본 설정

### 필수 환경변수

AI 서비스를 사용하려면 최소한 하나의 API 키가 필요합니다:

```bash
# OpenAI API 키 (옵션 1)
OPENAI_API_KEY=sk-your-openai-api-key

# Google AI API 키 (옵션 2)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### 기본 공급자 선택

```bash
# 기본 AI 공급자 설정
AI_DEFAULT_PROVIDER=google  # 'openai', 'google', 'auto'

# 폴백 공급자 설정 (선택사항)
AI_FALLBACK_PROVIDER=openai
```

### 자동 선택 모드

`AI_DEFAULT_PROVIDER=auto`로 설정하면 시스템이 자동으로 최적의 공급자를 선택합니다:

1. **API 키 기반 자동 선택**: 사용 가능한 API 키에 따라 자동 선택
2. **비용 효율성 우선**: 동일한 품질이면 더 저렴한 공급자 선택 (Google AI 우선)
3. **폴백 지원**: 기본 공급자 실패 시 자동으로 다른 공급자로 전환

## ⚙️ 환경변수 설정

### AI 공급자 설정

```bash
# === 기본 설정 ===
AI_DEFAULT_PROVIDER=google          # 기본 공급자: 'openai', 'google', 'auto'
AI_FALLBACK_PROVIDER=openai         # 폴백 공급자 (선택사항)
AI_ENABLE_FALLBACK=true             # 폴백 활성화 여부

# === API 키 ===
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_AI_API_KEY=your-google-key

# === 모델 설정 ===
OPENAI_MODEL=gpt-4o-mini            # OpenAI 모델
GOOGLE_AI_MODEL=gemini-1.5-flash    # Google AI 모델

# === 토큰 및 성능 설정 ===
OPENAI_MAX_TOKENS=2000              # OpenAI 최대 토큰
GOOGLE_AI_MAX_TOKENS=2000           # Google AI 최대 토큰
OPENAI_TEMPERATURE=0.7              # OpenAI 창의성 수준
GOOGLE_AI_TEMPERATURE=0.7           # Google AI 창의성 수준

# === 타임아웃 및 재시도 ===
OPENAI_TIMEOUT=30000                # OpenAI 타임아웃 (밀리초)
GOOGLE_AI_TIMEOUT=30000             # Google AI 타임아웃 (밀리초)
OPENAI_RETRIES=3                    # OpenAI 재시도 횟수
GOOGLE_AI_RETRIES=3                 # Google AI 재시도 횟수
```

### AI 기능 설정

```bash
# === 고급 기능 ===
AI_ENABLE_ADVANCED_PROMPTS=true     # 고도화된 프롬프트 시스템 사용
AI_ENABLE_QUALITY_CHECK=true        # 품질 검사 활성화
AI_ENABLE_CACHING=true              # 응답 캐싱 활성화
AI_ENABLE_ANALYTICS=true            # 사용량 분석 활성화
AI_DEBUG_MODE=false                 # 디버그 모드 (개발환경에서만)

# === 제한 설정 ===
AI_MAX_REQUESTS_PER_HOUR=100        # 시간당 최대 요청 수
AI_MAX_TOKENS_PER_REQUEST=4000      # 요청당 최대 토큰 수
AI_CACHE_EXPIRY_HOURS=24            # 캐시 만료 시간
```

## 🔧 공급자별 상세 설정

### OpenAI 설정

```bash
# OpenAI 공급자 설정
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini            # 추천: 비용 효율적
OPENAI_MAX_TOKENS=2000              # 충분한 응답 길이 확보
OPENAI_TEMPERATURE=0.7              # 창의성과 일관성의 균형
OPENAI_TIMEOUT=30000                # 30초 타임아웃
OPENAI_RETRIES=3                    # 3회 재시도

# OpenAI의 장점:
# - 높은 품질의 응답
# - 안정적인 서비스
# - 다양한 모델 선택

# OpenAI의 단점:
# - 유료 서비스 (사용량에 따른 과금)
# - API 키 관리 필요
```

### Google AI (Gemini) 설정

```bash
# Google AI 공급자 설정
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_AI_MODEL=gemini-1.5-flash    # 추천: 빠르고 효율적
GOOGLE_AI_MAX_TOKENS=2000           # 충분한 응답 길이 확보
GOOGLE_AI_TEMPERATURE=0.7           # 창의성과 일관성의 균형
GOOGLE_AI_TIMEOUT=30000             # 30초 타임아웃
GOOGLE_AI_RETRIES=3                 # 3회 재시도

# Google AI의 장점:
# - 무료 할당량 제공
# - 빠른 응답 속도
# - 다국어 지원 우수

# Google AI의 단점:
# - 할당량 제한
# - 상대적으로 새로운 서비스
```

## 🎯 고급 기능

### 로드 밸런싱

여러 공급자 간 부하 분산을 위한 설정:

```bash
AI_ENABLE_LOAD_BALANCING=true       # 로드 밸런싱 활성화
AI_LOAD_BALANCING_STRATEGY=fastest-response  # 전략 선택
```

로드 밸런싱 전략:
- `round-robin`: 순차적으로 공급자 선택
- `least-used`: 가장 적게 사용된 공급자 선택
- `fastest-response`: 가장 빠른 응답 시간의 공급자 선택

### 서킷 브레이커

공급자 장애 시 자동 차단:

```bash
AI_ENABLE_CIRCUIT_BREAKER=true      # 서킷 브레이커 활성화
AI_CIRCUIT_BREAKER_THRESHOLD=5      # 연속 실패 횟수 임계치
```

### 헬스 체크

공급자 상태 모니터링:

```bash
AI_ENABLE_HEALTH_CHECK=true         # 헬스 체크 활성화
AI_HEALTH_CHECK_INTERVAL=60000      # 체크 간격 (밀리초)
```

## 🎛️ 환경별 설정 예시

### 개발 환경 (.env.local)

```bash
# 개발환경: Google AI 우선 사용 (무료 할당량 활용)
AI_DEFAULT_PROVIDER=google
AI_FALLBACK_PROVIDER=openai
AI_ENABLE_FALLBACK=true

# Google AI 설정
GOOGLE_AI_API_KEY=your-google-api-key
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_MAX_TOKENS=1500

# OpenAI 설정 (폴백용)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini

# 개발 전용 기능
AI_DEBUG_MODE=true
AI_ENABLE_ANALYTICS=false
AI_MAX_REQUESTS_PER_HOUR=50
```

### 프로덕션 환경

```bash
# 프로덕션: 안정성 우선, OpenAI 기본 사용
AI_DEFAULT_PROVIDER=openai
AI_FALLBACK_PROVIDER=google
AI_ENABLE_FALLBACK=true

# OpenAI 설정 (안정성 중심)
OPENAI_API_KEY=sk-your-production-openai-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_RETRIES=5

# Google AI 설정 (폴백용)
GOOGLE_AI_API_KEY=your-production-google-key
GOOGLE_AI_MODEL=gemini-1.5-flash

# 프로덕션 최적화
AI_ENABLE_CACHING=true
AI_ENABLE_QUALITY_CHECK=true
AI_ENABLE_CIRCUIT_BREAKER=true
AI_ENABLE_LOAD_BALANCING=true
AI_MAX_REQUESTS_PER_HOUR=1000
AI_DEBUG_MODE=false
```

### 테스트 환경

```bash
# 테스트: 빠른 응답과 비용 최적화
AI_DEFAULT_PROVIDER=auto
AI_ENABLE_FALLBACK=false

# 최소 설정
GOOGLE_AI_API_KEY=your-test-google-key
GOOGLE_AI_MAX_TOKENS=1000
GOOGLE_AI_TEMPERATURE=0.5

# 테스트 최적화
AI_ENABLE_CACHING=false
AI_ENABLE_ANALYTICS=false
AI_MAX_REQUESTS_PER_HOUR=20
AI_DEBUG_MODE=true
```

## 🚨 문제 해결

### 자주 발생하는 문제

#### 1. API 키 오류

```bash
# 에러: "API 키가 유효하지 않습니다"
# 해결책:
# 1. API 키 형식 확인
# 2. 공급자별 올바른 키 형식 사용
# 3. 환경변수 로드 확인

# 디버그 모드로 확인
AI_DEBUG_MODE=true
```

#### 2. 할당량 초과

```bash
# 에러: "API 사용량 한도를 초과했습니다"
# 해결책:
# 1. 폴백 공급자 설정
AI_ENABLE_FALLBACK=true
AI_FALLBACK_PROVIDER=google

# 2. 요청 제한 설정
AI_MAX_REQUESTS_PER_HOUR=50
```

#### 3. 응답 지연

```bash
# 타임아웃 증가
OPENAI_TIMEOUT=60000
GOOGLE_AI_TIMEOUT=60000

# 로드 밸런싱 활성화
AI_ENABLE_LOAD_BALANCING=true
AI_LOAD_BALANCING_STRATEGY=fastest-response
```

#### 4. 서비스 불안정

```bash
# 서킷 브레이커 설정
AI_ENABLE_CIRCUIT_BREAKER=true
AI_CIRCUIT_BREAKER_THRESHOLD=3

# 헬스 체크 활성화
AI_ENABLE_HEALTH_CHECK=true
AI_HEALTH_CHECK_INTERVAL=30000
```

### 디버깅 도구

#### 1. 설정 확인

브라우저 콘솔에서 AI 설정 확인 (디버그 모드 시):

```javascript
// AI 설정 정보가 콘솔에 출력됨
// 🤖 AI 설정 요약:
// ├─ 기본 공급자: google
// ├─ 폴백 공급자: openai
// └─ 활성화된 기능: ✅ enableAdvancedPrompts
```

#### 2. 서비스 상태 API

```bash
# 개발 환경에서 AI 서비스 상태 확인 API 엔드포인트 추가 가능
# GET /api/ai/status
```

## 📊 모니터링

### 사용량 추적

시스템은 자동으로 다음 지표를 추적합니다:

- **요청 수**: 공급자별 총 요청 수
- **응답 시간**: 평균 응답 시간
- **성공률**: 요청 성공률
- **토큰 사용량**: 토큰 소모량
- **에러 발생률**: 에러 타입별 발생률

### 비용 모니터링

환경변수로 비용 임계치 설정:

```bash
# 월 예산 설정 (USD)
AI_MONTHLY_BUDGET=100

# 경고 임계치 (예산의 %)
AI_BUDGET_WARNING_THRESHOLD=80
AI_BUDGET_CRITICAL_THRESHOLD=95
```

### 알림 설정

```bash
# 알림 채널 설정
AI_ALERT_WEBHOOK_URL=https://your-webhook-url
AI_ALERT_EMAIL=admin@your-domain.com

# 알림 조건
AI_ALERT_ON_QUOTA_EXCEEDED=true
AI_ALERT_ON_HIGH_ERROR_RATE=true
AI_ALERT_ON_BUDGET_THRESHOLD=true
```

## 📝 권장사항

### 프로덕션 환경

1. **이중화 설정**: 최소 2개 공급자 설정
2. **모니터링**: 헬스 체크와 서킷 브레이커 활성화
3. **캐싱**: 응답 캐싱으로 비용 절약
4. **제한**: 적절한 사용량 제한 설정

### 개발 환경

1. **비용 최적화**: Google AI 우선 사용
2. **디버깅**: 디버그 모드 활성화
3. **실험**: 다양한 모델과 설정 테스트

### 보안

1. **API 키 관리**: 환경변수 사용, 코드에 하드코딩 금지
2. **접근 제한**: 프로덕션과 개발 환경 키 분리
3. **모니터링**: 비정상적인 사용량 패턴 감지

## 🔄 업그레이드 가이드

### 기존 시스템에서 마이그레이션

기존 Google AI만 사용하는 시스템에서 통합 시스템으로 업그레이드:

```bash
# 1. 기존 설정 유지
GOOGLE_AI_API_KEY=your-existing-key

# 2. 통합 시스템 설정 추가
AI_DEFAULT_PROVIDER=google
AI_ENABLE_FALLBACK=false  # 점진적 적용

# 3. OpenAI 추가 (선택사항)
OPENAI_API_KEY=your-new-openai-key
AI_FALLBACK_PROVIDER=openai
AI_ENABLE_FALLBACK=true
```

### 단계별 적용

1. **1단계**: 기존 설정 유지하며 통합 시스템 적용
2. **2단계**: 모니터링 및 로그 확인
3. **3단계**: 폴백 공급자 추가
4. **4단계**: 고급 기능 활성화 (로드 밸런싱, 서킷 브레이커)

이 가이드를 따라 AI 공급자를 설정하면 안정적이고 효율적인 AI 서비스를 구축할 수 있습니다.
