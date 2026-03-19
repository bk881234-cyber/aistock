import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import useMarketData from '@/hooks/useMarketData';
import useAlerts from '@/hooks/useAlerts';

/**
 * 앱 전체 레이아웃
 * - 좌측 고정 사이드바
 * - 최상단 티커 + 네비게이션
 * - 우측 메인 콘텐츠 영역
 * - 마운트 시 시장 데이터 폴링 시작
 */
export default function AppLayout() {
  // 최상위에서 폴링 시작 → 모든 자식 컴포넌트가 스토어 구독
  useMarketData({ intervalMs: 30_000, autoStart: true });
  useAlerts();

  return (
    <div className="flex h-screen bg-surface2 overflow-hidden">
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* 상단 네비 (티커 포함) */}
        <TopNav />

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
