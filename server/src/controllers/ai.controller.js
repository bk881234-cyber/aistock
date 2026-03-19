const { AIReport, StockWeather } = require('../models');
const { getCache, setCache } = require('../config/redis');
const { success, error } = require('../utils/response');

/**
 * GET /api/ai/weather/:symbol
 * 종목 날씨 조회 (캐시 우선)
 */
const getWeather = async (req, res) => {
  try {
    const { symbol } = req.params;
    const CACHE_KEY = `weather:${symbol}`;
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const weather = await StockWeather.findOne({
      where: { stock_symbol: symbol },
    });

    if (!weather || new Date(weather.expires_at) < new Date()) {
      // 만료된 경우 weatherAnalysisJob이 다음 주기에 갱신
      return success(res, null, '날씨 데이터를 분석 중입니다. 잠시 후 다시 확인해주세요.');
    }

    await setCache(CACHE_KEY, weather, 300);  // 5분 캐시
    return success(res, weather);
  } catch (err) {
    console.error('[ai] getWeather 오류:', err);
    return error(res);
  }
};

/**
 * GET /api/ai/report/:symbol
 * AI 3줄 요약 리포트 조회 (캐시 우선 → 없으면 생성 트리거)
 */
const getReport = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { type = 'news_summary' } = req.query;
    const CACHE_KEY = `report:${symbol}:${type}`;

    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const report = await AIReport.findOne({
      where: { stock_symbol: symbol, report_type: type },
      order: [['generated_at', 'DESC']],
    });

    if (report && new Date(report.expires_at) > new Date()) {
      await setCache(CACHE_KEY, report, 600);  // 10분 캐시
      return success(res, report);
    }

    // 캐시 미스 → 비동기 생성 요청 (실제 생성은 reportService에서 처리)
    return success(res, null, '리포트를 생성 중입니다. 최대 30초 후 다시 조회해주세요.', 202);
  } catch (err) {
    console.error('[ai] getReport 오류:', err);
    return error(res);
  }
};

/**
 * POST /api/ai/report/:symbol/generate
 * AI 리포트 즉시 생성 (aiLimiter 적용)
 */
const generateReport = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { type = 'news_summary' } = req.body;

    // 순환 참조 방지를 위해 서비스는 런타임에 require
    const reportService = require('../services/ai/reportService');
    const report = await reportService.generate(symbol, type);

    return success(res, report, 'AI 리포트가 생성되었습니다.');
  } catch (err) {
    console.error('[ai] generateReport 오류:', err);
    return error(res, 'AI 리포트 생성 중 오류가 발생했습니다.');
  }
};

/**
 * GET /api/ai/sell-guide/:portfolioId
 * 기계적 매도 가이드 (분할 매도 시뮬레이션)
 */
const getSellGuide = async (req, res) => {
  try {
    const sellGuideService = require('../services/ai/sellGuideService');
    const guide = await sellGuideService.generate(req.params.portfolioId, req.user.id);
    return success(res, guide);
  } catch (err) {
    console.error('[ai] getSellGuide 오류:', err);
    return error(res);
  }
};

module.exports = { getWeather, getReport, generateReport, getSellGuide };
