import api from './axiosInstance';

export const getWatchlist = () =>
  api.get('/watchlist').then((r) => r.data.data.items);

export const addToWatchlist = (payload) =>
  api.post('/watchlist', payload).then((r) => r.data);

export const updateWatchlistItem = (id, payload) =>
  api.put(`/watchlist/${id}`, payload).then((r) => r.data);

export const removeFromWatchlist = (id) =>
  api.delete(`/watchlist/${id}`).then((r) => r.data);
