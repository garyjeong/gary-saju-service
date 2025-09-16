#!/bin/bash

# 🐳 개-사주 Docker 빌드 스크립트

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
DOCKERFILE_PATH="./docker/Dockerfile"

echo -e "${BLUE}🐳 개-사주 Docker 이미지 빌드 시작${NC}"
echo -e "${YELLOW}📋 빌드 정보:${NC}"
echo -e "  - 이미지명: ${IMAGE_NAME}:${TAG}"
echo -e "  - Dockerfile: ${DOCKERFILE_PATH}"
echo -e "  - 컨텍스트: $(pwd)"
echo ""

# 빌드 시작 시간 기록
start_time=$(date +%s)

# Docker 빌드 실행
echo -e "${YELLOW}🔨 Docker 이미지 빌드 중...${NC}"
docker build \
  -f "${DOCKERFILE_PATH}" \
  -t "${IMAGE_NAME}:${TAG}" \
  --progress=plain \
  .

# 빌드 완료 시간 계산
end_time=$(date +%s)
duration=$((end_time - start_time))

echo ""
echo -e "${GREEN}✅ 빌드 완료!${NC}"
echo -e "${YELLOW}📊 빌드 통계:${NC}"
echo -e "  - 소요 시간: ${duration}초"
echo -e "  - 이미지 크기: $(docker images ${IMAGE_NAME}:${TAG} --format "table {{.Size}}" | tail -n +2)"
echo ""

echo -e "${BLUE}🚀 실행 명령어:${NC}"
echo -e "  docker run -p 3000:3000 ${IMAGE_NAME}:${TAG}"
echo ""

echo -e "${GREEN}🎉 빌드가 성공적으로 완료되었습니다!${NC}"
