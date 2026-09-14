'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';

/**
 * 404 for `notFound()` thrown inside the dashboard (an unknown project, a non-operator on
 * /admin, …). Without this the marketing 404 — with its own header — would render inside
 * the dashboard shell.
 */
export default function DashboardNotFound() {
  const { t } = useTranslation();

  return (
    <div className="dash-page flex flex-col items-center justify-center text-center min-h-[50vh] py-16">
      <p className="dash-eyebrow mb-2">404</p>
      <h1 className="text-xl font-semibold tracking-tight">{t('errors', 'pageNotFound')}</h1>
      <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('errors', 'pageNotFoundDesc')}
      </p>
      <Link href="/dashboard" className="btn btn-primary mt-6">
        {t('errors', 'goDashboard')}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
