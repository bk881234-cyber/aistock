/**
 * 뉴스 수집 서비스
 * Yahoo Finance Search API에서 종목 관련 뉴스를 가져와 텍스트로 변환
 */
const https = require('https');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const httpsGet = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('timeout')));
  });

/** Yahoo Finance 응답에서 뉴스 배열 추출 (API 버전별 경로 대응) */
const extractNews = (data) => {
  // 최신 포맷: { news: [...], quotes: [...] }
  if (Array.isArray(data?.news)) return data.news;
  // 구 포맷: { finance: { result: [{ news: [...] }] } }
  if (Array.isArray(data?.finance?.result?.[0]?.news)) return data.finance.result[0].news;
  // 구 포맷 v2: { finance: { result: { news: [...] } } }
  if (Array.isArray(data?.finance?.result?.news)) return data.finance.result.news;
  return [];
};

/**
 * 종목 뉴스 수집
 * @param {string} symbol  Yahoo Finance 심볼 (예: '005930.KS', 'AAPL')
 * @param {number} count   가져올 뉴스 수 (최대 10)
 * @returns {Array<{title:string, publisher:string, publishedAt:number, link:string}>}
 */
const fetchNews = async (symbol, count = 8) => {
  const makeUrl = (host, q) =>
    `https://${host}/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=0&newsCount=${count}&enableFuzzyQuery=false&lang=ko-KR`;

  const toItems = (rawNews) =>
    rawNews
      .map((n) => ({
        title:       n.title       || '',
        publisher:   n.publisher   || '',
        publishedAt: n.providerPublishTime || 0,
        link:        n.link        || '',
      }))
      .filter((n) => n.title);

  // 1차: query1으로 심볼 검색
  try {
    const data = await httpsGet(makeUrl('query1.finance.yahoo.com', symbol));
    const items = toItems(extractNews(data));
    if (items.length) return items;
  } catch { /* 다음 시도 */ }

  // 2차: query2 fallback
  try {
    const data = await httpsGet(makeUrl('query2.finance.yahoo.com', symbol));
    const items = toItems(extractNews(data));
    if (items.length) return items;
  } catch { /* 다음 시도 */ }

  // 3차: 한국 종목(6자리)이면 회사명으로 재검색
  if (/^\d{6}(\.KS|\.KQ)?$/.test(symbol)) {
    try {
      const code = symbol.replace(/\.(KS|KQ)$/, '');
      const { searchKoreanStocks } = require('../../utils/koreanStocks');
      const found = searchKoreanStocks(code);
      if (found.length) {
        const data = await httpsGet(makeUrl('query1.finance.yahoo.com', found[0].name));
        const items = toItems(extractNews(data));
        if (items.length) return items;
      }
    } catch { /* 무시 */ }
  }

  return [];
};

/**
 * 뉴스 목록 → AI 프롬프트용 컨텍스트 문자열
 * @param {string} symbol
 * @returns {string}
 */
const buildNewsContext = async (symbol) => {
  // Yahoo Finance 심볼 변환 (내부 코드 → Yahoo 심볼)
  const yahooSym = /^\d{6}$/.test(symbol) ? `${symbol}.KS` : symbol;
  const news = await fetchNews(yahooSym, 8);

  if (!news.length) {
    return `${symbol} 종목에 대한 최근 뉴스를 찾을 수 없습니다. 일반적인 시장 상황과 종목의 기본적 분석을 바탕으로 분석해주세요.`;
  }

  const now = Date.now() / 1000;
  const lines = news.map((n, i) => {
    const hoursAgo = Math.round((now - n.publishedAt) / 3600);
    const timeLabel = hoursAgo < 1 ? '방금 전' : hoursAgo < 24 ? `${hoursAgo}시간 전` : `${Math.round(hoursAgo / 24)}일 전`;
    return `${i + 1}. [${n.publisher} / ${timeLabel}] ${n.title}${n.link ? ` (${n.link})` : ''}`;
  });

  return `${symbol} 종목 최근 뉴스 ${news.length}건:\n${lines.join('\n')}`;
};

module.exports = { fetchNews, buildNewsContext };
