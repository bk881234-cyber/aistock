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
        { symbol: 'GOLD_USD',   current_val: 2350.0, change_val: 0, change_pct: 0, high_52w: 2500.0, low_52w: 1800.0, raw_json: { gauge_position: 75, sparkline: [] }, last_updated: now },
        { symbol: 'SILVER_USD', current_val: 29.5,   change_val: 0, change_pct: 0, high_52w: 35.0,   low_52w: 20.0,   raw_json: { gauge_position: 60, sparkline: [] }, last_updated: now },
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

  const axios = require('axios');
  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com',
  };
  const PARAMS = { q, quotesCount: 10, newsCount: 0, enableFuzzyQuery: true, enableCb: false };

  // Yahoo Finance exchange 코드 → 내부 시장 코드
  const EXCHANGE_MAP = {
    KSC: 'KOSPI',  KOE: 'KOSDAQ',
    NYQ: 'NYSE',   PCX: 'NYSE',   ASE: 'NYSE',
    NMS: 'NASDAQ', NGM: 'NASDAQ', NCM: 'NASDAQ', NQB: 'NASDAQ',
    TOR: 'TSX',    LSE: 'LSE',    FRA: 'FSE',
  };

  const mapQuotes = (quotes) =>
    (quotes ?? [])
      .filter((item) => item.quoteType === 'EQUITY' || item.quoteType === 'ETF')
      .slice(0, 8)
      .map((item) => {
        // 한국 심볼 suffix 우선 체크
        let market;
        if (item.symbol.endsWith('.KS')) market = 'KOSPI';
        else if (item.symbol.endsWith('.KQ')) market = 'KOSDAQ';
        else market = EXCHANGE_MAP[item.exchange] ?? item.exchange ?? 'US';

        return {
          symbol:      item.symbol.replace(/\.(KS|KQ)$/, ''),
          yahooSymbol: item.symbol,
          name:        item.longname || item.shortname || item.symbol,
          market,
          exchange:    item.exchange,
        };
      });

  try {
    let data;
    try {
      const r = await axios.get('https://query1.finance.yahoo.com/v1/finance/search', {
        params: PARAMS, timeout: 5000, headers: HEADERS,
      });
      data = r.data;
    } catch {
      // query1 차단 시 query2 fallback
      const r = await axios.get('https://query2.finance.yahoo.com/v1/finance/search', {
        params: PARAMS, timeout: 5000, headers: HEADERS,
      });
      data = r.data;
    }
    return success(res, mapQuotes(data?.quotes));
  } catch (err) {
    console.error('[market] searchStock 오류:', err.message);
    return success(res, []);
  }
};

/** Yahoo Finance 심볼 매핑 (차트용) */
const CHART_SYMBOLS = {
  KOSPI: '^KS11', KOSDAQ: '^KQ11', NASDAQ: '^IXIC', SPX: '^GSPC',
  DOW: '^DJI', VIX: '^VIX', GOLD_USD: 'GC=F', SILVER_USD: 'SI=F',
};
const RANGE_PARAMS = {
  '1d':  { interval: '5m',  range: '1d'  },
  '5d':  { interval: '30m', range: '5d'  },
  '1mo': { interval: '1d',  range: '1mo' },
  '1y':  { interval: '1wk', range: '1y'  },
};
const CHART_TTL = { '1d': 60, '5d': 300, '1mo': 600, '1y': 3600 };

/**
 * GET /api/market/chart/:symbol?range=1d|5d|1mo|1y
 * 지수/원자재 차트 스파크라인 반환 (Redis 캐시)
 */
const getChart = async (req, res) => {
  const { symbol } = req.params;
  const range = RANGE_PARAMS[req.query.range] ? req.query.range : '1d';
  const yahooSym = CHART_SYMBOLS[symbol];
  if (!yahooSym) return error(res, '지원하지 않는 심볼', 400);

  try {
    const CACHE_KEY = `market:chart:${symbol}:${range}`;
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const axios = require('axios');
    const { interval, range: r } = RANGE_PARAMS[range];
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}`,
      {
        params: { interval, range: r },
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      },
    );

    const result = data?.chart?.result?.[0];
    if (!result) return success(res, { symbol, range, sparkline: [] });

    const timestamps = result.timestamp ?? [];
    const closes = result.indicators?.quote?.[0]?.close ?? [];
    const sparkline = timestamps
      .map((t, i) => ({ t: t * 1000, v: closes[i] }))
      .filter((d) => d.v != null);

    const payload = { symbol, range, sparkline };
    await setCache(CACHE_KEY, payload, CHART_TTL[range]);
    return success(res, payload);
  } catch (err) {
    console.error(`[market] getChart ${symbol}/${range} 오류:`, err.message);
    return success(res, { symbol, range, sparkline: [] });
  }
};

module.exports = { getIndices, getFx, getCommodities, getOverview, searchStock, getChart };
