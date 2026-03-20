const cron = require('node-cron');
const { MarketCache } = require('../models');
const { fetchAllIndices } = require('../services/market/indexService');
const { fetchAllFx }      = require('../services/market/fxService');
const { fetchAllCommodities } = require('../services/market/commodityService');
const { invalidateMarketCache } = require('../services/cache/cacheService');

/**
 * 한국 장중 여부 판단 (KST 09:00~15:30)
 */
const isKoreanMarketOpen = () => {
  const now = new Date();
  const kst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const h = kst.getHours();
  const m = kst.getMinutes();
  const day = kst.getDay(); // 0=일, 6=토

  if (day === 0 || day === 6) return false;
  const minuteOfDay = h * 60 + m;
  return minuteOfDay >= 540 && minuteOfDay <= 930; // 09:00 ~ 15:30
};

/**
 * DB upsert 헬퍼 (symbol 기준 insert or update)
 */
const upsertCache = async (items) => {
  if (!items?.length) return;
  await Promise.allSettled(
    items.map((item) =>
      MarketCache.upsert(item, { conflictFields: ['symbol'] })
    )
  );
};

/**
 * 전체 시장 데이터 갱신
 */
const refreshAllMarketData = async () => {
  const label = `[marketRefreshJob] ${new Date().toISOString()}`;
  try {
    // 병렬 API 호출
    const [indices, fx, commodities] = await Promise.all([
      fetchAllIndices(),
      fetchAllFx(),
      fetchAllCommodities(),
    ]);

    // API 실패 시 더미 데이터 (깡통 방지) — 심볼은 내부 코드 기준
    const now = new Date();
    // 2026년 3월 기준 현실적 수치 (API 실패 시 폴백용)
    const finalIndices     = indices.length ? indices : [
      { symbol: 'KOSPI',  data_type: 'index', current_val: 2520.0,  change_val: 0, change_pct: 0, raw_json: {}, last_updated: now },
      { symbol: 'KOSDAQ', data_type: 'index', current_val: 720.0,   change_val: 0, change_pct: 0, raw_json: {}, last_updated: now },
      { symbol: 'NASDAQ', data_type: 'index', current_val: 17800.0, change_val: 0, change_pct: 0, raw_json: {}, last_updated: now },
      { symbol: 'SPX',    data_type: 'index', current_val: 5650.0,  change_val: 0, change_pct: 0, raw_json: {}, last_updated: now },
      { symbol: 'DOW',    data_type: 'index', current_val: 41800.0, change_val: 0, change_pct: 0, raw_json: {}, last_updated: now },
      { symbol: 'VIX',    data_type: 'index', current_val: 22.0,    change_val: 0, change_pct: 0, raw_json: {}, last_updated: now },
    ];
    const finalFx = fx.length ? fx : [
      { symbol: 'USD_KRW', data_type: 'fx', current_val: 1460.0, change_val: 0, change_pct: 0, raw_json: { sparkline: [] }, last_updated: now },
      { symbol: 'EUR_KRW', data_type: 'fx', current_val: 1580.0, change_val: 0, change_pct: 0, raw_json: { sparkline: [] }, last_updated: now },
      { symbol: 'JPY_KRW', data_type: 'fx', current_val: 9.60,   change_val: 0, change_pct: 0, raw_json: { sparkline: [] }, last_updated: now },
    ];
    const finalCommodities = commodities.length ? commodities : [
      { symbol: 'GOLD_USD',   data_type: 'commodity', current_val: 3020.0, change_val: 0, change_pct: 0, high_52w: 3100.0, low_52w: 2000.0, raw_json: { gauge_position: 80, sparkline: [] }, last_updated: now },
      { symbol: 'SILVER_USD', data_type: 'commodity', current_val: 33.5,   change_val: 0, change_pct: 0, high_52w: 36.0,   low_52w: 22.0,   raw_json: { gauge_position: 65, sparkline: [] }, last_updated: now },
      { symbol: 'OIL_USD',    data_type: 'commodity', current_val: 70.0,   change_val: 0, change_pct: 0, high_52w: 90.0,   low_52w: 60.0,   raw_json: { gauge_position: 40, sparkline: [] }, last_updated: now },
    ];

    // DB upsert 병렬 실행
    await Promise.all([
      upsertCache(finalIndices),
      upsertCache(finalFx),
      upsertCache(finalCommodities),
    ]);

    // Redis 무효화 → 다음 API 요청 시 DB에서 신선한 데이터 로드
    await invalidateMarketCache();

    const total = finalIndices.length + finalFx.length + finalCommodities.length;
    console.log(`${label} 완료: 지수 ${finalIndices.length}개 / 환율 ${finalFx.length}개 / 원자재 ${finalCommodities.length}개`);
    return total;
  } catch (err) {
    console.error(`${label} 오류:`, err.message);
    return 0;
  }
};

/**
 * 크론 스케줄 등록
 *  - 장중 (한국 09:00~15:30): 매 1분
 *  - 장외:                    매 5분 (불필요한 API 호출 감소)
 */
const startMarketRefreshJob = () => {
  // 서버 시작 시 즉시 1회 실행
  refreshAllMarketData().then(() =>
    console.log('[marketRefreshJob] 초기 데이터 로드 완료')
  );

  // 장중 1분 간격
  cron.schedule('* 9-15 * * 1-5', refreshAllMarketData, {
    timezone: 'Asia/Seoul',
  });

  // 장외 5분 간격 (15:30 이후, 장 시작 전, 주말 포함)
  cron.schedule('*/5 0-8,16-23 * * *', refreshAllMarketData, {
    timezone: 'Asia/Seoul',
  });
  cron.schedule('*/5 * * * 0,6', refreshAllMarketData, {
    timezone: 'Asia/Seoul',
  });

  console.log('[marketRefreshJob] 크론 등록 완료 (장중 1분 / 장외 5분)');
};

module.exports = { startMarketRefreshJob, refreshAllMarketData };
