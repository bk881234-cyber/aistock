import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import clsx from 'clsx';

const LABELS = {
  KOSPI:  '코스피',
  KOSDAQ: '코스닥',
  NASDAQ: '나스닥',
  SPX:    'S&P 500',
  DOW:    '다우',
  VIX:    'VIX',
};

export default function IndexCard({ data, compact = false }) {
  if (!data) return <SkeletonCard compact={compact} />;

  const { symbol, current_val, change_val, change_pct, raw_json } = data;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;

  if (compact) {
    return (
      <div className={clsx(
        'relative overflow-hidden rounded-card border p-4 backdrop-blur-xl transition-all duration-200',
        isUp
          ? 'bg-bull/8 border-bull/25'
          : isDown
          ? 'bg-bear/8 border-bear/25'
          : 'bg-white/50 border-white/60',
      )}>
        {/* 상단 바 */}
        <div className={clsx(
          'absolute top-0 left-0 right-0 h-[2px] rounded-t-card',
          isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral',
        )} />

        <p className="text-sm font-bold text-text-secondary pt-1">{LABELS[symbol] ?? symbol}</p>
        <p className="text-xl font-bold font-mono text-text-primary mt-0.5">
          {fmtIndex(current_val)}
        </p>
        <p className={clsx('text-base font-semibold mt-0.5', directionClass(change_pct))}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
      </div>
    );
  }

  // non-compact (row 1용 - IndexChartCard로 대체됨, fallback)
  return (
    <div className={clsx(
      'relative overflow-hidden rounded-card border p-5 backdrop-blur-xl transition-all duration-200',
      'hover:-translate-y-0.5 hover:shadow-cardHover',
      isUp
        ? 'bg-bull/8 border-bull/25'
        : isDown
        ? 'bg-bear/8 border-bear/25'
        : 'bg-white/50 border-white/60',
    )}>
      <div className={clsx(
        'absolute top-0 left-0 right-0 h-[3px] rounded-t-card',
        isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral',
      )} />

      <div className="flex items-start justify-between mb-2 pt-1">
        <div>
          <p className="text-base font-bold text-text-secondary">{LABELS[symbol] ?? symbol}</p>
          <p className="text-2xl font-bold font-mono text-text-primary mt-1">
            {fmtIndex(current_val)}
          </p>
        </div>
        {raw_json?.marketState && (
          <span className={clsx(
            'text-xs px-2 py-0.5 rounded-full font-semibold border',
            raw_json.marketState === 'REGULAR'
              ? 'bg-bull/10 text-bull border-bull/20'
              : 'bg-neutral/10 text-neutral border-neutral/20',
          )}>
            {raw_json.marketState === 'REGULAR' ? '장중' : '장외'}
          </span>
        )}
      </div>

      <div className={clsx('flex items-center gap-1.5 text-base font-semibold', directionClass(change_pct))}>
        <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
        <span>{fmtIndex(Math.abs(change_val))}</span>
        <span className="text-sm opacity-80">({fmtPct(change_pct)})</span>
      </div>
    </div>
  );
}

function SkeletonCard({ compact = false }) {
  return (
    <div className={clsx(
      'rounded-card border border-white/60 bg-white/50 backdrop-blur-xl animate-pulse',
      compact ? 'p-4 space-y-2' : 'p-5 space-y-2',
    )}>
      <div className="h-4 w-16 bg-black/10 rounded" />
      <div className={clsx('bg-black/10 rounded', compact ? 'h-6 w-24' : 'h-7 w-28')} />
      <div className="h-4 w-20 bg-black/10 rounded" />
    </div>
  );
}
