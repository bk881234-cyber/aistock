const { StockWeather } = require('../../models');
const { setCache } = require('../cache/cacheService');

/**
 * 날씨 점수 → 날씨 등급 변환
 * 0~100점 범위
 */
const scoreToWeather = (score) => {
  if (score >= 80) return 'sunny';           // 맑음: 강한 매수 신호
  if (score >= 60) return 'partly_cloudy';   // 구름조금: 약한 매수 신호
  if (score >= 40) return 'cloudy';          // 흐림: 중립
  if (score >= 20) return 'rainy';           // 비: 약한 매도 신호
  return 'thunderstorm';                      // 뇌우: 강한 매도 신호
};

/**
 * RSI 기여 점수 계산 (0~30점)
 */
const calcRsiScore = (rsi) => {
  if (!rsi) return 15;          // 데이터 없으면 중립
  if (rsi >= 70) return 5;      // 과매수 → 위험
  if (rsi >= 60) return 20;     // 강세
  if (rsi >= 40) return 25;     // 적정
  if (rsi >= 30) return 15;     // 약세
  return 30;                    // 과매도 → 반등 기대 (역발상)
};

/**
 * MACD 기여 점수 계산 (0~25점)
 */
const calcMacdScore = (signal) => {
  if (signal === 'bullish') return 25;
  if (signal === 'neutral')  return 12;
  return 0;
};

/**
 * 볼린저 밴드 기여 점수 계산 (0~20점)
 */
const calcBbScore = (position) => {
  if (position === 'breakout_up') return 20;
  if (position === 'upper')       return 15;
  if (position === 'middle')      return 10;
  if (position === 'lower')       return 5;
  return 0;  // breakout_down
};

/**
 * 거래량 기여 점수 계산 (0~15점)
 */
const calcVolumeScore = (ratio) => {
  if (!ratio) return 7;
  if (ratio >= 2.0) return 15;   // 평균 2배 이상 급증
  if (ratio >= 1.5) return 12;
  if (ratio >= 1.0) return 8;
  return 3;                       // 거래 부진
};

/**
 * 이동평균 기여 점수 계산 (0~10점)
 */
const calcMaScore = (pos) => {
  if (pos === 'golden_cross') return 10;
  if (pos === 'above_20')     return 8;
  if (pos === 'above_60')     return 5;
  if (pos === 'dead_cross')   return 0;
  return 2;  // below_60
};

/**
 * 종목 날씨 분석 실행
 * @param {string} symbol
 * @param {object} indicators - { rsi14, macdSignal, bbPosition, volumeRatio, movingAvgPos }
 */
const analyze = async (symbol, indicators = {}) => {
  const { rsi14, macdSignal, bbPosition, volumeRatio, movingAvgPos } = indicators;

  const score = Math.round(
    calcRsiScore(rsi14) +
    calcMacdScore(macdSignal) +
    calcBbScore(bbPosition) +
    calcVolumeScore(volumeRatio) +
    calcMaScore(movingAvgPos)
  );

  const clampedScore = Math.min(100, Math.max(0, score));
  const weather = scoreToWeather(clampedScore);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);  // 10분 후 만료

  await StockWeather.upsert({
    stock_symbol: symbol,
    weather,
    weather_score: clampedScore,
    rsi_14: rsi14 || null,
    macd_signal: macdSignal || null,
    bb_position: bbPosition || null,
    volume_ratio: volumeRatio || null,
    moving_avg_pos: movingAvgPos || null,
    analyzed_at: new Date(),
    expires_at: expiresAt,
  }, { conflictFields: ['stock_symbol'] });

  const result = { stock_symbol: symbol, weather, weather_score: clampedScore, expires_at: expiresAt };
  await setCache(`weather:${symbol}`, result, 300);

  return result;
};

module.exports = { analyze, scoreToWeather };
