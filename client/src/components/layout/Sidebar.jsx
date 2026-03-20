import { NavLink } from 'react-router-dom';
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
    <aside className={clsx(
      'hidden md:flex w-56 flex-shrink-0 flex-col h-full',
      'bg-white border-r border-border',
    )}>
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black tracking-tight">AI</span>
          </div>
          <div>
            <p className="text-base font-bold text-text-primary leading-none tracking-tight">
              AI<span className="text-primary">stock</span>
            </p>
            <p className="text-xs text-text-muted mt-0.5">주식 트래커</p>
          </div>
        </div>
      </div>

      {/* 메인 네비 */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface2 hover:text-text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 하단 영역 */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface2 hover:text-text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* 사용자 정보 */}
        <div className="mt-2 px-3 py-3 bg-surface2 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {user?.name?.[0] ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate leading-none">{user?.name}</p>
              <p className="text-xs text-text-muted truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-text-muted hover:text-red-500 transition-colors font-medium"
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
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      {active
        ? <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
      }
    </svg>
  );
}
function PortfolioIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function WatchlistIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function CalcIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <rect x="4" y="2" width="16" height="20" rx="2" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h3M8 15h3M15 11l2 2m0 0l2-2m-2 2v-4" />
    </svg>
  );
}
function TrendIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function SettingsIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
