import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import clsx from 'clsx';

const LABELS = {
  KOSPI:  '코스피',
  KOSDAQ: '코스닥',
  NASDAQ: '나스닥',
  SPX:    'S&P 500',
  DOW:    '다우',
  VIX:    'VIX 공포지수',
};

export default function IndexCard({ data, compact = false }) {
  if (!data) return <SkeletonCard compact={compact} />;

  const { symbol, current_val, change_val, change_pct, raw_json } = data;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;
  const marketState = raw_json?.marketState;

  if (compact) {
    return (
      <div className="card-hover p-3 relative overflow-hidden">
        <p className="text-[10px] font-medium text-text-muted">{LABELS[symbol] ?? symbol}</p>
        <p className="text-base font-bold font-mono text-text-primary mt-0.5">
          {fmtIndex(current_val)}
        </p>
        <p className={clsx('text-[11px] font-semibold', directionClass(change_pct))}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
        <div className={clsx('absolute left-0 top-2 bottom-2 w-0.5 rounded-full', isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral')} />
      </div>
    );
  }

  return (
    <div className={clsx(
      'card-hover p-4 relative overflow-hidden',
      isUp && 'bg-gradient-to-br from-surface to-bull-light',
      isDown && 'bg-gradient-to-br from-surface to-bear-light',
    )}>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px] font-medium text-text-muted">{LABELS[symbol] ?? symbol}</p>
          <p className="text-xl font-bold font-mono text-text-primary mt-0.5">
            {fmtIndex(current_val)}
          </p>
        </div>
        {/* 마켓 상태 뱃지 */}
        {marketState && (
          <span className={clsx(
            'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
            marketState === 'REGULAR'
              ? 'bg-bull-light text-bull'
              : 'bg-neutral-light text-neutral'
          )}>
            {marketState === 'REGULAR' ? '장중' : '장외'}
          </span>
        )}
      </div>

      {/* 등락 */}
      <div className={clsx('flex items-center gap-1.5 text-sm font-semibold', directionClass(change_pct))}>
        <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
        <span>{fmtIndex(Math.abs(change_val))}</span>
        <span className="text-[12px]">({fmtPct(change_pct)})</span>
      </div>

      {/* 좌측 컬러 바 */}
      <div
        className={clsx(
          'absolute left-0 top-3 bottom-3 w-1 rounded-full',
          isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral'
        )}
      />
    </div>
  );
}

function SkeletonCard({ compact = false }) {
  return (
    <div className={`card ${compact ? 'p-3' : 'p-4'} space-y-2 animate-pulse`}>
      <div className="h-3 w-16 bg-border rounded" />
      <div className={`${compact ? 'h-5' : 'h-6'} w-24 bg-border rounded`} />
      <div className="h-3 w-20 bg-border rounded" />
    </div>
  );
}
