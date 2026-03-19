const cron = require('node-cron');
const { Portfolio, Watchlist, StockWeather } = require('../models');
const weatherService = require('../services/ai/weatherService');
const { Op } = require('sequelize');

/**
 * 기술적 지표 수집 (스텁 - 2단계에서 실제 API 연동)
 * Alpha Vantage TECHNICAL_INDICATOR API 활용 예정
 */
const fetchIndicators = async (symbol) => {
  // TODO: 2단계에서 Alpha Vantage RSI/MACD/BBANDS API 연동
  // 현재는 랜덤 더미 데이터 반환 (개발용)
  return {
    rsi14:        40 + Math.random() * 40,  // 40~80
    macdSignal:   ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
    bbPosition:   ['upper', 'middle', 'lower'][Math.floor(Math.random() * 3)],
    volumeRatio:  0.5 + Math.random() * 2,
    movingAvgPos: ['above_20', 'above_60', 'below_60'][Math.floor(Math.random() * 3)],
  };
};

const analyzeAllTrackedStocks = async () => {
  try {
    console.log('[weatherAnalysisJob] 날씨 분석 시작...');

    // 포트폴리오 + 관심 종목에서 유니크 심볼 수집
    const [portfolioSymbols, watchlistSymbols] = await Promise.all([
      Portfolio.findAll({
        where: { status: 'active' },
        attributes: ['stock_symbol'],
        group: ['stock_symbol'],
      }),
      Watchlist.findAll({
        attributes: ['stock_symbol'],
        group: ['stock_symbol'],
      }),
    ]);

    const allSymbols = [
      ...new Set([
        ...portfolioSymbols.map((p) => p.stock_symbol),
        ...watchlistSymbols.map((w) => w.stock_symbol),
      ]),
    ];

    console.log(`[weatherAnalysisJob] 분석 대상: ${allSymbols.length}개 종목`);

    // 만료된 날씨 데이터만 갱신
    const now = new Date();
    const expiredSymbols = await StockWeather.findAll({
      where: {
        stock_symbol: allSymbols,
        expires_at: { [Op.lt]: now },
      },
      attributes: ['stock_symbol'],
    });

    const existingSymbols = await StockWeather.findAll({
      attributes: ['stock_symbol'],
    });
    const existingSet = new Set(existingSymbols.map((s) => s.stock_symbol));
    const newSymbols = allSymbols.filter((s) => !existingSet.has(s));

    const toAnalyze = [
      ...expiredSymbols.map((s) => s.stock_symbol),
      ...newSymbols,
    ];

    for (const symbol of toAnalyze) {
      const indicators = await fetchIndicators(symbol);
      await weatherService.analyze(symbol, indicators);
    }

    console.log(`[weatherAnalysisJob] 완료: ${toAnalyze.length}개 종목 갱신`);
  } catch (err) {
    console.error('[weatherAnalysisJob] 오류:', err.message);
  }
};

const startWeatherAnalysisJob = () => {
  analyzeAllTrackedStocks();

  // 10분마다 만료된 날씨 데이터 갱신
  cron.schedule('*/10 * * * *', analyzeAllTrackedStocks, {
    timezone: 'Asia/Seoul',
  });

  console.log('[weatherAnalysisJob] 날씨 분석 크론 시작 (10분 간격)');
};

module.exports = { startWeatherAnalysisJob, analyzeAllTrackedStocks };
