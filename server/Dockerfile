# ── Stage 1: 의존성 설치 ─────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# 패키지 파일만 먼저 복사 (레이어 캐시 활용)
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: 프로덕션 이미지 ──────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# 보안: non-root 유저로 실행
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 복사 (불필요한 파일 제외 → .dockerignore 참조)
COPY src ./src
COPY package.json ./

# 로그 디렉토리 생성 및 권한 설정
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
EXPOSE 4000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "src/app.js"]
