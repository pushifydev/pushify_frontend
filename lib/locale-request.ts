import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from './i18n';

/**
 * Where the language comes from on a request.
 *
 * Kept out of middleware.ts so the root layout can import the names without dragging
 * `next/server` along, and so the parsing below is reachable from the unit tests.
 */

export const LOCALE_COOKIE = 'pushify-lang';
export const LOCALE_HEADER = 'x-pushify-locale';
/** The request path, passed to the root layout (which has no other way to know it). */
export const PATH_HEADER = 'x-pushify-path';

export const isSupportedLocale = (value: string | null | undefined): value is SupportedLocale =>
  !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);

/**
 * Pick a language out of an Accept-Language header.
 *
 * Highest q-value first, and a region is ignored — `tr-TR` is Turkish. Only used on a first
 * visit; after that the cookie carries whatever the visitor last saw or chose.
 */
export function localeFromAcceptLanguage(header: string | null | undefined): SupportedLocale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const parsed = q ? Number.parseFloat(q.split('=')[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(parsed) ? parsed : 0 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isSupportedLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
