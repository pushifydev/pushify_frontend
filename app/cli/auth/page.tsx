'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Terminal, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api/client';
import { cliAuthCodeMatches } from '@/lib/cli-auth-code';
import { useAuthStore } from '@/stores/auth';

function CliAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading, checkAuth } = useAuthStore();
  const code = searchParams.get('code');

  const [status, setStatus] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  // The code from the URL is never shown: the user must type the one their own terminal printed,
  // otherwise a link from someone else would approve *their* CLI session (device-code phishing).
  const [typedCode, setTypedCode] = useState('');
  const codeMatches = cliAuthCodeMatches(code, typedCode);

  useEffect(() => {
    checkAuth().finally(() => setAuthChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (authChecked && !authLoading && !user) {
      const redirect = encodeURIComponent(`/cli/auth?code=${encodeURIComponent(code ?? '')}`);
      router.push(`/login?redirect=${redirect}`);
    }
  }, [authChecked, authLoading, user, router, code]);

  const handleApprove = async () => {
    if (!code || !codeMatches) return;
    setStatus('loading');

    try {
      await api.post('/auth/cli/approve', { code });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error?.message || 'Failed to approve. Code may be expired.');
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

  if (!authChecked || authLoading || !user) {
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
                : 'rgba(99,102,241,0.1)',
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

            {/* Code entry — the code from the link is deliberately not displayed */}
            <div
              className="rounded-xl p-4 my-6"
              style={{
                background: 'var(--hover-overlay)',
                border: '1px solid var(--glass-border)',
              }}
            >
              <label
                htmlFor="cli-auth-code"
                className="block text-xs mb-2"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                Enter the code shown in your terminal
              </label>
              <input
                id="cli-auth-code"
                type="text"
                value={typedCode}
                onChange={(e) => setTypedCode(e.target.value)}
                placeholder="XXXX-XXXX"
                className="input text-center text-xl tracking-widest font-mono"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus
              />
              {typedCode.trim() && !codeMatches && (
                <p className="text-xs mt-2" style={{ color: 'var(--status-error)' }}>
                  This code does not match the login request.
                </p>
              )}
            </div>

            {/* Phishing warning */}
            <div
              className="flex items-start gap-2 rounded-xl p-3 mb-4 text-left text-xs"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--text-secondary)',
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--status-error)' }} />
              <span>
                If you did not start this login yourself by running <code>pushify login</code>, do not
                approve it. Approving gives whoever started it full access to your account.
              </span>
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
                disabled={status === 'loading' || !codeMatches}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
