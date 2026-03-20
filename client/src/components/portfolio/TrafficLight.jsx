import { SIGNAL_META } from '@/utils/tradingLogic';
import clsx from 'clsx';

const LEVELS = ['green', 'yellow', 'red'];

/**
 * 신호등 표시기 (초록 / 노랑 / 빨강)
 *
 * @param {'green'|'yellow'|'red'} level
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} showLabel
 * @param {boolean} vertical  세로 배치 여부
 */
export default function TrafficLight({
  level = 'yellow',
  size = 'md',
  showLabel = true,
  vertical = false,
}) {
  const meta   = SIGNAL_META[level] ?? SIGNAL_META.yellow;
  const dotSz  = { sm: 'w-2 h-2',   md: 'w-2.5 h-2.5', lg: 'w-3.5 h-3.5' }[size];
  const textSz = { sm: 'text-[10px]', md: 'text-xs',    lg: 'text-sm'      }[size];

  // 세로 배치: 3개 dot 세로로 (실제 신호등처럼)
  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-[3px]">
        {LEVELS.map((l) => {
          const on = l === level;
          const m  = SIGNAL_META[l];
          return (
            <span
              key={l}
              className={clsx(
                'rounded-full transition-all duration-300',
                dotSz,
                on ? m.dot : 'bg-border',
                on && l === 'green'  ? 'shadow-[0_0_6px_#16A34A70]' : '',
                on && l === 'yellow' ? 'shadow-[0_0_6px_#D9770670]' : '',
                on && l === 'red'    ? 'shadow-[0_0_6px_#DC262670]' : '',
              )}
            />
          );
        })}
        {showLabel && (
          <span className={clsx('font-semibold mt-1', textSz)} style={{ color: meta.color }}>
            {meta.label}
          </span>
        )}
      </div>
    );
  }

  // 가로 배치: dot + label
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={clsx(
          'rounded-full flex-shrink-0',
          dotSz,
          meta.dot,
          level === 'green' && 'shadow-[0_0_5px_#16A34A80] animate-pulse',
          level === 'red'   && 'shadow-[0_0_5px_#DC262680] animate-pulse',
        )}
      />
      {showLabel && (
        <span className={clsx('font-semibold', textSz)} style={{ color: meta.color }}>
          {meta.label}
        </span>
      )}
    </div>
  );
}
