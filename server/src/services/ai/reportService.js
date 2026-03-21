const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../../config/env');
const { AIReport } = require('../../models');
const { setCache, KEYS, TTL } = require('../cache/cacheService');
const { buildNewsContext } = require('./newsService');

const genAI = new GoogleGenerativeAI(env.gemini.apiKey);

const REPORT_TTL_HOURS = 4;

/**
 * AI 3줄 요약 리포트 생성
 * @param {string} symbol - 종목 코드 (예: '005930', 'AAPL')
 * @param {'news_summary'|'sell_guide'|'sector_outlook'} type
 */
const generate = async (symbol, type = 'news_summary') => {
  const newsContext = await buildNewsContext(symbol);

  // Gemini에서는 System Prompt를 모델 생성 시나 개별 요청에 포함할 수 있습니다.
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
당신은 개인 투자자를 위한 AI 주식 분석 어시스턴트입니다.
초보 투자자도 이해할 수 있도록 쉽고 명확한 언어를 사용하며,
감정적 판단 대신 데이터 기반의 객관적 분석을 제공합니다.

종목코드: ${symbol}
분석 타입: ${type}
뉴스 컨텍스트: ${newsContext}

다음 JSON 소스 코드만 응답하세요(다른 설명 없이):
{
  "one_liner": "한 줄 시황 요약 (30자 이내)",
  "full_text": "3줄 요약 전문 (각 줄 구분자: \\n)",
  "positives": ["호재 요인 1", "호재 요인 2"],
  "negatives": ["악재 요인 1"],
  "confidence": 75
}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();

  let parsed;
  try {
    // ```json 으로 감싸진 경우 제거
    const cleanText = rawText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleanText);
  } catch (err) {
    console.error('[Gemini] 파싱 실패:', rawText);
    throw new Error('AI 응답 파싱 실패');
  }

  const expiresAt = new Date(Date.now() + REPORT_TTL_HOURS * 60 * 60 * 1000);

  // 기존 리포트 삭제 후 재생성
  await AIReport.destroy({ where: { stock_symbol: symbol, report_type: type } });

  const report = await AIReport.create({
    stock_symbol: symbol,
    report_type: type,
    positives: parsed.positives || [],
    negatives: parsed.negatives || [],
    one_liner: parsed.one_liner,
    full_text: parsed.full_text,
    confidence: parsed.confidence,
    source_urls: [],
    generated_at: new Date(),
    expires_at: expiresAt,
  });

  // Redis 캐시 갱신
  const cacheKey = `report:${symbol}:${type}`;
  await setCache(cacheKey, report, TTL.REPORT);

  return report;
};

module.exports = { generate };
