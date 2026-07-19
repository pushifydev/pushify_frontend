const AUTH_REDIRECT_KEY = 'auth_post_login_redirect';

/** Auth pages must never be a post-login destination (redirect loops). */
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

/**
 * Central open-redirect guard: only same-origin relative paths survive.
 * Rejects absolute URLs, protocol-relative (`//evil.com`), backslash tricks,
 * embedded schemes, and auth pages themselves. Everything that consumes a
 * redirect target (query param, sessionStorage, guards) must go through this.
 */
export function sanitizeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = raw.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return null;
  if (path.includes('://') || path.includes('\\')) return null;
  const base = path.split(/[?#]/)[0];
  if (AUTH_PAGES.some((p) => base === p || base.startsWith(`${p}/`))) return null;
  return path;
}

/** `/login` or `/register` URL that carries the destination along. */
export function buildAuthPath(page: 'login' | 'register', redirect?: string | null): string {
  const safe = sanitizeRedirectPath(redirect);
  return safe ? `/${page}?redirect=${encodeURIComponent(safe)}` : `/${page}`;
}

/** Persist post-login path (must be same-origin relative path). */
export function saveAuthRedirect(path: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  const safe = sanitizeRedirectPath(path);
  if (!safe) return;
  sessionStorage.setItem(AUTH_REDIRECT_KEY, safe);
}

export function getAuthRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  return sanitizeRedirectPath(sessionStorage.getItem(AUTH_REDIRECT_KEY));
}

export function consumeAuthRedirect(fallback = '/dashboard'): string {
  const path = getAuthRedirect();
  if (path) {
    sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    return path;
  }
  return fallback;
}
