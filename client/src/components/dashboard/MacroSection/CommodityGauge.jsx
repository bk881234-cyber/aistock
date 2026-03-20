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

  // oz → g 환산 (1 troy oz = 31.1035 g)
  const OZ_TO_G      = 31.1035;
  const pricePerGram = current_val / OZ_TO_G;          // USD/g
  const chgPerGram   = chgVal / OZ_TO_G;               // USD/g 변동
  const krwPerGram   = usdKrw > 0 ? Math.round(pricePerGram * usdKrw) : null;  // KRW/g

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
          <p className="text-xs text-text-muted mt-1">1년 위치 {gaugePos}%</p>
        </div>

        {/* 가격 정보 */}
        <div className="flex-1 min-w-0">
          {/* KRW/g 메인 가격 */}
          {krwPerGram ? (
            <>
              <p className="text-2xl font-bold font-mono text-text-primary leading-none tabular-nums">
                {fmtKRW(krwPerGram)}<span className="text-sm font-normal text-text-muted ml-1">/g</span>
              </p>
              <p className="text-sm text-text-muted mt-1 font-mono">
                ${pricePerGram.toFixed(2)}<span className="text-xs ml-0.5">/g</span>
                <span className={clsx(
                  'ml-2 text-xs font-semibold',
                  isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-neutral',
                )}>
                  ({isUp ? '+' : ''}${chgPerGram.toFixed(2)})
                </span>
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold font-mono text-text-primary">
              ${pricePerGram.toFixed(2)}<span className="text-sm font-normal text-text-muted ml-1">/g</span>
            </p>
          )}

          {/* 52주 범위 바 */}
          {hi52 > 0 && lo52 > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[11px] text-text-muted mb-1">
                <span>1년 최저가 ${(lo52 / OZ_TO_G).toFixed(2)}/g</span>
                <span>1년 최고가 ${(hi52 / OZ_TO_G).toFixed(2)}/g</span>
              </div>
              {/* 범위 바 + 현재 위치 점 */}
              <div className="relative h-1.5 bg-surface3 rounded-full overflow-visible">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', barColor)}
                  style={{ width: `${Math.max(4, gaugePos)}%` }}
                />
                {/* 현재가 위치 마커 */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-text-primary shadow-sm"
                  style={{ left: `calc(${Math.max(4, gaugePos)}% - 5px)` }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1.5">
                현재 가격은 1년 최저가~최고가 사이의 <span className="font-bold text-text-secondary">{gaugePos}%</span> 위치
                {gaugePos >= 80 && <span className="text-danger ml-1">— 연고점 근처</span>}
                {gaugePos <= 20 && <span className="text-safe ml-1">— 연저점 근처</span>}
              </p>
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
