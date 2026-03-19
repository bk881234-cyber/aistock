/**
 * Vercel Cron — 종목 날씨 분석 갱신
 * schedule: "*/10 * * * *" (10분마다)
 */
// nft 번들링 힌트
require('pg');
require('pg-hstore');

const { analyzeAllTrackedStocks } = require('../../server/src/jobs/weatherAnalysisJob');
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
  const auth = req.headers.authorization;
  if (env.cronSecret && auth !== `Bearer ${env.cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await init();
    await analyzeAllTrackedStocks();
    res.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error('[cron/weather]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
