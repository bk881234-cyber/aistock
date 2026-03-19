# ── Stage 1: 빌드 ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 빌드 시점 환경 변수 주입 (VITE_ 접두사만 번들에 포함됨)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2: Nginx로 정적 파일 서빙 ──────────────────────
FROM nginx:1.27-alpine AS runner

# 커스텀 Nginx 설정 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 라우팅을 위한 Nginx 설정 (최소)
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
  location ~* \.(js|css|png|jpg|svg|ico|woff2)$ { \
    expires 1y; add_header Cache-Control "public, immutable"; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:80/ || exit 1
