import { useState } from 'react';
import useAlerts from '@/hooks/useAlerts';
import { fmtDateTime } from '@/utils/formatters';
import clsx from 'clsx';
import api from '@/api/axiosInstance';
import toast from 'react-hot-toast';

export default function AlertPanel() {
  const { history, unreadCount, markAllRead, fetchAlerts } = useAlerts();
  const [adding, setAdding] = useState(false);
  const recent = history.slice(0, 6);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="section-title mb-0">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            알림
          </h2>
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-bear rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-text-muted hover:text-primary transition-colors">
              모두 읽음
            </button>
          )}
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-[11px] text-primary hover:text-primary-dark font-medium transition-colors"
          >
            {adding ? '닫기' : '+ 알림 추가'}
          </button>
        </div>
      </div>

      {/* 알림 추가 인라인 폼 */}
      {adding && (
        <AddAlertForm
          onSaved={() => { setAdding(false); fetchAlerts(); }}
          onCancel={() => setAdding(false)}
        />
      )}

      {recent.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-xs text-text-muted">발동된 알림이 없습니다</p>
          <p className="text-[11px] text-text-muted mt-1">
            위의 <span className="text-primary font-medium">+ 알림 추가</span>로 종목 알림을 설정하세요
          </p>
        </div>
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
              <span className="mt-0.5 flex-shrink-0">
                {h.is_read ? (
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                )}
              </span>
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

function AddAlertForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    stock_symbol: '',
    alert_type: 'price_target',
    condition: 'above',
    threshold: '',
  });
  const [saving, setSaving] = useState(false);

  const ALERT_TYPES = [
    { value: 'price_target', label: '목표가 도달' },
    { value: 'stop_loss',    label: '손절가 도달' },
    { value: 'volume_surge', label: '거래량 급증' },
    { value: 'weather_change', label: 'AI 날씨 변화' },
  ];

  const CONDITIONS = [
    { value: 'above', label: '이상' },
    { value: 'below', label: '이하' },
    { value: 'pct_change', label: '등락%' },
  ];

  const handleSubmit = async () => {
    if (!form.stock_symbol || !form.threshold) return;
    setSaving(true);
    try {
      await api.post('/alerts', {
        ...form,
        stock_symbol: form.stock_symbol.toUpperCase(),
        threshold: parseFloat(form.threshold),
      });
      toast.success('알림이 설정되었습니다.');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || '알림 설정 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-3 p-3 bg-surface2 rounded-lg space-y-2 border border-border">
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input text-xs"
          placeholder="종목코드 (예: 005930)"
          value={form.stock_symbol}
          onChange={(e) => setForm({ ...form, stock_symbol: e.target.value })}
        />
        <input
          className="input text-xs"
          type="number"
          placeholder="기준값 (가격 or %)"
          value={form.threshold}
          onChange={(e) => setForm({ ...form, threshold: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          className="input text-xs"
          value={form.alert_type}
          onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
        >
          {ALERT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className="input text-xs"
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost flex-1 text-xs py-1.5">취소</button>
        <button
          onClick={handleSubmit}
          disabled={saving || !form.stock_symbol || !form.threshold}
          className="btn-primary flex-1 text-xs py-1.5"
        >
          {saving ? '저장 중...' : '알림 저장'}
        </button>
      </div>
    </div>
  );
}
