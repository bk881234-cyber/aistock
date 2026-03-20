/**
 * 매매 로직 유틸리티
 * - 트레일링 스탑 계산
 * - 신호등(Traffic Light) 평가
 * - 목표 수익률 도달 알림 판단
 * - 분할 매도 권장
 */

/**
 * 신호등 레벨 계산
 * @param {object} p  - 포트폴리오 enriched 객체
 * @returns {'green'|'yellow'|'red'} level
 *          green  = 목표가의 80% 이상 달성, 또는 수익률 +5% 이상
 *          yellow = 수익률 -5% ~ +5% (또는 목표 미달성)
 *          red    = 수익률 -5% 미만, 또는 손절가 이하
 */
export const calcSignalLevel = (p) => {
  const ret       = Number(p.return_pct)    ?? 0;
  const stopPrice = Number(p.stop_loss_price) || 0;
  const current   = Number(p.current_price)   || 0;
  const targetRet = Number(p.target_return_pct_goal) || 10; // 기본 목표 10%

  // 손절 조건 (가격 기준)
  if (stopPrice > 0 && current > 0 && current <= stopPrice) return 'red';

  // 수익률 기준
  if (ret >= Math.min(targetRet * 0.8, 5)) return 'green';
  if (ret >= -5)                            return 'yellow';
  return 'red';
};

/**
 * 트레일링 스탑 가격 계산
 * "고점 대비 N% 하락 시 손절" — 현재가를 고점으로 가정(보수적)
 *
 * @param {number} currentPrice   현재가 (고점 프록시)
 * @param {number} avgBuyPrice    평균 매수가
 * @param {number} trailingPct    트레일링 스탑 % (예: 5.0 = -5%)
 * @returns {{ price: number, fromCurrent: number } | null}
 *   price       = 트레일링 스탑 절대 가격
 *   fromCurrent = 현재가 대비 하락 여유 금액
 */
export const calcTrailingStop = (currentPrice, avgBuyPrice, trailingPct) => {
  if (!trailingPct || trailingPct <= 0) return null;
  if (!currentPrice || currentPrice <= 0) return null;

  // 이익 구간에서만 의미 있는 트레일링 스탑
  const high   = Math.max(currentPrice, avgBuyPrice);
  const price  = high * (1 - trailingPct / 100);
  const fromCurrent = currentPrice - price;

  return {
    price:       Math.round(price),
    fromCurrent: Math.round(fromCurrent),
    pct:         trailingPct,
  };
};

/**
 * 절반 매도 권장 판단
 * 목표 수익률 도달 시 "절반 매도 권장" 리턴
 *
 * @param {number} returnPct       현재 수익률 %
 * @param {number} targetReturnPct 목표 수익률 % (portfolio.target_sell_price 기반)
 * @param {number} avgBuyPrice     평균 매수가
 * @param {number} currentPrice    현재가
 * @returns {{ recommend: boolean, reason: string, halfQty: number } | null}
 */
export const calcHalfSellRecommend = (returnPct, targetPrice, avgBuyPrice, currentPrice, quantity) => {
  if (!targetPrice || targetPrice <= 0) return null;

  const targetRetPct = ((targetPrice - avgBuyPrice) / avgBuyPrice) * 100;
  const isTargetHit  = currentPrice >= targetPrice;
  const isNear80     = returnPct >= targetRetPct * 0.8 && targetRetPct > 0;

  if (!isTargetHit && !isNear80) return null;

  const halfQty = Math.floor(Number(quantity) / 2);

  if (isTargetHit) {
    return {
      recommend: true,
      level:     'hit',       // 목표 도달
      reason:    `목표가 ${currentPrice.toLocaleString()}원 도달! 보유 수량의 절반(${halfQty}주) 매도를 권장합니다.`,
      halfQty,
      targetRetPct,
    };
  }

  return {
    recommend: true,
    level:     'near',        // 80% 근접
    reason:    `목표가의 ${Math.round(returnPct / targetRetPct * 100)}% 달성. 부분 익절을 고려해보세요.`,
    halfQty,
    targetRetPct,
  };
};

/**
 * 수익률 → 색상 토큰
 */
export const retColor = (pct) => {
  if (pct >= 5)  return { text: 'text-bull',    bg: 'bg-bull/8',    border: 'border-bull/20' };
  if (pct >= 0)  return { text: 'text-safe',     bg: 'bg-safe/6',    border: 'border-safe/20' };
  if (pct >= -5) return { text: 'text-warn',     bg: 'bg-warn/8',    border: 'border-warn/20' };
  return             { text: 'text-bear',     bg: 'bg-bear/8',    border: 'border-bear/20' };
};

/**
 * 신호등 메타 정보
 */
export const SIGNAL_META = {
  green:  { label: '정상',   color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', dot: 'bg-safe' },
  yellow: { label: '주의',   color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', dot: 'bg-yellow-400' },
  red:    { label: '위험',   color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', dot: 'bg-danger' },
};
