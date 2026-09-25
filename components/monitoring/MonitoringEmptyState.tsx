'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { EmptyState } from '@/components/EmptyState';

export function MonitoringEmptyState({ projectCount }: { projectCount: number }) {
  const { t } = useTranslation();

  if (projectCount === 0) {
    return (
      <EmptyState
        label={t('navigation', 'monitoring')}
        title={t('monitoring', 'noProjects')}
        description={t('monitoring', 'noProjectsDesc')}
        action={{ label: t('projects', 'createProject'), href: '/dashboard/projects/new' }}
      />
    );
  }

  return (
    <div className="dash-empty">
      <span className="dash-eyebrow">{t('navigation', 'monitoring')}</span>
      <h3 className="dash-empty-title">{t('monitoring', 'noMetricsYet')}</h3>
      <p className="dash-empty-text">{t('monitoring', 'noMetricsYetDesc')}</p>
      <ul className="mt-5 space-y-1.5 text-[13px] text-[var(--text-muted)] max-w-sm text-left">
        <li className="flex items-start gap-2">
          <span className="dash-status-dot mt-[7px]" aria-hidden />
          <span>{t('monitoring', 'hintRunningDeploy')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="dash-status-dot mt-[7px]" aria-hidden />
          <span>{t('monitoring', 'hintWaitCollect')}</span>
        </li>
      </ul>
      <div className="dash-empty-action">
        <Link href="/dashboard/projects" className="btn btn-secondary">
          {t('monitoring', 'viewProjects')}
        </Link>
      </div>
    </div>
  );
}
