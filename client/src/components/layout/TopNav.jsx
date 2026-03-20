import { useLocation } from 'react-router-dom';
import TickerBar from '@/components/common/Ticker/TickerBar';
import { useAlertStore } from '@/store/alertStore';

const PAGE_TITLES = {
  '/':          '대시보드',
  '/portfolio': '포트폴리오',
  '/watchlist': '관심 종목',
  '/curation':  '트렌드 큐레이션',
  '/settings':  '설정',
};

export default function TopNav() {
  const location = useLocation();
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const title = PAGE_TITLES[location.pathname] ?? '상세 보기';

  return (
    <header className="bg-white/50 backdrop-blur-xl border-b border-white/60 flex-shrink-0 shadow-sm">
      {/* 실시간 지수 티커 */}
      <TickerBar />

      {/* 페이지 제목 + 알림 영역 */}
      <div className="flex items-center justify-between px-5 py-3">
        <h1 className="text-lg font-bold text-text-primary">{title}</h1>

        <div className="flex items-center gap-2">
          {/* 알림 벨 */}
          <button className="relative p-2.5 rounded-xl bg-white/60 hover:bg-white/90 border border-white/60 transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-bull rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function LastUpdated() {
  const lastUpdated = useAlertStore?.((s) => s.lastUpdated);
  if (!lastUpdated) return null;
  return (
    <span className="text-[11px] text-text-muted">
      업데이트: {new Date(lastUpdated).toLocaleTimeString('ko-KR')}
    </span>
  );
}
