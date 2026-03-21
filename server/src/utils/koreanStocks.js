/**
 * 주요 한국 상장 종목 로컬 DB
 * Yahoo Finance 검색이 한국어 종목명을 찾지 못할 때 폴백으로 사용
 */
const KOREAN_STOCKS = [
  // ── KOSPI 대형주 ──────────────────────────────────────────
  { code: '005930', name: '삼성전자',        market: 'KOSPI',  aliases: ['삼성'] },
  { code: '000660', name: 'SK하이닉스',      market: 'KOSPI',  aliases: ['sk하이닉스', '하이닉스'] },
  { code: '373220', name: 'LG에너지솔루션',  market: 'KOSPI',  aliases: ['LG에너지', 'LGES'] },
  { code: '207940', name: '삼성바이오로직스',market: 'KOSPI',  aliases: ['삼바'] },
  { code: '005380', name: '현대차',          market: 'KOSPI',  aliases: ['현대자동차'] },
  { code: '000270', name: '기아',            market: 'KOSPI',  aliases: ['기아자동차', 'KIA'] },
  { code: '005490', name: 'POSCO홀딩스',     market: 'KOSPI',  aliases: ['포스코', 'posco'] },
  { code: '006400', name: '삼성SDI',         market: 'KOSPI',  aliases: ['SDI'] },
  { code: '051910', name: 'LG화학',          market: 'KOSPI',  aliases: ['LG화학'] },
  { code: '068270', name: '셀트리온',        market: 'KOSPI',  aliases: [] },
  { code: '105560', name: 'KB금융',          market: 'KOSPI',  aliases: ['KB'] },
  { code: '055550', name: '신한지주',        market: 'KOSPI',  aliases: ['신한'] },
  { code: '086790', name: '하나금융지주',    market: 'KOSPI',  aliases: ['하나금융', '하나'] },
  { code: '316140', name: '우리금융지주',    market: 'KOSPI',  aliases: ['우리금융', '우리은행'] },
  { code: '035720', name: '카카오',          market: 'KOSPI',  aliases: ['kakao'] },
  { code: '035420', name: 'NAVER',           market: 'KOSPI',  aliases: ['네이버', 'naver'] },
  { code: '017670', name: 'SK텔레콤',        market: 'KOSPI',  aliases: ['SKT', 'sk텔레콤', 'sk telecom'] },
  { code: '030200', name: 'KT',              market: 'KOSPI',  aliases: ['케이티'] },
  { code: '032640', name: 'LG유플러스',      market: 'KOSPI',  aliases: ['LGU+', 'LG U+'] },
  { code: '096770', name: 'SK이노베이션',    market: 'KOSPI',  aliases: ['SK이노'] },
  { code: '034730', name: 'SK',              market: 'KOSPI',  aliases: ['SK그룹'] },
  { code: '003550', name: 'LG',             market: 'KOSPI',  aliases: [] },
  { code: '066570', name: 'LG전자',          market: 'KOSPI',  aliases: [] },
  { code: '034220', name: 'LG디스플레이',    market: 'KOSPI',  aliases: ['LGD'] },
  { code: '011070', name: 'LG이노텍',        market: 'KOSPI',  aliases: [] },
  { code: '009150', name: '삼성전기',        market: 'KOSPI',  aliases: [] },
  { code: '028260', name: '삼성물산',        market: 'KOSPI',  aliases: [] },
  { code: '018260', name: '삼성SDS',         market: 'KOSPI',  aliases: [] },
  { code: '012330', name: '현대모비스',      market: 'KOSPI',  aliases: ['모비스'] },
  { code: '000720', name: '현대건설',        market: 'KOSPI',  aliases: [] },
  { code: '329180', name: '현대중공업',      market: 'KOSPI',  aliases: ['HD현대중공업'] },
  { code: '010140', name: '삼성중공업',      market: 'KOSPI',  aliases: [] },
  { code: '042660', name: '한화오션',        market: 'KOSPI',  aliases: ['대우조선해양'] },
  { code: '010620', name: '현대미포조선',    market: 'KOSPI',  aliases: [] },
  { code: '015760', name: '한국전력',        market: 'KOSPI',  aliases: ['한전', 'KEPCO'] },
  { code: '033780', name: 'KT&G',            market: 'KOSPI',  aliases: ['케이티앤지'] },
  { code: '010950', name: 'S-Oil',           market: 'KOSPI',  aliases: ['에스오일'] },
  { code: '078930', name: 'GS',              market: 'KOSPI',  aliases: ['GS홀딩스'] },
  { code: '009830', name: '한화솔루션',      market: 'KOSPI',  aliases: ['한화큐셀'] },
  { code: '012450', name: '한화에어로스페이스', market: 'KOSPI', aliases: ['한화에어로'] },
  { code: '047810', name: '한국항공우주',    market: 'KOSPI',  aliases: ['KAI'] },
  { code: '034020', name: '두산에너빌리티',  market: 'KOSPI',  aliases: ['두산중공업'] },
  { code: '241560', name: '두산밥캣',        market: 'KOSPI',  aliases: [] },
  { code: '003670', name: '포스코퓨처엠',    market: 'KOSPI',  aliases: ['포스코케미칼'] },
  { code: '010130', name: '고려아연',        market: 'KOSPI',  aliases: [] },
  { code: '323410', name: '카카오뱅크',      market: 'KOSPI',  aliases: [] },
  { code: '377300', name: '카카오페이',      market: 'KOSPI',  aliases: [] },
  { code: '259960', name: '크래프톤',        market: 'KOSPI',  aliases: ['PUBG'] },
  { code: '251270', name: '넷마블',          market: 'KOSPI',  aliases: [] },
  { code: '036570', name: '엔씨소프트',      market: 'KOSPI',  aliases: ['NC'] },
  { code: '352820', name: '하이브',          market: 'KOSPI',  aliases: ['빅히트'] },
  { code: '138040', name: '메리츠금융지주',  market: 'KOSPI',  aliases: ['메리츠'] },
  { code: '090430', name: '아모레퍼시픽',    market: 'KOSPI',  aliases: ['아모레'] },
  { code: '051900', name: 'LG생활건강',      market: 'KOSPI',  aliases: [] },
  { code: '097950', name: 'CJ제일제당',      market: 'KOSPI',  aliases: ['CJ'] },
  { code: '128940', name: '한미약품',        market: 'KOSPI',  aliases: [] },
  { code: '000100', name: '유한양행',        market: 'KOSPI',  aliases: [] },
  { code: '006280', name: '녹십자',          market: 'KOSPI',  aliases: ['GC녹십자'] },
  { code: '326030', name: 'SK바이오팜',      market: 'KOSPI',  aliases: [] },
  { code: '023530', name: '롯데쇼핑',        market: 'KOSPI',  aliases: ['롯데'] },
  { code: '139480', name: '이마트',          market: 'KOSPI',  aliases: [] },
  { code: '282330', name: 'BGF리테일',       market: 'KOSPI',  aliases: ['CU편의점'] },
  { code: '271560', name: '오리온',          market: 'KOSPI',  aliases: [] },
  { code: '004370', name: '농심',            market: 'KOSPI',  aliases: [] },
  { code: '000810', name: '삼성화재',        market: 'KOSPI',  aliases: [] },
  { code: '001450', name: '현대해상',        market: 'KOSPI',  aliases: [] },
  { code: '185750', name: '종근당',          market: 'KOSPI',  aliases: [] },
  { code: '011170', name: '롯데케미칼',      market: 'KOSPI',  aliases: [] },
  { code: '010060', name: 'OCI홀딩스',       market: 'KOSPI',  aliases: ['OCI'] },
  { code: '000150', name: '두산',            market: 'KOSPI',  aliases: [] },
  { code: '004170', name: '신세계',          market: 'KOSPI',  aliases: [] },
  { code: '069960', name: '현대백화점',      market: 'KOSPI',  aliases: [] },
  { code: '180640', name: '한진칼',          market: 'KOSPI',  aliases: ['대한항공지주'] },
  { code: '003490', name: '대한항공',        market: 'KOSPI',  aliases: ['KAL'] },
  { code: '020560', name: '아시아나항공',    market: 'KOSPI',  aliases: [] },
  { code: '036460', name: '한국가스공사',    market: 'KOSPI',  aliases: ['가스공사'] },
  { code: '002380', name: 'KCC',             market: 'KOSPI',  aliases: [] },
  { code: '024110', name: '기업은행',        market: 'KOSPI',  aliases: ['IBK'] },
  { code: '000080', name: '하이트진로',      market: 'KOSPI',  aliases: ['진로'] },
  { code: '103140', name: '풍산',            market: 'KOSPI',  aliases: [] },

  // ── KOSDAQ 주요 종목 ──────────────────────────────────────
  { code: '247540', name: '에코프로비엠',    market: 'KOSDAQ', aliases: ['에코프로BM'] },
  { code: '086520', name: '에코프로',        market: 'KOSDAQ', aliases: [] },
  { code: '263750', name: '펄어비스',        market: 'KOSDAQ', aliases: [] },
  { code: '035900', name: 'JYP엔터',         market: 'KOSDAQ', aliases: ['JYP'] },
  { code: '041510', name: 'SM엔터테인먼트',  market: 'KOSDAQ', aliases: ['SM', 'SM엔터'] },
  { code: '122870', name: 'YG엔터테인먼트',  market: 'KOSDAQ', aliases: ['YG'] },
  { code: '091990', name: '셀트리온헬스케어',market: 'KOSDAQ', aliases: [] },
  { code: '196170', name: '알테오젠',        market: 'KOSDAQ', aliases: [] },
  { code: '214150', name: '클래시스',        market: 'KOSDAQ', aliases: [] },
  { code: '112040', name: '위메이드',        market: 'KOSDAQ', aliases: [] },
  { code: '293490', name: '카카오게임즈',    market: 'KOSDAQ', aliases: [] },
  { code: '357780', name: '솔브레인',        market: 'KOSDAQ', aliases: [] },
  { code: '131370', name: '나이스정보통신',  market: 'KOSDAQ', aliases: [] },
  { code: '039030', name: 'iClick',          market: 'KOSDAQ', aliases: [] },
  { code: '069620', name: '대웅제약',        market: 'KOSDAQ', aliases: ['대웅'] },
  { code: '145020', name: '휴젤',            market: 'KOSDAQ', aliases: [] },
  { code: '011040', name: 'CJ케이엑스',      market: 'KOSDAQ', aliases: [] },
  { code: '060310', name: '3S',              market: 'KOSDAQ', aliases: [] },
  { code: '039200', name: '오스코텍',        market: 'KOSDAQ', aliases: [] },
  { code: '236200', name: '슈프리마',        market: 'KOSDAQ', aliases: [] },
];

/**
 * 한국 종목 검색 (한국어 이름 / 종목코드 / 별칭 지원)
 * @param {string} query
 * @returns {Array<{symbol, yahooSymbol, name, market}>}
 */
const searchKoreanStocks = (query) => {
  const q = query.trim().toLowerCase().replace(/\s+/g, '');
  if (!q) return [];

  const matched = KOREAN_STOCKS.filter(({ code, name, aliases }) => {
    const normalName = name.toLowerCase().replace(/\s+/g, '');
    const normalCode = code.toLowerCase();
    const normalAliases = aliases.map((a) => a.toLowerCase().replace(/\s+/g, ''));
    return (
      normalName.includes(q) ||
      normalCode.includes(q) ||
      normalAliases.some((a) => a.includes(q))
    );
  });

  return matched.slice(0, 8).map(({ code, name, market }) => ({
    symbol:      code,
    yahooSymbol: `${code}.${market === 'KOSPI' ? 'KS' : 'KQ'}`,
    name,
    market,
    exchange:    market === 'KOSPI' ? 'KSC' : 'KOE',
  }));
};

module.exports = { searchKoreanStocks };
