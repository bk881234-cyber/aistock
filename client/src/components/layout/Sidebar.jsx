import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',            label: '대시보드',    icon: '▣' },
  { to: '/portfolio',   label: '포트폴리오',  icon: '◈' },
  { to: '/watchlist',   label: '관심 종목',  icon: '◎' },
  { to: '/calculator',  label: '물타기 계산', icon: '≈' },
  { to: '/curation',    label: '트렌드',      icon: '◉' },
];

const BOTTOM_ITEMS = [
  { to: '/settings', label: '설정', icon: '◐' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className={clsx(
      'hidden md:flex w-56 flex-shrink-0 flex-col h-full',
      'bg-white/50 backdrop-blur-xl border-r border-white/60',
      'shadow-[1px_0_16px_rgba(31,38,135,0.06)]',
    )}>
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-white/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white text-xs font-black">AI</span>
          </div>
          <div>
            <span className="text-base font-bold text-primary tracking-tight">
              AI<span className="text-text-primary">stock</span>
            </span>
            <p className="text-xs text-text-muted">주식 트래커</p>
          </div>
        </div>
      </div>

      {/* 메인 네비 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-base font-semibold transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                  : 'text-text-secondary hover:bg-white/60 hover:text-text-primary border border-transparent',
              )
            }
          >
            <span className="text-base w-5 text-center leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 하단 영역 */}
      <div className="px-3 py-4 border-t border-white/40 space-y-1">
        {BOTTOM_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-base font-semibold transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:bg-white/60 hover:text-text-primary border border-transparent',
              )
            }
          >
            <span className="text-base w-5 text-center leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}

        {/* 사용자 정보 */}
        <div className="mt-3 px-3 py-3 bg-white/50 rounded-xl border border-white/60">
          <p className="text-sm font-bold text-text-primary truncate">{user?.name}</p>
          <p className="text-xs text-text-muted truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs text-text-muted hover:text-bear transition-colors font-medium"
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
