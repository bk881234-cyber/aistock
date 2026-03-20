import { fmtUSD, fmtPct } from '@/utils/formatters';
import GaugeChart from '@/components/common/GaugeChart';
import clsx from 'clsx';

/**
 * 금/은 안전자산 선호도 게이지 카드
 * gauge_position: 0(52주 저점) ~ 100(52주 고점)
 */
export default function CommodityGauge({ data, label, emoji, compact = false }) {
  if (!data) return <SkeletonGauge compact={compact} />;

  const { current_val, raw_json } = data;
  const change_pct = Number(data.change_pct) || 0;
  const gaugePos = raw_json?.gauge_position ?? 50;
  const isUp = change_pct > 0;

  // 게이지 위치에 따른 선호도 레이블
  const preference =
    gaugePos >= 75 ? '매우 높음' :
    gaugePos >= 55 ? '높음'     :
    gaugePos >= 45 ? '보통'     :
    gaugePos >= 25 ? '낮음'     : '매우 낮음';

  if (compact) {
    return (
      <div className="card p-3 flex flex-col gap-0.5">
        <p className="text-[10px] font-medium text-text-muted">{emoji} {label}</p>
        <p className="text-sm font-bold font-mono text-text-primary">{fmtUSD(current_val)}</p>
        <p className={clsx(
          'text-[11px] font-semibold',
          isUp ? 'text-bull' : change_pct < 0 ? 'text-bear' : 'text-neutral'
        )}>
          {isUp ? '▲' : change_pct < 0 ? '▼' : '—'} {fmtPct(change_pct)}
        </p>
        <p className="text-[10px] text-text-muted">{preference}</p>
      </div>
    );
  }

  return (
    <div className="card p-3 flex flex-col items-center gap-1">
      <p className="text-[11px] font-medium text-text-muted self-start">
        {emoji} {label} 선호도
      </p>

      <GaugeChart value={gaugePos} size={72} />

      <p className="text-sm font-bold font-mono text-text-primary">
        {fmtUSD(current_val)}
      </p>
      <p className={clsx(
        'text-[11px] font-semibold',
        isUp ? 'text-bull' : change_pct < 0 ? 'text-bear' : 'text-neutral'
      )}>
        {fmtPct(change_pct)}
      </p>
      <p className="text-[10px] text-text-muted">{preference}</p>
    </div>
  );
}

function SkeletonGauge({ compact = false }) {
  if (compact) {
    return (
      <div className="card p-3 space-y-1.5 animate-pulse">
        <div className="h-3 w-12 bg-border rounded" />
        <div className="h-4 w-20 bg-border rounded" />
        <div className="h-3 w-10 bg-border rounded" />
      </div>
    );
  }
  return (
    <div className="card p-3 flex flex-col items-center gap-2 animate-pulse">
      <div className="h-3 w-16 bg-border rounded" />
      <div className="w-18 h-10 bg-border rounded" />
      <div className="h-4 w-12 bg-border rounded" />
    </div>
  );
}
