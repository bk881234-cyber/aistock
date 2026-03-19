import { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { getSellGuide } from '@/api/aiApi';
import { fmtKRW, fmtPct } from '@/utils/formatters';
import clsx from 'clsx';

export default function SellModal({ portfolio, onClose }) {
  const sell = usePortfolioStore((s) => s.sell);
  const [form, setForm] = useState({ quantity: '', price_per_share: '', fee: '' });
  const [guide, setGuide] = useState(null);
  const [tab, setTab]     = useState('sell');  // 'sell' | 'guide'
  const [loading, setLoading] = useState(false);

  const maxQty = parseFloat(portfolio.quantity);

  // 분할 매도 가이드 조회
  useEffect(() => {
    getSellGuide(portfolio.id)
      .then(setGuide)
      .catch(() => {});
  }, [portfolio.id]);

  const gain = form.quantity && form.price_per_share
    ? ((Number(form.price_per_share) - portfolio.avg_buy_price) * Number(form.quantity)).toFixed(0)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.quantity) > maxQty) return;
    setLoading(true);
    const ok = await sell({
      portfolio_id:    portfolio.id,
      quantity:        Number(form.quantity),
      price_per_share: Number(form.price_per_share),
      fee:             Number(form.fee || 0),
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-text-primary">
          📤 {portfolio.stock_name} 매도
        </h2>
        <div className="flex gap-1 bg-surface2 rounded-lg p-0.5 text-xs">
          {['sell', 'guide'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3 py-1 rounded-md font-medium transition-colors',
                tab === t ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted'
              )}
            >
              {t === 'sell' ? '매도 입력' : '🤖 AI 가이드'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'sell' ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 보유 정보 */}
          <div className="bg-surface2 rounded-lg px-4 py-3 grid grid-cols-3 gap-2 text-sm">
            <InfoItem label="평균 매수가" value={fmtKRW(portfolio.avg_buy_price)} />
            <InfoItem label="보유 수량"   value={`${maxQty}주`} />
            <InfoItem label="현재 수익률" value={fmtPct(portfolio.return_pct)} colored={portfolio.return_pct} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={`수량 (최대 ${maxQty}주)`}>
              <input
                type="number" min="0.0001" step="0.0001" max={maxQty}
                className="input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </Field>
            <Field label="매도가 (원)">
              <input
                type="number" min="0" step="1"
                className="input"
                value={form.price_per_share}
                onChange={(e) => setForm({ ...form, price_per_share: e.target.value })}
                required
              />
            </Field>
          </div>
          <Field label="수수료 (선택)">
            <input type="number" min="0" className="input" placeholder="0"
              value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          </Field>

          {/* 예상 손익 */}
          {gain !== null && (
            <div className={clsx(
              'rounded-lg px-4 py-2 flex justify-between text-sm',
              Number(gain) >= 0 ? 'bg-bull-light' : 'bg-bear-light'
            )}>
              <span className="text-text-muted">예상 실현 손익</span>
              <span className={clsx('font-bold', Number(gain) >= 0 ? 'text-bull' : 'text-bear')}>
                {fmtKRW(Number(gain), true)}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
            <button type="submit" disabled={loading} className="btn-danger flex-1">
              {loading ? '처리 중...' : '매도 확인'}
            </button>
          </div>
        </form>
      ) : (
        <SellGuidePanel guide={guide} />
      )}
    </Overlay>
  );
}

function SellGuidePanel({ guide }) {
  if (!guide) return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-3 text-sm max-h-80 overflow-y-auto pr-1">
      {/* 분할 매도 플랜 */}
      {guide.split_sell_plan?.length > 0 && (
        <div>
          <p className="font-semibold text-text-primary mb-2">📊 분할 매도 플랜</p>
          {guide.split_sell_plan.map((step) => (
            <div key={step.step} className="flex gap-3 items-start mb-2 last:mb-0">
              <span className="w-6 h-6 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step.step}
              </span>
              <div>
                <p className="font-medium text-text-primary">{step.trigger_desc}</p>
                <p className="text-text-muted text-xs">{step.reason}</p>
                <p className="text-xs text-primary mt-0.5">→ {step.sell_qty}주 ({step.sell_pct}%) 매도</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 손절가 */}
      {guide.stop_loss && (
        <div className="bg-bear-light rounded-lg p-3">
          <p className="font-semibold text-bear mb-1">🛑 손절 가이드</p>
          <p className="text-text-secondary text-xs">{guide.stop_loss.description}</p>
          <p className="text-xs text-text-muted mt-1">
            손절 시 예상 손실: {fmtKRW(Number(guide.stop_loss.loss_if_triggered))}
          </p>
        </div>
      )}

      {/* 멘탈 케어 팁 */}
      <div className="bg-primary-light rounded-lg p-3 space-y-1">
        <p className="font-semibold text-primary text-xs mb-1.5">💡 멘탈 케어 팁</p>
        {guide.mental_tips?.map((tip, i) => (
          <p key={i} className="text-xs text-text-secondary">· {tip}</p>
        ))}
      </div>
    </div>
  );
}

function InfoItem({ label, value, colored }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className={clsx('font-semibold text-sm mt-0.5',
        colored !== undefined
          ? colored >= 0 ? 'text-bull' : 'text-bear'
          : 'text-text-primary'
      )}>{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      {children}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        {children}
      </div>
    </div>
  );
}
