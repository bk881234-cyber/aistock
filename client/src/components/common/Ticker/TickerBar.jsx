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

/** 구분점 */
const Dot = () => (
  <span className="text-border/80 select-none px-1">•</span>
);

function IndexTick({ item }) {
  if (!item) return null;
  const { symbol, current_val, change_pct } = item;
  const isUp   = change_pct > 0;
  const isDown = change_pct < 0;
  const isVix  = symbol === 'VIX';

  return (
    <span className="inline-flex items-center gap-1.5 px-4 whitespace-nowrap">
      <span className="text-[12px] font-medium text-text-muted">{INDEX_LABELS[symbol]}</span>
      <span className="text-[13px] font-bold text-text-primary font-mono">{fmtIndex(current_val)}</span>
      <span className={clsx(
        'text-[11px] font-semibold',
        isVix ? 'text-accent'
          : isUp ? 'text-bull'
          : isDown ? 'text-bear'
          : 'text-neutral',
      )}>
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

  // JPY/KRW는 소수점 2자리까지 표시
  const display = symbol === 'JPY_KRW'
    ? current_val.toFixed(2)
    : fmtIndex(current_val);

  return (
    <span className="inline-flex items-center gap-1.5 px-4 whitespace-nowrap">
      <span className="text-[12px] font-medium text-text-muted">{FX_LABELS[symbol]}</span>
      <span className="text-[13px] font-bold text-text-primary font-mono">{display}</span>
      <span className={clsx(
        'text-[11px] font-semibold',
        isUp ? 'text-bull' : isDown ? 'text-bear' : 'text-neutral',
      )}>
        {isUp ? '▲' : isDown ? '▼' : '—'}{fmtPct(change_pct)}
      </span>
      <Dot />
    </span>
  );
}

/**
 * 최상단 무한 스크롤 티커
 * - 지수 6개 + 환율 3개 통합
 * - CSS animation 기반 (JS interval 없음)
 * - 마우스 hover 시 일시정지
 */
export default function TickerBar() {
  const { indices, fx, loading } = useMarketStore();

  const sortedIdx = INDEX_ORDER.map((s) => indices.find((i) => i.symbol === s)).filter(Boolean);
  const sortedFx  = FX_ORDER.map((s) => fx.find((f) => f.symbol === s)).filter(Boolean);

  if (loading && sortedIdx.length === 0) {
    return (
      <div className="h-9 bg-surface2 border-b border-border flex items-center px-6">
        <span className="text-xs text-text-muted animate-pulse">시장 데이터 로딩 중...</span>
      </div>
    );
  }

  // 지수 + 환율 섞어서 무한 반복
  const items = [...sortedIdx.map((d) => ({ type: 'index', data: d })), ...sortedFx.map((d) => ({ type: 'fx', data: d }))];
  const doubled = [...items, ...items]; // CSS 애니메이션 무한 효과

  return (
    <div
      className="h-9 bg-white border-b border-border overflow-hidden relative select-none"
      style={{ contain: 'layout' }}
    >
      {/* 좌우 페이드 마스크 */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

      {/* 스크롤 컨테이너 — hover 시 animation-play-state: paused */}
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
