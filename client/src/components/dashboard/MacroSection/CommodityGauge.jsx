import { fmtUSD, fmtKRW, fmtPct } from '@/utils/formatters';
import GaugeChart from '@/components/common/GaugeChart';
import clsx from 'clsx';

/**
 * 금/은 원자재 카드 + VIX 연동 게이지
 *
 * vixLevel: null | number (VIX 지수)
 *  < 20  → 안전 구간  (녹색)
 *  20-30 → 주의 구간  (오렌지)
 *  30+   → 공포 구간  (빨강) — 안전자산 선호 급등
 */
export default function CommodityGauge({ data, label, usdKrw = 0, vixLevel = null }) {
  if (!data) return <SkeletonGauge />;

  const { current_val, change_val, change_pct, high_52w, low_52w, raw_json } = data;
  const pct      = Number(change_pct) || 0;
  const chgVal   = Number(change_val) || 0;
  const hi52     = Number(high_52w)   || 0;
  const lo52     = Number(low_52w)    || 0;
  const gaugePos = raw_json?.gauge_position ?? (hi52 && lo52
    ? Math.round(((current_val - lo52) / (hi52 - lo52)) * 100)
    : 50);
  const isUp     = pct > 0;
  const isDown   = pct < 0;
  const krwPrice = usdKrw > 0 ? Math.round(current_val * usdKrw) : null;

  // VIX 기반 위험도 텍스트 + 색상
  const vixInfo = vixLevel === null ? null
    : vixLevel >= 30 ? { label: '공포 구간', color: 'text-danger', bg: 'bg-danger/8 border-danger/20' }
    : vixLevel >= 20 ? { label: '주의 구간', color: 'text-warn',   bg: 'bg-warn/8 border-warn/20'   }
    :                  { label: '안전 구간', color: 'text-safe',   bg: 'bg-safe/8 border-safe/20'   };

  // 52주 bar 위치 클래스
  const barColor = isUp ? 'bg-bull' : isDown ? 'bg-bear' : 'bg-neutral';

  return (
    <div className="card flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-bold text-text-primary">{label}</p>
          {vixInfo && (
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block', vixInfo.bg, vixInfo.color)}>
              VIX {vixLevel?.toFixed(1)} — {vixInfo.label}
            </span>
          )}
        </div>
        <div className={clsx(
          'flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-xl border',
          isUp
            ? 'text-bull bg-bull/8 border-bull/15'
            : isDown
            ? 'text-bear bg-bear/8 border-bear/15'
            : 'text-neutral bg-neutral/10 border-neutral/15',
        )}>
          <span>{isUp ? '▲' : isDown ? '▼' : '—'}</span>
          <span>{fmtPct(pct)}</span>
        </div>
      </div>

      {/* 메인 영역: 게이지 + 가격 */}
      <div className="flex items-center gap-5">
        {/* 게이지 */}
        <div className="flex-shrink-0 text-center">
          <GaugeChart value={gaugePos} size={96} vix={vixLevel} />
          <p className="text-xs text-text-muted mt-1">52주 위치</p>
        </div>

        {/* 가격 정보 */}
        <div className="flex-1 min-w-0">
          {/* KRW 메인 가격 */}
          {krwPrice ? (
            <>
              <p className="text-2xl font-bold font-mono text-text-primary leading-none tabular-nums">
                {fmtKRW(krwPrice)}
              </p>
              <p className="text-sm text-text-muted mt-1 font-mono">
                {fmtUSD(current_val)}<span className="text-xs ml-0.5">/oz</span>
                <span className={clsx(
                  'ml-2 text-xs font-semibold',
                  isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-neutral',
                )}>
                  ({isUp ? '+' : ''}{fmtUSD(chgVal)})
                </span>
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold font-mono text-text-primary">
              {fmtUSD(current_val)}<span className="text-sm font-normal text-text-muted ml-1">/oz</span>
            </p>
          )}

          {/* 52주 범위 바 */}
          {hi52 > 0 && lo52 > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>52주 저가 {fmtUSD(lo52)}</span>
                <span>고가 {fmtUSD(hi52)}</span>
              </div>
              <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', barColor)}
                  style={{ width: `${Math.max(4, gaugePos)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonGauge() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 w-20 bg-surface3 rounded" />
        <div className="h-6 w-16 bg-surface3 rounded-xl" />
      </div>
      <div className="flex items-center gap-5">
        <div className="w-24 h-14 bg-surface3 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-36 bg-surface3 rounded" />
          <div className="h-4 w-24 bg-surface3 rounded" />
          <div className="h-1.5 w-full bg-surface3 rounded" />
        </div>
      </div>
    </div>
  );
}
