import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setToken: (token) => {
        localStorage.setItem('auth_token', token);
        set({ token });
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem('auth_token');
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignorar errores de red al cerrar sesión.
        }
        localStorage.removeItem('auth_token');
        set({ user: null, token: null });
      },

      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.is_admin === true,
    }),
    { name: 'auth-store', partialize: (state) => ({ token: state.token }) }
  )
);
