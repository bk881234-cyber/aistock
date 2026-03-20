import { useMarketStore } from '@/store/marketStore';
import IndexChartCard from './IndexChartCard';
import FxCard from './FxCard';
import CommodityGauge from './CommodityGauge';
import IndexCard from './IndexCard';

const ROW1     = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'SPX'];
const FX_ORDER = ['USD_KRW', 'EUR_KRW', 'JPY_KRW'];

export default function MacroSection() {
  const { indices, fx, commodities } = useMarketStore();

  const row1     = ROW1.map((s) => indices.find((i) => i.symbol === s) ?? null);
  const usdData  = fx.find((f) => f.symbol === 'USD_KRW') ?? null;
  const eurData  = fx.find((f) => f.symbol === 'EUR_KRW') ?? null;
  const jpyData  = fx.find((f) => f.symbol === 'JPY_KRW') ?? null;
  const gold     = commodities.find((c) => c.symbol === 'GOLD_USD')   ?? null;
  const silver   = commodities.find((c) => c.symbol === 'SILVER_USD') ?? null;
  const vix      = indices.find((i) => i.symbol === 'VIX');
  const dow      = indices.find((i) => i.symbol === 'DOW');
  const usdKrw   = usdData?.current_val ?? 0;
  const vixLevel = vix ? Number(vix.current_val) : null;

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Row 1: 주요 4대 지수 차트 카드 ─────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {row1.map((idx, i) => (
          <IndexChartCard key={ROW1[i]} data={idx} />
        ))}
      </div>

      {/* ── Row 2: USD/KRW 맨 앞 → DOW → VIX → EUR → JPY ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* ① USD/KRW — 가장 왼쪽 */}
        <FxCard data={usdData} compact />

        {/* ② DOW */}
        <IndexCard data={dow} label="다우" compact />

        {/* ③ VIX — 별도 강조 카드 */}
        <VixCard data={vix} />

        {/* ④⑤ EUR / JPY */}
        <FxCard data={eurData} compact />
        <FxCard data={jpyData} compact />
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
 * VIX 전용 카드 — Cool Blue + 글로우 스타일
 */
function VixCard({ data }) {
  if (!data) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-8 rounded mb-2" style={{ background: 'rgba(147,197,253,0.30)' }} />
        <div className="h-7 w-16 rounded" style={{ background: 'rgba(147,197,253,0.30)' }} />
      </div>
    );
  }

  const val    = Number(data.current_val) || 0;
  const pct    = Number(data.change_pct)  || 0;
  const isUp   = pct > 0;
  const isDown = pct < 0;

  const level =
    val >= 30 ? { label: '공포', color: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.20)', glow: 'rgba(220,38,38,0.15)' }
    : val >= 20 ? { label: '주의', color: '#EA580C', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.20)',  glow: 'rgba(234,88,12,0.12)'  }
    :             { label: '안전', color: '#16A34A', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.20)',  glow: 'rgba(22,163,74,0.10)'  };

  return (
    <div className="card relative overflow-hidden" style={{
      border: `1px solid ${level.border}`,
      boxShadow: `0 2px 10px ${level.glow}`,
    }}>
      {/* 배경 글로우 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: `linear-gradient(180deg, ${level.bg} 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>VIX 공포지수</p>
          <span style={{
            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px',
            background: level.bg, border: `1px solid ${level.border}`, color: level.color,
          }}>
            {level.label}
          </span>
        </div>
        <p style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'monospace', color: level.color, lineHeight: 1.1 }}>
          {val.toFixed(2)}
        </p>
        <p style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px', color: isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280' }}>
          {isUp ? '▲' : isDown ? '▼' : '—'} {Math.abs(pct).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
