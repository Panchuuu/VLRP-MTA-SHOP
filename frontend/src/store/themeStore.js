import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: null, // null = auto (sigue al sistema)

      init: () => {
        const stored = get().theme;
        applyTheme(stored ?? getSystemTheme());

        // Escuchar cambios del sistema cuando está en auto
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (!get().theme) applyTheme(e.matches ? 'dark' : 'light');
          });
      },

      toggle: () => {
        const current = document.documentElement.classList.contains('dark')
          ? 'dark'
          : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },

      setAuto: () => {
        applyTheme(getSystemTheme());
        set({ theme: null });
      },

      isDark: () => document.documentElement.classList.contains('dark'),
    }),
    { name: 'vlrp-theme', partialize: (s) => ({ theme: s.theme }) }
  )
);
