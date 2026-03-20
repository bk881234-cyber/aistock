import { useLocation } from 'react-router-dom';
import TickerBar from '@/components/common/Ticker/TickerBar';
import { useAlertStore } from '@/store/alertStore';
import { useMarketStore } from '@/store/marketStore';

const PAGE_TITLES = {
  '/':           '대시보드',
  '/portfolio':  '포트폴리오',
  '/watchlist':  '관심 종목',
  '/curation':   '트렌드 큐레이션',
  '/calculator': '물타기 계산기',
  '/settings':   '설정',
};

export default function TopNav() {
  const location    = useLocation();
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const lastUpdated = useMarketStore((s) => s.lastUpdated);
  const loading     = useMarketStore((s) => s.loading);
  const title       = PAGE_TITLES[location.pathname] ?? '상세 보기';

  return (
    <header className="bg-white border-b border-border flex-shrink-0 shadow-ticker">
      {/* 실시간 지수 + 환율 티커 */}
      <TickerBar />

      {/* 페이지 제목 + 알림 */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
          {lastUpdated && (
            <span className="hidden md:flex items-center gap-1.5 text-xs text-text-muted">
              {loading
                ? <span className="text-primary animate-pulse">● 업데이트 중</span>
                : <>업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}</>
              }
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-surface2 border border-border transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-bull rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
