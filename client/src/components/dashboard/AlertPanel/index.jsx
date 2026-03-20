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
          <h2 className="section-title mb-0">🔔 알림</h2>
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
