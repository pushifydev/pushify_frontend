'use client';

import {
  ExternalLink,
  GitBranch,
  Rocket,
  RotateCcw,
} from 'lucide-react';
import { DeploymentFailureSummary } from '@/components/DeploymentFailureSummary';
import { DeploymentTimeline } from '@/components/DeploymentTimeline';
import { findLastGoodDeployment } from '@/lib/deployment-utils';
import { useProject, useDeployments, useTranslation } from '@/hooks';
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
  const latestDeployment = deployments?.[0];
  const lastGood = deployments ? findLastGoodDeployment(deployments) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
      <div className="lg:col-span-2 space-y-4 min-w-0">
        <h3 className="text-lg font-semibold">{t('projectDetail', 'latestDeployment')}</h3>
        {latestDeployment ? (
          <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                <span className={`badge shrink-0 ${getStatusBadge(latestDeployment.status)}`}>
                  {latestDeployment.status}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  {formatTimeAgo(latestDeployment.createdAt, t)}
                </span>
              </div>
              {latestDeployment.url && (
                <a
                  href={latestDeployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('projectDetail', 'preview')}
                </a>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm min-w-0">
              <GitBranch className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="terminal-text">{latestDeployment.branch}</span>
              {latestDeployment.commitHash && (
                <span className="text-[var(--text-muted)]">
                  @ {latestDeployment.commitHash.slice(0, 7)}
                </span>
              )}
            </div>
            {latestDeployment.commitMessage && (
              <p className="text-sm text-[var(--text-secondary)] mt-2 pl-7">
                {latestDeployment.commitMessage}
              </p>
            )}
            {latestDeployment.status === 'failed' && (
              <div className="mt-3 pl-7">
                <DeploymentFailureSummary
                  logs={latestDeployment.buildLogs}
                  errorMessage={latestDeployment.errorMessage}
                />
              </div>
            )}
            {latestDeployment.status === 'failed' && lastGood && (
              <div className="mt-4 p-3 rounded-lg border border-[var(--status-error)]/25 bg-[var(--status-error)]/5">
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  {t('projectDetail', 'deploymentFailedBanner')}
                </p>
                <button
                  type="button"
                  onClick={() => onRollback(lastGood.id)}
                  className="btn btn-secondary h-9 text-sm inline-flex items-center gap-2"
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
          <div className="p-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
            <Rocket className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">{t('projectDetail', 'noDeploymentsYet')}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">{t('projectDetail', 'projectInfo')}</h4>
          <div className="space-y-3 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[var(--text-muted)] shrink-0">{t('projectDetail', 'framework')}</span>
              <span className="terminal-text break-all sm:text-right">{project.framework || t('projectDetail', 'unknown')}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[var(--text-muted)] shrink-0">{t('projectDetail', 'rootDirectory')}</span>
              <span className="terminal-text break-all sm:text-right">{project.rootDirectory || '/'}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[var(--text-muted)] shrink-0">{t('projectDetail', 'buildCommand')}</span>
              <span className="terminal-text break-all sm:text-right">{project.buildCommand || 'npm run build'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Container Metrics */}
      <div className="lg:col-span-3 mt-6">
        <MetricsSection projectId={projectId} t={t} />
      </div>
    </div>
  );
}
