const { MarketCache } = require('../models');
const { getCache, setCache } = require('../config/redis');
const { success, error } = require('../utils/response');
const { refreshAllMarketData } = require('../jobs/marketRefreshJob');

/** Sequelize DECIMAL → float 변환 + 직렬화 헬퍼 */
const toFloat = (v) => (v == null ? null : parseFloat(v) || 0);

const serializeIndex = (row) => ({
  symbol:      row.symbol,
  current_val: toFloat(row.current_val),
  change_val:  toFloat(row.change_val),
  change_pct:  toFloat(row.change_pct),
  high_52w:    row.high_52w != null ? toFloat(row.high_52w) : null,
  low_52w:     row.low_52w  != null ? toFloat(row.low_52w)  : null,
  raw_json:    row.raw_json ?? null,
  last_updated: row.last_updated,
});

const serializeFx = (row) => ({
  symbol:      row.symbol,
  current_val: toFloat(row.current_val),
  change_val:  toFloat(row.change_val),
  change_pct:  toFloat(row.change_pct),
  raw_json:    row.raw_json ?? null,
  last_updated: row.last_updated,
});

const serializeCommodity = (row) => ({
  symbol:      row.symbol,
  current_val: toFloat(row.current_val),
  change_val:  toFloat(row.change_val),
  change_pct:  toFloat(row.change_pct),
  high_52w:    row.high_52w != null ? toFloat(row.high_52w) : null,
  low_52w:     row.low_52w  != null ? toFloat(row.low_52w)  : null,
  raw_json:    row.raw_json ?? null,
  last_updated: row.last_updated,
});

/**
 * GET /api/market/indices
 * KOSPI, KOSDAQ, NASDAQ, S&P500 현재값 반환
 * 캐시 순서: Redis (5s) → DB → 외부 API (jobs에서 갱신)
 */
const getIndices = async (req, res) => {
  try {
    const CACHE_KEY = 'market:indices';
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const indices = await MarketCache.findAll({
      where: { data_type: 'index' },
      order: [['symbol', 'ASC']],
    });

    const data = indices.map(serializeIndex);

    await setCache(CACHE_KEY, data, 5);
    return success(res, data);
  } catch (err) {
    console.error('[market] getIndices 오류:', err.message);
    return success(res, []);   // 500 대신 빈 배열 → 폴링 에러 토스트 방지
  }
};

/**
 * GET /api/market/fx
 * 달러 환율 (USD/KRW) 반환
 */
const getFx = async (req, res) => {
  try {
    const CACHE_KEY = 'market:fx';
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const fx = await MarketCache.findAll({ where: { data_type: 'fx' } });
    const data = fx.map(serializeFx);

    await setCache(CACHE_KEY, data, 30);
    return success(res, data);
  } catch (err) {
    console.error('[market] getFx 오류:', err.message);
    return success(res, []);
  }
};

/**
 * GET /api/market/commodities
 * 금(GOLD), 은(SILVER) 데이터 반환
 */
const getCommodities = async (req, res) => {
  try {
    const CACHE_KEY = 'market:commodities';
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const commodities = await MarketCache.findAll({ where: { data_type: 'commodity' } });
    const data = commodities.map(serializeCommodity);

    await setCache(CACHE_KEY, data, 60);
    return success(res, data);
  } catch (err) {
    console.error('[market] getCommodities 오류:', err.message);
    return success(res, []);
  }
};

/**
 * GET /api/market/overview
 * 대시보드용 전체 매크로 데이터 통합 반환
 */
const getOverview = async (req, res) => {
  try {
    const CACHE_KEY = 'market:overview';
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    let all = await MarketCache.findAll({
      where: { data_type: ['index', 'fx', 'commodity'] },
    });

    // DB가 비어 있으면 외부 API에서 즉시 가져오기 (최초 요청 시 자동 시드)
    if (!all.length) {
      console.log('[market] DB 비어있음 — Yahoo Finance에서 즉시 수집');
      await refreshAllMarketData();
      all = await MarketCache.findAll({
        where: { data_type: ['index', 'fx', 'commodity'] },
      });
    }

    const data = {
      indices:     all.filter((d) => d.data_type === 'index').map(serializeIndex),
      fx:          all.filter((d) => d.data_type === 'fx').map(serializeFx),
      commodities: all.filter((d) => d.data_type === 'commodity').map(serializeCommodity),
    };

    await setCache(CACHE_KEY, data, 5);
    return success(res, data);
  } catch (err) {
    console.error('[market] getOverview 오류:', err.message);
    // 500 대신 빈 객체 반환 → 폴링 에러 토스트 반복 방지
    return success(res, { indices: [], fx: [], commodities: [] });
  }
};

module.exports = { getIndices, getFx, getCommodities, getOverview };
