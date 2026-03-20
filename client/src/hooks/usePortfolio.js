import { useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { calcTrailingStop, calcHalfSellRecommend, calcSignalLevel } from '@/utils/tradingLogic';
import toast from 'react-hot-toast';

/**
 * 포트폴리오 통합 훅
 * - 각 보유 종목에 현재가·수익률·수익금·신호등·트레일링스탑·목표가알림을 enriched 해서 반환
 * - 목표 수익률 도달 시 toast 알림 (마운트 당 1회)
 */
const usePortfolio = () => {
  const { portfolios, loading, fetchPortfolio, buy, sell, updateSettings, calcReturnPct } =
    usePortfolioStore();
  const marketStore = useMarketStore();

  // 알림 중복 방지: 이미 toast를 띄운 portfolio ID 집합
  const alertedRef = useRef(new Set());

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // ── enriched 계산 ──────────────────────────────────────────
  const enrichedPortfolios = portfolios.map((p) => {
    const cachedStock  = marketStore.getIndex?.(p.stock_symbol);
    const currentPrice = cachedStock?.current_val ?? parseFloat(p.avg_buy_price);
    const returnPct    = calcReturnPct(p, currentPrice) ?? 0;
    const quantity     = parseFloat(p.quantity);
    const avgBuy       = parseFloat(p.avg_buy_price);

    // 트레일링 스탑 계산
    const trailingStop = calcTrailingStop(
      currentPrice,
      avgBuy,
      parseFloat(p.trailing_stop_pct) || 0,
    );

    // 절반 매도 권장
    const halfSell = calcHalfSellRecommend(
      returnPct,
      parseFloat(p.target_sell_price) || 0,
      avgBuy,
      currentPrice,
      quantity,
    );

    // 신호등 레벨
    const signalLevel = calcSignalLevel({
      return_pct:        returnPct,
      stop_loss_price:   p.stop_loss_price,
      current_price:     currentPrice,
      target_return_pct_goal: 10,
    });

    return {
      ...p,
      current_price:   currentPrice,
      return_pct:      returnPct,
      unrealized_gain: (currentPrice - avgBuy) * quantity,
      total_value:     currentPrice * quantity,
      total_cost:      avgBuy * quantity,
      trailingStop,
      halfSell,
      signalLevel,
    };
  });

  // ── 목표가 달성 알림 (마운트 당 1회) ──────────────────────
  useEffect(() => {
    enrichedPortfolios.forEach((p) => {
      if (!p.halfSell?.recommend) return;
      if (alertedRef.current.has(p.id)) return;
      if (p.halfSell.level === 'hit') {
        toast(p.halfSell.reason, {
          icon: '🎯',
          duration: 8000,
          style: { background: '#F0FDF4', color: '#166534', border: '1px solid #86EFAC' },
        });
        alertedRef.current.add(p.id);
      }
    });
  }, [enrichedPortfolios.map((p) => p.id + ':' + p.return_pct).join(',')]);

  // ── 집계 수치 ──────────────────────────────────────────────
  const totalCost         = enrichedPortfolios.reduce((s, p) => s + p.total_cost,  0);
  const totalCurrentValue = enrichedPortfolios.reduce((s, p) => s + p.total_value, 0);
  const totalGain         = totalCurrentValue - totalCost;
  const totalReturnPct    = totalCost > 0
    ? ((totalCurrentValue - totalCost) / totalCost) * 100
    : 0;

  return {
    enrichedPortfolios,
    totalCost,
    totalCurrentValue,
    totalGain,
    totalReturnPct,
    loading,
    buy,
    sell,
    updateSettings,
    fetchPortfolio,
  };
};

export default usePortfolio;
