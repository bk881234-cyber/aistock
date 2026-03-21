import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',           label: '대시보드',    icon: DashboardIcon },
  { to: '/portfolio',  label: '포트폴리오',  icon: PortfolioIcon },
  { to: '/watchlist',  label: '관심 종목',  icon: WatchlistIcon },
  { to: '/calculator', label: '물타기 계산', icon: CalcIcon      },
  { to: '/curation',   label: '트렌드',      icon: TrendIcon     },
];

const BOTTOM_ITEMS = [
  { to: '/settings', label: '설정', icon: SettingsIcon },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="hidden md:flex w-56 flex-shrink-0 flex-col h-full relative z-20"
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E3A5F 55%, #1A3A6B 100%)',
        borderRight: '1px solid rgba(147,197,253,0.15)',
        boxShadow: '4px 0 24px rgba(26,86,219,0.12)',
      }}
    >
      {/* 사이드바 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: 'absolute', bottom: '20%', left: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }} />
      </div>

      {/* ── 로고 ── */}
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(147,197,253,0.12)' }}>
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          {/* 로고 아이콘 — 블루 글로우 */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #1A56DB, #0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(14,165,233,0.50), 0 0 32px rgba(26,86,219,0.25)',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: '900', letterSpacing: '-0.5px' }}>AI</span>
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '800', color: '#E2E8F0', lineHeight: 1, letterSpacing: '-0.3px' }}>
              AI<span style={{ background: 'linear-gradient(135deg, #60A5FA, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>stock</span>
            </p>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>주식 트래커</p>
          </div>
        </Link>
      </div>

      {/* ── 메인 네비 ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                isActive
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white',
              )
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(26,86,219,0.40), rgba(14,165,233,0.20))',
              border: '1px solid rgba(96,165,250,0.30)',
              boxShadow: '0 0 12px rgba(26,86,219,0.20), inset 0 1px 0 rgba(255,255,255,0.08)',
            } : {
              border: '1px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                {/* 활성 왼쪽 바 */}
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '60%', borderRadius: '0 2px 2px 0',
                    background: 'linear-gradient(180deg, #60A5FA, #0EA5E9)',
                    boxShadow: '0 0 8px rgba(14,165,233,0.70)',
                  }} />
                )}
                <Icon active={isActive} />
                <span style={{ fontSize: '14px' }}>{label}</span>

                {/* 호버 글로우 */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: 'rgba(96,165,250,0.06)' }} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── 하단 영역 ── */}
      <div className="px-3 py-3 flex-shrink-0 space-y-1" style={{ borderTop: '1px solid rgba(147,197,253,0.10)' }}>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200',
              )
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(26,86,219,0.35), rgba(14,165,233,0.18))',
              border: '1px solid rgba(96,165,250,0.25)',
            } : { border: '1px solid transparent' }}
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span style={{ fontSize: '14px' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* 사용자 정보 */}
        <div className="mt-2 px-3 py-3 rounded-xl" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(147,197,253,0.12)',
        }}>
          <div className="flex items-center gap-2 mb-2">
            {/* 아바타 글로우 */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #1A56DB, #0EA5E9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(14,165,233,0.40)',
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>
                {user?.name?.[0] ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-none" style={{ color: '#E2E8F0' }}>{user?.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: '#94A3B8' }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs font-medium transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={(e) => e.target.style.color = '#F87171'}
            onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── 아이콘 컴포넌트 ── */
function DashboardIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} style={{ color: active ? '#60A5FA' : 'currentColor' }}>
      {active
        ? <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
      }
    </svg>
  );
}
function PortfolioIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? '#60A5FA' : 'currentColor' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function WatchlistIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} style={{ color: active ? '#60A5FA' : 'currentColor' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function CalcIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? '#60A5FA' : 'currentColor' }}>
      <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h3M8 15h3M15 11l2 2m0 0l2-2m-2 2v-4" />
    </svg>
  );
}
function TrendIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? '#60A5FA' : 'currentColor' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? '#60A5FA' : 'currentColor' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
