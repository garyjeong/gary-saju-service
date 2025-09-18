# 멀티 스테이지 빌드를 사용한 Next.js 애플리케이션 Dockerfile

# 1. 의존성 설치 단계
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpm 설치
RUN corepack enable pnpm

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 2. 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app

# pnpm 설치
RUN corepack enable pnpm

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 빌드 (빌드 시에만 사용할 더미 환경 변수 설정)
ENV OPENAI_API_KEY=dummy_build_key \
    GOOGLE_AI_API_KEY=dummy_build_key

RUN pnpm build

# 3. 운영 단계
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 시스템 사용자 추가
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Public 폴더 복사
COPY --from=builder /app/public ./public

# 빌드 결과물 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js

CMD ["node", "server.js"]
