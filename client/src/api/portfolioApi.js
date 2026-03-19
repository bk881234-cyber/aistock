import api from './axiosInstance';

export const getPortfolio = () =>
  api.get('/portfolio').then((r) => r.data.data.portfolios);

export const buyStock = (payload) =>
  api.post('/portfolio/buy', payload).then((r) => r.data);

export const sellStock = (payload) =>
  api.post('/portfolio/sell', payload).then((r) => r.data);

export const updatePortfolioSettings = (id, payload) =>
  api.put(`/portfolio/${id}/settings`, payload).then((r) => r.data);

export const getTransactions = (portfolioId) =>
  api.get(`/portfolio/${portfolioId}/transactions`).then((r) => r.data.data.transactions);
