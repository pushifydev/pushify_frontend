/**
 * localStorage that never throws. Safari private mode, "block all cookies",
 * storage quota and SSR all make the raw API throw — and a throw during OAuth
 * start or store init takes the whole page down with it.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — feature degrades, page keeps working */
    }
  },
  remove(key: string): void {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
