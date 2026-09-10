'use client';

import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

/**
 * "Is someone signed in?" for marketing pages — without the network round-trip the
 * dashboard's checkAuth does. A stored access token is enough to swap Sign in/Sign up
 * for a Dashboard link; if the token turns out to be stale, the dashboard guard sends
 * them to login anyway. Starts as `false` so SSR and the first client paint agree.
 */
export function useSignedIn(): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
  }, [isAuthenticated]);

  return isAuthenticated || hasToken;
}
