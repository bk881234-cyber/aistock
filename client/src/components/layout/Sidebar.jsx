import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',          icon: '📊', label: '대시보드'    },
  { to: '/portfolio', icon: '💼', label: '포트폴리오'  },
  { to: '/watchlist', icon: '⭐', label: '관심 종목'   },
  { to: '/curation',  icon: '🔥', label: '트렌드'      },
];

const BOTTOM_ITEMS = [
  { to: '/settings', icon: '⚙️', label: '설정' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col h-full">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-border">
        <span className="text-lg font-bold text-primary tracking-tight">
          AI<span className="text-text-primary">stock</span>
        </span>
        <p className="text-[11px] text-text-muted mt-0.5">AI 주식 트래커</p>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
              )
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 하단 영역 */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {BOTTOM_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
              )
            }
          >
            <span className="text-base leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}

        {/* 사용자 정보 + 로그아웃 */}
        <div className="mt-3 px-3 py-3 bg-surface2 rounded-lg">
          <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
          <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 text-[11px] text-text-muted hover:text-bear transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
