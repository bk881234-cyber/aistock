import { create } from 'zustand';
import api from '@/api/axiosInstance';

export const useAlertStore = create((set, get) => ({
  alerts:  [],
  history: [],
  unreadCount: 0,

  fetchAlerts: async () => {
    try {
      const { data } = await api.get('/alerts');
      set({ alerts: data.data.alerts });
    } catch { /* 무시 */ }
  },

  fetchHistory: async () => {
    try {
      const { data } = await api.get('/alerts/history');
      const history = data.data.history;
      set({
        history,
        unreadCount: history.filter((h) => !h.is_read).length,
      });
    } catch { /* 무시 */ }
  },

  markAllRead: async () => {
    try {
      await api.patch('/alerts/history/read-all');
      set({ unreadCount: 0, history: get().history.map((h) => ({ ...h, is_read: true })) });
    } catch { /* 무시 */ }
  },
}));
