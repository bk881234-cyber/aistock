import { useMarketStore } from '@/store/marketStore';
import IndexChartCard from './IndexChartCard';
import FxCard from './FxCard';
import CommodityGauge from './CommodityGauge';
import IndexCard from './IndexCard';

const ROW1     = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'SPX'];
const FX_ORDER = ['USD_KRW', 'EUR_KRW', 'JPY_KRW'];

export default function MacroSection() {
  const { indices, fx, commodities } = useMarketStore();

  const row1   = ROW1.map((s) => indices.find((i) => i.symbol === s) ?? null);
  const shownFx = FX_ORDER.map((s) => fx.find((f) => f.symbol === s) ?? null);
  const gold    = commodities.find((c) => c.symbol === 'GOLD_USD')   ?? null;
  const silver  = commodities.find((c) => c.symbol === 'SILVER_USD') ?? null;
  const vix     = indices.find((i) => i.symbol === 'VIX');
  const dow     = indices.find((i) => i.symbol === 'DOW');
  const usdKrw  = fx.find((f) => f.symbol === 'USD_KRW')?.current_val ?? 0;
  const vixLevel = vix ? Number(vix.current_val) : null;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Row 1: 주요 4대 지수 차트 카드 ─────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {row1.map((idx, i) => (
          <IndexChartCard key={ROW1[i]} data={idx} />
        ))}
      </div>

      {/* ── Row 2: 보조 지수(DOW·VIX) + 환율 카드 ───────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* DOW */}
        <IndexCard data={dow} label="다우" compact />

        {/* VIX — 별도 강조 카드 */}
        <VixCard data={vix} />

        {/* 환율 3종 */}
        {shownFx.map((f, i) => (
          <FxCard key={FX_ORDER[i]} data={f} compact />
        ))}
      </div>

      {/* ── Row 3: 금·은 게이지 (VIX 연동 색상) ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CommodityGauge data={gold}   label="금 (Gold)"   usdKrw={usdKrw} vixLevel={vixLevel} />
        <CommodityGauge data={silver} label="은 (Silver)" usdKrw={usdKrw} vixLevel={vixLevel} />
      </div>

    </div>
  );
}

/**
 * VIX 전용 카드 — 공포지수를 시각적으로 강조
 */
function VixCard({ data }) {
  if (!data) {
    return (
      <div className="rounded-card border border-border bg-white p-4 animate-pulse shadow-card">
        <div className="h-4 w-8 bg-surface3 rounded mb-2" />
        <div className="h-7 w-16 bg-surface3 rounded" />
      </div>
    );
  }

  const val = Number(data.current_val) || 0;
  const pct = Number(data.change_pct)  || 0;
  const isUp = pct > 0;
  const isDown = pct < 0;

  // VIX 레벨별 스타일
  const level =
    val >= 30 ? { label: '공포',   bg: 'bg-danger/6  border-l-danger',  text: 'text-danger' }
    : val >= 20 ? { label: '주의',   bg: 'bg-warn/6    border-l-warn',    text: 'text-warn'   }
    :             { label: '안전',   bg: 'bg-safe/6    border-l-safe',    text: 'text-safe'   };

  return (
    <div className={`relative rounded-card border-l-[3px] border-t border-r border-b border-border ${level.bg} bg-white p-4 shadow-card hover:shadow-cardHover transition-all duration-200`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[12px] font-medium text-text-muted">VIX 공포지수</p>
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${level.text} bg-white/60`}>
          {level.label}
        </span>
      </div>
      <p className={`text-2xl font-bold font-mono tabular-nums ${level.text}`}>
        {val.toFixed(2)}
      </p>
      <p className={`text-sm font-semibold mt-0.5 ${isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-neutral'}`}>
        {isUp ? '▲' : isDown ? '▼' : '—'} {Math.abs(pct).toFixed(2)}%
      </p>
    </div>
  );
}
