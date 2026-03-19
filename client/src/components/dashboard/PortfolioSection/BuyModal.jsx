import { useState } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';

const MARKETS = ['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ'];

export default function BuyModal({ onClose }) {
  const buy = usePortfolioStore((s) => s.buy);
  const [form, setForm] = useState({
    stock_symbol: '', stock_name: '', market: 'KOSPI',
    quantity: '', price_per_share: '', fee: '',
  });
  const [loading, setLoading] = useState(false);

  const totalAmount = form.quantity && form.price_per_share
    ? (Number(form.quantity) * Number(form.price_per_share) + Number(form.fee || 0)).toLocaleString()
    : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await buy({
      stock_symbol:   form.stock_symbol.toUpperCase(),
      stock_name:     form.stock_name,
      market:         form.market,
      quantity:       Number(form.quantity),
      price_per_share:Number(form.price_per_share),
      fee:            Number(form.fee || 0),
    });
    setLoading(false);
    if (ok) onClose();
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <Overlay onClose={onClose}>
      <h2 className="text-base font-bold text-text-primary mb-5">📥 매수 입력</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="종목코드" placeholder="005930">
            <input className="input" {...f('stock_symbol')} required />
          </Field>
          <Field label="종목명" placeholder="삼성전자">
            <input className="input" {...f('stock_name')} required />
          </Field>
        </div>

        <Field label="시장">
          <select className="input" {...f('market')}>
            {MARKETS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="수량 (주)">
            <input type="number" min="0" step="0.0001" className="input" {...f('quantity')} required />
          </Field>
          <Field label="매수가 (원)">
            <input type="number" min="0" step="1" className="input" {...f('price_per_share')} required />
          </Field>
        </div>

        <Field label="수수료 (선택)">
          <input type="number" min="0" className="input" placeholder="0" {...f('fee')} />
        </Field>

        {/* 총 매수금액 미리보기 */}
        <div className="bg-surface2 rounded-lg px-4 py-2 flex justify-between text-sm">
          <span className="text-text-muted">총 매수금액</span>
          <span className="font-bold text-text-primary">{totalAmount}원</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? '처리 중...' : '매수 확인'}
          </button>
        </div>
      </form>
    </Overlay>
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
