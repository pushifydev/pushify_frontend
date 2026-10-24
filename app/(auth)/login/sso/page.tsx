'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, setTokens } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { consumeAuthRedirect, sanitizeRedirectPath } from '@/lib/auth-redirect';
import {
  isExpectedSsoCallback,
  readSsoCallbackParams,
  stripSsoCallbackParams,
  takeSsoStart,
} from '@/lib/sso-callback';

/**
 * Where the identity provider's callback lands. The backend has already verified the sign-in and
 * put the tokens in the URL fragment (legacy backends: the query string); this stores them, loads
 * the account and moves on — or, when the account has 2FA, hands the short-lived token back to the
 * login form for the second factor. Only a tab that started the sign-in itself (see startSso on
 * /login) gets that far; any other link carrying tokens is refused.
 */
function SsoCallback() {
  const router = useRouter();
  const { checkAuth, logout } = useAuthStore();
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  // Run once: the URL is scrubbed and the start marker consumed on the first pass, so a re-run
  // (Strict Mode) would find neither — and must not end the session that pass just created.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const { pathname, search, hash } = window.location;
    const { accessToken, refreshToken, twoFactorToken } = readSsoCallbackParams(hash, search);
    // Scrub the credentials from the address bar immediately — before /auth/me, analytics or
    // anything else gets a chance to see the URL.
    const clean = stripSsoCallbackParams(pathname, search, hash);
    if (clean !== null) window.history.replaceState(window.history.state, '', clean);

    // Login CSRF guard: without a recent start in this tab the tokens came from someone else's
    // link. Refuse them before anything is written, leaving the current session untouched.
    if (!isExpectedSsoCallback(takeSsoStart(), Date.now())) {
      setFailed(true);
      return;
    }

    // A session is still stored in this browser: end it properly first (revoked, per-user caches
    // such as React Query dropped) so nothing of the previous account carries over.
    const endPreviousSession = () => (getAccessToken() ? logout() : Promise.resolve());

    if (twoFactorToken) {
      endPreviousSession()
        .then(() => {
          useAuthStore.setState({ requiresTwoFactor: true, twoFactorToken });
          router.replace('/login');
        })
        .catch(() => setFailed(true));
      return;
    }
    if (!accessToken || !refreshToken) {
      setFailed(true);
      return;
    }

    endPreviousSession()
      .then(() => {
        setTokens(accessToken, refreshToken);
        return checkAuth();
      })
      .then(() => {
        // checkAuth reports failure through the store, not by throwing
        if (!useAuthStore.getState().isAuthenticated) {
          setFailed(true);
          return;
        }
        router.replace(sanitizeRedirectPath(consumeAuthRedirect('')) || '/dashboard');
      })
      .catch(() => setFailed(true));
  }, [router, checkAuth, logout]);

  return (
    <div className="w-full text-center py-12">
      {failed ? (
        <>
          <p className="text-[var(--status-error)] mb-4">{t('auth', 'ssoFailed')}</p>
          <button onClick={() => router.replace('/login')} className="btn btn-primary">
            {t('auth', 'signIn')}
          </button>
        </>
      ) : (
        <p className="text-neutral-600 dark:text-neutral-400">{t('auth', 'ssoCompleting')}</p>
      )}
    </div>
  );
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SsoCallback />
    </Suspense>
  );
}
