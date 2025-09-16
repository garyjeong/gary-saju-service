# 🚀 개-사주 프로덕션 배포 가이드

빠르고 안전한 프로덕션 배포를 위한 체크리스트와 명령어 모음입니다.

## 📋 배포 전 체크리스트

### ✅ 필수 사항
- [ ] `.env.local` 파일에 프로덕션 환경변수 설정
- [ ] `next.config.ts`에 `output: "standalone"` 설정 확인
- [ ] Docker 설치 및 실행 상태 확인
- [ ] 빌드 테스트 완료 (`./docker/test.sh`)

### ✅ 보안 설정
- [ ] API 키들이 환경변수로 안전하게 관리됨
- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] 프로덕션 도메인 CORS 설정 확인

### ✅ 성능 최적화  
- [ ] 이미지 최적화 설정 확인
- [ ] 번들 크기 최적화 완료
- [ ] CDN 설정 (필요시)

## 🐳 로컬 Docker 배포

### 1단계: 이미지 빌드
```bash
# 프로덕션 이미지 빌드
./docker/build.sh production

# 빌드 확인
docker images | grep gae-saju
```

### 2단계: 컨테이너 실행
```bash
# 프로덕션 모드 실행
./docker/run.sh production 3000

# 상태 확인
docker ps | grep gae-saju-app
```

### 3단계: 서비스 확인
```bash
# Health Check
curl http://localhost:3000

# 브라우저 테스트
open http://localhost:3000
```

## ☁️ 클라우드 배포

### AWS ECS 배포
```bash
# ECR 로그인
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# 이미지 태그 및 푸시
docker tag gae-saju:production YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/gae-saju:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/gae-saju:latest

# ECS 서비스 업데이트
aws ecs update-service --cluster your-cluster --service gae-saju --force-new-deployment
```

### Google Cloud Run 배포
```bash
# 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/YOUR_PROJECT/gae-saju

# Cloud Run 배포
gcloud run deploy gae-saju \
  --image gcr.io/YOUR_PROJECT/gae-saju \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1
```

### Azure Container Instances 배포
```bash
# Azure 컨테이너 레지스트리 로그인
az acr login --name YOUR_REGISTRY

# 이미지 태그 및 푸시
docker tag gae-saju:production YOUR_REGISTRY.azurecr.io/gae-saju:latest
docker push YOUR_REGISTRY.azurecr.io/gae-saju:latest

# 컨테이너 인스턴스 생성
az container create \
  --resource-group your-rg \
  --name gae-saju \
  --image YOUR_REGISTRY.azurecr.io/gae-saju:latest \
  --dns-name-label gae-saju \
  --ports 3000
```

### DigitalOcean App Platform 배포
```bash
# GitHub 연결 후 앱 생성
doctl apps create --spec app.yaml
```

## 🔧 운영 관리

### 로그 모니터링
```bash
# 실시간 로그 확인
docker logs -f gae-saju-app

# 최근 100줄 로그
docker logs --tail 100 gae-saju-app
```

### 컨테이너 관리
```bash
# 컨테이너 재시작
docker restart gae-saju-app

# 컨테이너 중지
docker stop gae-saju-app

# 컨테이너 제거
docker rm gae-saju-app

# 이미지 정리
docker image prune -f
```

### Health Check 확인
```bash
# Health Check 상태
docker inspect gae-saju-app | grep -A 5 Health

# 수동 Health Check
docker exec gae-saju-app node healthcheck.js
```

## 📊 성능 모니터링

### 리소스 사용량 확인
```bash
# CPU, 메모리 사용량
docker stats gae-saju-app

# 컨테이너 상세 정보
docker inspect gae-saju-app
```

### 성능 최적화 팁
- **메모리**: 일반적으로 512MB-1GB 권장
- **CPU**: 0.5-1 vCPU로 시작
- **연결 제한**: Reverse proxy (nginx) 사용 권장
- **캐싱**: CDN 및 Redis 캐시 고려

## 🔒 보안 설정

### SSL/TLS 설정
```bash
# Let's Encrypt with nginx
certbot --nginx -d your-domain.com

# 또는 클라우드 로드밸런서 SSL 인증서 사용
```

### 방화벽 설정
```bash
# UFW (Ubuntu)
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000/tcp  # 직접 접근 차단
```

## 🚨 장애 대응

### 빠른 롤백
```bash
# 이전 버전으로 롤백
docker run -d -p 3000:3000 --name gae-saju-app gae-saju:previous

# 또는 클라우드 서비스 롤백 기능 사용
```

### 응급 복구
```bash
# 컨테이너 재시작
./docker/run.sh production

# 새 이미지로 재배포
./docker/build.sh hotfix
./docker/run.sh hotfix
```

---

## 📞 지원 및 문의

배포 중 문제가 발생하면:

1. **로그 확인**: `docker logs gae-saju-app`
2. **Health Check**: `curl http://localhost:3000`
3. **리소스 확인**: `docker stats gae-saju-app`
4. **네트워크 확인**: `docker port gae-saju-app`

**🎉 성공적인 배포를 응원합니다!** 🚀
