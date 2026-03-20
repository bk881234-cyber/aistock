import { useMarketStore } from '@/store/marketStore';
import { fmtIndex, fmtPct } from '@/utils/formatters';
import clsx from 'clsx';

const INDEX_ORDER = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'SPX', 'DOW', 'VIX'];
const FX_ORDER    = ['USD_KRW', 'EUR_KRW', 'JPY_KRW'];

const INDEX_LABELS = {
  KOSPI: '코스피', KOSDAQ: '코스닥', NASDAQ: '나스닥',
  SPX: 'S&P500', DOW: '다우', VIX: 'VIX',
};
const FX_LABELS = {
  USD_KRW: 'USD/KRW', EUR_KRW: 'EUR/KRW', JPY_KRW: 'JPY/KRW',
};

/** 구분 점 */
const Dot = () => (
  <span style={{ color: 'rgba(147,197,253,0.50)', userSelect: 'none', padding: '0 6px', fontSize: '10px' }}>●</span>
);

function IndexTick({ item }) {
  if (!item) return null;
  const { symbol, current_val, change_pct } = item;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;
  const isVix  = symbol === 'VIX';

  const dirColor = isVix
    ? '#A78BFA'
    : isUp ? '#E84040'
    : isDown ? '#2563EB'
    : '#6B7280';

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap" style={{ padding: '0 12px' }}>
      {/* 발광 노드 */}
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        background: isUp ? '#E84040' : isDown ? '#60A5FA' : '#6B7280',
        boxShadow: isUp
          ? '0 0 4px rgba(232,64,64,0.70)'
          : isDown ? '0 0 4px rgba(96,165,250,0.70)'
          : 'none',
      }} />
      <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>{INDEX_LABELS[symbol]}</span>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>{fmtIndex(current_val)}</span>
      <span style={{ fontSize: '11px', fontWeight: '600', color: dirColor }}>
        {isVix
          ? fmtIndex(change_pct)
          : `${isUp ? '▲' : isDown ? '▼' : '—'}${fmtPct(change_pct)}`}
      </span>
      <Dot />
    </span>
  );
}

function FxTick({ item }) {
  if (!item) return null;
  const { symbol, current_val, change_pct } = item;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;

  const display = symbol === 'JPY_KRW'
    ? current_val.toFixed(2)
    : fmtIndex(current_val);

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap" style={{ padding: '0 12px' }}>
      {/* 사이안 발광 노드 (환율 표시) */}
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        background: '#0EA5E9',
        boxShadow: '0 0 5px rgba(14,165,233,0.80)',
      }} />
      <span style={{ fontSize: '11px', fontWeight: '600', color: '#1A56DB' }}>{FX_LABELS[symbol]}</span>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace' }}>{display}</span>
      <span style={{ fontSize: '11px', fontWeight: '600', color: isUp ? '#E84040' : isDown ? '#2563EB' : '#6B7280' }}>
        {isUp ? '▲' : isDown ? '▼' : '—'}{fmtPct(change_pct)}
      </span>
      <Dot />
    </span>
  );
}

/**
 * 최상단 무한 스크롤 티커 — Cool Blue 스타일
 * USD/KRW 가장 앞에 배치 → 지수 → EUR/JPY
 */
export default function TickerBar() {
  const { indices, fx, loading } = useMarketStore();

  const sortedIdx = INDEX_ORDER.map((s) => indices.find((i) => i.symbol === s)).filter(Boolean);
  const sortedFx  = FX_ORDER.map((s) => fx.find((f) => f.symbol === s)).filter(Boolean);

  if (loading && sortedIdx.length === 0) {
    return (
      <div style={{
        height: '36px', background: 'rgba(219,234,254,0.30)',
        borderBottom: '1px solid rgba(147,197,253,0.25)',
        display: 'flex', alignItems: 'center', padding: '0 24px',
      }}>
        <span style={{ fontSize: '12px', color: '#94A3B8', animation: 'pulse 2s infinite' }}>시장 데이터 로딩 중...</span>
      </div>
    );
  }

  // USD/KRW 맨 앞 → 지수 → EUR/JPY
  const usdItem = sortedFx.find((f) => f.symbol === 'USD_KRW');
  const otherFx = sortedFx.filter((f) => f.symbol !== 'USD_KRW');

  const items = [
    ...(usdItem ? [{ type: 'fx', data: usdItem }] : []),
    ...sortedIdx.map((d) => ({ type: 'index', data: d })),
    ...otherFx.map((d) => ({ type: 'fx', data: d })),
  ];
  const doubled = [...items, ...items];

  return (
    <div
      style={{
        height: '36px',
        background: 'linear-gradient(90deg, rgba(219,234,254,0.50) 0%, rgba(224,242,254,0.35) 50%, rgba(219,234,254,0.50) 100%)',
        borderBottom: '1px solid rgba(147,197,253,0.30)',
        overflow: 'hidden', position: 'relative',
        contain: 'layout',
      }}
      className="select-none"
    >
      {/* 좌우 페이드 마스크 */}
      <div style={{
        position: 'absolute', left: 0, top: 0, height: '100%', width: '60px',
        background: 'linear-gradient(90deg, rgba(240,245,255,0.90) 0%, transparent 100%)',
        zIndex: 10, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, height: '100%', width: '60px',
        background: 'linear-gradient(270deg, rgba(240,245,255,0.90) 0%, transparent 100%)',
        zIndex: 10, pointerEvents: 'none',
      }} />

      {/* 스크롤 컨테이너 */}
      <div
        className="flex items-center h-full animate-ticker-scroll hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, idx) =>
          item.type === 'index'
            ? <IndexTick key={`idx-${idx}`} item={item.data} />
            : <FxTick   key={`fx-${idx}`}  item={item.data} />,
        )}
      </div>
    </div>
  );
}
