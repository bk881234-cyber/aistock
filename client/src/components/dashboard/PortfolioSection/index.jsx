import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePortfolio from '@/hooks/usePortfolio';
import { fmtKRW, fmtPct, fmtCompact, directionClass } from '@/utils/formatters';
import WeatherWidget from '@/components/ai/WeatherWidget';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import clsx from 'clsx';

export default function PortfolioSection() {
  const {
    enrichedPortfolios,
    totalCost,
    totalCurrentValue,
    totalReturnPct,
    loading,
  } = usePortfolio();

  const [buyOpen,  setBuyOpen]  = useState(false);
  const [sellTarget, setSellTarget] = useState(null);

  const totalGain = totalCurrentValue - totalCost;

  return (
    <div className="card">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-title mb-0">💼 내 포트폴리오</h2>
          {!loading && (
            <p className="text-[12px] text-text-muted mt-0.5">
              평가액 <span className="font-semibold text-text-primary">{fmtKRW(totalCurrentValue)}</span>
              {' '}·{' '}
              <span className={clsx('font-semibold', directionClass(totalGain))}>
                {fmtKRW(totalGain, true)} ({fmtPct(totalReturnPct)})
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/portfolio" className="btn-ghost text-xs">전체 보기</Link>
          <button onClick={() => setBuyOpen(true)} className="btn-primary text-xs">
            + 거래 기록
          </button>
        </div>
      </div>

      {/* 종목 리스트 */}
      {loading ? (
        <PortfolioSkeleton />
      ) : enrichedPortfolios.length === 0 ? (
        <EmptyState onAdd={() => setBuyOpen(true)} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] text-text-muted uppercase tracking-wide">
                <th className="text-left py-2 font-medium">종목</th>
                <th className="text-right py-2 font-medium">현재가</th>
                <th className="text-right py-2 font-medium">수익률</th>
                <th className="text-right py-2 font-medium">평가손익</th>
                <th className="text-center py-2 font-medium">AI 날씨</th>
                <th className="text-center py-2 font-medium">신호</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {enrichedPortfolios.map((p) => (
                <PortfolioRow
                  key={p.id}
                  portfolio={p}
                  onSell={() => setSellTarget(p)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 모달 */}
      {buyOpen  && <BuyModal  onClose={() => setBuyOpen(false)} />}
      {sellTarget && <SellModal portfolio={sellTarget} onClose={() => setSellTarget(null)} />}
    </div>
  );
}

function PortfolioRow({ portfolio, onSell }) {
  const {
    stock_name, stock_symbol, market,
    current_price, return_pct, unrealized_gain,
    avg_buy_price, quantity,
  } = portfolio;

  const isUp   = return_pct > 0;
  const isDown = return_pct < 0;

  return (
    <tr className="hover:bg-surface2 transition-colors group">
      {/* 종목명 */}
      <td className="py-3 pr-4">
        <Link to={`/stock/${stock_symbol}`} className="hover:underline">
          <p className="font-semibold text-text-primary">{stock_name}</p>
          <p className="text-[11px] text-text-muted">{stock_symbol} · {market}</p>
        </Link>
      </td>

      {/* 현재가 */}
      <td className="py-3 text-right font-mono">
        <p className="font-semibold text-text-primary">{fmtKRW(current_price)}</p>
        <p className="text-[11px] text-text-muted">평균 {fmtKRW(avg_buy_price)}</p>
      </td>

      {/* 수익률 */}
      <td className={clsx('py-3 text-right font-semibold font-mono', directionClass(return_pct))}>
        {isUp && '▲'}{isDown && '▼'}
        {fmtPct(return_pct)}
      </td>

      {/* 평가손익 */}
      <td className={clsx('py-3 text-right font-mono text-sm', directionClass(unrealized_gain))}>
        <p className="font-semibold">{fmtKRW(unrealized_gain, true)}</p>
        <p className="text-[11px] text-text-muted">{fmtCompact(quantity)}주</p>
      </td>

      {/* AI 날씨 */}
      <td className="py-3 text-center">
        <WeatherWidget symbol={stock_symbol} variant="inline" />
      </td>

      {/* AI 신호등 */}
      <td className="py-3 text-center">
        <SignalBadge returnPct={return_pct} />
      </td>

      {/* 액션 */}
      <td className="py-3 text-right">
        <button
          onClick={onSell}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-text-muted hover:text-bear px-2 py-1 rounded"
        >
          매도
        </button>
      </td>
    </tr>
  );
}

/**
 * 수익률 기반 간이 신호 (날씨 점수 없을 때 폴백)
 */
function SignalBadge({ returnPct }) {
  if (returnPct >= 10)       return <span className="badge-bull">강한 익절</span>;
  if (returnPct >= 3)        return <span className="badge-bull">익절 검토</span>;
  if (returnPct >= -3)       return <span className="badge-flat">보유</span>;
  if (returnPct >= -10)      return <span className="badge-bear">손절 검토</span>;
  return                            <span className="badge-bear">손절 필요</span>;
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border/50">
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-24 bg-border rounded" />
            <div className="h-3 w-16 bg-border rounded" />
          </div>
          <div className="h-4 w-20 bg-border rounded self-center" />
          <div className="h-4 w-16 bg-border rounded self-center" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-3">📭</span>
      <p className="text-sm font-medium text-text-secondary">보유 종목이 없습니다</p>
      <p className="text-xs text-text-muted mt-1 mb-4">매수 버튼을 눌러 첫 종목을 추가해보세요</p>
      <button onClick={onAdd} className="btn-primary text-xs">+ 거래 기록</button>
    </div>
  );
}
