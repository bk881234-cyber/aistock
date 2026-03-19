/**
 * Vercel Cron — 시장 데이터 갱신
 * schedule: "*/5 * * * *" (5분마다)
 *
 * Vercel은 Authorization: Bearer ${CRON_SECRET} 헤더를 자동 첨부
 */
// nft 번들링 힌트
require('pg');
require('pg-hstore');

const { refreshAllMarketData } = require('../../server/src/jobs/marketRefreshJob');
const env = require('../../server/src/config/env');
const { connectDB } = require('../../server/src/config/database');
const { connectRedis } = require('../../server/src/config/redis');

let ready = false;
const init = async () => {
  if (ready) return;
  await connectDB();
  await connectRedis();
  ready = true;
};

module.exports = async (req, res) => {
  // Vercel Cron 요청 인증
  const auth = req.headers.authorization;
  if (env.cronSecret && auth !== `Bearer ${env.cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await init();
    const count = await refreshAllMarketData();
    res.json({ ok: true, updated: count, ts: new Date().toISOString() });
  } catch (err) {
    console.error('[cron/market]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
