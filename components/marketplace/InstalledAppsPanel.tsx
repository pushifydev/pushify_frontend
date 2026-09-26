'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceDeployments } from '@/hooks/useMarketplace';
import type { MarketplaceDeployment } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { RowList } from '@/components/dashboard/PageKit';

export function InstalledAppsPanel() {
  const { t, locale } = useTranslation();
  const { data: installs = [], isLoading } = useMarketplaceDeployments();

  if (isLoading) {
    return (
      <div className="dash-rows" role="status" aria-label={t('common', 'loading')}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="dash-row">
            <Skeleton className="h-5 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (installs.length === 0) {
    return (
      <EmptyState
        label={t('marketplace', 'tabInstalled')}
        title={t('marketplace', 'noInstallsTitle')}
        description={t('marketplace', 'noInstallsDesc')}
      />
    );
  }

  return (
    <RowList label={t('marketplace', 'tabInstalled')}>
      {installs.map((install: MarketplaceDeployment) => {
        const project = install.project;
        const live = project?.status === 'active';

        return (
          <div key={install.id} className="dash-row flex items-center gap-3 min-w-0">
            <span className={`dash-status-dot ${live ? 'is-success' : ''}`} aria-hidden />
            <span className="text-lg leading-none shrink-0" aria-hidden>
              {install.templateIcon ?? '📦'}
            </span>
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/projects/${install.projectId}`}
                className="text-sm font-medium truncate block text-[var(--text-primary)] hover:underline underline-offset-4"
              >
                {install.templateName ?? install.templateId}
              </Link>
              <p className="terminal-text text-xs mt-0.5 truncate text-[var(--text-muted)]">
                {project?.name ?? install.projectId}
                {project?.slug ? ` · ${project.slug}` : ''}
                {install.appVersion ? ` · v${install.appVersion}` : ''}
              </p>
            </div>
            {project && !live && (
              <span className="badge badge-neutral shrink-0">{project.status}</span>
            )}
            <span className="text-xs shrink-0 hidden sm:block text-[var(--text-muted)]">
              {formatTimeAgo(install.createdAt, t)}
            </span>
            <Link
              href={`/dashboard/projects/${install.projectId}`}
              className="btn btn-secondary btn-sm shrink-0"
            >
              {locale === 'tr' ? 'Aç' : 'Open'}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        );
      })}
    </RowList>
  );
}
