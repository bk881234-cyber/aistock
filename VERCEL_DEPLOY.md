# Supabase + Vercel 배포 가이드

## 아키텍처

```
브라우저
  │
  ▼ https://your-project.vercel.app
┌─────────────────────────────────────────────────┐
│               Vercel CDN                         │
│  /* → client/dist/index.html (React SPA)         │
│  /api/* → api/server.js (Express Serverless)     │
│  /api/cron/* → Vercel Cron Jobs (5~10분 주기)   │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
  Supabase          Upstash
  PostgreSQL         Redis
  (DB + 스키마)    (캐시 레이어)
```

---

## Step 1 — Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com) → **New Project** 생성
2. 프로젝트명: `aistock` / 비밀번호 기록해두기 / Region: `Northeast Asia (Seoul)` 선택
3. 생성 완료 후 → **SQL Editor** → **New Query**
4. `scripts/supabase-schema.sql` 전체 내용 붙여넣기 → **Run**

**연결 문자열 복사:**
- 좌측 메뉴 → **Settings → Database**
- **Connection String** 탭 → **Transaction** 모드 선택
- URI 전체 복사 (예: `postgresql://postgres.xxxxx:password@aws-...pooler.supabase.com:6543/postgres`)

---

## Step 2 — Upstash Redis 설정

1. [upstash.com](https://upstash.com) → **Create Database**
2. Name: `aistock-cache` / Region: `ap-northeast-1 (Tokyo)` / Type: Regional
3. 생성 후 → **REST API** 탭
4. `UPSTASH_REDIS_REST_URL`과 `UPSTASH_REDIS_REST_TOKEN` 복사

---

## Step 3 — Vercel 배포

### 3-1. GitHub에 코드 푸시

```bash
cd C:\Users\bkbk8\AIstock
git init
git add .
git commit -m "initial commit"
# GitHub에 새 레포 생성 후:
git remote add origin https://github.com/YOUR_USERNAME/aistock.git
git push -u origin main
```

### 3-2. Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub 레포 선택 → Import
3. **Framework Preset**: Other
4. **Root Directory**: `.` (기본값 유지)
5. **Build Command**: `cd client && npm install && npm run build`
6. **Output Directory**: `client/dist`
7. **Install Command**: `cd server && npm install`

### 3-3. 환경 변수 입력

Vercel → **Settings → Environment Variables** 에서 아래 항목 추가:

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `NODE_ENV` | `production` | All |
| `DATABASE_URL` | Supabase Transaction URI | All |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | All |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Token | All |
| `JWT_SECRET` | 48자 랜덤 hex | All |
| `ALLOWED_ORIGINS` | `https://your-project.vercel.app` | All |
| `CRON_SECRET` | 32자 랜덤 hex | All |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | All |

**환경변수 값 생성 명령어 (PowerShell):**
```powershell
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3-4. 배포

환경 변수 저장 후 → **Redeploy** 클릭

---

## Step 4 — 배포 확인

```
# 헬스체크
https://your-project.vercel.app/api/health

# 정상 응답:
{ "status": "ok", "runtime": "vercel" }
```

---

## 로컬 개발 (참고)

```powershell
# 터미널 1: DB + Redis (Docker Desktop 필요)
cd C:\Users\bkbk8\AIstock
docker compose up -d

# 터미널 2: API 서버
cd server
npm run dev    # http://localhost:4000

# 터미널 3: React
cd client
npm run dev    # http://localhost:5173
```

---

## 무료 티어 한도

| 서비스 | 무료 한도 | 초과 시 |
|--------|-----------|---------|
| Vercel | 100GB 대역폭/월, 함수 100GB-Hrs/월 | $20/월 프로 |
| Supabase | DB 500MB, 50MB 파일 | $25/월 프로 |
| Upstash Redis | 10,000 req/일, 256MB | $0.2/10만 req |

> 개인 포트폴리오 / 소규모 공유용은 무료 티어로 충분합니다.
