import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import SparkLine from '@/components/common/SparkLine';
import clsx from 'clsx';

const LABELS = {
  USD_KRW: 'USD / KRW',
  EUR_KRW: 'EUR / KRW',
  JPY_KRW: 'JPY / KRW',
  CNY_KRW: 'CNY / KRW',
};

export default function FxCard({ data }) {
  if (!data) return <SkeletonFx />;

  const { symbol, current_val, change_pct, raw_json } = data;
  const sparkline = raw_json?.sparkline ?? [];
  const isUp = change_pct > 0;

  return (
    <div className="card p-3 flex flex-col gap-1">
      <p className="text-[11px] font-medium text-text-muted">{LABELS[symbol] ?? symbol}</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-base font-bold font-mono text-text-primary">
            {fmtIndex(current_val)}
          </p>
          <p className={clsx('text-[12px] font-semibold', directionClass(change_pct))}>
            {isUp ? '▲' : change_pct < 0 ? '▼' : '—'} {fmtPct(change_pct)}
          </p>
        </div>

        {/* D3 스파크라인 */}
        {sparkline.length > 1 && (
          <SparkLine
            data={sparkline}
            width={80}
            height={36}
            color={isUp ? '#0FA36E' : '#E84040'}
          />
        )}
      </div>
    </div>
  );
}

function SkeletonFx() {
  return (
    <div className="card p-3 space-y-1.5 animate-pulse">
      <div className="h-3 w-20 bg-border rounded" />
      <div className="h-5 w-24 bg-border rounded" />
    </div>
  );
}
