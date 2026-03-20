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
