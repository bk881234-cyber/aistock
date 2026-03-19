# AIstock 프로덕션 배포 가이드

## 아키텍처 구성

```
인터넷
  │
  ▼ :80 / :443
┌─────────────────┐
│   Nginx          │  리버스 프록시 + 정적 파일 서빙 + Rate Limit
│  (nginx:1.27)    │  /api/* → Node.js 4000
└────┬────────────┘  /* → React SPA (client/dist/)
     │ internal network
  ┌──┴──────────────────────────────┐
  │  Node.js Express (port 4000)    │  API 서버 + 크론 잡
  │  ├── PostgreSQL (postgres:5432) │  데이터 영속화
  │  └── Redis (redis:6379)         │  캐시 + 세션
  └────────────────────────────────┘
```

---

## VPS 최초 세팅 (Ubuntu 22.04 기준)

### 1. 필수 패키지 설치

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl docker.io docker-compose-plugin

# Docker 그룹 추가 (sudo 없이 docker 실행)
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 프로젝트 클론

```bash
git clone https://github.com/your-repo/AIstock.git /srv/aistock
cd /srv/aistock
```

### 3. 환경 변수 파일 생성

```bash
cp .env.production.example .env.production
nano .env.production   # 아래 필수 항목 입력
```

**반드시 변경해야 할 항목:**

| 변수 | 설명 | 생성 방법 |
|------|------|-----------|
| `DB_PASSWORD` | PostgreSQL 비밀번호 | `openssl rand -base64 24` |
| `REDIS_PASSWORD` | Redis 비밀번호 | `openssl rand -base64 24` |
| `JWT_SECRET` | JWT 서명 키 (32자↑) | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ALLOWED_ORIGINS` | 허용 도메인 | `https://your-domain.com` |
| `ANTHROPIC_API_KEY` | Claude API 키 | Anthropic 콘솔에서 발급 |

### 4. React 빌드

```bash
cd client
npm ci
npm run build
cd ..
```

### 5. 배포 실행

```bash
bash scripts/deploy.sh
```

---

## 수동 배포 (스크립트 없이)

```bash
# 컨테이너 빌드 및 시작
docker compose -f docker-compose.prod.yml up -d --build

# DB 마이그레이션 (최초 1회 + 스키마 변경 시)
docker compose -f docker-compose.prod.yml exec server \
  npx sequelize-cli db:migrate

# 상태 확인
docker compose -f docker-compose.prod.yml ps
curl http://localhost/health
```

---

## HTTPS 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install -y certbot

# 인증서 발급 (도메인이 이 서버를 가리키고 있어야 함)
sudo certbot certonly --standalone -d aistock.app -d www.aistock.app

# nginx.conf 수정: HTTP→HTTPS 리다이렉트 및 SSL 설정 주석 해제
nano nginx/nginx.conf

# 인증서 자동 갱신 등록
echo "0 2 * * * root certbot renew --quiet && docker compose -f /srv/aistock/docker-compose.prod.yml restart nginx" \
  | sudo tee /etc/cron.d/certbot-renew
```

---

## 업데이트 배포 절차

```bash
cd /srv/aistock
git pull

# 프론트엔드 변경 시
cd client && npm ci && npm run build && cd ..

# 서버 코드만 변경된 경우
docker compose -f docker-compose.prod.yml build server
docker compose -f docker-compose.prod.yml up -d server

# 전체 재배포 (DB/Redis는 재시작 없이 유지)
docker compose -f docker-compose.prod.yml up -d --build --no-deps server
```

---

## 운영 명령어 모음

```bash
# 로그 실시간 확인
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f nginx

# 컨테이너 상태
docker compose -f docker-compose.prod.yml ps

# PostgreSQL 접속
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U aistock_user -d aistock_db

# Redis 접속
docker compose -f docker-compose.prod.yml exec redis \
  redis-cli -a $REDIS_PASSWORD

# 특정 서비스만 재시작
docker compose -f docker-compose.prod.yml restart server

# 전체 중단
docker compose -f docker-compose.prod.yml down

# 볼륨 포함 전체 삭제 (데이터 소멸 — 주의!)
docker compose -f docker-compose.prod.yml down -v
```

---

## 배포 전 최종 체크리스트

```
환경 변수
  □ .env.production 파일 생성 완료
  □ DB_PASSWORD — 16자 이상 강력한 비밀번호
  □ REDIS_PASSWORD — 설정됨 (빈 값 금지)
  □ JWT_SECRET — 48자 이상 랜덤 hex
  □ ALLOWED_ORIGINS — 실제 도메인으로 변경
  □ ANTHROPIC_API_KEY — 유효한 키 입력

빌드
  □ client/dist/ 디렉토리 존재 확인
  □ npm run build 에러 없음

Docker
  □ Docker, Docker Compose 설치 확인
  □ docker compose -f docker-compose.prod.yml config 오류 없음

보안
  □ 서버 방화벽: 80, 443 포트만 개방 (5432, 6379 외부 차단)
  □ SSH 키 인증만 허용 (비밀번호 로그인 비활성화)
  □ fail2ban 설치 (선택)
  □ ufw 활성화: ufw allow 80,443/tcp && ufw enable

DB
  □ 최초 배포 후 DB 마이그레이션 실행
  □ DB 백업 스케줄 설정 (pg_dump 크론)

헬스체크
  □ curl http://your-domain/health → {"status":"ok"} 응답 확인
  □ docker compose -f docker-compose.prod.yml ps 전체 healthy 확인
  □ 로그인 / 회원가입 동작 확인
  □ 시장 데이터 조회 (/api/market/overview) 확인
```

---

## 권장 서버 사양

| 항목 | 최소 | 권장 |
|------|------|------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| 디스크 | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 | Ubuntu 22.04 |

**클라우드 추천:** AWS Lightsail ($10~20/월), DigitalOcean Droplet, Vultr
