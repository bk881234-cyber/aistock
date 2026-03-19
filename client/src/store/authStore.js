import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '@/api/authApi';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await authApi.login(email, password);
          localStorage.setItem('aistock_token', data.token);
          set({ token: data.token, user: data.user, loading: false });
          toast.success(`안녕하세요, ${data.user.name}님!`);
          return true;
        } catch (err) {
          set({ loading: false });
          if (!err._toastShown) {
            toast.error(err.response?.data?.message || '로그인에 실패했습니다.');
          }
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await authApi.register(name, email, password);
          localStorage.setItem('aistock_token', data.token);
          set({ token: data.token, user: data.user, loading: false });
          toast.success('회원가입이 완료되었습니다!');
          return true;
        } catch (err) {
          set({ loading: false });
          if (!err._toastShown) {
            toast.error(err.response?.data?.message || err.message || '회원가입에 실패했습니다.');
          }
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('aistock_token');
        set({ token: null, user: null });
        toast('로그아웃되었습니다.', { icon: '👋' });
      },

      fetchMe: async () => {
        try {
          const { user } = await authApi.getMe();
          set({ user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'aistock_auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// 401 이벤트 → 자동 로그아웃
window.addEventListener('auth:logout', () => useAuthStore.getState().logout());
