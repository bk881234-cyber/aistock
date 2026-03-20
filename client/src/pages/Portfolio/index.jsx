import { useState } from 'react';
import usePortfolio from '@/hooks/usePortfolio';
import { fmtKRW, fmtPct, directionClass } from '@/utils/formatters';
import PortfolioRow from '@/components/portfolio/PortfolioRow';
import BuyModal from '@/components/dashboard/PortfolioSection/BuyModal';
import clsx from 'clsx';

/**
 * 포트폴리오 전체 페이지 (Step 3)
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  요약 카드 (총 평가액 / 총 손익 / 투자원금 / 수익률)      │
 * ├──────────────────────────────────────────────────────────┤
 * │  종목 리스트 테이블                                       │
 * │  ┌──────────────────────────────────────────────────┐   │
 * │  │ 신호등 │ 종목 │ 현재가 │ 수익률 │ 평가손익 │ 날씨 │ 신호 │ │
 * │  └──────────────────────────────────────────────────┘   │
 * │  → 행 클릭 시 확장: 목표가/손절가/트레일링스탑 상세     │
 * └──────────────────────────────────────────────────────────┘
 */
export default function Portfolio() {
  const {
    enrichedPortfolios,
    totalCost, totalCurrentValue, totalGain, totalReturnPct,
    loading,
  } = usePortfolio();

  const [buyOpen, setBuyOpen] = useState(false);
  const [sortKey, setSortKey] = useState('return_pct'); // 정렬 기준
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...enrichedPortfolios].sort((a, b) => {
    const v = (x) => Number(x[sortKey]) || 0;
    return sortAsc ? v(a) - v(b) : v(b) - v(a);
  });

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  const isUp   = totalGain > 0;
  const isDown = totalGain < 0;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── 요약 카드 ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="총 평가금액"
          value={fmtKRW(totalCurrentValue)}
          highlight
        />
        <SummaryCard
          label="총 평가손익"
          value={fmtKRW(totalGain, true)}
          sub={fmtPct(totalReturnPct)}
          color={directionClass(totalGain)}
          isUp={isUp}
          isDown={isDown}
        />
        <SummaryCard
          label="투자 원금"
          value={fmtKRW(totalCost)}
        />
        <SummaryCard
          label="보유 종목 수"
          value={`${enrichedPortfolios.length}종목`}
          sub={loading ? '업데이트 중...' : '실시간'}
        />
      </div>

      {/* ── 종목 리스트 ─────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        {/* 리스트 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">보유 종목</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted hidden md:block">
              행 클릭 시 상세 설정 표시
            </span>
            <button
              onClick={() => setBuyOpen(true)}
              className="btn-primary text-sm py-2"
            >
              + 거래 기록
            </button>
          </div>
        </div>

        {loading ? (
          <PortfolioSkeleton />
        ) : enrichedPortfolios.length === 0 ? (
          <EmptyState onAdd={() => setBuyOpen(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface2 border-b border-border text-xs text-text-muted uppercase tracking-wide">
                  <th className="py-2.5 pl-3 pr-2 text-center w-12">신호</th>
                  <th className="py-2.5 pr-4 text-left">종목</th>
                  <SortTh label="현재가" sortKey="current_price" current={sortKey} asc={sortAsc} onSort={toggleSort} />
                  <SortTh label="수익률"  sortKey="return_pct"    current={sortKey} asc={sortAsc} onSort={toggleSort} />
                  <SortTh label="평가손익" sortKey="unrealized_gain" current={sortKey} asc={sortAsc} onSort={toggleSort} />
                  <th className="py-2.5 pr-3 text-center">날씨</th>
                  <th className="py-2.5 pr-3 text-center">신호등</th>
                  <th className="py-2.5 pr-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <PortfolioRow key={p.id} portfolio={p} rank={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 범례 ────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 text-xs text-text-muted px-1">
        <LegendItem color="bg-safe"     label="신호등 초록: 수익률 +5% 이상 또는 목표 80% 달성" />
        <LegendItem color="bg-yellow-400" label="신호등 노랑: 수익률 -5% ~ +5% (보유 관찰)" />
        <LegendItem color="bg-danger"   label="신호등 빨강: 수익률 -5% 미만 또는 손절가 이하" />
      </div>

      {buyOpen && <BuyModal onClose={() => setBuyOpen(false)} />}
    </div>
  );
}

/* ── 서브 컴포넌트 ── */

function SummaryCard({ label, value, sub, color, highlight, isUp, isDown }) {
  return (
    <div className={clsx(
      'card',
      isUp   && 'border-l-[3px] border-l-bull',
      isDown && 'border-l-[3px] border-l-bear',
    )}>
      <p className="text-sm text-text-muted">{label}</p>
      <p className={clsx(
        'text-2xl font-bold font-mono tabular-nums mt-1',
        highlight ? 'text-text-primary' : color ?? 'text-text-primary',
      )}>
        {value}
      </p>
      {sub && (
        <p className={clsx('text-sm font-semibold mt-0.5', color ?? 'text-text-muted')}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SortTh({ label, sortKey, current, asc, onSort }) {
  const active = current === sortKey;
  return (
    <th
      className="py-2.5 pr-4 text-right cursor-pointer hover:text-text-primary transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className="ml-1 opacity-60">
        {active ? (asc ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', color)} />
      <span>{label}</span>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="p-5 space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border/50">
          <div className="w-8 h-12 bg-surface3 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 bg-surface3 rounded" />
            <div className="h-3 w-20 bg-surface3 rounded" />
          </div>
          <div className="h-5 w-24 bg-surface3 rounded self-center" />
          <div className="h-5 w-16 bg-surface3 rounded self-center" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-surface2 rounded-2xl flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-text-secondary">보유 종목이 없습니다</p>
      <p className="text-sm text-text-muted mt-1 mb-5">매수 기록을 추가하면 실시간으로 수익률을 추적합니다</p>
      <button onClick={onAdd} className="btn-primary">
        + 첫 거래 기록 추가
      </button>
    </div>
  );
}
