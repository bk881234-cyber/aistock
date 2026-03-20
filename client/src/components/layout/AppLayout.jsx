import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import useMarketData from '@/hooks/useMarketData';
import useAlerts from '@/hooks/useAlerts';

/**
 * 앱 전체 레이아웃 — 글래스모피즘 + PWA 모바일 최적화
 * - 데스크탑: 좌측 사이드바
 * - 모바일: 하단 네비게이션 바 (BottomNav)
 */
export default function AppLayout() {
  useMarketData({ intervalMs: 30_000, autoStart: true });
  useAlerts();

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 35%, #e0f2fe 70%, #dbeafe 100%)' }}
    >
      {/* 장식 배경 오브 */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full bg-accent/12 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-2/3 w-[320px] h-[320px] rounded-full bg-bull/6 blur-3xl" />

      {/* 데스크탑 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />

        {/* 페이지 콘텐츠: 모바일에서 하단 네비 높이만큼 pb 추가 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* 모바일 하단 네비 */}
      <BottomNav />
    </div>
  );
}
