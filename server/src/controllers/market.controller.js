const { MarketCache } = require('../models');
const { getCache, setCache } = require('../config/redis');
const { success, error } = require('../utils/response');
const { refreshAllMarketData } = require('../jobs/marketRefreshJob');

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

    const data = indices.map((i) => ({
      symbol: i.symbol,
      current_val: i.current_val,
      change_val: i.change_val,
      change_pct: i.change_pct,
      last_updated: i.last_updated,
    }));

    await setCache(CACHE_KEY, data, 5);
    return success(res, data);
  } catch (err) {
    console.error('[market] getIndices 오류:', err);
    return error(res);
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
    const data = fx.map((f) => ({
      symbol: f.symbol,
      current_val: f.current_val,
      change_pct: f.change_pct,
      raw_json: f.raw_json,
      last_updated: f.last_updated,
    }));

    await setCache(CACHE_KEY, data, 30);
    return success(res, data);
  } catch (err) {
    console.error('[market] getFx 오류:', err);
    return error(res);
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
    const data = commodities.map((c) => ({
      symbol: c.symbol,
      current_val: c.current_val,
      change_pct: c.change_pct,
      high_52w: c.high_52w,
      low_52w: c.low_52w,
      last_updated: c.last_updated,
    }));

    await setCache(CACHE_KEY, data, 60);
    return success(res, data);
  } catch (err) {
    console.error('[market] getCommodities 오류:', err);
    return error(res);
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
      indices: all.filter((d) => d.data_type === 'index'),
      fx: all.filter((d) => d.data_type === 'fx'),
      commodities: all.filter((d) => d.data_type === 'commodity'),
    };

    await setCache(CACHE_KEY, data, 5);
    return success(res, data);
  } catch (err) {
    console.error('[market] getOverview 오류:', err);
    return error(res);
  }
};

module.exports = { getIndices, getFx, getCommodities, getOverview };
