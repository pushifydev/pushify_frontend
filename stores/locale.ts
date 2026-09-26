import { create } from 'zustand';
import { type SupportedLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES, loadLocale, isLocaleLoaded } from '@/lib/i18n';
import { safeStorage } from '@/lib/safe-storage';
import { LOCALE_COOKIE } from '@/lib/locale-request';

/**
 * The language, decided on the server.
 *
 * It used to be a `persist` store over localStorage. That cannot work for the first paint: the
 * server never sees localStorage, so it rendered English and the page switched to Turkish once
 * the store had rehydrated — visible on every reload. A cookie is readable while the page is
 * being rendered, so `middleware.ts` resolves the language and `app/layout.tsx` seeds this store
 * with the same value the HTML was built from. The first client render therefore matches the
 * server exactly and nothing changes under the reader.
 */

/** The key the old localStorage store used; read once, to carry a deliberate choice over. */
const LEGACY_KEY = 'pushify-locale';

interface LocaleState {
  locale: SupportedLocale;
  /** Bumped when a dictionary finishes loading so translated UI re-renders */
  dictVersion: number;
  setLocale: (locale: SupportedLocale) => void;
  toggleLocale: () => void;
}

function writeCookie(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  // A year, on every path, and not sent on cross-site requests — it is a display preference.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export const useLocaleStore = create<LocaleState>()((set, get) => ({
  locale: DEFAULT_LOCALE,
  dictVersion: 0,
  setLocale: (locale) => {
    if (get().locale === locale) return;
    set({ locale });
    writeCookie(locale);
    void loadLocale(locale).then(() => set({ dictVersion: get().dictVersion + 1 }));
  },
  toggleLocale: () => get().setLocale(get().locale === 'en' ? 'tr' : 'en'),
}));

/**
 * Called from the root layout with the language the HTML was rendered in, before anything is
 * drawn, so the store and the markup never disagree.
 */
export function seedLocale(locale: SupportedLocale): void {
  if (useLocaleStore.getState().locale !== locale) {
    useLocaleStore.setState({ locale });
  }
}

/**
 * One-off: visitors who picked a language before this moved to a cookie still have it in
 * localStorage. Adopt it, write the cookie so the server gets it from now on, and drop the old
 * key. This runs after hydration, so such a visitor sees one switch — once, ever.
 */
export function migrateLegacyLocale(): void {
  const raw = safeStorage.get(LEGACY_KEY);
  if (!raw) return;
  safeStorage.remove(LEGACY_KEY);

  try {
    const stored = JSON.parse(raw)?.state?.locale;
    if (SUPPORTED_LOCALES.includes(stored) && stored !== useLocaleStore.getState().locale) {
      useLocaleStore.getState().setLocale(stored);
    }
  } catch {
    /* unreadable leftover — the cookie already holds a usable value */
  }
}

/**
 * On the public site a Turkish visitor hydrates with the site's slice of the dictionary. Fetch the
 * rest once the page is up, so a move into the dashboard reads in Turkish from the first frame.
 */
export function completeDictionary(): void {
  const { locale } = useLocaleStore.getState();
  if (isLocaleLoaded(locale)) return;
  void loadLocale(locale).then(() =>
    useLocaleStore.setState({ dictVersion: useLocaleStore.getState().dictVersion + 1 })
  );
}
