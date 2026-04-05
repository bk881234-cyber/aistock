import api from './axiosInstance';

/**
 * 대시보드용 전체 매크로 데이터 (지수 + 환율 + 원자재)
 */
export const getMarketOverview = () =>
  api.get('/market/overview').then((r) => r.data.data);

/**
 * 지수만 (티커 컴포넌트용)
 */
export const getIndices = () =>
  api.get('/market/indices').then((r) => r.data.data);

/**
 * 환율 데이터 (스파크라인 포함)
 */
export const getFx = () =>
  api.get('/market/fx').then((r) => r.data.data);

/**
 * 원자재 (게이지 차트용 gauge_position 포함)
 */
export const getCommodities = () =>
  api.get('/market/commodities').then((r) => r.data.data);

/**
 * 종목 검색 자동완성 (BuyModal, WatchlistInline 용)
 * @param {string} q - 검색어 (종목명 or 코드)
 */
export const searchStock = (q) =>
  api.get('/market/search', { params: { q } }).then((r) => r.data.data);

/**
 * 지수/원자재 차트 스파크라인 (일/주/월/년)
 * @param {string} symbol - 'KOSPI' | 'NASDAQ' | 'GOLD_USD' | ...
 * @param {string} range  - '1d' | '5d' | '1mo' | '1y'
 */
export const getIndexChart = (symbol, range = '1d') =>
  api.get(`/market/chart/${symbol}`, { params: { range } }).then((r) => r.data.data);

/**
 * 종목 상세 — 현재가 + OHLCV 캔들 (3개월 기본)
 * @param {string} symbol - '005930' | 'AAPL' | ...
 * @param {string} market - 'KOSPI' | 'KOSDAQ' | 'US' | (생략 가능)
 * @param {string} range  - '1mo' | '3mo' | '6mo' | '1y' | '5y'
 */
export const getStockDetail = (symbol, market, range = '3mo') =>
  api.get(`/market/stock/${symbol}`, { params: { market, range } }).then((r) => r.data.data);

/**
 * 현재가만 반환 — 포트폴리오 실시간 폴링용 (경량, TTL 30초)
 * @param {string} symbol - '005930' | 'AAPL' | ...
 * @param {string} market - 'KOSPI' | 'KOSDAQ' | 'US' | (생략 가능)
 */
export const getStockPrice = (symbol, market) =>
  api.get(`/market/price/${symbol}`, { params: { market } }).then((r) => r.data.data);

/**
 * Yahoo Finance 강제 갱신 — Redis+DB 캐시 무효화 후 재수집 (인증 필요)
 */
export const forceMarketRefresh = () =>
  api.post('/market/refresh').then((r) => r.data);
