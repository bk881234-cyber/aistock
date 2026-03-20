import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import useMarketData from '@/hooks/useMarketData';
import useAlerts from '@/hooks/useAlerts';

/**
 * 앱 전체 레이아웃 — Cool Blue 테마
 * - 배경: 블루 틴트 그라디언트 (#F0F5FF)
 * - 데스크탑: 다크 사이드바 (w-56)
 * - 모바일: 하단 네비게이션 바
 */
export default function AppLayout() {
  useMarketData({ intervalMs: 30_000, autoStart: true });
  useAlerts();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(160deg, #EBF5FF 0%, #F0F5FF 40%, #E8EFFE 100%)' }}>
      {/* 배경 글로우 오브 (image_5.png 스타일) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div style={{
          position: 'absolute', top: '-120px', left: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-100px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,86,219,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      {/* 데스크탑 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* 모바일 하단 네비 */}
      <BottomNav />
    </div>
  );
}
