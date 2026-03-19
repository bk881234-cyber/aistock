const { getCache, setCache, delCache } = require('../../config/redis');

/**
 * 캐시 키 네임스페이스 상수
 */
const KEYS = {
  MARKET_OVERVIEW: 'market:overview',
  MARKET_INDICES:  'market:indices',
  MARKET_FX:       'market:fx',
  MARKET_COMMODITY:'market:commodities',
  WEATHER: (sym)  => `weather:${sym}`,
  REPORT:  (sym, type) => `report:${sym}:${type}`,
};

/**
 * TTL 상수 (초)
 */
const TTL = {
  INDEX:     5,    // 지수: 5초
  FX:        30,   // 환율: 30초
  COMMODITY: 60,   // 원자재: 1분
  WEATHER:   300,  // 날씨: 5분
  REPORT:    600,  // AI 리포트: 10분
};

/**
 * DB 캐시 갱신 헬퍼: fn()이 DB에서 데이터 조회 후 Redis에 저장
 */
const withCache = async (key, ttl, fn) => {
  const cached = await getCache(key);
  if (cached) return cached;

  const data = await fn();
  if (data) await setCache(key, data, ttl);
  return data;
};

/**
 * 시장 캐시 전체 무효화 (크론 갱신 후 호출)
 */
const invalidateMarketCache = async () => {
  await Promise.all([
    delCache(KEYS.MARKET_OVERVIEW),
    delCache(KEYS.MARKET_INDICES),
    delCache(KEYS.MARKET_FX),
    delCache(KEYS.MARKET_COMMODITY),
  ]);
};

module.exports = { KEYS, TTL, withCache, invalidateMarketCache };
