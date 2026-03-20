/**
 * 배포 진단용 엔드포인트 — 문제 해결 후 삭제
 * GET https://aistock-platform.vercel.app/api/debug
 */
// nft 번들링 힌트
require('pg');
require('pg-hstore');

module.exports = async (req, res) => {
  const result = {
    env: {
      NODE_ENV:               process.env.NODE_ENV || '❌ 미설정',
      DATABASE_URL:           process.env.DATABASE_URL ? '✅ 설정됨' : '❌ 미설정',
      JWT_SECRET:             process.env.JWT_SECRET
                                ? (process.env.JWT_SECRET.length >= 32 ? `✅ 설정됨 (${process.env.JWT_SECRET.length}자)` : `⚠️ 너무 짧음 (${process.env.JWT_SECRET.length}자)`)
                                : '❌ 미설정',
      GEMINI_API_KEY:         process.env.GEMINI_API_KEY ? '✅ 설정됨' : '⚠️ 미설정',
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✅ 설정됨' : '⚠️ 미설정',
      ALLOWED_ORIGINS:        process.env.ALLOWED_ORIGINS || '⚠️ 미설정',
      CRON_SECRET:            process.env.CRON_SECRET ? '✅ 설정됨' : '⚠️ 미설정',
    },
    db: null,
    tables: null,
  };

  if (!process.env.DATABASE_URL) {
    result.db = '❌ DATABASE_URL 없음 — Vercel 환경변수에 추가하세요';
    return res.status(200).json(result);
  }

  try {
    // server/node_modules에서 sequelize를 찾도록 server 경로를 통해 require
    const { sequelize } = require('../server/src/config/database');
    await sequelize.authenticate();
    result.db = '✅ DB 연결 성공';

    // raw 결과 그대로 반환 — 컬럼명 파악용
    const [tables] = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
    );
    const [cnt] = await sequelize.query(
      `SELECT COUNT(*)::int AS cnt FROM pg_tables WHERE schemaname = 'public';`
    );

    result.table_count = cnt[0];          // 테이블 개수 raw
    result.tables_raw = tables.slice(0, 3); // 첫 3행 raw (컬럼명 확인용)
    result.tables = tables.map((t) => t.tablename ?? JSON.stringify(t));

  } catch (err) {
    result.db = `❌ DB 연결 실패: ${err.message}`;
  }

  return res.status(200).json(result);
};
