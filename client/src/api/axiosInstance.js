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
      // 스토어 초기화는 authStore에서 처리
      window.dispatchEvent(new Event('auth:logout'));
    } else if (status === 429) {
      toast.error(message || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    } else if (status >= 500) {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
