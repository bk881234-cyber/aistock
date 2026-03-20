/**
 * Vercel Serverless 전용 Express 앱
 * - app.listen() 없음 (Vercel이 요청을 직접 주입)
 * - 크론 잡 없음 (vercel.json의 crons에서 HTTP로 호출)
 * - DB/Redis: 첫 요청 시 초기화 후 warm 상태로 재사용
 */
require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');

const env              = require('./config/env');
const { connectDB, sequelize } = require('./config/database');
const { connectRedis } = require('./config/redis');

const authRoutes      = require('./routes/auth.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const marketRoutes    = require('./routes/market.routes');
const aiRoutes        = require('./routes/ai.routes');
const alertRoutes     = require('./routes/alert.routes');
const { generalLimiter } = require('./middleware/rateLimiter');

const isProd = env.NODE_ENV === 'production';
const app    = express();

// ── 보안 헤더 ───────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,        // Vercel CDN이 별도 처리
  crossOriginEmbedderPolicy: false,
}));
app.set('trust proxy', 1);            // Vercel 프록시 신뢰

// ── CORS ────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    // Vercel Preview 배포 URL도 자동 허용 (*.vercel.app)
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    if (env.allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS 차단: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(generalLimiter);

// ── API 라우트 ──────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/market',    marketRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/alerts',    alertRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), runtime: 'vercel', deploy_check: 'v2026-03-20' });
  } catch {
    res.status(503).json({ status: 'error', message: 'DB 연결 오류' });
  }
});

// ── 전역 에러 핸들러 ────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

// ── 서버리스 초기화 (첫 요청 시 1회, warm 재사용) ───────
// Promise 뮤텍스: 동시 cold-start 요청에도 안전하게 1회만 초기화
let initPromise = null;

const initOnce = () => {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await connectRedis();
      // 프로덕션: sequelize.sync 사용 안 함 → Supabase 대시보드에서 마이그레이션
      if (!isProd) {
        await sequelize.sync({ alter: true });
        console.log('[DB] 테이블 동기화 완료');
      }
    })().catch((err) => {
      initPromise = null; // 실패 시 다음 요청에서 재시도 가능
      throw err;
    });
  }
  return initPromise;
};

/**
 * Vercel Serverless Function 핸들러
 * api/server.js에서 module.exports 로 export
 */
const handler = async (req, res) => {
  try {
    await initOnce();
  } catch (err) {
    // DB 연결 실패해도 503 반환하지 않음
    // → 각 엔드포인트가 개별적으로 빈 데이터(200) 반환하여 에러 토스트 방지
    console.error('[WARN] DB 초기화 실패, 요청 처리 계속:', err.message);
  }
  return app(req, res);
};

module.exports = handler;
module.exports.app = app;         // 개발 서버에서 직접 사용 가능
