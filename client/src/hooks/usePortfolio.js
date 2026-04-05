import { useState, useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { getStockPrice } from '@/api/marketApi';
import { calcTrailingStop, calcHalfSellRecommend, calcSignalLevel } from '@/utils/tradingLogic';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 30_000; // 30초

/**
 * 포트폴리오 통합 훅
 * - 각 보유 종목에 현재가·수익률·수익금·신호등·트레일링스탑·목표가알림을 enriched 해서 반환
 * - 현재가는 /market/price/:symbol API로 30초마다 폴링
 * - 목표 수익률 도달 시 toast 알림 (마운트 당 1회)
 */
const usePortfolio = () => {
  const { portfolios, loading, fetchPortfolio, buy, sell, updateSettings, calcReturnPct } =
    usePortfolioStore();

  // symbol → currentPrice 맵
  const [prices, setPrices] = useState({});

  // 알림 중복 방지: 이미 toast를 띄운 portfolio ID 집합
  const alertedRef  = useRef(new Set());
  const timerRef    = useRef(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // ── 현재가 폴링 ────────────────────────────────────────
  useEffect(() => {
    if (!portfolios.length) return;

    const fetchPrices = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      try {
        const results = await Promise.allSettled(
          portfolios.map((p) =>
            getStockPrice(p.stock_symbol, p.market).then((d) => ({
              symbol: p.stock_symbol,
              price:  d?.currentPrice ?? null,
            }))
          )
        );

        const next = {};
        results.forEach((r) => {
          if (r.status === 'fulfilled' && r.value.price != null) {
            next[r.value.symbol] = r.value.price;
          }
        });

        if (Object.keys(next).length) {
          setPrices((prev) => ({ ...prev, ...next }));
        }
      } catch { /* 폴링 실패 시 기존 prices 유지 */ }
      finally { fetchingRef.current = false; }
    };

    fetchPrices();
    timerRef.current = setInterval(fetchPrices, POLL_INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [portfolios.map((p) => p.stock_symbol).join(',')]);

  // ── enriched 계산 ──────────────────────────────────────────
  const enrichedPortfolios = portfolios.map((p) => {
    const currentPrice = prices[p.stock_symbol] ?? parseFloat(p.avg_buy_price);
    const returnPct    = calcReturnPct(p, currentPrice) ?? 0;
    const quantity     = parseFloat(p.quantity);
    const avgBuy       = parseFloat(p.avg_buy_price);

    const trailingStop = calcTrailingStop(
      currentPrice,
      avgBuy,
      parseFloat(p.trailing_stop_pct) || 0,
    );

    const halfSell = calcHalfSellRecommend(
      returnPct,
      parseFloat(p.target_sell_price) || 0,
      avgBuy,
      currentPrice,
      quantity,
    );

    const signalLevel = calcSignalLevel({
      return_pct:             returnPct,
      stop_loss_price:        p.stop_loss_price,
      current_price:          currentPrice,
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
