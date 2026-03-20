import { useState } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { fmtKRW } from '@/utils/formatters';
import { calcTrailingStop } from '@/utils/tradingLogic';
import clsx from 'clsx';

/**
 * 종목별 매매 설정 모달
 * - 목표 매도가, 손절가, 트레일링 스탑 %
 */
export default function SettingsModal({ portfolio, onClose }) {
  const updateSettings = usePortfolioStore((s) => s.updateSettings);
  const [form, setForm] = useState({
    target_sell_price:  portfolio.target_sell_price  ?? '',
    stop_loss_price:    portfolio.stop_loss_price    ?? '',
    trailing_stop_pct:  portfolio.trailing_stop_pct  ?? '',
  });
  const [loading, setLoading] = useState(false);

  const avg     = parseFloat(portfolio.avg_buy_price);
  const current = parseFloat(portfolio.current_price) || avg;

  // 목표가 입력 시 예상 수익률 미리보기
  const targetRet = form.target_sell_price
    ? ((Number(form.target_sell_price) - avg) / avg * 100).toFixed(1)
    : null;

  // 손절가 입력 시 예상 손실률
  const stopRet = form.stop_loss_price
    ? ((Number(form.stop_loss_price) - avg) / avg * 100).toFixed(1)
    : null;

  // 트레일링 스탑 미리보기
  const trailing = form.trailing_stop_pct
    ? calcTrailingStop(current, avg, Number(form.trailing_stop_pct))
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      target_sell_price: form.target_sell_price ? Number(form.target_sell_price) : null,
      stop_loss_price:   form.stop_loss_price   ? Number(form.stop_loss_price)   : null,
      trailing_stop_pct: form.trailing_stop_pct ? Number(form.trailing_stop_pct) : null,
    };
    const ok = await updateSettings(portfolio.id, payload);
    setLoading(false);
    if (ok) onClose();
  };

  const f = (key, v) => setForm((p) => ({ ...p, [key]: v }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-text-primary">{portfolio.stock_name}</h2>
            <p className="text-sm text-text-muted">매매 기준 설정</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">평균 매수가</p>
            <p className="text-base font-bold font-mono text-text-primary">{fmtKRW(avg)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 목표 매도가 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              목표 매도가 <span className="text-text-muted font-normal">(익절 목표)</span>
            </label>
            <input
              type="number" min="0" step="1"
              className="input"
              placeholder={`현재가 ${fmtKRW(current)}`}
              value={form.target_sell_price}
              onChange={(e) => f('target_sell_price', e.target.value)}
            />
            {targetRet !== null && (
              <p className={clsx(
                'text-xs mt-1 font-semibold',
                Number(targetRet) >= 0 ? 'text-safe' : 'text-danger',
              )}>
                예상 수익률: {Number(targetRet) >= 0 ? '+' : ''}{targetRet}%
                {Number(targetRet) >= 0 && ' — 목표 도달 시 절반 매도 권장 알림'}
              </p>
            )}
          </div>

          {/* 손절가 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              손절가 <span className="text-text-muted font-normal">(Stop Loss)</span>
            </label>
            <input
              type="number" min="0" step="1"
              className="input"
              placeholder={`평균 -5% = ${fmtKRW(Math.round(avg * 0.95))}`}
              value={form.stop_loss_price}
              onChange={(e) => f('stop_loss_price', e.target.value)}
            />
            {stopRet !== null && (
              <p className={clsx(
                'text-xs mt-1 font-semibold',
                Number(stopRet) < 0 ? 'text-danger' : 'text-safe',
              )}>
                평균 대비 {Number(stopRet) >= 0 ? '+' : ''}{stopRet}%
              </p>
            )}
          </div>

          {/* 트레일링 스탑 */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">
              트레일링 스탑 <span className="text-text-muted font-normal">(고점 대비 하락 %)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="50" step="0.5"
                className="input"
                placeholder="예: 5 (고점 대비 -5% 시 손절)"
                value={form.trailing_stop_pct}
                onChange={(e) => f('trailing_stop_pct', e.target.value)}
              />
              <span className="text-text-muted text-sm flex-shrink-0">%</span>
            </div>
            {trailing && (
              <div className="mt-2 p-3 bg-surface2 rounded-xl border border-border text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">현재가 기준 스탑 가격</span>
                  <span className="font-bold text-danger">{fmtKRW(trailing.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">현재가와의 차이</span>
                  <span className="font-semibold text-text-secondary">-{fmtKRW(trailing.fromCurrent)}</span>
                </div>
                <p className="text-xs text-text-muted pt-1">
                  수익이 발생하면 고점을 자동 추적하여 손절선을 올립니다.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
