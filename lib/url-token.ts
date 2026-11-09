/**
 * Query parameter that carries the one-time token of an emailed link (/reset-password,
 * /verify-email, /accept-invitation).
 */
export const URL_TOKEN_PARAM = 'token';

/**
 * The same URL with the emailed token removed from the query string; other parameters and the
 * fragment are kept. Returns `null` when there was nothing to strip.
 */
export function stripUrlToken(pathname: string, search: string, hash: string): string | null {
  const query = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  if (!query.has(URL_TOKEN_PARAM)) return null;
  query.delete(URL_TOKEN_PARAM);
  const q = query.toString();
  return `${pathname}${q ? `?${q}` : ''}${hash}`;
}

/**
 * Removes the token from the address bar so it doesn't linger in the URL that analytics,
 * history and Referer headers see. Read the token into state *before* calling this:
 * `useSearchParams()` follows the new URL and returns `null` for it afterwards.
 */
export function scrubUrlToken(): void {
  if (typeof window === 'undefined') return;
  const { pathname, search, hash } = window.location;
  const clean = stripUrlToken(pathname, search, hash);
  if (clean !== null) window.history.replaceState(window.history.state, '', clean);
}
