import { create } from 'zustand';
import * as portfolioApi from '@/api/portfolioApi';
import toast from 'react-hot-toast';

export const usePortfolioStore = create((set, get) => ({
  portfolios: [],
  loading:    false,
  error:      null,

  // ── 전체 조회 ──────────────────────────────────────────
  fetchPortfolio: async () => {
    set({ loading: true });
    try {
      const portfolios = await portfolioApi.getPortfolio();
      set({ portfolios, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ── 매수 ───────────────────────────────────────────────
  buy: async (payload) => {
    try {
      await portfolioApi.buyStock(payload);
      toast.success(`${payload.stock_name} 매수 처리 완료`);
      await get().fetchPortfolio();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || '매수 처리에 실패했습니다.');
      return false;
    }
  },

  // ── 매도 ───────────────────────────────────────────────
  sell: async (payload) => {
    try {
      const res = await portfolioApi.sellStock(payload);
      const gain = Number(res.data?.realized_gain ?? 0);
      const msg = gain >= 0
        ? `수익 실현: +${Number(gain).toLocaleString()}원`
        : `손실 확정: ${Number(gain).toLocaleString()}원`;
      toast(msg, { icon: gain >= 0 ? '📈' : '📉' });
      await get().fetchPortfolio();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || '매도 처리에 실패했습니다.');
      return false;
    }
  },

  // ── 설정 업데이트 (목표가/손절가/트레일링) ─────────────
  updateSettings: async (id, payload) => {
    try {
      await portfolioApi.updatePortfolioSettings(id, payload);
      toast.success('설정이 저장되었습니다.');
      await get().fetchPortfolio();
      return true;
    } catch (err) {
      toast.error('설정 저장에 실패했습니다.');
      return false;
    }
  },

  // ── 현재가 기반 수익률 계산 헬퍼 ──────────────────────
  calcReturnPct: (portfolio, currentPrice) => {
    const avg = parseFloat(portfolio.avg_buy_price);
    if (!avg || !currentPrice) return null;
    return ((currentPrice - avg) / avg) * 100;
  },
}));
