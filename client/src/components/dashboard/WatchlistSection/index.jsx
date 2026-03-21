import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as watchlistApi from '@/api/watchlistApi';
import { searchStock } from '@/api/marketApi';
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
      <div className="mb-3">
        <h2 className="section-title mb-2">⭐ 관심 종목</h2>
        <div className="flex gap-2">
          <Link to="/watchlist" className="btn-ghost text-xs">전체</Link>
          <button onClick={() => setAdding((v) => !v)} className="btn-ghost text-xs">
            {adding ? '닫기' : '+ 추가'}
          </button>
        </div>
      </div>

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

      {loading ? (
        <WatchlistSkeleton />
      ) : items.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-2xl mb-2">⭐</p>
          <p className="text-xs font-medium text-text-secondary">관심 종목이 없습니다</p>
          <p className="text-[11px] text-text-muted mt-1">
            위 <span className="text-primary font-medium">+ 추가</span>로 종목명을 검색하세요
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 8).map((item) => (
            <WatchlistRow key={item.id} item={item} onRemove={remove} />
          ))}
        </ul>
      )}
    </div>
  );
}

function WatchlistRow({ item, onRemove }) {
  return (
    <li className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface2 group transition-colors">
      <Link to={`/stock/${item.stock_symbol}`} state={{ market: item.market, stockName: item.stock_name }} className="flex-1 min-w-0">
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
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-text-muted hover:text-bear text-xs px-1 flex-shrink-0"
      >
        ✕
      </button>
    </li>
  );
}

function AddWatchlistInline({ onAdd, onCancel }) {
  const [form,     setForm]     = useState({ stock_symbol: '', stock_name: '', market: 'KOSPI' });
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchStock(query);
        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  const select = (item) => {
    setForm({ stock_symbol: item.symbol, stock_name: item.name, market: item.market });
    setQuery(item.name);
    setResults([]);
  };

  return (
    <div className="mb-3 p-3 bg-surface2 rounded-lg space-y-2 border border-border">
      {/* 종목 검색 */}
      <div className="relative">
        <div className="relative">
          <input
            className="input text-xs pr-8"
            placeholder="종목명 검색 (예: 삼성전자, AAPL)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {searching && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted animate-pulse">●</span>
          )}
        </div>
        {query.trim() && !searching && (
          <div className="absolute z-20 w-full mt-1 bg-surface border border-border rounded-lg shadow-cardHover overflow-hidden">
            {results.length > 0 ? (
              <ul className="max-h-44 overflow-y-auto">
                {results.map((item) => (
                  <li
                    key={item.yahooSymbol}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface2 text-xs"
                    onMouseDown={() => select(item)}
                  >
                    <span className="text-[9px] font-bold text-white bg-primary rounded px-1 flex-shrink-0">{item.market}</span>
                    <span className="font-medium text-text-primary truncate">{item.name}</span>
                    <span className="text-text-muted ml-auto flex-shrink-0">{item.symbol}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-xs text-text-muted">
                검색 결과 없음 — 영문 티커나 종목코드로 직접 입력하세요
              </p>
            )}
          </div>
        )}
      </div>

      {/* 수동 입력 */}
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
        {['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ'].map((m) => <option key={m}>{m}</option>)}
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
