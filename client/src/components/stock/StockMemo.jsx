import { useState, useEffect } from 'react';

const MAX_ROWS = 10;
const STORAGE_KEY = (symbol) => `stockmemo:${symbol}`;

export default function StockMemo({ symbol }) {
  const [rows, setRows]   = useState([]);
  const [form, setForm]   = useState({ date: '', amount: '', memo: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY(symbol));
      if (saved) setRows(JSON.parse(saved));
    } catch { /* 무시 */ }
  }, [symbol]);

  const save = (next) => {
    setRows(next);
    localStorage.setItem(STORAGE_KEY(symbol), JSON.stringify(next));
  };

  const handleAdd = () => {
    if (!form.date && !form.amount && !form.memo) return;
    const next = [...rows, { id: Date.now(), ...form }];
    save(next.slice(-MAX_ROWS));
    setForm({ date: '', amount: '', memo: '' });
    setAdding(false);
  };

  const handleDelete = (id) => save(rows.filter((r) => r.id !== id));

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="card">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-text-primary text-sm">📝 메모</h3>
        {rows.length < MAX_ROWS && (
          <button
            onClick={() => setAdding((v) => !v)}
            className="text-[11px] text-primary hover:text-primary-dark font-medium transition-colors"
          >
            {adding ? '닫기' : '+ 추가'}
          </button>
        )}
      </div>

      {/* 입력 폼 */}
      {adding && (
        <div className="mb-3 p-3 bg-surface2 rounded-lg border border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-text-muted mb-1">날짜</label>
              <input type="date" className="input text-xs" {...f('date')} />
            </div>
            <div>
              <label className="block text-[10px] text-text-muted mb-1">금액</label>
              <input type="text" className="input text-xs" placeholder="예: 1,500,000" {...f('amount')} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-text-muted mb-1">메모</label>
            <input type="text" className="input text-xs" placeholder="내용을 입력하세요" {...f('memo')} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="btn-ghost flex-1 text-xs py-1.5">취소</button>
            <button onClick={handleAdd} className="btn-primary flex-1 text-xs py-1.5">저장</button>
          </div>
        </div>
      )}

      {/* 리스트 */}
      {rows.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">
          메모가 없습니다. + 추가로 기록해보세요
        </p>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
          {/* 헤더 행 */}
          <div className="grid grid-cols-[90px_1fr_1fr_24px] gap-2 px-2 pb-1 border-b border-border">
            <span className="text-[10px] text-text-muted font-medium">날짜</span>
            <span className="text-[10px] text-text-muted font-medium">금액</span>
            <span className="text-[10px] text-text-muted font-medium">메모</span>
            <span />
          </div>
          <ul className="divide-y divide-border/40">
            {rows.map((row) => (
              <li key={row.id} className="grid grid-cols-[90px_1fr_1fr_24px] gap-2 items-center px-2 py-2 group hover:bg-surface2 rounded">
                <span className="text-xs text-text-muted tabular-nums">{row.date || '—'}</span>
                <span className="text-xs text-text-primary truncate">{row.amount || '—'}</span>
                <span className="text-xs text-text-secondary truncate">{row.memo || '—'}</span>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-[11px] text-text-muted hover:text-bear opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {rows.length >= MAX_ROWS && (
            <p className="text-[10px] text-text-muted text-center pt-2">최대 10개까지 저장 가능합니다</p>
          )}
        </div>
      )}
    </div>
  );
}
