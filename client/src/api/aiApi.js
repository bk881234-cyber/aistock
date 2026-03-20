import api from './axiosInstance';

export const getWeather = (symbol) =>
  api.get(`/ai/weather/${symbol}`).then((r) => r.data.data);

export const getReport = (symbol, type = 'news_summary') =>
  api.get(`/ai/report/${symbol}`, { params: { type } }).then((r) => r.data.data);

export const generateReport = (symbol, type = 'news_summary') =>
  api.post(`/ai/report/${symbol}/generate`, { type }).then((r) => r.data.data);

export const getSellGuide = (portfolioId) =>
  api.get(`/ai/sell-guide/${portfolioId}`).then((r) => r.data.data);

export const getNewsAnalysis = (symbol, priceChangePct = 0) =>
  api.post('/ai/news-analysis', { symbol, priceChangePct }).then((r) => r.data.data);
