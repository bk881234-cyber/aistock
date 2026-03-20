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

    // DB 실패 시 Yahoo Finance에서 직접 조회 시도 (DB 없이도 대시보드 표시)
    try {
      const { fetchAllIndices }     = require('../services/market/indexService');
      const { fetchAllFx }          = require('../services/market/fxService');
      const { fetchAllCommodities } = require('../services/market/commodityService');

      const [idxRaw, fxRaw, comRaw] = await Promise.all([
        fetchAllIndices(),
        fetchAllFx(),
        fetchAllCommodities(),
      ]);

      if (idxRaw.length || fxRaw.length || comRaw.length) {
        return success(res, {
          indices:     idxRaw.map(serializeIndex),
          fx:          fxRaw.map(serializeFx),
          commodities: comRaw.map(serializeCommodity),
        });
      }
    } catch { /* Yahoo도 실패 시 더미 데이터로 */ }

    // 최후 더미 데이터 (DB·Yahoo 모두 실패)
    const now = new Date();
    return success(res, {
      indices: [
        { symbol: 'KOSPI',  current_val: 2650.0,  change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'KOSDAQ', current_val: 870.0,   change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'NASDAQ', current_val: 16210.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'SPX',    current_val: 5200.0,  change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'DOW',    current_val: 39000.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'VIX',    current_val: 18.5,    change_val: 0, change_pct: 0, last_updated: now },
      ],
      fx: [
        { symbol: 'USD_KRW', current_val: 1330.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'EUR_KRW', current_val: 1440.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'JPY_KRW', current_val: 8.82,   change_val: 0, change_pct: 0, last_updated: now },
      ],
      commodities: [
        { symbol: 'GOLD_USD', current_val: 2350.0, change_val: 0, change_pct: 0, high_52w: 2500.0, low_52w: 1800.0, raw_json: { gauge_position: 75, sparkline: [] }, last_updated: now },
      ],
    });
  }
};

/**
 * GET /api/market/search?q=삼성전자
 * Yahoo Finance 종목 검색 (자동완성용)
 */
const searchStock = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q || q.length < 1) return success(res, []);

  try {
    const axios = require('axios');
    const { data } = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
      params: { q, quotesCount: 10, newsCount: 0, enableFuzzyQuery: false, enableCb: false },
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const results = (data?.quotes ?? [])
      .filter((item) => item.quoteType === 'EQUITY' || item.quoteType === 'ETF')
      .slice(0, 8)
      .map((item) => {
        // Yahoo 심볼 → 내부 시장 코드 변환
        let market = 'NASDAQ';
        if (item.exchange === 'KSC' || item.symbol.endsWith('.KS')) market = 'KOSPI';
        else if (item.exchange === 'KOE' || item.symbol.endsWith('.KQ')) market = 'KOSDAQ';
        else if (item.exchange === 'NYQ') market = 'NYSE';

        // 내부 심볼: 한국 종목은 숫자 코드만 (005930.KS → 005930)
        const internalSymbol = item.symbol.replace(/\.(KS|KQ)$/, '');

        return {
          symbol:      internalSymbol,
          yahooSymbol: item.symbol,
          name:        item.longname || item.shortname || item.symbol,
          market,
          exchange:    item.exchange,
        };
      });

    return success(res, results);
  } catch (err) {
    console.error('[market] searchStock 오류:', err.message);
    return success(res, []);
  }
};

module.exports = { getIndices, getFx, getCommodities, getOverview, searchStock };
