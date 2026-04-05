import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import TVChart from '@/components/charts/TVChart';
import AIReport from '@/components/ai/AIReport';
import WeatherWidget from '@/components/ai/WeatherWidget';
import SignalLight from '@/components/common/SignalLight';
import StockMemo from '@/components/stock/StockMemo';
import useWeather from '@/hooks/useWeather';
import { fmtKRW, fmtPct } from '@/utils/formatters';
import { getStockDetail } from '@/api/marketApi';

export default function StockDetail() {
  const { symbol }   = useParams();
  const { state }    = useLocation();
  const market       = state?.market ?? null;
  const stockName    = state?.stockName ?? symbol;

  const { weather } = useWeather(symbol);

  const [stockData,  setStock]  = useState(null);
  const [loading,    setLoading] = useState(true);
  const [fetchError, setError]  = useState(null);

  const load = useCallback(async (sym, mkt) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStockDetail(sym, mkt);
      setStock(data);
    } catch (err) {
      console.error('[StockDetail] fetch error:', err.message);
      setError('시세 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(symbol, market);
  }, [symbol, market, load]);

  const candles    = stockData?.candles ?? [];
  const last       = candles[candles.length - 1];
  const prev       = candles[candles.length - 2];
  const changePct  = stockData?.changePct
    ?? (last && prev ? ((last.close - prev.close) / prev.close) * 100 : null);
  const currentPrice = stockData?.currentPrice ?? last?.close ?? 0;
  const displayName  = stockData?.name ?? stockName;
  const displayMkt   = stockData?.market ?? market ?? '';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 상단 요약 바 */}
      <div className="card py-4 space-y-3">
        {/* 종목명 + 날씨/신호 */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xl font-bold text-text-primary truncate">{displayName}</p>
            <p className="text-sm text-text-muted">{symbol} · {displayMkt}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <WeatherWidget symbol={symbol} variant="card" />
            <SignalLight score={weather?.weather_score ?? 50} size="lg" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-pulse h-8 w-32 bg-surface3 rounded" />
            <div className="animate-pulse h-5 w-20 bg-surface3 rounded" />
          </div>
        ) : fetchError ? (
          <p className="text-sm text-danger font-medium">{fetchError}</p>
        ) : (
          <>
            {/* 가격 + 고저가 */}
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {stockData?.currency === 'USD'
                    ? `$${currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : fmtKRW(currentPrice)}
                </p>
                {changePct !== null && (
                  <p className={`text-sm font-semibold ${changePct >= 0 ? 'text-bull' : 'text-bear'}`}>
                    {changePct >= 0 ? '▲' : '▼'} {fmtPct(changePct)}
                  </p>
                )}
              </div>
              {last && (
                <div className="text-sm text-text-muted space-y-0.5">
                  <p>고가 <span className="font-mono font-semibold text-text-primary">{fmtKRW(last.high)}</span></p>
                  <p>저가 <span className="font-mono font-semibold text-text-primary">{fmtKRW(last.low)}</span></p>
                </div>
              )}
            </div>

          </>
        )}
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 차트 */}
        <div className="lg:col-span-8 space-y-5">
          <TVChart
            symbol={symbol}
            name={displayName}
            candleData={candles}
          />

        </div>

        {/* AI 리포트 + 메모 */}
        <div className="lg:col-span-4 space-y-4">
          <AIReport
            symbol={symbol}
            stockData={{
              symbol,
              stockName: displayName,
              market:    displayMkt,
              currentPrice,
              returnPct: changePct ?? 0,
            }}
          />
          <StockMemo symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
