import { useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';

/**
 * 포트폴리오 + 현재가 통합 훅
 * 각 보유 종목에 현재가·수익률·수익금을 enriched 해서 반환
 *
 * @returns {{ enrichedPortfolios, totalInvested, totalCurrentValue,
 *             totalReturnPct, loading, buy, sell, updateSettings, fetchPortfolio }}
 */
const usePortfolio = () => {
  const { portfolios, loading, fetchPortfolio, buy, sell, updateSettings, calcReturnPct } =
    usePortfolioStore();

  // 현재가 조회 (MarketCache에서 가져옴 — 실제 종목 현재가는 2단계 이후 Yahoo Stock API 연동)
  const marketStore = useMarketStore();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // 종목별 Yahoo 심볼 변환 헬퍼 (KIS → Yahoo)
  const toYahooSymbol = (symbol, market) => {
    if (market === 'KOSPI' || market === 'KOSDAQ') return `${symbol}.KS`;
    return symbol; // 미국 주식은 그대로
  };

  // enriched 포트폴리오 (현재가는 MarketCache에서 가져오거나 avg_buy_price 폴백)
  const enrichedPortfolios = portfolios.map((p) => {
    const cachedStock = marketStore.getIndex?.(p.stock_symbol); // 임시 폴백
    const currentPrice = cachedStock?.current_val ?? parseFloat(p.avg_buy_price);
    const returnPct    = calcReturnPct(p, currentPrice);
    const quantity     = parseFloat(p.quantity);
    const avgBuy       = parseFloat(p.avg_buy_price);

    return {
      ...p,
      current_price:   currentPrice,
      return_pct:      returnPct,
      unrealized_gain: (currentPrice - avgBuy) * quantity,
      total_value:     currentPrice * quantity,
      total_cost:      avgBuy * quantity,
    };
  });

  const totalCost         = enrichedPortfolios.reduce((s, p) => s + p.total_cost, 0);
  const totalCurrentValue = enrichedPortfolios.reduce((s, p) => s + p.total_value, 0);
  const totalReturnPct    = totalCost > 0
    ? ((totalCurrentValue - totalCost) / totalCost) * 100
    : 0;

  return {
    enrichedPortfolios,
    totalCost,
    totalCurrentValue,
    totalReturnPct,
    loading,
    buy,
    sell,
    updateSettings,
    fetchPortfolio,
  };
};

export default usePortfolio;
