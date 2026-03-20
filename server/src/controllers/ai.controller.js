const { AIReport, StockWeather } = require('../models');
const { getCache, setCache } = require('../config/redis');
const { success, error } = require('../utils/response');
const { buildNewsContext } = require('../services/ai/newsService');

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
    const env = require('../config/env');
    if (!env.gemini.apiKey) {
      return error(res, 'AI 기능을 사용하려면 Gemini API 키 설정이 필요합니다. Vercel 환경변수에 GEMINI_API_KEY를 추가해주세요.', 503);
    }
    const { symbol } = req.params;
    const { type = 'news_summary' } = req.body;
    const reportService = require('../services/ai/reportService');
    const report = await reportService.generate(symbol, type);
    return success(res, report, 'AI 리포트가 생성되었습니다.');
  } catch (err) {
    console.error('[ai] generateReport 오류:', err.message);
    return error(res, `AI 리포트 생성 중 오류가 발생했습니다: ${err.message}`);
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

/**
 * POST /api/ai/news-analysis
 * 가격 급등락 감지 시 뉴스를 수집해 호재/악재 3줄 요약 반환
 * body: { symbol, priceChangePct }
 *
 * - 캐시 30분 (동일 심볼 연속 요청 방지)
 * - priceChangePct는 컨텍스트로만 사용 (분석 품질 향상)
 */
const getNewsAnalysis = async (req, res) => {
  try {
    const { symbol, priceChangePct = 0 } = req.body;
    if (!symbol) return error(res, 'symbol이 필요합니다.', 400);

    const CACHE_KEY = `news-analysis:${symbol}`;
    const cached = await getCache(CACHE_KEY);
    if (cached) return success(res, cached);

    // 뉴스 수집
    const newsContext = await buildNewsContext(symbol);

    // Gemini 3줄 요약 생성
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const env = require('../config/env');
    const genAI = new GoogleGenerativeAI(env.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const direction = priceChangePct > 0 ? `+${priceChangePct.toFixed(1)}% 급등` : `${priceChangePct.toFixed(1)}% 급락`;

    const prompt = `
당신은 개인 투자자를 위한 AI 주식 분석가입니다.
종목이 오늘 ${direction} 했습니다.
아래 최신 뉴스를 분석하여 호재와 악재를 명확히 구분해주세요.

${newsContext}

반드시 아래 JSON 형식만 반환하세요 (마크다운 없이):
{
  "one_liner": "시황 한 줄 요약 (25자 이내, ${direction} 이유 포함)",
  "full_text": "1줄: 핵심 원인\\n2줄: 시장 반응\\n3줄: 투자자 유의사항",
  "positives": ["호재 요인 1 (20자 이내)", "호재 요인 2"],
  "negatives": ["악재 요인 1 (20자 이내)"],
  "confidence": 70
}
`.trim();

    const result   = await model.generateContent(prompt);
    const rawText  = result.response.text();
    const cleaned  = rawText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // JSON 파싱 실패 시 기본값
      parsed = {
        one_liner:  `${symbol} 분석 결과`,
        full_text:  `1. ${direction} 발생\n2. 뉴스 분석 중\n3. 신중한 판단 권고`,
        positives:  [],
        negatives:  [],
        confidence: 40,
      };
    }

    const payload = { symbol, priceChangePct, ...parsed, analyzedAt: new Date().toISOString() };
    await setCache(CACHE_KEY, payload, 1800); // 30분 캐시
    return success(res, payload, '뉴스 분석이 완료되었습니다.');
  } catch (err) {
    console.error('[ai] getNewsAnalysis 오류:', err.message);
    return error(res, 'AI 뉴스 분석 중 오류가 발생했습니다.');
  }
};

module.exports = { getWeather, getReport, generateReport, getSellGuide, getNewsAnalysis };
