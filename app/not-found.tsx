'use client';

import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-6">
          <h1 className="text-[160px] sm:text-[200px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-white/[0.02] select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-[var(--accent-cyan)] text-2xl font-bold">?</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white">{t('errors', 'pageNotFound')}</h2>
        <p className="text-[var(--text-secondary)] mt-3 leading-relaxed max-w-sm mx-auto">
          {t('errors', 'pageNotFoundDesc')}
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <Link href="/" className="btn btn-secondary h-11 px-5 gap-2">
            <Home className="w-4 h-4" />
            {t('errors', 'goHome')}
          </Link>
          <Link href="/dashboard" className="btn btn-primary h-11 px-5 gap-2">
            {t('errors', 'goDashboard')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
