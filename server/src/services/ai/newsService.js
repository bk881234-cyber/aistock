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
    req.setTimeout(6000, () => req.destroy(new Error('timeout')));
  });

/**
 * 종목 뉴스 수집
 * @param {string} symbol  Yahoo Finance 심볼 (예: '005930.KS', 'AAPL')
 * @param {number} count   가져올 뉴스 수 (최대 10)
 * @returns {Array<{title:string, publisher:string, publishedAt:number}>}
 */
const fetchNews = async (symbol, count = 8) => {
  try {
    const url =
      `https://query1.finance.yahoo.com/v1/finance/search` +
      `?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=${count}&enableFuzzyQuery=false`;

    const data = await httpsGet(url);
    const rawNews = data?.finance?.result?.[0]?.news ?? [];

    return rawNews.map((n) => ({
      title:       n.title       || '',
      publisher:   n.publisher   || '',
      publishedAt: n.providerPublishTime || 0,
      link:        n.link        || '',
    })).filter((n) => n.title);
  } catch (err) {
    console.warn('[newsService] 뉴스 조회 실패:', err.message);
    return [];
  }
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
