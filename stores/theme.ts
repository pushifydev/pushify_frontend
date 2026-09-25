import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isMarketingPath } from '@/lib/marketing-routes';

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
      // Pushify opens dark; light and 'follow my OS' are there for whoever chooses them.
      theme: 'dark',
      isHydrated: false,
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'pushify-theme',
      // v0 defaulted to 'system', so nearly every stored 'system' is a default nobody chose.
      // Moving those to the new default once is what makes the product open dark for existing
      // visitors too; a 'system' picked after this (v1) is a real choice and is kept.
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { theme?: Theme } | undefined;
        if (version < 1 && state?.theme === 'system') return { ...state, theme: 'dark' as Theme };
        return state as ThemeState;
      },
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

  // The public site is dark-only for now; the preference applies to the product.
  const dark = isMarketingPath(window.location.pathname)
    ? true
    : theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme === 'dark';
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);
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
