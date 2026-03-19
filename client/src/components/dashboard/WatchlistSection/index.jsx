import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as watchlistApi from '@/api/watchlistApi';
import WeatherWidget from '@/components/ai/WeatherWidget';
import { fmtKRW } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function WatchlistSection() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);

  const load = async () => {
    try {
      const data = await watchlistApi.getWatchlist();
      setItems(data);
    } catch { /* 무시 */ }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id, name) => {
    await watchlistApi.removeFromWatchlist(id);
    toast.success(`${name} 관심 종목 삭제`);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">⭐ 관심 종목</h2>
        <div className="flex gap-2">
          <Link to="/watchlist" className="btn-ghost text-xs">전체</Link>
          <button onClick={() => setAdding(true)} className="btn-ghost text-xs">+ 추가</button>
        </div>
      </div>

      {loading ? (
        <WatchlistSkeleton />
      ) : items.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-6">
          관심 종목을 추가해보세요
        </p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 8).map((item) => (
            <WatchlistRow key={item.id} item={item} onRemove={remove} />
          ))}
        </ul>
      )}

      {adding && (
        <AddWatchlistInline
          onAdd={async (payload) => {
            try {
              await watchlistApi.addToWatchlist(payload);
              toast.success(`${payload.stock_name} 추가됨`);
              await load();
              setAdding(false);
            } catch (err) {
              toast.error(err.response?.data?.message || '추가 실패');
            }
          }}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  );
}

function WatchlistRow({ item, onRemove }) {
  return (
    <li className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface2 group transition-colors">
      <Link to={`/stock/${item.stock_symbol}`} className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{item.stock_name}</p>
        <p className="text-[11px] text-text-muted">{item.stock_symbol} · {item.market}</p>
      </Link>

      <WeatherWidget symbol={item.stock_symbol} variant="inline" />

      {item.alert_price && (
        <span className="text-[10px] text-accent bg-accent-light px-1.5 py-0.5 rounded flex-shrink-0">
          목표 {fmtKRW(item.alert_price)}
        </span>
      )}

      <button
        onClick={() => onRemove(item.id, item.stock_name)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-bear text-xs px-1"
      >
        ✕
      </button>
    </li>
  );
}

function AddWatchlistInline({ onAdd, onCancel }) {
  const [form, setForm] = useState({ stock_symbol: '', stock_name: '', market: 'KOSPI' });

  return (
    <div className="mt-3 p-3 bg-surface2 rounded-lg space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          className="input text-xs" placeholder="종목코드"
          value={form.stock_symbol}
          onChange={(e) => setForm({ ...form, stock_symbol: e.target.value })}
        />
        <input
          className="input text-xs" placeholder="종목명"
          value={form.stock_name}
          onChange={(e) => setForm({ ...form, stock_name: e.target.value })}
        />
      </div>
      <select
        className="input text-xs"
        value={form.market}
        onChange={(e) => setForm({ ...form, market: e.target.value })}
      >
        {['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ'].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-ghost flex-1 text-xs">취소</button>
        <button
          onClick={() => onAdd({ ...form, stock_symbol: form.stock_symbol.toUpperCase() })}
          className="btn-primary flex-1 text-xs"
          disabled={!form.stock_symbol || !form.stock_name}
        >
          추가
        </button>
      </div>
    </div>
  );
}

function WatchlistSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 py-1.5">
          <div className="flex-1 space-y-1">
            <div className="h-3 w-20 bg-border rounded" />
            <div className="h-2.5 w-14 bg-border rounded" />
          </div>
          <div className="h-4 w-10 bg-border rounded" />
        </div>
      ))}
    </div>
  );
}
