import { fmtUSD, fmtKRW, fmtPct } from '@/utils/formatters';
import GaugeChart from '@/components/common/GaugeChart';
import clsx from 'clsx';

/**
 * 금/은 원자재 카드 (글래스모피즘)
 * - 가격은 트로이온스(oz) 기준 USD 선물 가격
 * - usdKrw 전달 시 KRW 환산 표시
 */
export default function CommodityGauge({ data, label, usdKrw = 0 }) {
  if (!data) return <SkeletonGauge />;

  const { current_val, change_pct, raw_json } = data;
  const pct      = Number(change_pct) || 0;
  const gaugePos = raw_json?.gauge_position ?? 50;
  const isUp     = pct > 0;
  const isDown   = pct < 0;
  const krwPrice = usdKrw > 0 ? Math.round(current_val * usdKrw) : null;

  const preference =
    gaugePos >= 75 ? '매우 높음' :
    gaugePos >= 55 ? '높음'     :
    gaugePos >= 45 ? '보통'     :
    gaugePos >= 25 ? '낮음'     : '매우 낮음';

  const prefBg =
    gaugePos >= 55 ? 'bg-bull/10 text-bull border-bull/20' :
    gaugePos <= 45 ? 'bg-bear/10 text-bear border-bear/20' :
    'bg-neutral/10 text-neutral border-neutral/20';

  return (
    <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-bold text-text-primary">{label}</p>
        <span className={clsx(
          'text-sm font-bold px-2.5 py-0.5 rounded-full border',
          isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-neutral',
          isUp ? 'bg-bull/10 border-bull/20' : isDown ? 'bg-bear/10 border-bear/20' : 'bg-neutral/10 border-neutral/20',
        )}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {fmtPct(pct)}
        </span>
      </div>

      {/* 게이지 + 정보 */}
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <GaugeChart value={gaugePos} size={88} />
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full border', prefBg)}>
            {preference}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* KRW 가격 (메인) */}
          {krwPrice ? (
            <>
              <p className="text-2xl font-bold font-mono text-text-primary leading-none">
                {fmtKRW(krwPrice)}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {fmtUSD(current_val)}<span className="ml-1 text-xs">/oz</span>
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold font-mono text-text-primary">
              {fmtUSD(current_val)}<span className="text-sm font-normal ml-1">/oz</span>
            </p>
          )}

          {/* 52주 위치 바 */}
          <div className="mt-3">
            <p className="text-xs text-text-muted mb-1">52주 범위 내 위치</p>
            <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full', isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral')}
                style={{ width: `${gaugePos}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonGauge() {
  return (
    <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-20 bg-black/10 rounded" />
        <div className="h-5 w-16 bg-black/10 rounded" />
      </div>
      <div className="flex items-center gap-5">
        <div className="w-24 h-16 bg-black/10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-36 bg-black/10 rounded" />
          <div className="h-4 w-24 bg-black/10 rounded" />
          <div className="h-2 w-full bg-black/10 rounded" />
        </div>
      </div>
    </div>
  );
}
