import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import useMarketData from '@/hooks/useMarketData';
import useAlerts from '@/hooks/useAlerts';

/**
 * 앱 전체 레이아웃 — 화이트 테마 + Stitch 스타일
 * - 데스크탑: 좌측 사이드바 (w-56)
 * - 모바일: 하단 네비게이션 바 (BottomNav)
 */
export default function AppLayout() {
  useMarketData({ intervalMs: 30_000, autoStart: true });
  useAlerts();

  return (
    <div className="flex h-screen overflow-hidden bg-surface2">
      {/* 데스크탑 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />

        {/* 페이지 콘텐츠: 모바일에서 하단 네비 높이만큼 pb 추가 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* 모바일 하단 네비 */}
      <BottomNav />
    </div>
  );
}
