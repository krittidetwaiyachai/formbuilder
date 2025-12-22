import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password });
          const { access_token, user } = response.data;
          localStorage.setItem('token', access_token);
          set({ token: access_token, user, isAuthenticated: true });
        } catch (error: any) {
          if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
            throw new Error('Cannot connect to server. Please make sure backend is running on http://localhost:3000');
          }
          throw error;
        }
      },
      register: async (email: string, password: string, firstName?: string, lastName?: string) => {
        try {
          const response = await api.post('/auth/register', { email, password, firstName, lastName });
          const { access_token, user } = response.data;
          localStorage.setItem('token', access_token);
          set({ token: access_token, user, isAuthenticated: true });
        } catch (error: any) {
          if (error.code === 'ERR_NETWORK' || error.message?.includes('ECONNREFUSED')) {
            throw new Error('Cannot connect to server. Please make sure backend is running on http://localhost:3000');
          }
          throw error;
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user: User) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

