/**
 * Vercel Cron — 알림 조건 체크
 * schedule: "*/5 * * * *" (5분마다)
 */
// nft 번들링 힌트
require('pg');
require('pg-hstore');

const { checkAlerts } = require('../../server/src/jobs/alertCheckJob');
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
    await checkAlerts();
    res.json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    console.error('[cron/alerts]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
};
