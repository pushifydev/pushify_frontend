'use client';

import Link from 'next/link';
import { ExternalLink, GitBranch, RefreshCw } from 'lucide-react';
import {
  useProject,
  useUpdateProjectSettings,
  useBillingInfo,
  useTranslation,
} from '@/hooks';
import { useActivePreviewDeployments } from '@/hooks/usePreviews';
import { formatTimeAgo } from '@/lib/formatters';

export function PreviewDeploymentsSection({
  projectId,
  project,
  t,
}: {
  projectId: string;
  project: NonNullable<ReturnType<typeof useProject>['data']>;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: previews = [], isLoading } = useActivePreviewDeployments(projectId);
  const { data: billingInfo } = useBillingInfo();
  const updateSettings = useUpdateProjectSettings(projectId);

  const previewAllowed = billingInfo?.features.previewDeployments ?? false;
  const previewDeploymentsEnabled =
    previewAllowed &&
    (project.settings as Record<string, unknown>)?.previewDeploymentsEnabled === true;

  const handleToggle = async () => {
    if (!previewAllowed) return;
    await updateSettings.mutateAsync({ previewDeploymentsEnabled: !previewDeploymentsEnabled });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return 'badge-success';
      case 'building':
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold min-w-0">{t('previews', 'title')}</h3>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggle}
            disabled={updateSettings.isPending || !previewAllowed}
            className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
              previewDeploymentsEnabled
                ? 'bg-[var(--accent-cyan)]'
                : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                previewDeploymentsEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          {updateSettings.isPending && (
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          )}
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        {t('previews', 'description')}
      </p>

      {!previewAllowed && (
        <p className="text-xs text-[var(--text-muted)] mb-4 p-3 rounded-lg bg-[var(--bg-tertiary)]">
          {t('previews', 'planRequired')}{' '}
          <Link href="/dashboard/billing/plans" className="dash-link">
            {t('billing', 'comparePlans')}
          </Link>
        </p>
      )}

      {previewDeploymentsEnabled && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <h4 className="text-sm font-medium mb-3">{t('previews', 'activePreviews')}</h4>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-16 bg-[var(--bg-tertiary)] rounded" />
            </div>
          ) : previews.length === 0 ? (
            <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] text-center">
              <p className="text-sm text-[var(--text-muted)]">{t('previews', 'noPreviewsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {previews.map((preview) => (
                <div
                  key={preview.id}
                  className="p-3 rounded-lg bg-[var(--bg-tertiary)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`badge shrink-0 ${getStatusBadge(preview.status)}`}>
                      {t('previews', preview.status as 'pending' | 'building' | 'running' | 'stopped' | 'failed')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm shrink-0">
                          {t('previews', 'prNumber')} #{preview.prNumber}
                        </span>
                        {preview.prTitle && (
                          <span className="text-sm text-[var(--text-secondary)] truncate min-w-0">
                            {preview.prTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)] mt-1">
                        <span className="truncate max-w-full">{preview.prBranch}</span>
                        <span className="shrink-0">→</span>
                        <span className="truncate max-w-full">{preview.baseBranch}</span>
                        <span className="shrink-0">·</span>
                        <span className="shrink-0">{formatTimeAgo(preview.createdAt, t)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {preview.previewUrl && preview.status === 'running' && (
                      <a
                        href={preview.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary h-8 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t('previews', 'previewUrl')}
                      </a>
                    )}
                    {project.gitRepoUrl && (
                      <a
                        href={`${project.gitRepoUrl}/pull/${preview.prNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost h-8 text-xs"
                      >
                        <GitBranch className="w-3 h-3" />
                        {t('previews', 'viewOnGithub')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
