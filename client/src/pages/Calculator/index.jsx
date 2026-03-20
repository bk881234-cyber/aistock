import { useState, useMemo } from 'react';
import { fmtKRW, fmtPct } from '@/utils/formatters';
import clsx from 'clsx';

/**
 * 물타기(평단가) 계산기
 * - 추가 매수 시 새 평균 단가 계산
 * - 손익분기점·목표가 수익률 분석
 */
export default function Calculator() {
  const [hold, setHold] = useState({ qty: '', price: '' });
  const [add,  setAdd]  = useState({ qty: '', price: '' });
  const [target, setTarget] = useState('');

  const result = useMemo(() => {
    const hQty   = Number(hold.qty)   || 0;
    const hPrice = Number(hold.price) || 0;
    const aQty   = Number(add.qty)    || 0;
    const aPrice = Number(add.price)  || 0;

    if (!hQty || !hPrice) return null;

    const totalQty  = hQty + aQty;
    const totalCost = hQty * hPrice + aQty * aPrice;
    const avgPrice  = totalQty > 0 ? totalCost / totalQty : 0;
    const priceDown = hPrice > 0 ? ((avgPrice - hPrice) / hPrice) * 100 : 0; // 평단 하락률

    const targetPrice = Number(target) || 0;
    const targetReturnPct = targetPrice && avgPrice
      ? ((targetPrice - avgPrice) / avgPrice) * 100
      : null;

    // 손익분기점 = 평단가 (수수료 0.015% 가정)
    const breakeven = avgPrice;

    return { totalQty, totalCost, avgPrice, priceDown, breakeven, targetReturnPct, targetPrice };
  }, [hold, add, target]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">물타기 계산기</h1>
        <p className="text-base text-text-muted mt-1">
          추가 매수 시 평균 단가를 미리 계산해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 현재 보유 */}
        <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5">
          <h2 className="text-base font-bold text-text-primary mb-4">현재 보유</h2>
          <div className="space-y-3">
            <InputField
              label="보유 수량 (주)"
              value={hold.qty}
              onChange={(v) => setHold((p) => ({ ...p, qty: v }))}
              placeholder="예: 100"
            />
            <InputField
              label="평균 매수가 (원)"
              value={hold.price}
              onChange={(v) => setHold((p) => ({ ...p, price: v }))}
              placeholder="예: 70,000"
            />
            {hold.qty && hold.price && (
              <div className="bg-black/5 rounded-xl p-3 text-sm">
                <Row label="총 투자금액" value={fmtKRW(Number(hold.qty) * Number(hold.price))} />
              </div>
            )}
          </div>
        </div>

        {/* 추가 매수 */}
        <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5">
          <h2 className="text-base font-bold text-text-primary mb-4">추가 매수 (물타기)</h2>
          <div className="space-y-3">
            <InputField
              label="추가 수량 (주)"
              value={add.qty}
              onChange={(v) => setAdd((p) => ({ ...p, qty: v }))}
              placeholder="예: 50"
            />
            <InputField
              label="추가 매수가 (원)"
              value={add.price}
              onChange={(v) => setAdd((p) => ({ ...p, price: v }))}
              placeholder="예: 60,000"
            />
            {add.qty && add.price && (
              <div className="bg-black/5 rounded-xl p-3 text-sm">
                <Row label="추가 투자금액" value={fmtKRW(Number(add.qty) * Number(add.price))} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 결과 카드 */}
      {result && (
        <div className="rounded-card border border-primary/30 bg-primary/5 backdrop-blur-xl p-5 animate-fade-in">
          <h2 className="text-base font-bold text-primary mb-4">계산 결과</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ResultCard
              label="새 평균 단가"
              value={fmtKRW(Math.round(result.avgPrice))}
              sub={result.priceDown < 0
                ? <span className="text-bear">{fmtPct(result.priceDown)} 하락</span>
                : <span className="text-text-muted">변화 없음</span>
              }
              highlight
            />
            <ResultCard
              label="총 보유 수량"
              value={`${result.totalQty.toLocaleString()}주`}
            />
            <ResultCard
              label="총 투자금액"
              value={fmtKRW(Math.round(result.totalCost))}
            />
          </div>

          {/* 기존 vs 새 평단 비교 */}
          {Number(hold.price) !== result.avgPrice && (
            <div className="mt-4 bg-white/50 rounded-xl p-4">
              <p className="text-sm font-semibold text-text-secondary mb-3">평균 단가 비교</p>
              <div className="space-y-2">
                <BarCompare
                  label="기존 평단"
                  value={Number(hold.price)}
                  maxVal={Number(hold.price)}
                  color="bg-neutral"
                />
                <BarCompare
                  label="새 평단"
                  value={result.avgPrice}
                  maxVal={Number(hold.price)}
                  color="bg-bull"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 목표가 수익률 */}
      {result && (
        <div className="rounded-card border border-white/60 bg-white/60 backdrop-blur-xl p-5">
          <h2 className="text-base font-bold text-text-primary mb-4">목표가 수익률 계산</h2>
          <InputField
            label="목표 주가 (원)"
            value={target}
            onChange={setTarget}
            placeholder="예: 80,000"
          />
          {result.targetReturnPct !== null && result.targetPrice > 0 && (
            <div className={clsx(
              'mt-3 p-4 rounded-xl border',
              result.targetReturnPct >= 0
                ? 'bg-bull/10 border-bull/20'
                : 'bg-bear/10 border-bear/20',
            )}>
              <p className="text-sm text-text-muted">
                {fmtKRW(result.targetPrice)} 도달 시 예상 수익률
              </p>
              <p className={clsx(
                'text-3xl font-bold font-mono mt-1',
                result.targetReturnPct >= 0 ? 'text-bull' : 'text-bear',
              )}>
                {fmtPct(result.targetReturnPct)}
              </p>
              <p className="text-sm text-text-muted mt-1">
                예상 평가금액 {fmtKRW(Math.round(result.totalQty * result.targetPrice))}
                {' '}/ 손익 {fmtKRW(Math.round(result.totalQty * result.targetPrice - result.totalCost), true)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 안내 */}
      <div className="rounded-card border border-white/40 bg-white/30 backdrop-blur-xl p-4 text-sm text-text-muted">
        <p className="font-semibold text-text-secondary mb-1">주의사항</p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>수수료·세금은 포함되지 않은 단순 계산값입니다</li>
          <li>물타기는 손실을 확대할 수 있습니다 — 충분한 검토 후 결정하세요</li>
          <li>AI 날씨가 ☀️ 이상일 때만 추가 매수를 권장합니다</li>
        </ul>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-secondary mb-1">{label}</label>
      <input
        type="number"
        min="0"
        step="any"
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ResultCard({ label, value, sub, highlight }) {
  return (
    <div className={clsx(
      'rounded-xl p-4 border',
      highlight ? 'bg-white border-primary/20' : 'bg-white/50 border-white/50',
    )}>
      <p className="text-sm text-text-muted">{label}</p>
      <p className={clsx('text-xl font-bold font-mono mt-1', highlight ? 'text-primary' : 'text-text-primary')}>
        {value}
      </p>
      {sub && <div className="text-sm mt-0.5">{sub}</div>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function BarCompare({ label, value, maxVal, color }) {
  const pct = maxVal > 0 ? Math.min(100, (value / maxVal) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text-muted w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-mono font-semibold text-text-primary w-28 text-right flex-shrink-0">
        {fmtKRW(Math.round(value))}
      </span>
    </div>
  );
}
