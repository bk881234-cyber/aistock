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

    // DB upsert 병렬 실행
    await Promise.all([
      upsertCache(indices),
      upsertCache(fx),
      upsertCache(commodities),
    ]);

    // Redis 무효화 → 다음 API 요청 시 DB에서 신선한 데이터 로드
    await invalidateMarketCache();

    const total = indices.length + fx.length + commodities.length;
    console.log(`${label} 완료: 지수 ${indices.length}개 / 환율 ${fx.length}개 / 원자재 ${commodities.length}개`);
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
