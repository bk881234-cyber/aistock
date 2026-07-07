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
      <div className="flex items-center gap-1.5">
        <WeatherIcon weatherKey={weather.weather} className="w-4 h-4 flex-shrink-0" />
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
      <WeatherIcon weatherKey={weather.weather} className="w-8 h-8" />
      <p className="text-sm font-bold mt-1" style={{ color: meta.color }}>{meta.label}</p>
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

function WeatherIcon({ weatherKey, className = "w-4 h-4" }) {
  switch (weatherKey) {
    case 'sunny':
      return (
        <svg className={`${className} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      );
    case 'partly_cloudy':
      return (
        <svg className={`${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case 'cloudy':
      return (
        <svg className={`${className} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case 'rainy':
      return (
        <svg className={`${className} text-indigo-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 19a4 4 0 00-4-4H9a4 4 0 00-4 4v0c0 .552.448 1 1 1h12c.552 0 1-.448 1-1v0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1" />
        </svg>
      );
    case 'thunderstorm':
      return (
        <svg className={`${className} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return null;
  }
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
