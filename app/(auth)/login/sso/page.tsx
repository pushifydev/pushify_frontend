'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { consumeAuthRedirect, sanitizeRedirectPath } from '@/lib/auth-redirect';
import {
  readSsoCallbackParams,
  stripSsoCallbackParams,
  type SsoCallbackParams,
} from '@/lib/sso-callback';

/**
 * Where the identity provider's callback lands. The backend has already verified the sign-in and
 * put the tokens in the URL fragment (legacy backends: the query string); this stores them, loads
 * the account and moves on — or, when the account has 2FA, hands the short-lived token back to the
 * login form for the second factor.
 */
function SsoCallback() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  // Read once: the URL is scrubbed right after, so a re-run (Strict Mode) must reuse these
  const params = useRef<SsoCallbackParams | null>(null);

  useEffect(() => {
    if (!params.current) {
      const { pathname, search, hash } = window.location;
      params.current = readSsoCallbackParams(hash, search);
      // Scrub the credentials from the address bar immediately — before /auth/me, analytics or
      // anything else gets a chance to see the URL.
      const clean = stripSsoCallbackParams(pathname, search, hash);
      if (clean !== null) window.history.replaceState(window.history.state, '', clean);
    }
    const { accessToken, refreshToken, twoFactorToken } = params.current;

    if (twoFactorToken) {
      useAuthStore.setState({ requiresTwoFactor: true, twoFactorToken });
      router.replace('/login');
      return;
    }
    if (!accessToken || !refreshToken) {
      setFailed(true);
      return;
    }

    setTokens(accessToken, refreshToken);
    checkAuth()
      .then(() => router.replace(sanitizeRedirectPath(consumeAuthRedirect('')) || '/dashboard'))
      .catch(() => setFailed(true));
  }, [router, checkAuth]);

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
