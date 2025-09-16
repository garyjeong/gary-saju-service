#!/bin/bash

# 🧪 개-사주 Docker 테스트 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 개-사주 Docker 통합 테스트 시작${NC}"
echo "======================================"

# 1. Docker 설치 확인
echo -e "${YELLOW}1. Docker 설치 상태 확인...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker가 설치되지 않았습니다.${NC}"
    exit 1
fi

docker_version=$(docker --version)
echo -e "${GREEN}✅ Docker 설치됨: ${docker_version}${NC}"

# 2. Docker 데몬 실행 확인
echo -e "${YELLOW}2. Docker 데몬 상태 확인...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker 데몬이 실행되지 않았습니다.${NC}"
    echo -e "${YELLOW}💡 Docker Desktop을 실행하거나 Docker 서비스를 시작해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker 데몬 실행 중${NC}"

# 3. 필수 파일 존재 확인
echo -e "${YELLOW}3. 필수 파일들 확인...${NC}"
required_files=(
    "docker/Dockerfile"
    "package.json"
    "next.config.ts"
    "src/app/layout.tsx"
    "healthcheck.js"
    ".dockerignore"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 필수 파일이 누락됨: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✅ 모든 필수 파일 존재${NC}"

# 4. Next.js 설정 확인
echo -e "${YELLOW}4. Next.js standalone 설정 확인...${NC}"
if grep -q "output.*standalone" next.config.ts; then
    echo -e "${GREEN}✅ Next.js standalone 설정 완료${NC}"
else
    echo -e "${RED}❌ Next.js standalone 설정이 필요합니다${NC}"
    exit 1
fi

# 5. pnpm 설정 확인
echo -e "${YELLOW}5. pnpm 설정 확인...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✅ pnpm 프로젝트입니다${NC}"
else
    echo -e "${RED}❌ pnpm-lock.yaml이 없습니다${NC}"
    exit 1
fi

# 6. 이미지 빌드 테스트 (시뮬레이션)
echo -e "${YELLOW}6. Docker 빌드 명령어 검증...${NC}"
build_cmd="docker build -f docker/Dockerfile -t gae-saju:test ."
echo -e "${BLUE}빌드 명령어: ${build_cmd}${NC}"

# 7. 실행 명령어 검증
echo -e "${YELLOW}7. Docker 실행 명령어 검증...${NC}"
run_cmd="docker run -d -p 3000:3000 --name gae-saju-test gae-saju:test"
echo -e "${BLUE}실행 명령어: ${run_cmd}${NC}"

echo ""
echo -e "${GREEN}🎉 모든 사전 검사 통과!${NC}"
echo -e "${BLUE}📋 다음 단계:${NC}"
echo -e "  1. 이미지 빌드: ./docker/build.sh"
echo -e "  2. 컨테이너 실행: ./docker/run.sh"
echo -e "  3. 서비스 확인: http://localhost:3000"
echo ""
echo -e "${YELLOW}💡 참고:${NC}"
echo -e "  - 첫 빌드는 5-10분 소요될 수 있습니다"
echo -e "  - 빌드 중 Node.js 이미지를 다운로드합니다"  
echo -e "  - 의존성 설치로 인한 시간이 필요합니다"
echo ""
echo -e "${GREEN}✨ Docker 컨테이너화 준비 완료!${NC}"
