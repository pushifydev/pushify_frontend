/** Credentials the backend's SSO redirect hands to /login/sso. */
export interface SsoCallbackParams {
  accessToken: string | null;
  refreshToken: string | null;
  twoFactorToken: string | null;
}

const SSO_KEYS = ['accessToken', 'refreshToken', 'twoFactorToken'] as const;

/** sessionStorage key holding when this tab sent the browser to the identity provider. */
export const SSO_PENDING_KEY = 'sso_pending';

/** How long a sign-in may take at the identity provider before its callback is refused. */
export const SSO_PENDING_MAX_AGE_MS = 10 * 60 * 1000;

/**
 * Login CSRF guard: credentials in the callback URL are only accepted when this tab started an
 * SSO sign-in recently (`startedAt` is the timestamp `rememberSsoStart` wrote). Without it the
 * link came from somewhere else — e.g. an attacker's own tokens — and must not become a session.
 */
export function isExpectedSsoCallback(startedAt: string | null, now: number): boolean {
  if (!startedAt || !/^\d+$/.test(startedAt)) return false;
  const age = now - Number(startedAt);
  return age >= 0 && age <= SSO_PENDING_MAX_AGE_MS;
}

/** Called right before the browser leaves for the identity provider. */
export function rememberSsoStart(now: number = Date.now()): void {
  try {
    sessionStorage.setItem(SSO_PENDING_KEY, String(now));
  } catch {
    /* storage unavailable: the callback is refused and the user is asked to try again */
  }
}

/** Reads and removes the start marker, so one sign-in admits exactly one callback. */
export function takeSsoStart(): string | null {
  try {
    const startedAt = sessionStorage.getItem(SSO_PENDING_KEY);
    sessionStorage.removeItem(SSO_PENDING_KEY);
    return startedAt;
  } catch {
    return null;
  }
}

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
