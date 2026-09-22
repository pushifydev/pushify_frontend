'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokens } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { useTranslation } from '@/hooks';
import { consumeAuthRedirect, sanitizeRedirectPath } from '@/lib/auth-redirect';

/**
 * Where the identity provider's callback lands. The backend has already verified the sign-in and
 * put the tokens in the URL; this stores them, loads the account and moves on — or, when the
 * account has 2FA, hands the short-lived token back to the login form for the second factor.
 */
function SsoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuthStore();
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const twoFactorToken = searchParams.get('twoFactorToken');
  // Nothing usable in the URL is an error we can see without running anything
  const error = failed || !(accessToken && refreshToken) ? !twoFactorToken : false;

  useEffect(() => {
    if (twoFactorToken) {
      useAuthStore.setState({ requiresTwoFactor: true, twoFactorToken });
      router.replace('/login');
      return;
    }
    if (!accessToken || !refreshToken) return;

    setTokens(accessToken, refreshToken);
    // The tokens sit in the address bar until this replaces it
    checkAuth()
      .then(() => router.replace(sanitizeRedirectPath(consumeAuthRedirect('')) || '/dashboard'))
      .catch(() => setFailed(true));
  }, [accessToken, refreshToken, twoFactorToken, router, checkAuth]);

  return (
    <div className="w-full text-center py-12">
      {error ? (
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
