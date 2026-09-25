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
import { SettingsSection, SettingsSwitch } from './SettingsParts';

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
    <SettingsSection
      id="settings-previews"
      title={t('previews', 'title')}
      description={t('previews', 'description')}
      action={
        <>
          {updateSettings.isPending && (
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          )}
          <SettingsSwitch
            checked={previewDeploymentsEnabled}
            onChange={() => handleToggle()}
            disabled={updateSettings.isPending || !previewAllowed}
            label={t('previews', 'title')}
          />
        </>
      }
      padded={!previewAllowed || previewDeploymentsEnabled}
    >
      {!previewAllowed && (
        <p className="text-[13px] text-[var(--text-secondary)]">
          {t('previews', 'planRequired')}{' '}
          <Link href="/dashboard/billing/plans" className="dash-link">
            {t('billing', 'comparePlans')}
          </Link>
        </p>
      )}

      {previewDeploymentsEnabled && (
        <div>
          <h4 className="dash-section-label mb-3">{t('previews', 'activePreviews')}</h4>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-14 bg-[var(--bg-tertiary)] rounded-[10px]" />
            </div>
          ) : previews.length === 0 ? (
            <p className="text-[13px] text-[var(--text-muted)]">{t('previews', 'noPreviewsDesc')}</p>
          ) : (
            <div className="rounded-[10px] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
              {previews.map((preview) => (
                <div
                  key={preview.id}
                  className="px-3 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`badge shrink-0 ${getStatusBadge(preview.status)}`}>
                      {t('previews', preview.status as 'pending' | 'building' | 'running' | 'stopped' | 'failed')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="terminal-text text-[13px] shrink-0">
                          {t('previews', 'prNumber')} #{preview.prNumber}
                        </span>
                        {preview.prTitle && (
                          <span className="text-[13px] text-[var(--text-secondary)] truncate min-w-0">
                            {preview.prTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 terminal-text text-[11px] text-[var(--text-muted)] mt-1">
                        <span className="truncate max-w-full">{preview.prBranch}</span>
                        <span className="shrink-0">→</span>
                        <span className="truncate max-w-full">{preview.baseBranch}</span>
                        <span className="shrink-0">·</span>
                        <span className="shrink-0">{formatTimeAgo(preview.createdAt, t)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {preview.previewUrl && preview.status === 'running' && (
                      <a
                        href={preview.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
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
                        className="btn btn-ghost btn-sm"
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
    </SettingsSection>
  );
}
