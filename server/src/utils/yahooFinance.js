/**
 * Yahoo Finance HTTP 클라이언트
 * - Chrome User-Agent로 차단 방지
 * - 자동 재시도 (최대 2회, 지수 백오프)
 * - 공통 에러 정규화
 */
const https = require('https');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const DEFAULT_HEADERS = {
  'User-Agent': USER_AGENT,
  Accept: 'application/json',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
};

// ── 저수준 fetch (Node 내장 https) ────────────────────────────
const httpsGet = (url, headers = {}) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { ...DEFAULT_HEADERS, ...headers } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(httpsGet(res.headers.location, headers));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy(new Error('Request timeout'));
    });
  });

// ── 재시도 래퍼 ───────────────────────────────────────────────
const withRetry = async (fn, retries = 2, delayMs = 500) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
};

// ── 공개 API ─────────────────────────────────────────────────

/**
 * 단일 종목 현재가 조회
 * @param {string} yahooSymbol  예) '005930.KS', 'AAPL', 'GC=F'
 * @returns {{ symbol, regularMarketPrice, regularMarketChange, regularMarketChangePercent,
 *             regularMarketPreviousClose, fiftyTwoWeekHigh, fiftyTwoWeekLow,
 *             shortName, longName, currency, exchangeName }}
 */
const fetchQuote = async (yahooSymbol) => {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` +
    `?interval=1d&range=1d&includePrePost=false`;

  const data = await withRetry(() => httpsGet(url));
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No quote data for ${yahooSymbol}`);

  return {
    symbol: yahooSymbol,
    regularMarketPrice:              meta.regularMarketPrice,
    regularMarketChange:             meta.regularMarketPrice - meta.chartPreviousClose,
    regularMarketChangePercent:
      ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    regularMarketPreviousClose:      meta.chartPreviousClose,
    fiftyTwoWeekHigh:                meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow:                 meta.fiftyTwoWeekLow,
    shortName:                       meta.shortName || meta.symbol,
    longName:                        meta.longName  || meta.shortName || meta.symbol,
    currency:                        meta.currency,
    exchangeName:                    meta.exchangeName,
  };
};

/**
 * 종목 차트(스파크라인) 데이터 조회
 * @param {string} yahooSymbol
 * @param {'1d'|'5d'|'1mo'|'3mo'|'6mo'|'1y'|'5y'} range
 * @returns {{ timestamps: number[], closes: number[], meta: object }}
 */
const fetchChart = async (yahooSymbol, range = '1d') => {
  const intervalMap = { '1d': '5m', '5d': '30m', '1mo': '1d', '3mo': '1d', '6mo': '1d', '1y': '1wk', '5y': '1mo' };
  const interval = intervalMap[range] || '1d';

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` +
    `?interval=${interval}&range=${range}&includePrePost=false`;

  const data = await withRetry(() => httpsGet(url));
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No chart data for ${yahooSymbol} range=${range}`);

  const timestamps = result.timestamp || [];
  const closes     = result.indicators?.quote?.[0]?.close || [];

  // null 제거 (장 중 미래 구간)
  const pairs = timestamps
    .map((t, i) => ({ t, c: closes[i] }))
    .filter((p) => p.t != null && p.c != null);

  return {
    timestamps: pairs.map((p) => p.t),
    closes:     pairs.map((p) => p.c),
    meta:       result.meta,
  };
};

/**
 * 응답에서 quotes 배열 추출 — Yahoo Finance 응답 형식 두 가지 모두 처리
 *  구형: data.finance.result[0].quotes
 *  신형: data.quotes
 */
const extractQuotes = (data) =>
  data?.quotes ||
  data?.finance?.result?.[0]?.quotes ||
  [];

/**
 * 종목 검색 자동완성
 * @param {string} query  예) '삼성', 'AAPL', '테슬라'
 * @returns {Array<{ symbol, shortname, longname, exchange, quoteType }>}
 */
const searchStocks = async (query) => {
  if (!query?.trim()) return [];

  const q = encodeURIComponent(query.trim());

  // 시도 순서: 한국(KR) → 글로벌 → query2 폴백
  const attempts = [
    `https://query1.finance.yahoo.com/v1/finance/search?q=${q}&lang=ko-KR&region=KR&quotesCount=10&newsCount=0&enableFuzzyQuery=true`,
    `https://query1.finance.yahoo.com/v1/finance/search?q=${q}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`,
    `https://query2.finance.yahoo.com/v1/finance/search?q=${q}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`,
  ];

  let quotes = [];
  for (const url of attempts) {
    try {
      const data = await withRetry(() => httpsGet(url), 1, 300);
      quotes = extractQuotes(data);
      if (quotes.length > 0) break;
    } catch {
      // 다음 URL 시도
    }
  }

  return quotes
    .filter((q) => q.quoteType !== 'OPTION' && q.quoteType !== 'CURRENCY')
    .map((q) => ({
      symbol:    q.symbol,
      shortname: q.shortname || q.longname || q.symbol,
      longname:  q.longname  || q.shortname || q.symbol,
      exchange:  q.exchange,
      quoteType: q.quoteType,
    }));
};

/**
 * 종목 OHLCV 캔들 데이터 조회
 * @param {string} yahooSymbol
 * @param {'1d'|'5d'|'1mo'|'3mo'|'6mo'|'1y'|'5y'} range
 * @returns {Array<{ time, open, high, low, close, volume }>}
 */
const fetchCandles = async (yahooSymbol, range = '3mo') => {
  const intervalMap = { '1d': '5m', '5d': '15m', '1mo': '1d', '3mo': '1d', '6mo': '1d', '1y': '1wk', '5y': '1mo' };
  const interval = intervalMap[range] || '1d';

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` +
    `?interval=${interval}&range=${range}&includePrePost=false`;

  const data = await withRetry(() => httpsGet(url));
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No candle data for ${yahooSymbol}`);

  const timestamps = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const opens   = q.open   || [];
  const highs   = q.high   || [];
  const lows    = q.low    || [];
  const closes  = q.close  || [];
  const volumes = q.volume || [];

  const candles = timestamps
    .map((t, i) => ({
      time:   t,
      open:   opens[i],
      high:   highs[i],
      low:    lows[i],
      close:  closes[i],
      volume: volumes[i],
    }))
    .filter((c) => c.close != null && c.open != null);

  return { candles, meta: result.meta };
};

/**
 * 여러 종목 현재가 일괄 조회 (순차 실행, 실패해도 부분 성공)
 * @param {string[]} yahooSymbols
 * @returns {Array<{ symbol, price, change, changePct, prevClose, high52w, low52w } | null>}
 */
const fetchQuotes = async (yahooSymbols) => {
  const results = await Promise.allSettled(yahooSymbols.map(fetchQuote));
  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : (() => { console.warn(`[yahooFinance] fetchQuote 실패: ${yahooSymbols[i]} — ${r.reason?.message}`); return null; })()
  );
};

module.exports = { fetchQuote, fetchChart, fetchCandles, searchStocks, fetchQuotes };
