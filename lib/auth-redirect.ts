const AUTH_REDIRECT_KEY = 'auth_post_login_redirect';

/** Persist post-login path (must be same-origin relative path). */
export function saveAuthRedirect(path: string | null | undefined): void {
  if (typeof window === 'undefined' || !path) return;
  if (!path.startsWith('/') || path.startsWith('//')) return;
  sessionStorage.setItem(AUTH_REDIRECT_KEY, path);
}

export function getAuthRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(AUTH_REDIRECT_KEY);
}

export function consumeAuthRedirect(fallback = '/dashboard'): string {
  const path = getAuthRedirect();
  if (path) {
    sessionStorage.removeItem(AUTH_REDIRECT_KEY);
    return path;
  }
  return fallback;
}
