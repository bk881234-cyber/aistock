import useAlerts from '@/hooks/useAlerts';
import { fmtDateTime } from '@/utils/formatters';
import clsx from 'clsx';

export default function AlertPanel() {
  const { history, unreadCount, markAllRead } = useAlerts();
  const recent = history.slice(0, 6);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="section-title mb-0">🔔 알림</h2>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-bear rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[11px] text-text-muted hover:text-primary transition-colors">
            모두 읽음
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">발동된 알림이 없습니다</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((h) => (
            <li
              key={h.id}
              className={clsx(
                'flex gap-2 p-2 rounded-lg text-xs',
                h.is_read ? 'bg-surface' : 'bg-primary-light border border-primary/20'
              )}
            >
              <span className="mt-0.5">{h.is_read ? '📩' : '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium leading-snug truncate">
                  {h.message}
                </p>
                <p className="text-text-muted mt-0.5">{fmtDateTime(h.triggered_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
