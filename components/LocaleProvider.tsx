'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, type SupportedLocale } from '@/lib/i18n';
import { seedLocale, useLocaleStore } from '@/stores/locale';

/**
 * The language, carried down the tree rather than read from the store.
 *
 * The store cannot do this job on the server. Zustand v5 serves `getInitialState()` as the server
 * snapshot, so every `useLocaleStore(...)` during SSR answers with the state the store was created
 * with — 'en' — no matter what was written into it for this request. The page therefore rendered
 * in English however carefully the server had worked out the visitor's language, and the text
 * switched once the browser took over.
 *
 * Context is per render, so it survives the trip: the server passes the language it rendered in,
 * the first client render starts from the same value, and a later switch arrives through the
 * subscription below.
 */

const LocaleContext = createContext<SupportedLocale>(DEFAULT_LOCALE);

/** The language the surrounding page is being rendered in. */
export const useLocale = (): SupportedLocale => useContext(LocaleContext);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: SupportedLocale;
  children: ReactNode;
}) {
  // Written during render, not in an effect: code outside React (API clients, the dictionary
  // loader) reads the store directly, and it should be right from the first moment.
  seedLocale(initialLocale);

  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);

  useEffect(() => {
    // The switcher writes to the store; follow it from here so the tree re-renders.
    setLocale(useLocaleStore.getState().locale);
    return useLocaleStore.subscribe((state) => setLocale(state.locale));
  }, []);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
