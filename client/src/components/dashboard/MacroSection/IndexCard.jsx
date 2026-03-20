import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import clsx from 'clsx';

const LABELS = {
  KOSPI: '코스피', KOSDAQ: '코스닥',
  NASDAQ: '나스닥', SPX: 'S&P 500', DOW: '다우', VIX: 'VIX',
};

export default function IndexCard({ data, label, compact = false }) {
  if (!data) return <SkeletonCard compact={compact} />;

  const { symbol, current_val, change_val, change_pct } = data;
  const displayLabel = label ?? LABELS[symbol] ?? symbol;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;

  if (compact) {
    return (
      <div
        className="transition-all duration-200"
        style={{
          borderRadius: '16px',
          padding: '16px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.80) 100%)',
          border: '1px solid rgba(147,197,253,0.35)',
          boxShadow: '0 2px 8px rgba(26,86,219,0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,219,0.10)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,86,219,0.05)';
          e.currentTarget.style.transform = '';
        }}
      >
        <p className="text-[14px] font-semibold text-text-muted">{displayLabel}</p>
        <p className="text-[22px] font-bold font-mono text-text-primary mt-0.5 tabular-nums">
          {fmtIndex(current_val)}
        </p>
        <p className={clsx('text-sm font-semibold mt-0.5', directionClass(change_pct))}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
      </div>
    );
  }

  return (
    <div
      className="transition-all duration-200"
      style={{
        borderRadius: '16px',
        padding: '20px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(240,245,255,0.85) 100%)',
        border: '1px solid rgba(147,197,253,0.28)',
        boxShadow: '0 2px 8px rgba(26,86,219,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,219,0.10)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,86,219,0.05)';
        e.currentTarget.style.transform = '';
      }}
    >
      <p className="text-[16px] font-bold text-text-secondary">{displayLabel}</p>
      <p className="text-[26px] font-bold font-mono text-text-primary mt-1 tabular-nums">
        {fmtIndex(current_val)}
      </p>
      <div className={clsx('flex items-center gap-1 text-sm font-semibold mt-1', directionClass(change_pct))}>
        <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
        <span className="font-mono">{fmtIndex(Math.abs(change_val))}</span>
        <span className="opacity-75">({fmtPct(change_pct)})</span>
      </div>
    </div>
  );
}

function SkeletonCard({ compact = false }) {
  return (
    <div className={clsx(
      'rounded-card border border-border bg-white shadow-card animate-pulse',
      compact ? 'p-4 space-y-2' : 'p-5 space-y-2',
    )}>
      <div className="h-3 w-12 bg-surface3 rounded" />
      <div className={clsx('bg-surface3 rounded', compact ? 'h-6 w-24' : 'h-8 w-28')} />
      <div className="h-3.5 w-20 bg-surface3 rounded" />
    </div>
  );
}
