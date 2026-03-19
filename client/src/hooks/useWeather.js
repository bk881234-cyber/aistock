import { useState, useEffect, useCallback } from 'react';
import { getWeather } from '@/api/aiApi';

const WEATHER_META = {
  sunny:         { label: '맑음',     emoji: '☀️',  color: '#F59E0B', bg: '#FFF8E6' },
  partly_cloudy: { label: '구름조금', emoji: '⛅',  color: '#60A5FA', bg: '#EFF6FF' },
  cloudy:        { label: '흐림',     emoji: '☁️',  color: '#9CA3AF', bg: '#F9FAFB' },
  rainy:         { label: '비',       emoji: '🌧️', color: '#6366F1', bg: '#F0F0FF' },
  thunderstorm:  { label: '뇌우',     emoji: '⛈️', color: '#EF4444', bg: '#FEF2F2' },
};

/**
 * 종목 날씨 데이터 훅
 * @param {string} symbol - 종목 코드
 * @param {boolean} autoFetch - 마운트 시 자동 조회
 */
const useWeather = (symbol, autoFetch = true) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const data = await getWeather(symbol);
      setWeather(data);
    } catch {
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [autoFetch, fetch]);

  const meta = weather ? (WEATHER_META[weather.weather] ?? WEATHER_META.cloudy) : null;

  return { weather, meta, loading, refetch: fetch };
};

export { WEATHER_META };
export default useWeather;
