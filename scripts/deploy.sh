#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  AIstock 프로덕션 배포 스크립트
#  사용법: bash scripts/deploy.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# ── 1. 사전 조건 확인 ────────────────────────────
info "사전 조건 확인..."
command -v docker  >/dev/null || error "Docker가 설치되어 있지 않습니다."
command -v node    >/dev/null || error "Node.js가 설치되어 있지 않습니다."

[ -f ".env.production" ] || error ".env.production 파일이 없습니다. .env.production.example을 참고해 작성해주세요."

# ── 2. 환경 변수 로드 및 검증 ────────────────────
set -a; source .env.production; set +a

[ -z "${JWT_SECRET:-}" ]    && error "JWT_SECRET이 설정되지 않았습니다."
[ -z "${DB_PASSWORD:-}" ]   && error "DB_PASSWORD가 설정되지 않았습니다."
[ -z "${REDIS_PASSWORD:-}" ] && error "REDIS_PASSWORD가 설정되지 않았습니다."
[ ${#JWT_SECRET} -lt 32 ]   && error "JWT_SECRET은 32자 이상이어야 합니다."

info "환경 변수 검증 완료"

# ── 3. React 프론트엔드 빌드 ──────────────────────
info "프론트엔드 빌드 중..."
cd client
npm ci --silent
npm run build
cd "$ROOT_DIR"
info "프론트엔드 빌드 완료 → client/dist/"

# ── 4. DB 마이그레이션 ───────────────────────────
warn "DB 마이그레이션은 수동으로 실행하세요:"
echo "   docker compose -f docker-compose.prod.yml exec server npx sequelize-cli db:migrate"

# ── 5. Docker 이미지 빌드 및 실행 ────────────────
info "Docker 컨테이너 빌드 및 시작..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# ── 6. 헬스체크 대기 ─────────────────────────────
info "서버 준비 대기 중 (최대 60초)..."
for i in $(seq 1 12); do
  if curl -sf http://localhost/health > /dev/null 2>&1; then
    info "서버 정상 기동 확인"
    break
  fi
  sleep 5
  [ $i -eq 12 ] && error "서버 헬스체크 실패. 'docker compose logs server' 확인"
done

# ── 7. 오래된 이미지 정리 ────────────────────────
docker image prune -f > /dev/null
info "배포 완료! http://localhost 에서 확인하세요."
echo ""
echo "  유용한 명령어:"
echo "    로그 확인:   docker compose -f docker-compose.prod.yml logs -f"
echo "    컨테이너 상태: docker compose -f docker-compose.prod.yml ps"
echo "    서버 재시작:  docker compose -f docker-compose.prod.yml restart server"
