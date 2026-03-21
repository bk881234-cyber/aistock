/**
 * Vercel Serverless Function — 모든 /api/* 요청 처리
 * vercel.json: { "source": "/api/:path*", "destination": "/api/server" }
 *
 * NOTE: 아래 require들은 Vercel nft(Node File Tracer)가 동적 require를 추적하지 못하는
 * 문제를 해결하기 위한 명시적 번들링 힌트입니다. 삭제하지 마세요.
 */
require('pg');
require('pg-hstore');
try { require('groq-sdk'); } catch (_) {}

let handler;
try {
  handler = require('../server/src/app.vercel');
} catch (err) {
  console.error('[FATAL] 모듈 로딩 실패:', err.message, err.stack);
  handler = (req, res) =>
    res.status(500).json({ success: false, message: `모듈 로딩 실패: ${err.message}` });
}
module.exports = handler;
