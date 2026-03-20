import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── 요청 인터셉터: JWT 자동 첨부 ─────────────────────────
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('aistock_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 응답 인터셉터: 에러 공통 처리 ────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      localStorage.removeItem('aistock_token');
      window.dispatchEvent(new Event('auth:logout'));
    } else if (status === 429) {
      toast.error(message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      error._toastShown = true;
    } else if (status >= 500) {
      // 백그라운드 폴링 엔드포인트는 에러 토스트 없이 무시
      const url = error.config?.url || '';
      const isSilent = ['/alerts', '/market', '/portfolio', '/watchlist', '/ai/weather'].some(
        (ep) => url.includes(ep)
      );
      if (!isSilent) {
        toast.error(message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      error._toastShown = true;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
