/**
 * 로컬 개발 / 셀프 호스팅용 서버
 * Vercel 배포는 api/server.js → server/src/app.vercel.js 사용
 */
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const path       = require('path');

const env              = require('./config/env');
const logger           = require('./utils/logger');
const { connectDB, sequelize } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { generalLimiter } = require('./middleware/rateLimiter');

// ── 라우트 ──────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const marketRoutes    = require('./routes/market.routes');
const aiRoutes        = require('./routes/ai.routes');
const alertRoutes     = require('./routes/alert.routes');

// ── 크론 잡 ─────────────────────────────────────────────
const { startMarketRefreshJob }   = require('./jobs/marketRefreshJob');
const { startWeatherAnalysisJob } = require('./jobs/weatherAnalysisJob');
const { startAlertCheckJob }      = require('./jobs/alertCheckJob');

const isProd = env.NODE_ENV === 'production';
const app    = express();

// ── 보안 헤더 (Helmet) ───────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'"],  // TradingView 인라인 스크립트 허용
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      fontSrc:        ["'self'", 'https://cdn.jsdelivr.net'],
      imgSrc:         ["'self'", 'data:', 'blob:'],
      connectSrc:     ["'self'", 'https://query1.finance.yahoo.com'],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,  // TradingView 차트 로드를 위해 완화
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
}));

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // 서버 내부 요청 (curl, Postman 등) 허용
    if (!origin) return cb(null, true);
    // '*' 와일드카드면 모두 허용 (개발 환경 기본값)
    if (env.allowedOrigins.includes('*')) return cb(null, true);
    if (env.allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS 정책 위반: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── 기본 미들웨어 ────────────────────────────────────────
app.use(compression());  // gzip 압축
app.set('trust proxy', 1);  // Nginx 프록시 뒤에서 IP 추적

// Morgan → Winston 연동
app.use(morgan(isProd ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

app.use(express.json({ limit: '1mb' }));         // 10mb → 1mb 축소 (DoS 방지)
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(generalLimiter);

// ── 프로덕션: 빌드된 React 정적 파일 서빙 ───────────────
if (isProd) {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild, {
    maxAge: '1d',
    etag:   true,
    index:  false,  // SPA 라우팅은 아래에서 처리
  }));
}

// ── API 라우트 마운트 ────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/market',    marketRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/alerts',    alertRoutes);

// ── 헬스체크 (로드밸런서 / Docker healthcheck용) ─────────
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', message: 'DB 연결 오류' });
  }
});

// ── 프로덕션: API가 아닌 모든 요청 → React SPA ──────────
if (isProd) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// ── 404 핸들러 (개발 환경) ────────────────────────────────
if (!isProd) {
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `${req.method} ${req.path} 를 찾을 수 없습니다.` });
  });
}

// ── 전역 에러 핸들러 ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // CORS 에러
  if (err.message?.startsWith('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // 스택 트레이스는 개발 환경에서만 로그
  const logLevel = err.status >= 500 ? 'error' : 'warn';
  logger[logLevel](`${req.method} ${req.path} → ${err.status || 500}: ${err.message}`, {
    stack: isProd ? undefined : err.stack,
    ip:    req.ip,
  });

  res.status(err.status || 500).json({
    success: false,
    // 프로덕션: 내부 에러 메시지 노출 금지
    message: isProd && (!err.status || err.status >= 500)
      ? '서버 오류가 발생했습니다.'
      : err.message || '오류가 발생했습니다.',
  });
});

// ── 서버 초기화 ──────────────────────────────────────────
const bootstrap = async () => {
  await connectDB();
  await connectRedis();

  if (!isProd) {
    await sequelize.sync({ alter: true });
    logger.info('[DB] 테이블 동기화 완료 (개발 모드)');
  }

  startMarketRefreshJob();
  startWeatherAnalysisJob();
  startAlertCheckJob();

  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`AIstock 서버 기동 | PORT=${env.PORT} | ENV=${env.NODE_ENV}`);
  });
};

// 예상치 못한 에러로 프로세스가 종료되지 않도록
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

bootstrap().catch((err) => {
  logger.error('[FATAL] 서버 기동 실패:', err.message);
  process.exit(1);
});

module.exports = app;
