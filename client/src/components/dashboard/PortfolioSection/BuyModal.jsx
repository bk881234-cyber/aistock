import { useState, useRef, useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { searchStock, getStockDetail } from '@/api/marketApi';

const MARKETS = ['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ'];

export default function BuyModal({ onClose }) {
  const buy = usePortfolioStore((s) => s.buy);
  const [form, setForm] = useState({
    stock_symbol: '', stock_name: '', market: 'KOSPI',
    quantity: '1', price_per_share: '',
  });
  const [loading,   setLoading]   = useState(false);
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const debounceRef = useRef(null);

  // 검색어 변경 시 자동완성
  useEffect(() => {
    if (!query.trim()) { setResults([]); setShowDrop(false); return; }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchStock(query);
        setResults(data ?? []);
        setShowDrop(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  const selectStock = async (item) => {
    setForm((f) => ({
      ...f,
      stock_symbol: item.symbol,
      stock_name:   item.name,
      market:       item.market,
      quantity:     '1',
      price_per_share: '',
    }));
    setQuery(item.name);
    setShowDrop(false);
    setResults([]);

    // 현재가 자동 조회
    setFetchingPrice(true);
    try {
      const detail = await getStockDetail(item.symbol, item.market);
      if (detail?.currentPrice) {
        setForm((f) => ({ ...f, price_per_share: String(Math.round(detail.currentPrice)) }));
      }
    } catch { /* 현재가 못가져와도 무시 */ }
    finally { setFetchingPrice(false); }
  };

  const totalAmount = form.quantity && form.price_per_share
    ? (Number(form.quantity) * Number(form.price_per_share)).toLocaleString()
    : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await buy({
      stock_symbol:    form.stock_symbol.toUpperCase(),
      stock_name:      form.stock_name,
      market:          form.market,
      quantity:        Number(form.quantity),
      price_per_share: Number(form.price_per_share),
      fee:             0,
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Overlay onClose={onClose}>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-text-primary">거래 기록 추가</h2>
        <p className="text-sm text-text-muted mt-1">
          실제로 매수한 내역을 기록합니다. 평균 단가·수익률이 자동 계산됩니다.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* 종목 검색 자동완성 */}
        <div className="relative">
          <label className="block text-xs font-medium text-text-secondary mb-1">
            종목 검색
          </label>
          <div className="relative">
            <input
              className="input pr-8"
              placeholder="종목명 또는 코드 입력 (예: 삼성전자, AAPL)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {searching && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-text-muted animate-pulse">
                검색 중...
              </span>
            )}
          </div>

          {showDrop && results.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-cardHover max-h-52 overflow-y-auto">
              {results.map((item) => (
                <li
                  key={item.yahooSymbol}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-surface2 text-sm"
                  onMouseDown={() => selectStock(item)}
                >
                  <span className="text-[10px] font-bold text-white bg-primary rounded px-1.5 py-0.5 flex-shrink-0">
                    {item.market}
                  </span>
                  <span className="font-medium text-text-primary truncate">{item.name}</span>
                  <span className="text-text-muted text-[11px] ml-auto flex-shrink-0">{item.symbol}</span>
                </li>
              ))}
            </ul>
          )}
          {showDrop && results.length === 0 && !searching && (
            <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-cardHover px-3 py-2 text-xs text-text-muted">
              검색 결과가 없습니다. 아래에 직접 입력하세요.
            </div>
          )}
        </div>

        {/* 종목코드 / 종목명 */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="종목코드">
            <input
              className="input"
              placeholder="005930"
              value={form.stock_symbol}
              onChange={(e) => setForm({ ...form, stock_symbol: e.target.value })}
              required
            />
          </Field>
          <Field label="종목명">
            <input
              className="input"
              placeholder="삼성전자"
              value={form.stock_name}
              onChange={(e) => setForm({ ...form, stock_name: e.target.value })}
              required
            />
          </Field>
        </div>

        <Field label="시장">
          <select
            className="input"
            value={form.market}
            onChange={(e) => setForm({ ...form, market: e.target.value })}
          >
            {MARKETS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="수량 (주)">
            <input type="number" min="0" step="0.0001" className="input"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </Field>
          <Field label={fetchingPrice ? '매수가 (조회 중...)' : '매수가 (원/달러)'}>
            <input type="number" min="0" step="1" className="input"
              placeholder={fetchingPrice ? '...' : '0'}
              value={form.price_per_share}
              onChange={(e) => setForm({ ...form, price_per_share: e.target.value })}
              required
            />
          </Field>
        </div>

        <div className="bg-surface2 rounded-lg px-4 py-2 flex justify-between text-sm">
          <span className="text-text-muted">총 매수금액</span>
          <span className="font-bold text-text-primary">{totalAmount}원</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">취소</button>
          <button type="submit" disabled={loading || fetchingPrice} className="btn-primary flex-1">
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        {children}
      </div>
    </div>
  );
}
