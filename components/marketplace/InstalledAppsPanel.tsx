'use client';

import Link from 'next/link';
import { PackageOpen, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceDeployments } from '@/hooks/useMarketplace';
import type { MarketplaceDeployment } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/constants';
import { Skeleton } from '@/components/Skeleton';

export function InstalledAppsPanel() {
  const { t } = useTranslation();
  const { data: installs = [], isLoading } = useMarketplaceDeployments();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (installs.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
      >
        <PackageOpen className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
        <p className="font-semibold mb-1">{t('marketplace', 'noInstallsTitle')}</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('marketplace', 'noInstallsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {installs.map((install: MarketplaceDeployment) => {
        const project = install.project;
        const statusColor =
          project?.status === 'active' ? STATUS_COLORS.success : STATUS_COLORS.neutral;

        return (
          <Link
            key={install.id}
            href={`/dashboard/projects/${install.projectId}`}
            className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
          >
            <span className="text-2xl shrink-0" role="img" aria-hidden>
              {install.templateIcon ?? '📦'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-[var(--accent-cyan)] transition-colors">
                {install.templateName ?? install.templateId}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {project?.name ?? install.projectId}
                {project?.slug ? ` · ${project.slug}` : ''}
                {install.appVersion ? ` · v${install.appVersion}` : ''}
              </p>
            </div>
            {project && (
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0 capitalize"
                style={{ background: `${statusColor}18`, color: statusColor }}
              >
                {project.status}
              </span>
            )}
            <span className="text-xs shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              {formatTimeAgo(install.createdAt, t)}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
          </Link>
        );
      })}
    </div>
  );
}
