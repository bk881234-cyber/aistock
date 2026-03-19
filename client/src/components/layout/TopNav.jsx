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
    <header className="bg-surface border-b border-border flex-shrink-0">
      {/* 실시간 지수 티커 */}
      <TickerBar />

      {/* 페이지 제목 + 알림 영역 */}
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-base font-bold text-text-primary">{title}</h1>

        <div className="flex items-center gap-3">
          {/* 알림 벨 */}
          <button className="relative p-2 rounded-lg hover:bg-surface2 transition-colors">
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-bear rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 마지막 업데이트 시각 */}
          <LastUpdated />
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
