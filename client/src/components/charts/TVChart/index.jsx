import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import clsx from 'clsx';

const INTERVALS = [
  { label: '1일',  value: '1D' },
  { label: '1주',  value: '1W' },
  { label: '1개월',value: '1M' },
  { label: '3개월',value: '3M' },
];

/**
 * TradingView Lightweight Charts 메인 차트
 * @param {string} symbol      - 종목 코드
 * @param {Array}  candleData  - [{ time, open, high, low, close, volume }]
 * @param {string} name        - 종목명 (헤더 표시용)
 */
export default function TVChart({ symbol, candleData = [], name = '' }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);
  const volumeRef    = useRef(null);
  const [interval, setInterval_] = useState('1D');
  const [crosshairPrice, setCrosshairPrice] = useState(null);

  // 차트 초기화
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#6B7280',
        fontFamily: 'Pretendard, Inter, system-ui',
      },
      grid: {
        vertLines:   { color: '#F3F4F6', style: 1 },
        horzLines:   { color: '#F3F4F6', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#9CA3AF', width: 1, style: 2 },
        horzLine: { color: '#9CA3AF', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#E5E7EB',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#E5E7EB',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll:  { mouseWheel: true, pressedMouseMove: true },
      handleScale:   { mouseWheel: true, pinch: true },
    });

    // 캔들 시리즈
    const candleSeries = chart.addCandlestickSeries({
      upColor:        '#0FA36E',
      downColor:      '#E84040',
      borderUpColor:  '#0FA36E',
      borderDownColor:'#E84040',
      wickUpColor:    '#0FA36E',
      wickDownColor:  '#E84040',
    });

    // 거래량 히스토그램
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      color: '#E5E7EB',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // 크로스헤어 → 현재가 오버레이 업데이트
    chart.subscribeCrosshairMove((param) => {
      if (param.seriesData.has(candleSeries)) {
        const bar = param.seriesData.get(candleSeries);
        setCrosshairPrice(bar?.close ?? null);
      } else {
        setCrosshairPrice(null);
      }
    });

    // 반응형 크기
    const observer = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    observer.observe(containerRef.current);

    chartRef.current  = chart;
    seriesRef.current = candleSeries;
    volumeRef.current = volumeSeries;

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, []);

  // 데이터 업데이트
  useEffect(() => {
    if (!seriesRef.current || !candleData.length) return;

    const sorted = [...candleData].sort((a, b) => a.time - b.time);
    seriesRef.current.setData(sorted);

    // 거래량 색상 (상승=초록, 하락=빨강)
    if (volumeRef.current) {
      volumeRef.current.setData(
        sorted.map((d) => ({
          time:  d.time,
          value: d.volume ?? 0,
          color: d.close >= d.open ? 'rgba(15,163,110,0.3)' : 'rgba(232,64,64,0.3)',
        }))
      );
    }

    chartRef.current?.timeScale().fitContent();
  }, [candleData]);

  const lastCandle = candleData[candleData.length - 1];
  const displayPrice = crosshairPrice ?? lastCandle?.close;
  const priceChange  = lastCandle ? lastCandle.close - lastCandle.open : 0;

  return (
    <div className="card p-0 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-text-primary">{name || symbol}</p>
            {displayPrice && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono text-text-primary">
                  {Number(displayPrice).toLocaleString()}
                </span>
                {priceChange !== 0 && (
                  <span className={clsx(
                    'text-xs font-semibold',
                    priceChange > 0 ? 'text-bull' : 'text-bear'
                  )}>
                    {priceChange > 0 ? '▲' : '▼'}
                    {Math.abs(priceChange).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 인터벌 탭 */}
        <div className="flex gap-1">
          {INTERVALS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setInterval_(value)}
              className={clsx(
                'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                interval === value
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-surface2'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 차트 영역 */}
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: 380 }}
      />

      {/* 데이터 없을 때 */}
      {candleData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-text-muted">차트 데이터 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
