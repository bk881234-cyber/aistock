import { create } from 'zustand';
import * as marketApi from '@/api/marketApi';

/**
 * 시장 데이터 전역 스토어
 * - 폴링 주기: 장중 30초 / 장외 3분
 * - 여러 컴포넌트가 구독해도 API 요청은 1회
 */
export const useMarketStore = create((set, get) => ({
  // ── 상태 ───────────────────────────────────────────────
  indices:     [],   // KOSPI, KOSDAQ, NASDAQ, SPX, VIX
  fx:          [],   // USD_KRW, EUR_KRW, ...
  commodities: [],   // GOLD_USD, SILVER_USD, OIL_USD
  lastUpdated: null,
  loading:     false,
  error:       null,
  pollingTimer: null,

  // ── 셀렉터 헬퍼 ────────────────────────────────────────
  getIndex: (symbol) => get().indices.find((i) => i.symbol === symbol),
  getFx:    (symbol) => get().fx.find((f) => f.symbol === symbol),
  getCommodity: (symbol) => get().commodities.find((c) => c.symbol === symbol),

  // ── 데이터 패치 ────────────────────────────────────────
  fetchOverview: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const data = await marketApi.getMarketOverview();
      set({
        indices:     data.indices     ?? [],
        fx:          data.fx          ?? [],
        commodities: data.commodities ?? [],
        lastUpdated: new Date(),
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // ── 폴링 시작 ──────────────────────────────────────────
  startPolling: (intervalMs = 30_000) => {
    const { pollingTimer, fetchOverview } = get();
    if (pollingTimer) return; // 이미 실행 중

    fetchOverview(); // 즉시 1회 실행

    const timer = setInterval(fetchOverview, intervalMs);
    set({ pollingTimer: timer });
  },

  // ── 폴링 중지 ──────────────────────────────────────────
  stopPolling: () => {
    const { pollingTimer } = get();
    if (pollingTimer) {
      clearInterval(pollingTimer);
      set({ pollingTimer: null });
    }
  },
}));
