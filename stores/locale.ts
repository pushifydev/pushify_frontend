import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type SupportedLocale, DEFAULT_LOCALE, detectBrowserLocale, loadLocale } from '@/lib/i18n';
import { safeStorage } from '@/lib/safe-storage';

interface LocaleState {
  locale: SupportedLocale;
  isHydrated: boolean;
  /** Bumped when a lazy dictionary finishes loading so translated UI re-renders */
  dictVersion: number;
  setLocale: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
  setHydrated: () => void;
}

function ensureDictionary(locale: SupportedLocale, bump: () => void): void {
  void loadLocale(locale).then(bump);
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      isHydrated: false,
      dictVersion: 0,
      setLocale: (locale) => {
        set({ locale });
        ensureDictionary(locale, () => set({ dictVersion: get().dictVersion + 1 }));
      },
      toggleLocale: () => {
        const locale: SupportedLocale = get().locale === 'en' ? 'tr' : 'en';
        set({ locale });
        ensureDictionary(locale, () => set({ dictVersion: get().dictVersion + 1 }));
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'pushify-locale',
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // Stored locale may be tr — fetch its dictionary before first tr render
        if (state) {
          ensureDictionary(state.locale, () =>
            useLocaleStore.setState((s) => ({ dictVersion: s.dictVersion + 1 }))
          );
        }
      },
    }
  )
);

// Initialize with browser locale if no stored preference
if (typeof window !== 'undefined') {
  const stored = safeStorage.get('pushify-locale');
  if (!stored) {
    const browserLocale = detectBrowserLocale();
    useLocaleStore.getState().setLocale(browserLocale);
  }
}
