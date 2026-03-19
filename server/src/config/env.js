require('dotenv').config();

// ── 필수 환경 변수 검증 ──────────────────────────────────
const REQUIRED_IN_PRODUCTION = ['JWT_SECRET', 'ALLOWED_ORIGINS'];
// Supabase or local DB 둘 중 하나
const hasDb = process.env.DATABASE_URL || process.env.DB_HOST;

if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_IN_PRODUCTION.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`[ENV] 필수 환경 변수 누락: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (!hasDb) {
    console.error('[ENV] DATABASE_URL 또는 DB_HOST 중 하나를 설정해야 합니다.');
    process.exit(1);
  }
  if ((process.env.JWT_SECRET || '').length < 32) {
    console.error('[ENV] JWT_SECRET은 32자 이상이어야 합니다.');
    process.exit(1);
  }
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 4000,

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT, 10) || 5432,
    name:     process.env.DB_NAME     || 'aistock_db',
    user:     process.env.DB_USER     || 'aistock_user',
    password: process.env.DB_PASSWORD || 'aistock_pass',
  },

  redis: {
    host:     process.env.REDIS_HOST     || 'localhost',
    port:     parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret:    process.env.JWT_SECRET    || 'dev_secret_CHANGE_IN_PRODUCTION_min32chars!!',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',').map((o) => o.trim()).filter(Boolean),

  // Vercel Cron 보안 시크릿
  cronSecret: process.env.CRON_SECRET || '',

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  marketApis: {
    alphaVantageKey: process.env.ALPHA_VANTAGE_API_KEY,
    kisAppKey:       process.env.KIS_APP_KEY,
    kisAppSecret:    process.env.KIS_APP_SECRET,
  },

  aws: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket:        process.env.AWS_S3_BUCKET  || 'aistock-cards',
    region:          process.env.AWS_REGION      || 'ap-northeast-2',
  },
};

module.exports = env;
