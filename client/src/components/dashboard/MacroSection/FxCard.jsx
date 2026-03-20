import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import SparkLine from '@/components/common/SparkLine';
import clsx from 'clsx';

const LABELS = {
  USD_KRW: 'USD / KRW',
  EUR_KRW: 'EUR / KRW',
  JPY_KRW: 'JPY / KRW',
  CNY_KRW: 'CNY / KRW',
};

export default function FxCard({ data, compact = false }) {
  if (!data) return <SkeletonFx compact={compact} />;

  const { symbol, raw_json } = data;
  const current_val = Number(data.current_val) || 0;
  const change_pct  = Number(data.change_pct)  || 0;
  const sparkline   = raw_json?.sparkline ?? [];
  const isUp        = change_pct > 0;
  const isDown      = change_pct < 0;
  const chartColor  = isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280';

  if (compact) {
    return (
      <div className={clsx(
        'relative rounded-card border p-4 backdrop-blur-xl transition-all duration-200 overflow-hidden',
        isUp ? 'bg-bull/6 border-bull/20' : isDown ? 'bg-bear/6 border-bear/20' : 'bg-white/50 border-white/60',
      )}>
        <div className={clsx('absolute top-0 left-0 right-0 h-[2px]', isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral')} />
        <p className="text-sm font-bold text-text-secondary pt-1">{LABELS[symbol] ?? symbol}</p>
        <p className="text-xl font-bold font-mono text-text-primary mt-0.5">{fmtIndex(current_val)}</p>
        <p className={clsx('text-base font-semibold mt-0.5', directionClass(change_pct))}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-4 flex flex-col gap-2">
      <p className="text-base font-bold text-text-secondary">{LABELS[symbol] ?? symbol}</p>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xl font-bold font-mono text-text-primary">{fmtIndex(current_val)}</p>
          <p className={clsx('text-base font-semibold', directionClass(change_pct))}>
            {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
          </p>
        </div>
        {sparkline.length > 1 && (
          <div className="h-10 w-20 flex-shrink-0">
            <SparkLine data={sparkline} width={80} height={40} color={chartColor} responsive />
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonFx({ compact = false }) {
  return (
    <div className={clsx(
      'rounded-card border border-white/60 bg-white/50 backdrop-blur-xl animate-pulse',
      compact ? 'p-4' : 'p-4',
    )}>
      <div className="h-4 w-20 bg-black/10 rounded mb-2" />
      <div className="h-7 w-24 bg-black/10 rounded mb-1" />
      <div className="h-4 w-16 bg-black/10 rounded" />
    </div>
  );
}
