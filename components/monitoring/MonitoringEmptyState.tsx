'use client';

import Link from 'next/link';
import { Activity, FolderPlus, Rocket, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks';

export function MonitoringEmptyState({ projectCount }: { projectCount: number }) {
  const { t } = useTranslation();

  if (projectCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <FolderPlus className="w-12 h-12 text-[var(--text-muted)] mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('monitoring', 'noProjects')}</h3>
        <p className="text-sm text-[var(--text-muted)] max-w-md text-center mb-6">
          {t('monitoring', 'noProjectsDesc')}
        </p>
        <Link href="/dashboard/projects/new" className="btn btn-primary">
          {t('projects', 'createProject')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <Activity className="w-12 h-12 text-[var(--text-muted)] mb-4" />
      <h3 className="text-lg font-semibold mb-2">{t('monitoring', 'noMetricsYet')}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md text-center mb-6">
        {t('monitoring', 'noMetricsYetDesc')}
      </p>
      <ul className="text-sm text-[var(--text-secondary)] space-y-2 max-w-sm w-full">
        <li className="flex items-start gap-2">
          <Rocket className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-cyan)]" />
          <span>{t('monitoring', 'hintRunningDeploy')}</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-cyan)]" />
          <span>{t('monitoring', 'hintWaitCollect')}</span>
        </li>
      </ul>
      <Link
        href="/dashboard/projects"
        className="btn btn-secondary mt-6"
      >
        {t('monitoring', 'viewProjects')}
      </Link>
    </div>
  );
}
