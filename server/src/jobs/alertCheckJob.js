const cron = require('node-cron');
const { Alert, AlertHistory, Portfolio, MarketCache } = require('../models');
const { getCache } = require('../config/redis');

/**
 * 알림 조건 체크 및 발동
 */
const checkAlerts = async () => {
  try {
    const activeAlerts = await Alert.findAll({
      where: { is_active: true },
      include: [{ association: 'portfolio' }],
    });

    if (!activeAlerts.length) return;

    for (const alert of activeAlerts) {
      const { stock_symbol, alert_type, condition, threshold } = alert;

      // 현재가 조회 (Redis 캐시 → MarketCache DB)
      let currentPrice = null;
      const cached = await getCache(`price:${stock_symbol}`);
      if (cached) {
        currentPrice = cached.current_val;
      } else {
        const mc = await MarketCache.findOne({ where: { symbol: stock_symbol } });
        currentPrice = mc?.current_val ? parseFloat(mc.current_val) : null;
      }

      if (!currentPrice) continue;

      let triggered = false;
      let message = '';

      if (alert_type === 'price_target' || alert_type === 'stop_loss') {
        if (condition === 'above' && currentPrice >= threshold) {
          triggered = true;
          message = `[${stock_symbol}] 목표가 ${threshold.toLocaleString()}원 돌파! 현재가: ${currentPrice.toLocaleString()}원`;
        } else if (condition === 'below' && currentPrice <= threshold) {
          triggered = true;
          message = `[${stock_symbol}] 손절가 ${threshold.toLocaleString()}원 이탈! 현재가: ${currentPrice.toLocaleString()}원`;
        }
      }

      if (alert_type === 'trailing_stop' && alert.portfolio) {
        const portfolio = alert.portfolio;
        const trailPct = parseFloat(portfolio.trailing_stop_pct);
        const avgBuy   = parseFloat(portfolio.avg_buy_price);
        const stopPrice = currentPrice * (1 - trailPct / 100);

        if (currentPrice <= avgBuy * (1 - trailPct / 100)) {
          triggered = true;
          message = `[${stock_symbol}] 트레일링 스탑 발동! 현재가 ${currentPrice.toLocaleString()}원이 평균 매수가 대비 ${trailPct}% 하락`;
        }
      }

      if (triggered) {
        await AlertHistory.create({
          alert_id:      alert.id,
          user_id:       alert.user_id,
          trigger_value: currentPrice,
          message,
        });

        // 일회성 알림은 비활성화
        if (['price_target', 'stop_loss'].includes(alert_type)) {
          await alert.update({ is_active: false });
        }

        // TODO: 실제 Push / Email 발송 (2단계)
        console.log(`[alertCheckJob] 알림 발동: ${message}`);
      }
    }
  } catch (err) {
    console.error('[alertCheckJob] 오류:', err.message);
  }
};

const startAlertCheckJob = () => {
  // 1분마다 알림 조건 체크
  cron.schedule('* * * * *', checkAlerts, {
    timezone: 'Asia/Seoul',
  });

  console.log('[alertCheckJob] 알림 체크 크론 시작 (1분 간격)');
};

module.exports = { startAlertCheckJob, checkAlerts };
