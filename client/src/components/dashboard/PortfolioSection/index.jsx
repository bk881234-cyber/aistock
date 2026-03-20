import { useState } from 'react';
import { Link } from 'react-router-dom';
import usePortfolio from '@/hooks/usePortfolio';
import { fmtKRW, fmtPct, fmtCompact, directionClass } from '@/utils/formatters';
import { SIGNAL_META } from '@/utils/tradingLogic';
import WeatherWidget from '@/components/ai/WeatherWidget';
import TrafficLight from '@/components/portfolio/TrafficLight';
import BuyModal from './BuyModal';
import SellModal from './SellModal';
import clsx from 'clsx';

export default function PortfolioSection() {
  const {
    enrichedPortfolios,
    totalCost, totalCurrentValue, totalGain, totalReturnPct,
    loading,
  } = usePortfolio();

  const [buyOpen,    setBuyOpen]    = useState(false);
  const [sellTarget, setSellTarget] = useState(null);

  return (
    <div className="card">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text-primary mb-0">내 포트폴리오</h2>
          {!loading && (
            <p className="text-xs text-text-muted mt-0.5 truncate">
              평가액 <span className="font-semibold text-text-primary">{fmtKRW(totalCurrentValue)}</span>
              {' '}·{' '}
              <span className={clsx('font-semibold', totalGain >= 0 ? 'text-bull' : 'text-bear')}>
                {fmtKRW(totalGain, true)} ({fmtPct(totalReturnPct)})
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/portfolio" className="btn-ghost text-xs py-1.5 px-3">전체 보기</Link>
          <button onClick={() => setBuyOpen(true)} className="btn-primary text-xs py-1.5">
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
                <th className="hidden sm:table-cell text-right py-2 font-medium">평가손익</th>
                <th className="hidden md:table-cell text-center py-2 font-medium">날씨</th>
                <th className="hidden md:table-cell text-center py-2 font-medium">신호등</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {enrichedPortfolios.slice(0, 6).map((p) => (
                <DashboardPortfolioRow
                  key={p.id}
                  portfolio={p}
                  onSell={() => setSellTarget(p)}
                />
              ))}
            </tbody>
          </table>
          {enrichedPortfolios.length > 6 && (
            <p className="text-center text-xs text-text-muted py-2">
              + {enrichedPortfolios.length - 6}개 더 보기 →{' '}
              <Link to="/portfolio" className="text-primary font-medium hover:underline">전체 포트폴리오</Link>
            </p>
          )}
        </div>
      )}

      {buyOpen    && <BuyModal  onClose={() => setBuyOpen(false)} />}
      {sellTarget && <SellModal portfolio={sellTarget} onClose={() => setSellTarget(null)} />}
    </div>
  );
}

function DashboardPortfolioRow({ portfolio, onSell }) {
  const {
    stock_name, stock_symbol, market,
    current_price, return_pct, unrealized_gain,
    avg_buy_price, quantity,
    signalLevel,
  } = portfolio;

  const isUp   = return_pct > 0;
  const isDown = return_pct < 0;

  return (
    <tr className="hover:bg-surface2 transition-colors group">
      {/* 종목명 */}
      <td className="py-2.5 pr-4">
        <Link to={`/stock/${stock_symbol}`} state={{ market, stockName: stock_name }} className="hover:underline">
          <p className="font-semibold text-text-primary">{stock_name}</p>
          <p className="text-[11px] text-text-muted">{stock_symbol} · {market}</p>
        </Link>
      </td>

      {/* 현재가 */}
      <td className="py-2.5 text-right font-mono">
        <p className="font-semibold text-text-primary tabular-nums">{fmtKRW(current_price)}</p>
        <p className="text-[11px] text-text-muted">평균 {fmtKRW(avg_buy_price)}</p>
      </td>

      {/* 수익률 */}
      <td className={clsx('py-2.5 text-right font-semibold font-mono tabular-nums', directionClass(return_pct))}>
        {isUp ? '▲' : isDown ? '▼' : '—'}{fmtPct(return_pct)}
      </td>

      {/* 평가손익 */}
      <td className={clsx('hidden sm:table-cell py-2.5 text-right font-mono text-sm', directionClass(unrealized_gain))}>
        <p className="font-semibold tabular-nums">{fmtKRW(unrealized_gain, true)}</p>
        <p className="text-[11px] text-text-muted">{fmtCompact(quantity)}주</p>
      </td>

      {/* AI 날씨 */}
      <td className="hidden md:table-cell py-2.5 text-center">
        <WeatherWidget symbol={stock_symbol} variant="inline" />
      </td>

      {/* 신호등 */}
      <td className="hidden md:table-cell py-2.5 text-center">
        <TrafficLight level={signalLevel} size="sm" />
      </td>

      {/* 매도 */}
      <td className="py-2.5 text-right">
        <button
          onClick={onSell}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[11px] text-danger hover:bg-danger/8 px-2 py-1 rounded font-semibold"
        >
          매도
        </button>
      </td>
    </tr>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 py-2.5 border-b border-border/50">
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-24 bg-surface3 rounded" />
            <div className="h-3 w-16 bg-surface3 rounded" />
          </div>
          <div className="h-4 w-20 bg-surface3 rounded self-center" />
          <div className="h-4 w-14 bg-surface3 rounded self-center" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm font-medium text-text-secondary">보유 종목이 없습니다</p>
      <p className="text-xs text-text-muted mt-1 mb-4">매수 버튼을 눌러 첫 종목을 추가해보세요</p>
      <button onClick={onAdd} className="btn-primary text-xs py-2">+ 거래 기록</button>
    </div>
  );
}
