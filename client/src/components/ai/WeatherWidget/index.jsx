import useWeather, { WEATHER_META } from '@/hooks/useWeather';
import SignalLight from '@/components/common/SignalLight';
import clsx from 'clsx';

/**
 * 종목 날씨 위젯 (포트폴리오 행에 인라인 표시)
 * @param {string} symbol
 * @param {'inline'|'card'} variant
 */
export default function WeatherWidget({ symbol, variant = 'inline' }) {
  const { weather, meta, loading } = useWeather(symbol);

  if (loading) return <span className="text-[11px] text-text-muted animate-pulse">분석 중...</span>;
  if (!weather || !meta) return <span className="text-[11px] text-text-muted">—</span>;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-1">
        <span className="text-base leading-none" title={meta.label}>{meta.emoji}</span>
        <SignalLight score={weather.weather_score} size="sm" />
      </div>
    );
  }

  // card variant
  return (
    <div
      className="rounded-lg p-3 flex flex-col items-center gap-1"
      style={{ background: meta.bg }}
    >
      <span className="text-3xl">{meta.emoji}</span>
      <p className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</p>
      <p className="text-[11px] text-text-muted">날씨 점수 {weather.weather_score}점</p>

      {/* 기술 지표 요약 */}
      <div className="w-full mt-1 space-y-0.5">
        <IndicatorRow label="RSI(14)" value={weather.rsi_14?.toFixed(1)} />
        <IndicatorRow label="MACD"    value={weather.macd_signal} />
        <IndicatorRow label="BB"      value={weather.bb_position} />
        <IndicatorRow label="거래량"  value={weather.volume_ratio ? `${weather.volume_ratio.toFixed(1)}x` : null} />
      </div>
    </div>
  );
}

function IndicatorRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-secondary">{value}</span>
    </div>
  );
}
