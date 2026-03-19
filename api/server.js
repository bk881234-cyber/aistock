/**
 * Vercel Serverless Function — 모든 /api/* 요청 처리
 * vercel.json: { "source": "/api/:path*", "destination": "/api/server" }
 */
let handler;
try {
  handler = require('../server/src/app.vercel');
} catch (err) {
  console.error('[FATAL] 모듈 로딩 실패:', err.message, err.stack);
  handler = (req, res) =>
    res.status(500).json({ success: false, message: `모듈 로딩 실패: ${err.message}` });
}
module.exports = handler;
