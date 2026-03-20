import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtKRW, fmtPct, fmtCompact, directionClass } from '@/utils/formatters';
import { retColor, SIGNAL_META } from '@/utils/tradingLogic';
import TrafficLight from './TrafficLight';
import WeatherWidget from '@/components/ai/WeatherWidget';
import SettingsModal from './SettingsModal';
import SellModal from '@/components/dashboard/PortfolioSection/SellModal';
import clsx from 'clsx';

/**
 * 포트폴리오 테이블 행
 * - 신호등 (TrafficLight)
 * - 종목 날씨 (WeatherWidget)
 * - 목표가 달성 배너
 * - 트레일링 스탑 표시
 * - 설정 모달 열기
 */
export default function PortfolioRow({ portfolio, rank }) {
  const [showSell,     setShowSell]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expanded,     setExpanded]     = useState(false);

  const {
    stock_name, stock_symbol, market,
    current_price, return_pct, unrealized_gain,
    avg_buy_price, quantity,
    target_sell_price, stop_loss_price, trailing_stop_pct,
    trailingStop, halfSell, signalLevel,
  } = portfolio;

  const isUp   = return_pct > 0;
  const isDown = return_pct < 0;
  const col    = retColor(return_pct);

  return (
    <>
      {/* ── 목표 달성 배너 ── */}
      {halfSell?.recommend && halfSell.level === 'hit' && (
        <tr>
          <td colSpan={8}>
            <div className="mx-1 mb-1 px-3 py-2 bg-safe/10 border border-safe/25 rounded-lg flex items-center gap-2 text-sm">
              <span className="text-lg">🎯</span>
              <span className="font-semibold text-safe flex-1">{halfSell.reason}</span>
              <button
                onClick={() => setShowSell(true)}
                className="text-xs bg-safe text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                지금 매도
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* ── 메인 행 ── */}
      <tr
        className="border-b border-border/40 hover:bg-surface2 transition-colors cursor-pointer group"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* 순위 + 신호등 */}
        <td className="py-3 pl-3 pr-2 w-12">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-muted font-medium">{rank}</span>
            <TrafficLight level={signalLevel} size="sm" showLabel={false} vertical />
          </div>
        </td>

        {/* 종목명 */}
        <td className="py-3 pr-4">
          <Link
            to={`/stock/${stock_symbol}`}
            state={{ market, stockName: stock_name }}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-text-primary text-base">{stock_name}</p>
            <p className="text-xs text-text-muted mt-0.5">
              {stock_symbol}
              <span className={clsx(
                'ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white',
                market === 'KOSPI' || market === 'KOSDAQ' ? 'bg-primary' : 'bg-neutral',
              )}>
                {market}
              </span>
            </p>
          </Link>
        </td>

        {/* 현재가 */}
        <td className="py-3 pr-4 text-right">
          <p className="font-bold font-mono text-text-primary tabular-nums">{fmtKRW(current_price)}</p>
          <p className="text-xs text-text-muted tabular-nums">평균 {fmtKRW(avg_buy_price)}</p>
        </td>

        {/* 수익률 */}
        <td className="py-3 pr-4 text-right">
          <p className={clsx('text-base font-bold font-mono tabular-nums', col.text)}>
            {isUp ? '▲' : isDown ? '▼' : '—'}{fmtPct(return_pct)}
          </p>
        </td>

        {/* 평가손익 */}
        <td className="py-3 pr-4 text-right">
          <p className={clsx('font-semibold font-mono text-sm tabular-nums', directionClass(unrealized_gain))}>
            {fmtKRW(unrealized_gain, true)}
          </p>
          <p className="text-xs text-text-muted">{fmtCompact(quantity)}주</p>
        </td>

        {/* 날씨 */}
        <td className="py-3 pr-3 text-center" onClick={(e) => e.stopPropagation()}>
          <WeatherWidget symbol={stock_symbol} variant="inline" />
        </td>

        {/* 신호등 텍스트 */}
        <td className="py-3 pr-3 text-center">
          <TrafficLight level={signalLevel} size="sm" />
        </td>

        {/* 액션 버튼 */}
        <td className="py-3 pr-3 text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowSettings(true)}
              className="text-[11px] text-text-muted hover:text-primary px-2 py-1 rounded-lg border border-transparent hover:border-border transition-all"
              title="설정"
            >
              ⚙️
            </button>
            <button
              onClick={() => setShowSell(true)}
              className="text-[11px] text-danger hover:bg-danger/8 px-2 py-1 rounded-lg border border-transparent hover:border-danger/20 transition-all font-semibold"
            >
              매도
            </button>
          </div>
        </td>
      </tr>

      {/* ── 확장 행: 트레일링 스탑 + 목표가 상세 ── */}
      {expanded && (
        <tr className="bg-surface2 border-b border-border/40">
          <td colSpan={8} className="px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">

              {/* 목표 매도가 */}
              <DetailBox
                label="목표 매도가"
                value={target_sell_price ? fmtKRW(target_sell_price) : '미설정'}
                sub={target_sell_price
                  ? `+${((target_sell_price - avg_buy_price) / avg_buy_price * 100).toFixed(1)}%`
                  : null}
                color={target_sell_price ? 'text-safe' : 'text-text-muted'}
                onClick={() => setShowSettings(true)}
                hint="클릭하여 설정"
              />

              {/* 손절가 */}
              <DetailBox
                label="손절가 (Stop Loss)"
                value={stop_loss_price ? fmtKRW(stop_loss_price) : '미설정'}
                sub={stop_loss_price
                  ? `${((stop_loss_price - avg_buy_price) / avg_buy_price * 100).toFixed(1)}%`
                  : null}
                color={stop_loss_price ? 'text-danger' : 'text-text-muted'}
                onClick={() => setShowSettings(true)}
                hint="클릭하여 설정"
              />

              {/* 트레일링 스탑 */}
              <DetailBox
                label={`트레일링 스탑 (${trailing_stop_pct ? `-${trailing_stop_pct}%` : '미설정'})`}
                value={trailingStop ? fmtKRW(trailingStop.price) : '미설정'}
                sub={trailingStop ? `-${fmtKRW(trailingStop.fromCurrent)} 여유` : null}
                color={trailingStop ? 'text-warn' : 'text-text-muted'}
                onClick={() => setShowSettings(true)}
                hint="클릭하여 설정"
              />

              {/* 총 평가금액 */}
              <DetailBox
                label="총 평가금액"
                value={fmtKRW(Math.round(current_price * quantity))}
                sub={`투자원금 ${fmtKRW(Math.round(avg_buy_price * quantity))}`}
                color="text-text-primary"
              />
            </div>

            {/* 부분 매도 권장 (near 레벨) */}
            {halfSell?.recommend && halfSell.level === 'near' && (
              <div className="mt-3 flex items-center gap-2 text-sm bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                <span>💡</span>
                <span className="text-text-secondary flex-1">{halfSell.reason}</span>
                <button
                  onClick={() => setShowSell(true)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  부분 매도
                </button>
              </div>
            )}
          </td>
        </tr>
      )}

      {showSell     && <SellModal     portfolio={portfolio} onClose={() => setShowSell(false)} />}
      {showSettings && <SettingsModal portfolio={portfolio} onClose={() => setShowSettings(false)} />}
    </>
  );
}

function DetailBox({ label, value, sub, color, onClick, hint }) {
  return (
    <div
      className={clsx('bg-white rounded-xl border border-border p-3', onClick && 'cursor-pointer hover:border-primary/30 transition-colors')}
      onClick={onClick}
    >
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={clsx('font-bold font-mono tabular-nums', color)}>{value}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      {hint && !value.includes('미설정') === false && (
        <p className="text-[10px] text-primary/60 mt-1">{hint}</p>
      )}
    </div>
  );
}
