const axios = require('axios');
const env = require('../../config/env');

/**
 * Yahoo Finance 비공식 v8 API
 * 장중 실시간 / 장외 전일 종가 반환
 */
const yahooClient = axios.create({
  baseURL: 'https://query1.finance.yahoo.com/v8/finance',
  timeout: 6000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'application/json',
  },
});

/**
 * 심볼 매핑: 내부 코드 → Yahoo Finance 심볼
 */
const INDEX_SYMBOLS = {
  KOSPI:  '^KS11',
  KOSDAQ: '^KQ11',
  NASDAQ: '^IXIC',
  SPX:    '^GSPC',
  DOW:    '^DJI',
  VIX:    '^VIX',   // 공포지수 (매크로 섹션에 활용)
};

/**
 * 단일 지수 조회
 * @param {string} internalSymbol - 'KOSPI' | 'KOSDAQ' | ...
 * @returns {object|null}
 */
const fetchIndex = async (internalSymbol) => {
  const yahooSym = INDEX_SYMBOLS[internalSymbol];
  if (!yahooSym) return null;

  try {
    const { data } = await yahooClient.get(`/chart/${encodeURIComponent(yahooSym)}`, {
      params: { interval: '1m', range: '1d', includePrePost: false },
    });

    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta      = result.meta;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? 0;
    const current   = meta.regularMarketPrice ?? prevClose;
    const changeVal = +(current - prevClose).toFixed(4);
    const changePct = prevClose ? +((changeVal / prevClose) * 100).toFixed(4) : 0;

    return {
      symbol:       internalSymbol,
      data_type:    'index',
      current_val:  current,
      prev_close:   prevClose,
      change_val:   changeVal,
      change_pct:   changePct,
      high_52w:     meta.fiftyTwoWeekHigh ?? null,
      low_52w:      meta.fiftyTwoWeekLow  ?? null,
      raw_json:     {
        currency:          meta.currency,
        exchangeName:      meta.exchangeName,
        regularMarketTime: meta.regularMarketTime,
        marketState:       meta.marketState,   // 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
      },
      last_updated: new Date(),
      ttl_seconds:  60,
    };
  } catch (err) {
    console.error(`[indexService] ${internalSymbol} 조회 실패:`, err.message);
    return null;
  }
};

/**
 * 모든 지수 병렬 조회
 */
const fetchAllIndices = async () => {
  const results = await Promise.allSettled(
    Object.keys(INDEX_SYMBOLS).map(fetchIndex)
  );
  return results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
};

/**
 * 종목 단건 조회 (포트폴리오 실시간 현재가용)
 * @param {string} rawSymbol - 실제 Yahoo 심볼 (예: '005930.KS', 'AAPL')
 */
const fetchStockQuote = async (rawSymbol) => {
  try {
    const { data } = await yahooClient.get(`/chart/${encodeURIComponent(rawSymbol)}`, {
      params: { interval: '1m', range: '1d' },
    });

    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? 0;
    const current   = meta.regularMarketPrice ?? prevClose;

    return {
      symbol:      rawSymbol,
      current_val: current,
      change_val:  +(current - prevClose).toFixed(4),
      change_pct:  prevClose ? +((( current - prevClose) / prevClose) * 100).toFixed(4) : 0,
      market_state: meta.marketState,
    };
  } catch (err) {
    console.error(`[indexService] 종목 ${rawSymbol} 조회 실패:`, err.message);
    return null;
  }
};

module.exports = { fetchIndex, fetchAllIndices, fetchStockQuote, INDEX_SYMBOLS };
