'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useTranslation } from '@/hooks';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-white">{t('errors', 'somethingWentWrong')}</h2>
        <p className="text-[var(--text-secondary)] mt-2 text-sm leading-relaxed">
          {t('errors', 'somethingWentWrongDesc')}
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-[var(--text-muted)] font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-secondary h-10 px-4 gap-2 text-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('errors', 'goDashboard')}
          </button>
          <button onClick={reset} className="btn btn-primary h-10 px-4 gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            {t('errors', 'tryAgain')}
          </button>
        </div>
      </div>
    </div>
  );
}
