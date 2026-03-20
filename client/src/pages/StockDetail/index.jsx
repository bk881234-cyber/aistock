import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import TVChart from '@/components/charts/TVChart';
import AIReport from '@/components/ai/AIReport';
import WeatherWidget from '@/components/ai/WeatherWidget';
import SignalLight from '@/components/common/SignalLight';
import NewsAnalysisPanel from '@/components/ai/NewsAnalysisPanel';
import StockMemo from '@/components/stock/StockMemo';
import { fmtKRW, fmtPct } from '@/utils/formatters';
import { getStockDetail } from '@/api/marketApi';

const RANGES = [
  { key: '1mo', label: '1개월' },
  { key: '3mo', label: '3개월' },
  { key: '6mo', label: '6개월' },
  { key: '1y',  label: '1년'  },
];

export default function StockDetail() {
  const { symbol }   = useParams();
  const { state }    = useLocation();
  const market       = state?.market ?? null;
  const stockName    = state?.stockName ?? symbol;

  const [range,      setRange]  = useState('3mo');
  const [stockData,  setStock]  = useState(null);
  const [loading,    setLoading] = useState(true);
  const [fetchError, setError]  = useState(null);

  const load = useCallback(async (sym, mkt, rng) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStockDetail(sym, mkt, rng);
      setStock(data);
    } catch (err) {
      console.error('[StockDetail] fetch error:', err.message);
      setError('시세 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(symbol, market, range);
  }, [symbol, market, range, load]);

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
      <div className="card flex flex-wrap items-center gap-6 py-4">
        <div>
          <p className="text-xl font-bold text-text-primary">{displayName}</p>
          <p className="text-sm text-text-muted">{symbol} · {displayMkt}</p>
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

            {/* 기간 탭 */}
            <div className="flex rounded-lg p-0.5 gap-0.5 ml-auto" style={{
              background: 'rgba(219,234,254,0.50)',
              border: '1px solid rgba(147,197,253,0.30)',
            }}>
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  style={{
                    padding: '4px 12px', fontSize: '13px', fontWeight: '600',
                    borderRadius: '6px', transition: 'all 0.15s',
                    background: range === r.key ? 'linear-gradient(135deg, #1A56DB, #0EA5E9)' : 'transparent',
                    color: range === r.key ? '#fff' : '#64748B',
                    boxShadow: range === r.key ? '0 2px 6px rgba(26,86,219,0.25)' : 'none',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-4">
          <WeatherWidget symbol={symbol} variant="card" />
          <SignalLight score={55} size="lg" />
        </div>
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

          {/* 뉴스 AI 분석 — 급등락 시 자동 펼침 */}
          <NewsAnalysisPanel
            symbol={symbol}
            priceChangePct={changePct ?? 0}
            autoExpand={Math.abs(changePct ?? 0) >= 3}
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
