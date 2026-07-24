'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { googleLoginCallback } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { consumeAuthRedirect } from '@/lib/auth-redirect';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' ? 'Access denied by user' : error);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing code or state parameter');
        return;
      }

      // Verify state matches what we stored. The mobile flow opens this page in a
      // throwaway in-app browser that never stored one, so only enforce the match
      // when an entry exists — the backend validates the one-time state regardless.
      const storedState = localStorage.getItem('google_oauth_state');
      if (storedState && storedState !== state) {
        setStatus('error');
        setErrorMessage('Invalid state parameter');
        return;
      }

      // Clear stored state
      localStorage.removeItem('google_oauth_state');

      try {
        const result = await googleLoginCallback(code, state);

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error.message || 'Google login failed');
          return;
        }

        if (result.data) {
          // Started from the mobile app: return the session over the deep link and
          // stop — this browser is only a bridge and never enters the dashboard.
          const handoff = result.data.mobileHandoff;
          if (handoff) {
            const params = new URLSearchParams();
            if (handoff.accessToken) params.set('accessToken', handoff.accessToken);
            if (handoff.refreshToken) params.set('refreshToken', handoff.refreshToken);
            if (handoff.twoFactorToken) params.set('twoFactorToken', handoff.twoFactorToken);
            setStatus('success');
            // Fragment, not query: keeps tokens out of server logs and Referer headers.
            window.location.replace(`${handoff.appRedirect}#${params.toString()}`);
            return;
          }

          // 2FA-enabled account: hand the challenge to the existing 2FA form on /login
          if ('requiresTwoFactor' in result.data) {
            useAuthStore.setState({
              requiresTwoFactor: true,
              twoFactorToken: result.data.twoFactorToken,
              isLoading: false,
            });
            router.replace('/login');
            return;
          }

          useAuthStore.setState({
            user: result.data.user,
            organization: result.data.organization,
            isAuthenticated: true,
            isLoading: false,
          });
          setStatus('success');
          setTimeout(() => router.push(consumeAuthRedirect('/dashboard')), 1000);
        }
      } catch {
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--accent-cyan)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Signing in with Google...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--status-success)' }} />
            <p style={{ color: 'var(--text-primary)' }}>Login successful! Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--status-error)' }} />
            <p className="mb-4" style={{ color: 'var(--text-primary)' }}>Login failed</p>
            <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-secondary"
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-cyan)' }} />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
