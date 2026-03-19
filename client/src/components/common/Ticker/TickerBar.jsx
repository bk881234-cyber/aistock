import { useMarketStore } from '@/store/marketStore';
import TickerItem from './TickerItem';

const TICKER_ORDER = ['KOSPI', 'KOSDAQ', 'NASDAQ', 'SPX', 'DOW', 'VIX'];

/**
 * 최상단 무한 스크롤 지수 티커
 * CSS animation으로 구현 (JS interval 없음 → 성능 최적화)
 */
export default function TickerBar() {
  const { indices, loading } = useMarketStore();

  const sorted = TICKER_ORDER
    .map((sym) => indices.find((i) => i.symbol === sym))
    .filter(Boolean);

  if (loading && sorted.length === 0) {
    return (
      <div className="h-9 bg-surface2 border-b border-border flex items-center px-6">
        <span className="text-xs text-text-muted animate-pulse">시장 데이터 로딩 중...</span>
      </div>
    );
  }

  // 무한 스크롤: 목록을 2배 복제
  const doubled = [...sorted, ...sorted];

  return (
    <div className="h-9 bg-surface2 border-b border-border overflow-hidden relative">
      {/* 좌우 페이드 */}
      <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-surface2 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-surface2 to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center h-full gap-0 animate-ticker-scroll"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, idx) => (
          <TickerItem key={`${item.symbol}-${idx}`} item={item} />
        ))}
      </div>
    </div>
  );
}
