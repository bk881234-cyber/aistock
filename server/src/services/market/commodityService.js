const axios = require('axios');

const yahooClient = axios.create({
  baseURL: 'https://query1.finance.yahoo.com/v8/finance',
  timeout: 6000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'application/json',
  },
});

/**
 * 원자재 선물 심볼 매핑 (Yahoo Finance 선물 코드)
 */
const COMMODITY_SYMBOLS = {
  GOLD_USD:   'GC=F',   // 금 선물 (oz/USD)
  SILVER_USD: 'SI=F',   // 은 선물 (oz/USD)
  OIL_USD:    'CL=F',   // 원유 WTI (barrel/USD)
  COPPER_USD: 'HG=F',   // 구리 (안전자산 역지표)
};

const fetchCommodity = async (internalSymbol) => {
  const yahooSym = COMMODITY_SYMBOLS[internalSymbol];
  if (!yahooSym) return null;

  try {
    const { data } = await yahooClient.get(`/chart/${yahooSym}`, {
      params: { interval: '5m', range: '5d' },  // 5일치 → 게이지 차트용
    });

    const result    = data?.chart?.result?.[0];
    const meta      = result?.meta;
    if (!meta) return null;

    // chartPreviousClose = 당일 기준 전날 종가 (선물에서 정확한 기준)
    // previousClose는 선물 계약 롤오버 등으로 잘못된 기준이 될 수 있음
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const current   = meta.regularMarketPrice ?? prevClose;
    const changeVal = +(current - prevClose).toFixed(4);
    // Yahoo가 직접 계산한 값을 우선 사용 (가장 정확)
    const changePct = meta.regularMarketChangePercent != null
      ? +meta.regularMarketChangePercent.toFixed(4)
      : prevClose ? +((changeVal / prevClose) * 100).toFixed(4) : 0;

    // 안전자산 선호도 게이지용: 52주 범위에서 현재 위치 (0~100%)
    const high52 = meta.fiftyTwoWeekHigh ?? current;
    const low52  = meta.fiftyTwoWeekLow  ?? current;
    const gaugePosition = high52 !== low52
      ? Math.round(((current - low52) / (high52 - low52)) * 100)
      : 50;

    // 5일 스파크라인 데이터
    const timestamps = result?.timestamp ?? [];
    const closes     = result?.indicators?.quote?.[0]?.close ?? [];
    const sparkline  = timestamps
      .filter((_, i) => closes[i] !== null)
      .slice(-40)
      .map((t, i) => ({
        t: t * 1000,
        v: closes[closes.length - 40 + i],
      }))
      .filter((d) => d.v != null);

    return {
      symbol:      internalSymbol,
      data_type:   'commodity',
      current_val: current,
      prev_close:  prevClose,
      change_val:  changeVal,
      change_pct:  changePct,
      high_52w:    high52,
      low_52w:     low52,
      raw_json:    {
        gauge_position: gaugePosition,  // 프론트 게이지 차트에서 직접 사용
        sparkline,
        currency:     meta.currency,
        marketState:  meta.marketState,
      },
      last_updated: new Date(),
      ttl_seconds:  300,
    };
  } catch (err) {
    console.error(`[commodityService] ${internalSymbol} 조회 실패:`, err.message);
    return null;
  }
};

const fetchAllCommodities = async () => {
  const results = await Promise.allSettled(
    Object.keys(COMMODITY_SYMBOLS).map(fetchCommodity)
  );
  return results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
};

module.exports = { fetchCommodity, fetchAllCommodities, COMMODITY_SYMBOLS };
