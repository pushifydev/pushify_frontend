import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type SupportedLocale, DEFAULT_LOCALE, detectBrowserLocale } from '@/lib/i18n';

interface LocaleState {
  locale: SupportedLocale;
  isHydrated: boolean;
  setLocale: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
  setHydrated: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      isHydrated: false,
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set({
          locale: get().locale === 'en' ? 'tr' : 'en',
        }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'pushify-locale',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Initialize with browser locale if no stored preference
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('pushify-locale');
  if (!stored) {
    const browserLocale = detectBrowserLocale();
    useLocaleStore.getState().setLocale(browserLocale);
  }
}
