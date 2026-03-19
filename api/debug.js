/**
 * 배포 진단용 엔드포인트 — 문제 해결 후 삭제
 * GET https://your-app.vercel.app/api/debug
 */
const { Sequelize } = require('sequelize');

module.exports = async (req, res) => {
  const result = {
    env: {
      NODE_ENV:              process.env.NODE_ENV || '❌ 미설정',
      DATABASE_URL:          process.env.DATABASE_URL ? '✅ 설정됨' : '❌ 미설정',
      JWT_SECRET:            process.env.JWT_SECRET
                               ? (process.env.JWT_SECRET.length >= 32 ? '✅ 설정됨 (32자↑)' : `⚠️ 너무 짧음 (${process.env.JWT_SECRET.length}자)`)
                               : '❌ 미설정',
      GEMINI_API_KEY:        process.env.GEMINI_API_KEY ? '✅ 설정됨' : '⚠️ 미설정 (AI 기능 불가)',
      UPSTASH_REDIS_REST_URL:process.env.UPSTASH_REDIS_REST_URL ? '✅ 설정됨' : '⚠️ 미설정 (캐시 없이 동작)',
      ALLOWED_ORIGINS:       process.env.ALLOWED_ORIGINS || '⚠️ 미설정 (기본값 사용)',
      CRON_SECRET:           process.env.CRON_SECRET ? '✅ 설정됨' : '⚠️ 미설정',
    },
    db: null,
    tables: null,
  };

  // DB 연결 테스트
  if (!process.env.DATABASE_URL) {
    result.db = '❌ DATABASE_URL 없음';
    return res.status(200).json(result);
  }

  let sequelize;
  try {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: { max: 1, min: 0, acquire: 10000, idle: 5000 },
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
        connectTimeout: 10000,
      },
    });

    await sequelize.authenticate();
    result.db = '✅ DB 연결 성공';

    // 테이블 존재 확인
    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    result.tables = tables.length > 0
      ? tables.map(t => t.table_name)
      : '❌ 테이블 없음 — SQL 스키마를 실행해주세요';

  } catch (err) {
    result.db = `❌ DB 연결 실패: ${err.message}`;
  } finally {
    if (sequelize) await sequelize.close().catch(() => {});
  }

  return res.status(200).json(result);
};
