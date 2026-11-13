/** Query value that makes Settings → Security explain why the user was sent there. */
export const ORG_2FA_REASON = 'org-2fa';

const SETTINGS_PATH = '/dashboard/settings';

/** Settings → Security (the 2FA setup) with the "your organization requires 2FA" note. */
export const ORG_2FA_SETUP_PATH = `${SETTINGS_PATH}?tab=security&reason=${ORG_2FA_REASON}`;

/**
 * Where to send the user after an API request was refused with ORG_2FA_REQUIRED, or null
 * to stay put. Null on the 2FA setup page itself: other requests made there (sidebar,
 * header, org data) keep failing with the same code until 2FA is on, and redirecting
 * again on each of them would loop.
 */
export function orgTwoFactorRedirectTarget(pathname: string, search: string): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path === SETTINGS_PATH && new URLSearchParams(search).get('tab') === 'security') {
    return null;
  }
  return ORG_2FA_SETUP_PATH;
}
