const { AIReport, StockWeather } = require('../models');
const { getCache, setCache } = require('../config/redis');
const { success, error } = require('../utils/response');

/**
 * GET /api/ai/weather/:symbol
 * 종목 날씨 조회 — 에러 시 null 반환 (프론트 WeatherWidget이 각 행마다 호출하므로 500 방지)
 */
const getWeather = async (req, res) => {
  try {
    const { symbol } = req.params;
    const CACHE_KEY = `weather:${symbol}`;
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    const weather = await StockWeather.findOne({ where: { stock_symbol: symbol } });

    if (!weather || new Date(weather.expires_at) < new Date()) {
      return success(res, null);  // 분석 중 → WeatherWidget이 "—" 표시
    }

    const plain = {
      weather:       weather.weather,
      weather_score: weather.weather_score,
      rsi_14:        weather.rsi_14        ? parseFloat(weather.rsi_14) : null,
      macd_signal:   weather.macd_signal,
      bb_position:   weather.bb_position,
      volume_ratio:  weather.volume_ratio  ? parseFloat(weather.volume_ratio) : null,
      moving_avg_pos: weather.moving_avg_pos,
      analyzed_at:   weather.analyzed_at,
    };

    await setCache(CACHE_KEY, plain, 300);
    return success(res, plain);
  } catch (err) {
    console.error('[ai] getWeather 오류:', err.message);
    return success(res, null);   // 500 대신 null 반환 → 에러 토스트 방지
  }
};

/**
 * GET /api/ai/report/:symbol
 * AI 리포트 조회
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
      await setCache(CACHE_KEY, report, 600);
      return success(res, report);
    }

    return success(res, null, '리포트를 생성 중입니다.', 202);
  } catch (err) {
    console.error('[ai] getReport 오류:', err.message);
    return success(res, null);   // 500 방지
  }
};

/**
 * POST /api/ai/report/:symbol/generate
 */
const generateReport = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { type = 'news_summary' } = req.body;
    const reportService = require('../services/ai/reportService');
    const report = await reportService.generate(symbol, type);
    return success(res, report, 'AI 리포트가 생성되었습니다.');
  } catch (err) {
    console.error('[ai] generateReport 오류:', err.message);
    return error(res, 'AI 리포트 생성 중 오류가 발생했습니다.');
  }
};

/**
 * GET /api/ai/sell-guide/:portfolioId
 */
const getSellGuide = async (req, res) => {
  try {
    const sellGuideService = require('../services/ai/sellGuideService');
    const guide = await sellGuideService.generate(req.params.portfolioId, req.user.id);
    return success(res, guide);
  } catch (err) {
    console.error('[ai] getSellGuide 오류:', err.message);
    return success(res, null);   // 500 방지
  }
};

module.exports = { getWeather, getReport, generateReport, getSellGuide };
