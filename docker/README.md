# 🐳 개-사주 Docker 가이드

개-사주 서비스를 Docker 컨테이너로 실행하기 위한 완전한 가이드입니다.

## 📋 목차

- [🚀 빠른 시작](#-빠른-시작)
- [🔧 상세 설정](#-상세-설정)
- [📊 성능 최적화](#-성능-최적화)
- [🔍 트러블슈팅](#-트러블슈팅)
- [📚 명령어 레퍼런스](#-명령어-레퍼런스)

## 🚀 빠른 시작

### 1. 이미지 빌드

```bash
# 기본 빌드
./docker/build.sh

# 특정 태그로 빌드
./docker/build.sh v1.0.0
```

### 2. 컨테이너 실행

```bash
# 기본 실행 (포트 3000)
./docker/run.sh

# 특정 포트로 실행
./docker/run.sh latest 8080
```

### 3. 서비스 확인

```bash
# 브라우저에서 접속
open http://localhost:3000

# 또는 curl로 테스트
curl http://localhost:3000
```

## 🔧 상세 설정

### Dockerfile 특징

- **멀티 스테이지 빌드**: 최적화된 이미지 크기
- **pnpm 지원**: 빠른 패키지 설치
- **보안 강화**: non-root 사용자 실행
- **Health Check**: 자동 상태 모니터링

### 환경 변수

```bash
# 기본 환경 변수
PORT=3000                    # 서비스 포트
NODE_ENV=production         # 실행 환경
NEXT_TELEMETRY_DISABLED=1   # 텔레메트리 비활성화
```

### 볼륨 마운트 (선택사항)

```bash
# 로그 디렉터리 마운트
docker run -v /host/logs:/app/logs gae-saju:latest

# 설정 파일 마운트
docker run -v /host/.env.local:/app/.env.local gae-saju:latest
```

## 📊 성능 최적화

### 이미지 크기 최적화

- **Alpine Linux** 기반 이미지 사용
- **멀티 스테이지 빌드**로 빌드 의존성 제거
- **.dockerignore**로 불필요한 파일 제외

### 실행 성능 최적화

- **dumb-init** 사용으로 시그널 처리 최적화
- **Next.js standalone** 출력으로 런타임 최소화
- **Health Check**로 컨테이너 상태 모니터링

### 캐시 최적화

```bash
# 의존성 캐시 활용
docker build --cache-from gae-saju:latest -t gae-saju:new .

# 빌드 캐시 정리
docker builder prune
```

## 🔍 트러블슈팅

### 일반적인 문제

#### 1. 빌드 실패

```bash
# 캐시 제거 후 재빌드
docker build --no-cache -f docker/Dockerfile -t gae-saju:latest .

# 빌드 로그 상세 확인
docker build --progress=plain -f docker/Dockerfile -t gae-saju:latest .
```

#### 2. 컨테이너 시작 실패

```bash
# 로그 확인
docker logs gae-saju-app

# 컨테이너 내부 접속
docker exec -it gae-saju-app sh
```

#### 3. Health Check 실패

```bash
# Health Check 상태 확인
docker inspect gae-saju-app | grep -A 10 Health

# 수동 Health Check 실행
docker exec gae-saju-app node healthcheck.js
```

### 포트 충돌 해결

```bash
# 사용 중인 포트 확인
lsof -i :3000

# 다른 포트로 실행
./docker/run.sh latest 8080
```

## 📚 명령어 레퍼런스

### 빌드 명령어

```bash
# 기본 빌드
docker build -f docker/Dockerfile -t gae-saju:latest .

# 태그 지정 빌드
docker build -f docker/Dockerfile -t gae-saju:v1.0.0 .

# 캐시 없이 빌드
docker build --no-cache -f docker/Dockerfile -t gae-saju:latest .
```

### 실행 명령어

```bash
# 기본 실행
docker run -p 3000:3000 gae-saju:latest

# 백그라운드 실행
docker run -d -p 3000:3000 --name gae-saju-app gae-saju:latest

# 환경 변수와 함께 실행
docker run -p 3000:3000 -e NODE_ENV=production gae-saju:latest

# 볼륨 마운트와 함께 실행
docker run -p 3000:3000 -v $(pwd)/.env.local:/app/.env.local gae-saju:latest
```

### 관리 명령어

```bash
# 컨테이너 목록
docker ps -a

# 컨테이너 로그
docker logs -f gae-saju-app

# 컨테이너 중지
docker stop gae-saju-app

# 컨테이너 제거
docker rm gae-saju-app

# 이미지 목록
docker images

# 이미지 제거
docker rmi gae-saju:latest

# 시스템 정리
docker system prune -f
```

### 개발 모드

```bash
# 개발 모드로 실행 (소스 코드 마운트)
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -v /app/.next \
  node:18-alpine sh -c "cd /app && npm run dev"
```

## 🚀 프로덕션 배포

### Docker Hub 배포

```bash
# 이미지 태그
docker tag gae-saju:latest your-username/gae-saju:latest

# 이미지 푸시
docker push your-username/gae-saju:latest
```

### 클라우드 배포

```bash
# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag gae-saju:latest your-account.dkr.ecr.us-east-1.amazonaws.com/gae-saju:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/gae-saju:latest

# Google Cloud Run
gcloud builds submit --tag gcr.io/your-project/gae-saju
gcloud run deploy --image gcr.io/your-project/gae-saju --platform managed
```

---

## 🎯 성능 지표

| 항목 | 값 |
|------|-----|
| **이미지 크기** | ~150MB |
| **빌드 시간** | ~2-3분 |
| **시작 시간** | ~3-5초 |
| **메모리 사용량** | ~100-200MB |

---

## 📞 지원

문제가 발생하면 다음을 확인해보세요:

1. **Docker 버전**: `docker --version` (20.10+ 권장)
2. **이미지 상태**: `docker images | grep gae-saju`
3. **컨테이너 로그**: `docker logs gae-saju-app`
4. **Health Check**: `docker inspect gae-saju-app`

**🌟 즐거운 개-사주 서비스 운영되세요!** 🐳
