# 🐳 개-사주 Next.js 프로덕션 Dockerfile
# Multi-stage build for optimized production image

# ===============================================
# 📦 Dependencies Stage
# ===============================================
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies only
RUN pnpm install --frozen-lockfile --prod=false

# ===============================================
# 🔨 Builder Stage  
# ===============================================
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy environment file if exists (optional)
RUN if [ -f ".env.local" ]; then cp .env.local ./; fi

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN pnpm build

# ===============================================
# 🚀 Runner Stage (Production)
# ===============================================
FROM node:18-alpine AS runner
WORKDIR /app

# Install dependencies for production
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public folder  
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy health check script
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js

# Set user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT 3000
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["dumb-init", "node", "server.js"]
