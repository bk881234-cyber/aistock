import { fmtIndex, fmtPct, directionClass } from '@/utils/formatters';
import SparkLine from '@/components/common/SparkLine';
import clsx from 'clsx';

const LABELS = {
  USD_KRW: { name: 'USD / KRW', flag: '🇺🇸' },
  EUR_KRW: { name: 'EUR / KRW', flag: '🇪🇺' },
  JPY_KRW: { name: 'JPY / KRW', flag: '🇯🇵' },
};

/**
 * 환율 카드 — 스파크라인 강조 버전
 *
 * compact=false: 풀 카드 (좌: 수치, 우: 스파크라인)
 * compact=true:  작은 카드 (수치만)
 */
export default function FxCard({ data, compact = false }) {
  if (!data) return <SkeletonFx compact={compact} />;

  const { symbol, raw_json } = data;
  const current_val = Number(data.current_val) || 0;
  const change_pct  = Number(data.change_pct)  || 0;
  const change_val  = Number(data.change_val)  || 0;
  const sparkline   = raw_json?.sparkline ?? [];
  const isUp        = change_pct > 0;
  const isDown      = change_pct < 0;
  const chartColor  = isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280';
  const meta        = LABELS[symbol] ?? { name: symbol, flag: '' };

  // JPY/KRW: 소수점 2자리
  const displayVal = symbol === 'JPY_KRW'
    ? current_val.toFixed(2)
    : fmtIndex(current_val);

  if (compact) {
    return (
      <div className={clsx(
        'relative rounded-card border bg-white p-4 transition-all duration-200 hover:shadow-cardHover shadow-card',
        isUp   ? 'border-l-[3px] border-l-bull border-t border-r border-b border-border'
        : isDown ? 'border-l-[3px] border-l-bear border-t border-r border-b border-border'
        :          'border border-border',
      )}>
        <p className="text-[12px] font-medium text-text-muted">{meta.name}</p>
        <p className="text-xl font-bold font-mono text-text-primary mt-0.5 tabular-nums">{displayVal}</p>
        <p className={clsx('text-sm font-semibold mt-0.5', directionClass(change_pct))}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
      </div>
    );
  }

  // 풀 카드: 스파크라인 강조
  return (
    <div className="rounded-card border border-border bg-white p-4 flex flex-col gap-3 shadow-card hover:shadow-cardHover transition-all duration-200 hover:-translate-y-[1px]">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.flag}</span>
          <p className="text-sm font-bold text-text-secondary">{meta.name}</p>
        </div>
        <span className={clsx(
          'text-xs font-bold px-2 py-0.5 rounded-lg border',
          isUp   ? 'text-bull bg-bull/8 border-bull/15'
          : isDown ? 'text-bear bg-bear/8 border-bear/15'
          :          'text-neutral bg-neutral/10 border-neutral/15',
        )}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(change_pct)}
        </span>
      </div>

      {/* 수치 + 스파크라인 나란히 */}
      <div className="flex items-end gap-3">
        <div className="flex-shrink-0">
          <p className="text-2xl font-bold font-mono text-text-primary tabular-nums leading-none">
            {displayVal}
          </p>
          <p className={clsx('text-sm font-medium mt-1', directionClass(change_val))}>
            {isUp ? '+' : ''}{symbol === 'JPY_KRW' ? change_val.toFixed(3) : fmtIndex(change_val)}
          </p>
        </div>

        {/* 스파크라인 */}
        {sparkline.length > 1 && (
          <div className="flex-1 h-12">
            <SparkLine
              data={sparkline}
              width={120} height={48}
              color={chartColor}
              filled responsive
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonFx({ compact = false }) {
  return (
    <div className={clsx(
      'rounded-card border border-border bg-white shadow-card animate-pulse',
      compact ? 'p-4' : 'p-4 flex flex-col gap-3',
    )}>
      <div className="h-4 w-20 bg-surface3 rounded mb-2" />
      <div className="h-7 w-28 bg-surface3 rounded mb-1" />
      <div className="h-4 w-16 bg-surface3 rounded" />
      {!compact && <div className="h-12 bg-surface3 rounded-lg" />}
    </div>
  );
}
