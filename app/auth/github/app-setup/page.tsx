'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useGitHubAppSetup, useTranslation } from '@/hooks';

/**
 * Where GitHub sends the browser after someone installs the Pushify App. The installation id
 * arrives in the query string; linking it to the organisation is what makes it usable, so that
 * happens here before handing the person back to whatever they were doing.
 */
function AppSetupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const setup = useGitHubAppSetup();

  const [failure, setFailure] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  // React runs effects twice in development; the state is single-use, so guard the call.
  const started = useRef(false);

  const installationId = Number(params.get('installation_id'));
  const state = params.get('state') ?? '';
  // Derived rather than set in the effect: this is knowable during render.
  const missingInstallation = !Number.isFinite(installationId) || installationId <= 0;

  useEffect(() => {
    if (missingInstallation || started.current) return;
    started.current = true;

    setup
      .mutateAsync({ installationId, state })
      .then((result) => {
        setAccount(result?.accountLogin ?? null);
        setTimeout(() => router.replace('/dashboard/projects/new'), 1200);
      })
      .catch((err: unknown) => {
        setFailure(err instanceof Error ? err.message : String(err));
      });
  }, [installationId, missingInstallation, router, setup, state]);

  const error = missingInstallation ? t('newProject', 'githubAppMissingInstallation') : failure;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div
        className="w-full max-w-md text-center px-6 py-8 rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        {error ? (
          <>
            <AlertCircle className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--status-error)' }} />
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {error}
            </p>
            <Link href="/dashboard/projects/new" className="btn btn-secondary text-sm">
              {t('common', 'back')}
            </Link>
          </>
        ) : account ? (
          <>
            <CheckCircle2
              className="w-6 h-6 mx-auto mb-3"
              style={{ color: 'var(--status-success)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('newProject', 'githubAppLinked')} <strong>{account}</strong>
            </p>
          </>
        ) : (
          <>
            <Loader2
              className="w-6 h-6 mx-auto mb-3 animate-spin"
              style={{ color: 'var(--accent-cyan)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('newProject', 'githubAppLinking')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function GitHubAppSetupPage() {
  return (
    <Suspense fallback={null}>
      <AppSetupInner />
    </Suspense>
  );
}
