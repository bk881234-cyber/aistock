const { Portfolio } = require('../../models');

/**
 * 분할 매도 플랜 생성
 * 목표가 도달 시 3단계 분할 매도 권장
 * @param {string} portfolioId
 * @param {string} userId
 * @param {number} currentPrice - 현재 시장가 (프론트에서 전달)
 */
const generate = async (portfolioId, userId, currentPrice) => {
  const portfolio = await Portfolio.findOne({
    where: { id: portfolioId, user_id: userId, status: 'active' },
  });

  if (!portfolio) throw new Error('보유 종목을 찾을 수 없습니다.');

  const { avg_buy_price, quantity, target_sell_price, stop_loss_price, trailing_stop_pct } = portfolio;

  const avgBuy = parseFloat(avg_buy_price);
  const qty    = parseFloat(quantity);
  const target = parseFloat(target_sell_price);
  const stop   = parseFloat(stop_loss_price);

  // 수익률 계산 (현재가 기준)
  const price       = currentPrice || avgBuy;
  const returnPct   = ((price - avgBuy) / avgBuy) * 100;
  const totalValue  = price * qty;
  const totalCost   = avgBuy * qty;
  const unrealizedGain = totalValue - totalCost;

  // 분할 매도 플랜 (목표가 기준 3단계)
  const splitPlan = target
    ? [
        {
          step: 1,
          trigger_price: target,
          trigger_desc: `목표가 ${target.toLocaleString()}원 도달`,
          sell_pct: 33,
          sell_qty: Math.floor(qty * 0.33),
          reason: '1차 익절: 수익 일부 실현으로 심리적 안정 확보',
        },
        {
          step: 2,
          trigger_price: target * 1.05,
          trigger_desc: `목표가 +5% (${(target * 1.05).toLocaleString()}원)`,
          sell_pct: 33,
          sell_qty: Math.floor(qty * 0.33),
          reason: '2차 익절: 추가 상승 시 수익 극대화',
        },
        {
          step: 3,
          trigger_price: target * 1.10,
          trigger_desc: `목표가 +10% (${(target * 1.10).toLocaleString()}원)`,
          sell_pct: 34,
          sell_qty: Math.ceil(qty * 0.34),
          reason: '3차 익절: 잔여 물량 전량 청산',
        },
      ]
    : [];

  // 트레일링 스탑 시뮬레이션
  const trailingStop = trailing_stop_pct
    ? {
        trailing_pct: trailing_stop_pct,
        current_stop_price: price * (1 - trailing_stop_pct / 100),
        description: `현재가 ${price.toLocaleString()}원 기준 ${trailing_stop_pct}% 하락 시 자동 매도 권장`,
      }
    : null;

  return {
    portfolio_id: portfolioId,
    stock_symbol: portfolio.stock_symbol,
    summary: {
      avg_buy_price: avgBuy,
      current_price: price,
      quantity: qty,
      return_pct: returnPct.toFixed(2),
      unrealized_gain: unrealizedGain.toFixed(0),
      total_value: totalValue.toFixed(0),
    },
    split_sell_plan: splitPlan,
    stop_loss: stop ? {
      price: stop,
      description: `손절가 ${stop.toLocaleString()}원 이탈 시 전량 매도 권장`,
      loss_if_triggered: ((stop - avgBuy) * qty).toFixed(0),
    } : null,
    trailing_stop: trailingStop,
    mental_tips: [
      '목표가 도달 시 뉴스가 아닌 분할 매도 플랜을 따르세요.',
      '손절가 설정 후에는 감정적 판단 없이 기계적으로 실행하세요.',
      '전량 매도보다 분할 매도가 장기 수익률을 높입니다.',
    ],
  };
};

module.exports = { generate };
