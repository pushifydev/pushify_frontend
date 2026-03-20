'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

function CliAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const code = searchParams.get('code');

  const [status, setStatus] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand persist to hydrate
    const timeout = setTimeout(() => setHydrated(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (hydrated && !authLoading && !user) {
      const redirect = encodeURIComponent(`/cli/auth?code=${code}`);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [hydrated, authLoading, user, router, code]);

  const handleApprove = async () => {
    if (!code) return;
    setStatus('loading');

    try {
      await api.post('/auth/cli/approve', { code });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to approve. Code may be expired.');
    }
  };

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center" style={{ color: 'var(--text-muted)' }}>
          <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Invalid link. No auth code provided.</p>
        </div>
      </div>
    );
  }

  if (!hydrated || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: status === 'success'
                ? 'rgba(34,197,94,0.1)'
                : status === 'error'
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(34,211,238,0.1)',
            }}
          >
            {status === 'success' ? (
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--status-success)' }} />
            ) : status === 'error' ? (
              <XCircle className="w-8 h-8" style={{ color: 'var(--status-error)' }} />
            ) : (
              <Terminal className="w-8 h-8" style={{ color: 'var(--accent-cyan)' }} />
            )}
          </div>
        </div>

        {/* Content */}
        {status === 'success' ? (
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              CLI Login Approved
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              You can close this tab and return to your terminal.
            </p>
          </div>
        ) : status === 'error' ? (
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Authentication Failed
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--status-error)' }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setStatus('confirm')}
              className="text-sm underline"
              style={{ color: 'var(--accent-cyan)' }}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              CLI Login Request
            </h1>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              A CLI session is requesting access to your account.
            </p>

            {/* Code display */}
            <div
              className="rounded-xl p-4 my-6"
              style={{
                background: 'var(--hover-overlay)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Verification Code
              </p>
              <p
                className="text-2xl font-bold tracking-[0.3em]"
                style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}
              >
                {code}
              </p>
            </div>

            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.close()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: 'var(--hover-overlay)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={status === 'loading'}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                style={{
                  background: 'var(--accent-cyan)',
                  color: '#020206',
                }}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Approve'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
        </div>
      }
    >
      <CliAuthContent />
    </Suspense>
  );
}
