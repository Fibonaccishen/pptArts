import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

interface AuthState {
  token: string | null;
  user: { id: number; username: string } | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.login(username, password);
          set({ token: result.token, user: result.user, isLoading: false });
        } catch (err: any) {
          const msg = err.response?.data?.error?.message || '登录失败';
          set({ error: msg, isLoading: false });
          throw new Error(msg);
        }
      },

      logout: () => {
        set({ token: null, user: null, error: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'pptarts-auth' },
  ),
);
