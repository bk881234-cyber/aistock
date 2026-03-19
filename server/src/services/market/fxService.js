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
 * 내부 심볼 → Yahoo Finance 통화쌍 매핑
 * Yahoo FX 규칙: "TARGET=X" 형태 (기준 USD 기준)
 * 원화 환율은 KRW=X (USD/KRW), JPYKRW=X 등
 */
const FX_SYMBOLS = {
  USD_KRW: 'KRW=X',       // 1 USD = ? KRW
  EUR_KRW: 'EURKRW=X',    // 1 EUR = ? KRW
  JPY_KRW: 'JPYKRW=X',    // 1 JPY = ? KRW
  CNY_KRW: 'CNYKRW=X',    // 1 CNY = ? KRW
};

const fetchFx = async (internalSymbol) => {
  const yahooPair = FX_SYMBOLS[internalSymbol];
  if (!yahooPair) return null;

  try {
    const { data } = await yahooClient.get(`/chart/${yahooPair}`, {
      params: { interval: '5m', range: '1d' },
    });

    const meta      = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? 0;
    const current   = meta.regularMarketPrice ?? prevClose;
    const changeVal = +(current - prevClose).toFixed(4);
    const changePct = prevClose ? +((changeVal / prevClose) * 100).toFixed(4) : 0;

    // 스파크라인용 closes (최근 20개 캔들)
    const timestamps = data?.chart?.result?.[0]?.timestamp ?? [];
    const closes     = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const sparkline  = timestamps
      .slice(-20)
      .map((t, i) => ({ t: t * 1000, v: closes[closes.length - 20 + i] ?? null }))
      .filter((d) => d.v !== null);

    return {
      symbol:      internalSymbol,
      data_type:   'fx',
      current_val: current,
      prev_close:  prevClose,
      change_val:  changeVal,
      change_pct:  changePct,
      high_52w:    meta.fiftyTwoWeekHigh ?? null,
      low_52w:     meta.fiftyTwoWeekLow  ?? null,
      raw_json:    { sparkline, currency: meta.currency, marketState: meta.marketState },
      last_updated: new Date(),
      ttl_seconds:  30,
    };
  } catch (err) {
    console.error(`[fxService] ${internalSymbol} 조회 실패:`, err.message);
    return null;
  }
};

const fetchAllFx = async () => {
  const results = await Promise.allSettled(
    Object.keys(FX_SYMBOLS).map(fetchFx)
  );
  return results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
};

module.exports = { fetchFx, fetchAllFx, FX_SYMBOLS };
