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

/** 상승 = 빨강 (#E84040), 하락 = 파랑 (#2563EB) */
const chartColor = (pct) =>
  pct > 0 ? '#E84040' : pct < 0 ? '#2563EB' : '#6B7280';

export default function IndexChartCard({ data }) {
  const [period, setPeriod]     = useState('1d');
  const [chartData, setChart]   = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchChart = useCallback(async (sym, p) => {
    if (!sym) return;
    setChartLoading(true);
    try {
      const d = await getIndexChart(sym, p);
      setChart(d?.sparkline ?? []);
    } catch {
      setChart([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChart(data?.symbol, period);
  }, [data?.symbol, period, fetchChart]);

  if (!data) return <SkeletonChartCard />;

  const { symbol, current_val, change_val, change_pct, raw_json } = data;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;
  const marketState = raw_json?.marketState;
  const color = chartColor(change_pct);

  return (
    <div className={clsx(
      'relative overflow-hidden rounded-card border p-5 flex flex-col gap-3',
      'backdrop-blur-xl transition-all duration-300',
      'hover:-translate-y-0.5 hover:shadow-cardHover',
      isUp
        ? 'bg-bull/8 border-bull/25 shadow-[0_4px_24px_rgba(232,64,64,0.10)]'
        : isDown
        ? 'bg-bear/8 border-bear/25 shadow-[0_4px_24px_rgba(37,99,235,0.10)]'
        : 'bg-white/50 border-white/60 shadow-card',
    )}>
      {/* 상단 강조 바 */}
      <div className={clsx(
        'absolute top-0 left-0 right-0 h-[3px] rounded-t-card',
        isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral',
      )} />

      {/* 헤더: 이름 + 장 상태 + 기간 탭 */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-text-secondary tracking-tight">
            {LABELS[symbol] ?? symbol}
          </span>
          {marketState && (
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full font-semibold border',
              marketState === 'REGULAR'
                ? 'bg-bull/10 text-bull border-bull/20'
                : 'bg-neutral/10 text-neutral border-neutral/20',
            )}>
              {marketState === 'REGULAR' ? '장중' : '장외'}
            </span>
          )}
        </div>

        {/* 기간 탭 */}
        <div className="flex bg-black/5 backdrop-blur-sm rounded-lg p-0.5 gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={clsx(
                'px-2.5 py-1 text-sm font-semibold rounded-md transition-all duration-150',
                period === p.key
                  ? 'bg-white/90 shadow text-text-primary'
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
        <p className="text-3xl font-bold font-mono text-text-primary leading-none">
          {fmtIndex(current_val)}
        </p>
        <div className={clsx(
          'flex items-center gap-1.5 mt-1.5 text-base font-semibold',
          directionClass(change_pct),
        )}>
          <span className="text-lg">{isUp ? '▲' : isDown ? '▼' : '—'}</span>
          <span>{fmtIndex(Math.abs(change_val))}</span>
          <span className="text-sm opacity-80">({fmtPct(change_pct)})</span>
        </div>
      </div>

      {/* 차트 */}
      <div className={clsx('transition-opacity duration-300 h-20', chartLoading && 'opacity-30')}>
        {chartData.length > 1 ? (
          <SparkLine
            data={chartData}
            width={300}
            height={80}
            color={color}
            filled
            responsive
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm text-text-muted">
              {chartLoading ? '불러오는 중...' : '데이터 없음'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonChartCard() {
  return (
    <div className="rounded-card border border-white/60 bg-white/50 backdrop-blur-xl p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-5 w-20 bg-black/10 rounded-lg" />
        <div className="h-7 w-32 bg-black/10 rounded-lg" />
      </div>
      <div className="h-9 w-40 bg-black/10 rounded-lg" />
      <div className="h-5 w-32 bg-black/10 rounded-lg" />
      <div className="h-20 bg-black/10 rounded-lg" />
    </div>
  );
}
