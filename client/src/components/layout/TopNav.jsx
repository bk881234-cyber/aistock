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
    <header
      className="flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(147,197,253,0.35)',
        boxShadow: '0 1px 0 rgba(147,197,253,0.20), 0 4px 16px rgba(26,86,219,0.04)',
      }}
    >
      {/* 실시간 지수 + 환율 티커 */}
      <TickerBar />

      {/* 페이지 제목 + 알림 */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          {/* 페이지 제목 — 그라데이션 */}
          <h1 className="text-lg font-bold" style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1A56DB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>{title}</h1>

          {lastUpdated && (
            <span className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
              {loading ? (
                <span className="flex items-center gap-1" style={{ color: '#0EA5E9' }}>
                  <span className="animate-pulse">●</span> 업데이트 중
                </span>
              ) : (
                <>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#16A34A',
                    boxShadow: '0 0 4px rgba(22,163,74,0.70)',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  {lastUpdated.toLocaleTimeString('ko-KR')}
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 알림 버튼 — 블루 글로우 */}
          <button
            className="relative p-2 rounded-xl transition-all duration-200"
            style={{
              background: 'rgba(219,234,254,0.40)',
              border: '1px solid rgba(147,197,253,0.40)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 12px rgba(26,86,219,0.18)';
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.60)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.borderColor = 'rgba(147,197,253,0.40)';
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ color: '#1A56DB' }} fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E84040, #F87171)', boxShadow: '0 0 6px rgba(232,64,64,0.50)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
