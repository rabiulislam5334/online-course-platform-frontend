import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User { id: number; full_name: string; email: string; role: string; status: string; }
interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { accessToken, refreshToken, user } = data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.response?.data?.message || 'Login failed');
        }
      },
      logout: async () => {
        try {
          const rt = localStorage.getItem('refreshToken');
          if (rt) await api.post('/auth/logout', { refreshToken: rt });
        } catch {}
        localStorage.clear();
        set({ user: null });
      },
    }),
    { name: 'auth', partialize: (s) => ({ user: s.user }) }
  )
);
