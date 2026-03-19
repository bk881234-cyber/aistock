import { fmtIndex, fmtPct } from '@/utils/formatters';
import clsx from 'clsx';

const SYMBOL_LABELS = {
  KOSPI:  '코스피',
  KOSDAQ: '코스닥',
  NASDAQ: '나스닥',
  SPX:    'S&P 500',
  DOW:    '다우',
  VIX:    'VIX',
};

export default function TickerItem({ item }) {
  if (!item) return null;
  const { symbol, current_val, change_pct } = item;
  const label = SYMBOL_LABELS[symbol] ?? symbol;
  const isUp  = change_pct > 0;
  const isVix = symbol === 'VIX';

  return (
    <div className="flex items-center gap-2 px-5 border-r border-border/60 h-full whitespace-nowrap">
      <span className="text-[12px] font-medium text-text-secondary">{label}</span>
      <span className="text-[13px] font-bold text-text-primary font-mono">
        {fmtIndex(current_val)}
      </span>
      <span
        className={clsx(
          'text-[11px] font-semibold',
          isVix
            ? 'text-accent'  // VIX는 별도 컬러
            : isUp ? 'text-bull' : change_pct < 0 ? 'text-bear' : 'text-neutral'
        )}
      >
        {isUp && '▲'}{!isUp && change_pct < 0 && '▼'}
        {fmtPct(change_pct)}
      </span>
    </div>
  );
}
