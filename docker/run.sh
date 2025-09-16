#!/bin/bash

# 🚀 개-사주 Docker 실행 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
IMAGE_NAME="gae-saju"
TAG="${1:-latest}"
CONTAINER_NAME="gae-saju-app"
PORT="${2:-3000}"

echo -e "${BLUE}🚀 개-사주 Docker 컨테이너 실행${NC}"
echo -e "${YELLOW}📋 실행 정보:${NC}"
echo -e "  - 이미지: ${IMAGE_NAME}:${TAG}"
echo -e "  - 컨테이너명: ${CONTAINER_NAME}"
echo -e "  - 포트: ${PORT}:3000"
echo ""

# 기존 컨테이너가 실행 중인지 확인
if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
    echo -e "${YELLOW}⚠️  기존 컨테이너가 실행 중입니다. 중지 후 재시작합니다.${NC}"
    docker stop "${CONTAINER_NAME}"
fi

# 기존 컨테이너 제거 (있다면)
if docker ps -aq -f name="${CONTAINER_NAME}" | grep -q .; then
    echo -e "${YELLOW}🗑️  기존 컨테이너를 제거합니다.${NC}"
    docker rm "${CONTAINER_NAME}"
fi

# 컨테이너 실행
echo -e "${YELLOW}🐳 컨테이너 시작 중...${NC}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:3000" \
  --restart unless-stopped \
  --health-cmd="node healthcheck.js" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  "${IMAGE_NAME}:${TAG}"

echo ""
echo -e "${GREEN}✅ 컨테이너가 성공적으로 시작되었습니다!${NC}"
echo ""
echo -e "${BLUE}📍 접속 정보:${NC}"
echo -e "  - 로컬: http://localhost:${PORT}"
echo -e "  - 컨테이너명: ${CONTAINER_NAME}"
echo ""

echo -e "${BLUE}🔧 유용한 명령어:${NC}"
echo -e "  - 로그 확인: docker logs -f ${CONTAINER_NAME}"
echo -e "  - 컨테이너 중지: docker stop ${CONTAINER_NAME}"
echo -e "  - 컨테이너 재시작: docker restart ${CONTAINER_NAME}"
echo -e "  - 상태 확인: docker ps"
echo ""

# 컨테이너 상태 확인
echo -e "${YELLOW}⏳ 컨테이너 상태 확인 중...${NC}"
sleep 3

if docker ps -q -f name="${CONTAINER_NAME}" | grep -q .; then
    echo -e "${GREEN}🎉 컨테이너가 정상적으로 실행되고 있습니다!${NC}"
    
    # Health check 상태 확인
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "N/A")
    echo -e "  - Health Check: ${health_status}"
else
    echo -e "${RED}❌ 컨테이너 실행에 실패했습니다.${NC}"
    echo -e "${YELLOW}📋 로그를 확인해보세요:${NC}"
    docker logs "${CONTAINER_NAME}"
    exit 1
fi
