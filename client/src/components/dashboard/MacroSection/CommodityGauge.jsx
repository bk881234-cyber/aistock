import { fmtUSD, fmtKRW, fmtPct } from '@/utils/formatters';
import GaugeChart from '@/components/common/GaugeChart';
import SparkLine from '@/components/common/SparkLine';
import clsx from 'clsx';

/**
 * 금/은 안전자산 선호도 게이지 카드 (글래스모피즘)
 * gauge_position: 0(52주 저점) ~ 100(52주 고점)
 * usdKrw: USD/KRW 환율 전달 시 KRW 가격 표시
 */
export default function CommodityGauge({ data, label, usdKrw = 0 }) {
  if (!data) return <SkeletonGauge />;

  const { current_val, change_pct, raw_json } = data;
  const pct      = Number(change_pct) || 0;
  const gaugePos = raw_json?.gauge_position ?? 50;
  const sparkline = raw_json?.sparkline ?? [];
  const isUp     = pct > 0;
  const isDown   = pct < 0;
  const krwPrice = usdKrw > 0 ? Math.round(current_val * usdKrw) : null;

  const preference =
    gaugePos >= 75 ? '매우 높음' :
    gaugePos >= 55 ? '높음'     :
    gaugePos >= 45 ? '보통'     :
    gaugePos >= 25 ? '낮음'     : '매우 낮음';

  const prefColor =
    gaugePos >= 55 ? 'bg-bull/10 text-bull border-bull/20' :
    gaugePos <= 45 ? 'bg-bear/10 text-bear border-bear/20' :
    'bg-neutral/10 text-neutral border-neutral/20';

  const chartColor = isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280';

  return (
    <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5 flex gap-5">
      {/* 좌: 게이지 */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <GaugeChart value={gaugePos} size={88} />
        <span className={clsx('text-sm font-semibold px-2.5 py-0.5 rounded-full border', prefColor)}>
          {preference}
        </span>
      </div>

      {/* 우: 수치 + 차트 */}
      <div className="flex-1 min-w-0 flex flex-col gap-2 justify-between">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-text-secondary">{label}</p>
          <span className={clsx(
            'text-base font-bold',
            isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-neutral',
          )}>
            {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(pct)}
          </span>
        </div>

        {/* 가격 */}
        <div>
          <p className="text-2xl font-bold font-mono text-text-primary leading-none">
            {krwPrice ? fmtKRW(krwPrice) : fmtUSD(current_val)}
          </p>
          {krwPrice && (
            <p className="text-sm text-text-muted font-mono mt-0.5">{fmtUSD(current_val)}</p>
          )}
        </div>

        {/* 스파크라인 */}
        {sparkline.length > 1 && (
          <div className="h-12">
            <SparkLine data={sparkline} width={200} height={48} color={chartColor} responsive />
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonGauge() {
  return (
    <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5 flex gap-5 animate-pulse">
      <div className="w-24 h-24 bg-black/10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-20 bg-black/10 rounded" />
        <div className="h-8 w-32 bg-black/10 rounded" />
        <div className="h-12 bg-black/10 rounded" />
      </div>
    </div>
  );
}
