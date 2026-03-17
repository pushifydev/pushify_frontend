'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useTranslation } from '@/hooks';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-white">{t('errors', 'somethingWentWrong')}</h2>
        <p className="text-[var(--text-secondary)] mt-3 leading-relaxed max-w-sm mx-auto">
          {t('errors', 'somethingWentWrongDesc')}
        </p>

        {error.digest && (
          <p className="mt-4 text-xs text-[var(--text-muted)] font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 mt-8">
          <Link href="/" className="btn btn-secondary h-11 px-5 gap-2">
            <Home className="w-4 h-4" />
            {t('errors', 'goHome')}
          </Link>
          <button onClick={reset} className="btn btn-primary h-11 px-5 gap-2">
            <RefreshCw className="w-4 h-4" />
            {t('errors', 'tryAgain')}
          </button>
        </div>
      </div>
    </div>
  );
}
