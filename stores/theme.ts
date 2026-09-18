import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isHydrated: boolean;
  setTheme: (theme: Theme) => void;
  setHydrated: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      isHydrated: false,
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'pushify-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
          applyTheme(state.theme);
        }
      },
    }
  )
);

/** Resolve the preference to a class on <html>. Exported so AfterHydration can put the class back after a hydration recovery. */
export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', systemDark);
    root.classList.toggle('light', !systemDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme } = useThemeStore.getState();
    if (theme === 'system') {
      applyTheme('system');
    }
  });
}
