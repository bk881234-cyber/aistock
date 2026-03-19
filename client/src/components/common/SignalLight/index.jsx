import clsx from 'clsx';

/**
 * AI 신호등 컴포넌트
 * weather_score 기반 3색 신호등 (매수/중립/매도)
 *
 * @param {'buy'|'neutral'|'sell'} signal
 * @param {number} score   - 0~100 날씨 점수
 * @param {'sm'|'md'|'lg'} size
 */

const SIGNAL_META = {
  buy:     { label: '매수', color: 'bg-bull',    pulse: 'animate-pulse-bull',  text: 'text-bull' },
  neutral: { label: '중립', color: 'bg-yellow-400', pulse: '',                 text: 'text-yellow-500' },
  sell:    { label: '매도', color: 'bg-bear',    pulse: 'animate-pulse-bear',  text: 'text-bear' },
};

const SIZES = {
  sm: { dot: 'w-2 h-2',   text: 'text-[10px]' },
  md: { dot: 'w-2.5 h-2.5', text: 'text-xs' },
  lg: { dot: 'w-3.5 h-3.5', text: 'text-sm' },
};

export const scoreToSignal = (score) => {
  if (score >= 65) return 'buy';
  if (score >= 40) return 'neutral';
  return 'sell';
};

export default function SignalLight({ score = 50, size = 'md', showLabel = true }) {
  const signal = scoreToSignal(score);
  const meta   = SIGNAL_META[signal];
  const sz     = SIZES[size];

  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx('rounded-full flex-shrink-0', sz.dot, meta.color, meta.pulse)} />
      {showLabel && (
        <span className={clsx('font-semibold', sz.text, meta.text)}>
          {meta.label}
        </span>
      )}
    </div>
  );
}
