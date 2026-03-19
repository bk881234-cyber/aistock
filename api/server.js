/**
 * Vercel Serverless Function — 모든 /api/* 요청 처리
 * vercel.json: { "source": "/api/:path*", "destination": "/api/server" }
 */
module.exports = require('../server/src/app.vercel');
