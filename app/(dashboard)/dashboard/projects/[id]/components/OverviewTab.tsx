'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createDeployment, promoteStaging, wakeProject } from '@/lib/api';
import {
  ExternalLink,
  GitBranch,
  Rocket,
  RotateCcw, Moon, Sun, ArrowUpCircle } from 'lucide-react';
import { DeploymentFailureSummary } from '@/components/DeploymentFailureSummary';
import { DeploymentTimeline } from '@/components/DeploymentTimeline';
import { findLastGoodDeployment } from '@/lib/deployment-utils';
import { useProject, useDeployments, useProjectHealthStatus, useTranslation } from '@/hooks';
import { MetricsSection } from './MetricsSection';

export function OverviewTab({
  project,
  projectId,
  deployments,
  formatTimeAgo,
  getStatusBadge,
  onRollback,
  t,
}: {
  project: NonNullable<ReturnType<typeof useProject>['data']>;
  projectId: string;
  deployments: ReturnType<typeof useDeployments>['data'];
  formatTimeAgo: (date: string, t?: any) => string;
  getStatusBadge: (status: string) => string;
  onRollback: (deploymentId: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const queryClient = useQueryClient();
  const [wakePending, setWakePending] = useState(false);
  const handleWake = async () => {
    setWakePending(true);
    await wakeProject(projectId);
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
    setWakePending(false);
  };

  const latestDeployment = deployments?.[0];
  const lastGood = deployments ? findLastGoodDeployment(deployments) : null;

  return (
    <>
    {project.sleepState !== 'awake' && (
      <div className="dash-callout dash-callout-attention items-center mb-4">
        <Moon className="w-4 h-4 shrink-0 text-[var(--status-warning)]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">
            {project.sleepState === 'waking' ? t('sleep', 'wakingTitle') : t('sleep', 'sleepingTitle')}
          </p>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {project.sleepState === 'waking' ? t('sleep', 'wakingDesc') : t('sleep', 'sleepingDesc')}
          </p>
        </div>
        {project.sleepState === 'sleeping' && (
          <button onClick={handleWake} disabled={wakePending} className="btn btn-secondary btn-sm shrink-0">
            <Sun className="w-4 h-4" />
            {wakePending ? t('sleep', 'waking') : t('sleep', 'wake')}
          </button>
        )}
      </div>
    )}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
      <div className="lg:col-span-2 space-y-4 min-w-0">
        <MonitoringLine projectId={projectId} t={t} />
        <StagingCard project={project} projectId={projectId} t={t} />
        <h3 className="dash-section-label">{t('projectDetail', 'latestDeployment')}</h3>
        {latestDeployment ? (
          <div className="dash-card p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0">
                <span className={`badge shrink-0 ${getStatusBadge(latestDeployment.status)}`}>
                  {latestDeployment.status}
                </span>
                <GitBranch className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden />
                <span className="terminal-text text-[13px] truncate">{latestDeployment.branch}</span>
                {latestDeployment.commitHash && (
                  <span className="terminal-text text-xs text-[var(--text-muted)]">
                    {latestDeployment.commitHash.slice(0, 7)}
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTimeAgo(latestDeployment.createdAt, t)}
                </span>
              </div>
              {latestDeployment.url && (
                <a
                  href={latestDeployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-link inline-flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('projectDetail', 'preview')}
                </a>
              )}
            </div>
            {latestDeployment.commitMessage && (
              <p className="text-[13px] text-[var(--text-secondary)] mt-2">
                {latestDeployment.commitMessage}
              </p>
            )}
            {latestDeployment.status === 'failed' && (
              <div className="mt-3 [&>div]:mb-0">
                <DeploymentFailureSummary
                  logs={latestDeployment.buildLogs}
                  errorMessage={latestDeployment.errorMessage}
                />
              </div>
            )}
            {latestDeployment.status === 'failed' && lastGood && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] text-[var(--text-secondary)]">
                  {t('projectDetail', 'deploymentFailedBanner')}
                </p>
                <button
                  type="button"
                  onClick={() => onRollback(lastGood.id)}
                  className="btn btn-secondary btn-sm shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('projectDetail', 'rollbackToLastGood')}
                  {lastGood.commitHash && (
                    <span className="terminal-text text-[var(--text-muted)]">
                      @{lastGood.commitHash.slice(0, 7)}
                    </span>
                  )}
                </button>
              </div>
            )}
            <DeploymentTimeline deployment={latestDeployment} />
          </div>
        ) : (
          <div className="dash-card px-6 py-10 text-center">
            <Rocket className="dash-empty-icon mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">{t('projectDetail', 'noDeploymentsYet')}</p>
          </div>
        )}
      </div>

      <div className="space-y-4 min-w-0">
        <h3 className="dash-section-label">{t('projectDetail', 'projectInfo')}</h3>
        <div className="dash-card px-4 py-1.5">
          <div className="dash-kv">
            <span>{t('projectDetail', 'framework')}</span>
            <span>{project.framework || t('projectDetail', 'unknown')}</span>
          </div>
          <div className="dash-kv">
            <span>{t('projectDetail', 'rootDirectory')}</span>
            <span>{project.rootDirectory || '/'}</span>
          </div>
          <div className="dash-kv">
            <span>{t('projectDetail', 'buildCommand')}</span>
            <span>{project.buildCommand || 'npm run build'}</span>
          </div>
        </div>
      </div>

      {/* Container Metrics */}
      <div className="lg:col-span-3 mt-2">
        <MetricsSection projectId={projectId} t={t} />
      </div>
    </div>
    </>
  );
}

/**
 * What monitoring last saw. Every deployed project is checked about once a minute; after three
 * failures in a row it counts as down and everyone with deployment alerts on gets an email.
 */
function MonitoringLine({ projectId, t }: { projectId: string; t: ReturnType<typeof useTranslation>['t'] }) {
  const { data } = useProjectHealthStatus(projectId);
  if (!data || data.status === 'unknown') return null;

  const down = data.status === 'down';
  const color = down ? 'var(--status-error)' : 'var(--status-success)';
  const since = down && data.downSince ? new Date(data.downSince).toLocaleString() : null;
  const detail = down
    ? data.statusCode
      ? `HTTP ${data.statusCode}`
      : data.error || ''
    : data.responseTimeMs != null
      ? `${data.responseTimeMs} ms`
      : '';

  return (
    <div className="dash-card flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-2.5 text-[13px]" role="status">
      <span className={`dash-status-dot ${down ? 'is-error' : 'is-success'}`} aria-hidden />
      <span className="font-medium" style={{ color }}>
        {down ? t('monitoring', 'down') : t('monitoring', 'up')}
      </span>
      {detail && <span className="terminal-text text-xs text-[var(--text-muted)]">{detail}</span>}
      {since && <span className="text-xs text-[var(--text-muted)]">· {since}</span>}
    </div>
  );
}

/**
 * The project's staging copy: pushes to its branch deploy it, and it can be promoted to
 * production (the same commit, rebuilt with production's variables).
 */
function StagingCard({
  project,
  projectId,
  t,
}: {
  project: NonNullable<ReturnType<typeof useProject>['data']>;
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<'deploy' | 'promote' | null>(null);
  if (!project.stagingBranch) return null;

  const stagingUrl = (project.settings as Record<string, unknown> | undefined)?.stagingUrl as string | undefined;

  const run = async (what: 'deploy' | 'promote') => {
    setPending(what);
    try {
      const result =
        what === 'deploy'
          ? await createDeployment(projectId, { environment: 'staging' })
          : await promoteStaging(projectId);
      if (result.error) throw new Error(result.error.message);
      await queryClient.invalidateQueries({ queryKey: ['deployments', projectId] });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="dash-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="dash-section-label">{t('projectDetail', 'staging')}</span>
        <code className="terminal-text text-xs px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
          {project.stagingBranch}
        </code>
        {stagingUrl ? (
          <a href={stagingUrl} target="_blank" rel="noreferrer" className="terminal-text text-[13px] truncate hover:underline underline-offset-2">
            {stagingUrl.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">{t('projectDetail', 'stagingNotDeployed')}</span>
        )}
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-3">{t('projectDetail', 'promoteHint')}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => run('deploy')} disabled={!!pending} className="btn btn-secondary btn-sm">
          <Rocket className="w-3.5 h-3.5" />
          {pending === 'deploy' ? '…' : t('projectDetail', 'deployStaging')}
        </button>
        <button type="button" onClick={() => run('promote')} disabled={!!pending || !stagingUrl} className="btn btn-secondary btn-sm">
          <ArrowUpCircle className="w-3.5 h-3.5" />
          {pending === 'promote' ? '…' : t('projectDetail', 'promoteToProduction')}
        </button>
      </div>
    </div>
  );
}
