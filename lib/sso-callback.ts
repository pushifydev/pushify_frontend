/** Credentials the backend's SSO redirect hands to /login/sso. */
export interface SsoCallbackParams {
  accessToken: string | null;
  refreshToken: string | null;
  twoFactorToken: string | null;
}

const SSO_KEYS = ['accessToken', 'refreshToken', 'twoFactorToken'] as const;

function toParams(raw: string, prefix: '#' | '?'): URLSearchParams {
  return new URLSearchParams(raw.startsWith(prefix) ? raw.slice(1) : raw);
}

/**
 * Reads the SSO credentials, preferring the fragment (never sent to the server, CDN or Referer)
 * and falling back to the query string for backends that still redirect with `?accessToken=…`.
 * The source is chosen as a whole so a token pair is never mixed from both places.
 */
export function readSsoCallbackParams(hash: string, search: string): SsoCallbackParams {
  const fromHash = toParams(hash, '#');
  const source = SSO_KEYS.some((key) => fromHash.get(key)) ? fromHash : toParams(search, '?');
  return {
    accessToken: source.get('accessToken'),
    refreshToken: source.get('refreshToken'),
    twoFactorToken: source.get('twoFactorToken'),
  };
}

/**
 * The same URL with every SSO credential removed from both query and fragment; unrelated
 * parameters are kept. Returns `null` when there was nothing to strip.
 */
export function stripSsoCallbackParams(pathname: string, search: string, hash: string): string | null {
  const query = toParams(search, '?');
  const fragment = toParams(hash, '#');
  let changed = false;
  for (const key of SSO_KEYS) {
    if (query.has(key)) {
      query.delete(key);
      changed = true;
    }
    if (fragment.has(key)) {
      fragment.delete(key);
      changed = true;
    }
  }
  if (!changed) return null;
  const q = query.toString();
  const f = fragment.toString();
  return `${pathname}${q ? `?${q}` : ''}${f ? `#${f}` : ''}`;
}
