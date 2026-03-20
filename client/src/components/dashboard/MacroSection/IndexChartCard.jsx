import { useState, useEffect, useCallback } from 'react';
import { getIndexChart } from '@/api/marketApi';
import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import SparkLine from '@/components/common/SparkLine';
import clsx from 'clsx';

const PERIODS = [
  { key: '1d',  label: '일' },
  { key: '5d',  label: '주' },
  { key: '1mo', label: '월' },
  { key: '1y',  label: '년' },
];

const LABELS = {
  KOSPI:  '코스피',
  KOSDAQ: '코스닥',
  NASDAQ: '나스닥',
  SPX:    'S&P 500',
};

const chartColor = (pct) =>
  pct > 0 ? '#E84040' : pct < 0 ? '#2563EB' : '#6B7280';

export default function IndexChartCard({ data }) {
  const [period, setPeriod]   = useState('1d');
  const [chartData, setChart] = useState([]);
  const [chartLoading, setCL] = useState(false);

  const fetchChart = useCallback(async (sym, p) => {
    if (!sym) return;
    setCL(true);
    try {
      const d = await getIndexChart(sym, p);
      setChart(d?.sparkline ?? []);
    } catch {
      setChart([]);
    } finally {
      setCL(false);
    }
  }, []);

  useEffect(() => {
    fetchChart(data?.symbol, period);
  }, [data?.symbol, period, fetchChart]);

  if (!data) return <SkeletonChartCard />;

  const { symbol, current_val, change_val, change_pct, raw_json } = data;
  const isUp        = change_pct > 0;
  const isDown      = change_pct < 0;
  const marketState = raw_json?.marketState;
  const color       = chartColor(change_pct);

  return (
    <div className={clsx(
      'relative overflow-hidden rounded-card border bg-white p-5 flex flex-col gap-3',
      'transition-all duration-200 hover:shadow-cardHover hover:-translate-y-[1px]',
      isUp   ? 'border-l-[3px] border-l-bull border-t border-r border-b border-border'
      : isDown ? 'border-l-[3px] border-l-bear border-t border-r border-b border-border'
      :          'border border-border',
      'shadow-card',
    )}>
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-text-secondary">
            {LABELS[symbol] ?? symbol}
          </span>
          {marketState && (
            <span className={clsx(
              'text-[11px] px-1.5 py-0.5 rounded-md font-semibold',
              marketState === 'REGULAR'
                ? 'bg-safe/10 text-safe'
                : 'bg-surface3 text-text-muted',
            )}>
              {marketState === 'REGULAR' ? '장중' : '장외'}
            </span>
          )}
        </div>

        {/* 기간 탭 */}
        <div className="flex bg-surface2 rounded-lg p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={clsx(
                'px-2 py-0.5 text-[12px] font-semibold rounded-md transition-all duration-150',
                period === p.key
                  ? 'bg-white shadow-sm text-text-primary'
                  : 'text-text-muted hover:text-text-secondary',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 수치 */}
      <div>
        <p className="text-2xl font-bold font-mono text-text-primary leading-none tabular-nums">
          {fmtIndex(current_val)}
        </p>
        <div className={clsx(
          'flex items-center gap-1 mt-1.5 text-sm font-semibold',
          directionClass(change_pct),
        )}>
          <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
          <span className="font-mono">{fmtIndex(Math.abs(change_val))}</span>
          <span className="opacity-75">({fmtPct(change_pct)})</span>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className={clsx('h-[72px] transition-opacity duration-300', chartLoading && 'opacity-30')}>
        {chartData.length > 1 ? (
          <SparkLine
            data={chartData}
            width={300} height={72}
            color={color}
            filled responsive
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm text-text-muted">
              {chartLoading ? '로딩 중...' : '데이터 없음'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonChartCard() {
  return (
    <div className="rounded-card border border-border bg-white p-5 animate-pulse space-y-3 shadow-card">
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 bg-surface3 rounded" />
        <div className="h-6 w-28 bg-surface3 rounded-lg" />
      </div>
      <div className="h-8 w-32 bg-surface3 rounded" />
      <div className="h-4 w-24 bg-surface3 rounded" />
      <div className="h-[72px] bg-surface3 rounded-lg" />
    </div>
  );
}
