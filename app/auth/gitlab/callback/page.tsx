'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { connectGitLab } from '@/lib/api/services/gitlab.service';

function GitLabCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
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

      const storedState = localStorage.getItem('gitlab_oauth_state');
      if (!storedState || storedState !== state) {
        setStatus('error');
        setErrorMessage('Invalid state parameter');
        return;
      }

      localStorage.removeItem('gitlab_oauth_state');

      try {
        const result = await connectGitLab(code, state);

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error.message || 'Failed to connect GitLab');
          return;
        }

        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard/projects/new');
        }, 1500);
      } catch {
        setStatus('error');
        setErrorMessage('Failed to connect GitLab');
      }
    };

    processCallback();
  }, []);

  return (
    <div className="text-center p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-w-md w-full mx-4">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-purple)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connecting GitLab...</h2>
          <p className="text-[var(--text-muted)]">Please wait while we complete the connection.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="w-12 h-12 text-[var(--status-success)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">GitLab Connected!</h2>
          <p className="text-[var(--text-muted)]">Redirecting you back...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-[var(--status-error)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-[var(--text-muted)] mb-4">{errorMessage}</p>
          <button
            onClick={() => router.push('/dashboard/projects/new')}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-w-md w-full mx-4">
      <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-purple)] mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Loading...</h2>
    </div>
  );
}

export default function GitLabCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <Suspense fallback={<LoadingFallback />}>
        <GitLabCallbackContent />
      </Suspense>
    </div>
  );
}
