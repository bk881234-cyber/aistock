const Anthropic = require('@anthropic-ai/sdk');
const env = require('../../config/env');
const { AIReport } = require('../../models');
const { setCache, KEYS, TTL } = require('../cache/cacheService');

const client = new Anthropic({ apiKey: env.anthropic.apiKey });

const REPORT_TTL_HOURS = 4;

/**
 * 종목 뉴스 수집 (스텁 - 2단계에서 실제 뉴스 API 연동)
 * @param {string} symbol
 * @returns {string} 뉴스 컨텍스트 문자열
 */
const fetchNewsContext = async (symbol) => {
  // TODO: 2단계에서 Yahoo Finance / Google News API 연동
  return `${symbol} 관련 최근 뉴스를 분석해주세요.`;
};

/**
 * AI 3줄 요약 리포트 생성
 * @param {string} symbol - 종목 코드 (예: '005930', 'AAPL')
 * @param {'news_summary'|'sell_guide'|'sector_outlook'} type
 */
const generate = async (symbol, type = 'news_summary') => {
  const newsContext = await fetchNewsContext(symbol);

  const systemPrompt = `당신은 개인 투자자를 위한 AI 주식 분석 어시스턴트입니다.
초보 투자자도 이해할 수 있도록 쉽고 명확한 언어를 사용하며,
감정적 판단 대신 데이터 기반의 객관적 분석을 제공합니다.
반드시 JSON 형식으로만 응답하세요.`;

  const userPrompt = `종목코드: ${symbol}
분석 타입: ${type}
뉴스 컨텍스트: ${newsContext}

다음 JSON 형식으로 정확히 응답해주세요:
{
  "one_liner": "한 줄 시황 요약 (30자 이내)",
  "full_text": "3줄 요약 전문 (각 줄 구분자: \\n)",
  "positives": ["호재 요인 1", "호재 요인 2"],
  "negatives": ["악재 요인 1"],
  "confidence": 75
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  let parsed;
  try {
    const rawText = message.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
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
