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

    // 최후 더미 데이터 (DB·Yahoo 모두 실패) — 2026년 3월 기준
    const now = new Date();
    return success(res, {
      indices: [
        { symbol: 'KOSPI',  current_val: 2520.0,  change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'KOSDAQ', current_val: 720.0,   change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'NASDAQ', current_val: 17800.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'SPX',    current_val: 5650.0,  change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'DOW',    current_val: 41800.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'VIX',    current_val: 22.0,    change_val: 0, change_pct: 0, last_updated: now },
      ],
      fx: [
        { symbol: 'USD_KRW', current_val: 1460.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'CNY_KRW', current_val: 200.0,  change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'EUR_KRW', current_val: 1580.0, change_val: 0, change_pct: 0, last_updated: now },
        { symbol: 'JPY_KRW', current_val: 9.60,   change_val: 0, change_pct: 0, last_updated: now },
      ],
      commodities: [
        { symbol: 'GOLD_USD',   current_val: 3020.0, change_val: 0, change_pct: 0, high_52w: 3100.0, low_52w: 2000.0, raw_json: { gauge_position: 80, sparkline: [] }, last_updated: now },
        { symbol: 'SILVER_USD', current_val: 33.5,   change_val: 0, change_pct: 0, high_52w: 36.0,   low_52w: 22.0,   raw_json: { gauge_position: 65, sparkline: [] }, last_updated: now },
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

  const { searchStocks } = require('../utils/yahooFinance');

  const EXCHANGE_MAP = {
    KSC: 'KOSPI',  KOE: 'KOSDAQ',
    NYQ: 'NYSE',   PCX: 'NYSE',   ASE: 'NYSE',
    NMS: 'NASDAQ', NGM: 'NASDAQ', NCM: 'NASDAQ', NQB: 'NASDAQ',
    TOR: 'TSX',    LSE: 'LSE',    FRA: 'FSE',
  };

  try {
    const quotes = await searchStocks(q);

    const normalize = (items) =>
      items
        .filter((item) => !['OPTION', 'CURRENCY', 'CRYPTOCURRENCY', 'FUTURE'].includes(item.quoteType))
        .slice(0, 8)
        .map((item) => {
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

    const result = normalize(quotes);
    return success(res, result);
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

    const { fetchChart } = require('../utils/yahooFinance');
    const chartData = await fetchChart(yahooSym, range);
    const sparkline = chartData.timestamps
      .map((t, i) => ({ t: t * 1000, v: chartData.closes[i] }))
      .filter((d) => d.v != null);

    const payload = { symbol, range, sparkline };
    await setCache(CACHE_KEY, payload, CHART_TTL[range]);
    return success(res, payload);
  } catch (err) {
    console.error(`[market] getChart ${symbol}/${range} 오류:`, err.message);
    return success(res, { symbol, range, sparkline: [] });
  }
};

/**
 * 심볼 → Yahoo Finance 심볼 변환
 * 005930 → 005930.KS (KOSPI) / 035420.KQ (KOSDAQ)
 */
const resolveYahooSymbol = async (symbol, market) => {
  if (market === 'KOSPI')  return `${symbol}.KS`;
  if (market === 'KOSDAQ') return `${symbol}.KQ`;

  // market 미지정 시 숫자 종목코드면 한국 주식으로 시도
  if (/^\d+$/.test(symbol)) {
    const { fetchQuote } = require('../utils/yahooFinance');
    // KS 먼저 시도
    try {
      await fetchQuote(`${symbol}.KS`);
      return `${symbol}.KS`;
    } catch {
      return `${symbol}.KQ`;
    }
  }
  return symbol; // US 주식
};

/**
 * GET /api/market/stock/:symbol?market=KOSPI&range=3mo
 * 종목 상세 (현재가 + OHLCV 캔들) 반환
 */
const getStockDetail = async (req, res) => {
  const { symbol } = req.params;
  const { market, range = '3mo' } = req.query;

  try {
    const CACHE_KEY = `market:stock:${symbol}:${range}`;
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const { fetchCandles, fetchQuote } = require('../utils/yahooFinance');
    const yahooSym = await resolveYahooSymbol(symbol, market);

    const [candleResult, quote] = await Promise.all([
      fetchCandles(yahooSym, range),
      fetchQuote(yahooSym).catch(() => null),
    ]);

    const data = {
      symbol,
      yahooSymbol: yahooSym,
      name:        quote?.shortName ?? quote?.longName ?? symbol,
      currency:    quote?.currency ?? 'KRW',
      market:      market ?? (yahooSym.endsWith('.KS') ? 'KOSPI' : yahooSym.endsWith('.KQ') ? 'KOSDAQ' : 'US'),
      currentPrice:       quote?.regularMarketPrice ?? null,
      change:             quote?.regularMarketChange ?? null,
      changePct:          quote?.regularMarketChangePercent ?? null,
      high52w:            quote?.fiftyTwoWeekHigh ?? null,
      low52w:             quote?.fiftyTwoWeekLow ?? null,
      candles:            candleResult.candles,
    };

    // 캔들 데이터는 길어서 TTL 짧게 (5분)
    await setCache(CACHE_KEY, data, 300);
    return success(res, data);
  } catch (err) {
    console.error('[market] getStockDetail 오류:', err.message);
    return error(res, '종목 데이터를 가져올 수 없습니다.', 502);
  }
};

module.exports = { getIndices, getFx, getCommodities, getOverview, searchStock, getChart, getStockDetail };
