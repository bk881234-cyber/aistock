import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TVChart from '@/components/charts/TVChart';
import AIReport from '@/components/ai/AIReport';
import WeatherWidget from '@/components/ai/WeatherWidget';
import SignalLight from '@/components/common/SignalLight';
import { fmtKRW, fmtPct } from '@/utils/formatters';

/**
 * 종목 상세 페이지
 * - TradingView 캔들 차트
 * - AI 날씨 + 신호등
 * - AI 3줄 요약 리포트
 *
 * 실제 캔들 데이터는 Yahoo Finance v8 API에서 가져옴 (이후 구현)
 */
export default function StockDetail() {
  const { symbol } = useParams();
  const [candleData, setCandleData] = useState([]);
  const [meta,       setMeta]       = useState(null);

  useEffect(() => {
    // TODO: 서버 /api/market/candle/:symbol 엔드포인트 연동
    // 현재는 더미 데이터 생성
    const now   = Math.floor(Date.now() / 1000);
    const dummy = Array.from({ length: 60 }, (_, i) => {
      const base  = 70000 + Math.random() * 5000;
      const open  = +(base).toFixed(0);
      const close = +(base + (Math.random() - 0.48) * 2000).toFixed(0);
      const high  = +(Math.max(open, close) + Math.random() * 500).toFixed(0);
      const low   = +(Math.min(open, close) - Math.random() * 500).toFixed(0);
      return {
        time:   now - (60 - i) * 86400,
        open, high, low, close,
        volume: Math.floor(100000 + Math.random() * 900000),
      };
    });
    setCandleData(dummy);
    setMeta({ name: symbol, market: 'KOSPI' });
  }, [symbol]);

  const last     = candleData[candleData.length - 1];
  const prev     = candleData[candleData.length - 2];
  const changePct = last && prev ? ((last.close - prev.close) / prev.close) * 100 : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 상단 요약 바 */}
      <div className="card flex items-center gap-6 py-4">
        <div>
          <p className="text-xl font-bold text-text-primary">{meta?.name ?? symbol}</p>
          <p className="text-xs text-text-muted">{symbol} · {meta?.market}</p>
        </div>

        {last && (
          <>
            <div>
              <p className="text-2xl font-bold font-mono text-text-primary">
                {fmtKRW(last.close)}
              </p>
              {changePct !== null && (
                <p className={`text-sm font-semibold ${changePct >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {changePct >= 0 ? '▲' : '▼'} {fmtPct(changePct)}
                </p>
              )}
            </div>

            <div className="text-xs text-text-muted space-y-0.5">
              <p>고가 <span className="font-mono text-text-primary">{fmtKRW(last.high)}</span></p>
              <p>저가 <span className="font-mono text-text-primary">{fmtKRW(last.low)}</span></p>
            </div>
          </>
        )}

        <div className="ml-auto flex items-center gap-4">
          <WeatherWidget symbol={symbol} variant="card" />
          <SignalLight score={55} size="lg" />
        </div>
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-12 gap-5">
        {/* 차트 */}
        <div className="col-span-8">
          <TVChart
            symbol={symbol}
            name={meta?.name ?? symbol}
            candleData={candleData}
          />
        </div>

        {/* AI 리포트 */}
        <div className="col-span-4">
          <AIReport symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
