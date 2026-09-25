'use client';

import {
  Clock,
  ExternalLink,
  FileText,
  GitCompare,
  History,
  Rocket,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { DeploymentFailureSummary } from '@/components/DeploymentFailureSummary';
import { DeploymentTimeline } from '@/components/DeploymentTimeline';
import {
  canRollbackToDeployment,
  findLastGoodDeployment,
} from '@/lib/deployment-utils';
import { deploymentDiff, formatSeconds, type DeploymentDiff } from '@/lib/deployment-diff';
import { formatMessage } from '@/lib/i18n/format-message';
import { useDeployments, useTranslation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';

/** One quiet line: build time vs the previous deploy, and what code moved. */
function DeploymentDiffLine({
  diff,
  t,
}: {
  diff: DeploymentDiff;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const parts: React.ReactNode[] = [];

  if (diff.buildSeconds !== null) {
    let build = formatMessage(t('projectDetail', 'diffBuild'), { seconds: formatSeconds(diff.buildSeconds) });
    if (diff.buildDeltaSeconds !== null && diff.buildDeltaSeconds !== 0) {
      const abs = formatSeconds(Math.abs(diff.buildDeltaSeconds));
      build += ` · ${formatMessage(
        t('projectDetail', diff.buildDeltaSeconds < 0 ? 'diffFaster' : 'diffSlower'),
        { delta: abs },
      )}`;
    }
    parts.push(
      <span
        key="build"
        style={{
          color:
            diff.buildDeltaSeconds !== null && diff.buildDeltaSeconds > 30
              ? 'var(--status-warning)'
              : 'var(--text-muted)',
        }}
      >
        {build}
      </span>,
    );
  }

  if (diff.sameCommit) {
    parts.push(<span key="same">{t('projectDetail', 'diffSameCommit')}</span>);
  } else if (diff.compareUrl && diff.fromSha && diff.toSha) {
    parts.push(
      <a
        key="compare"
        href={diff.compareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:underline underline-offset-2 text-[var(--text-secondary)]"
      >
        <GitCompare className="w-3 h-3 shrink-0" />
        {formatMessage(t('projectDetail', 'diffCompare'), { from: diff.fromSha, to: diff.toSha })}
      </a>,
    );
  } else if (diff.fromSha && diff.toSha) {
    parts.push(
      <span key="new">{formatMessage(t('projectDetail', 'diffNewCommit'), { from: diff.fromSha })}</span>,
    );
  }

  if (parts.length === 0) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums mt-2 text-[var(--text-muted)]">
      {parts}
    </p>
  );
}

export function DeploymentsTab({
  deployments,
  gitRepoUrl,
  formatTimeAgo,
  getStatusBadge,
  onCancel,
  onRollback,
  onViewLogs,
  onViewContainerLogs,
  onViewHistoricalLogs,
  t,
}: {
  deployments: ReturnType<typeof useDeployments>['data'];
  gitRepoUrl?: string | null;
  formatTimeAgo: (date: string, t?: any) => string;
  getStatusBadge: (status: string) => string;
  onCancel: (id: string) => void;
  onRollback: (id: string) => void;
  onViewLogs: (deployment: NonNullable<ReturnType<typeof useDeployments>['data']>[number]) => void;
  onViewContainerLogs: (deploymentId: string) => void;
  onViewHistoricalLogs: (deploymentId: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const confirm = useConfirm();
  const lastGood = deployments ? findLastGoodDeployment(deployments) : null;

  const handleRollback = async (deployment: NonNullable<typeof deployments>[number]) => {
    const commit = deployment.commitHash?.slice(0, 7) ?? deployment.id.slice(0, 8);
    const ok = await confirm({
      title: t('projectDetail', 'rollbackConfirmTitle'),
      description: formatMessage(t('projectDetail', 'rollbackConfirmDesc'), {
        commit,
        branch: deployment.branch || '—',
      }),
      confirmText: t('projectDetail', 'rollback'),
      variant: 'warning',
    });
    if (ok) onRollback(deployment.id);
  };

  if (!deployments || deployments.length === 0) {
    return (
      <div className="dash-card px-6 py-14 text-center">
        <Rocket className="dash-empty-icon mb-3" />
        <h3 className="text-[15px] mb-1">{t('projectDetail', 'noDeploymentsYet')}</h3>
        <p className="text-sm text-[var(--text-secondary)]">{t('projectDetail', 'pushToTrigger')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      <div className="dash-callout flex-col gap-1.5 text-[13px]" role="note">
        <p className="dash-section-label">{t('projectDetail', 'logsHelpTitle')}</p>
        <ul className="space-y-1 text-[var(--text-secondary)]">
          <li className="flex gap-2"><FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden />{t('projectDetail', 'logsHelpBuild')}</li>
          <li className="flex gap-2"><Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden />{t('projectDetail', 'logsHelpContainer')}</li>
          <li className="flex gap-2"><History className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden />{t('projectDetail', 'logsHelpHistorical')}</li>
        </ul>
      </div>
      <div className="dash-rows">
      {deployments.map((deployment, index) => (
        <div key={deployment.id} className="dash-row">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 min-w-0">
                <span className={`badge shrink-0 ${getStatusBadge(deployment.status)}`}>
                  {deployment.status}
                </span>
                {deployment.status === 'pending' && deployment.inQueue && (
                  <span className="badge badge-neutral shrink-0">
                    {deployment.queuePosition
                      ? formatMessage(t('projectDetail', 'deployQueuePosition'), {
                          position: deployment.queuePosition,
                        })
                      : t('projectDetail', 'deployQueueWaiting')}
                  </span>
                )}
                <span className="terminal-text text-[13px] text-[var(--text-primary)] truncate max-w-[160px] sm:max-w-[260px]">
                  {deployment.branch}
                </span>
                {deployment.commitHash && (
                  <span className="terminal-text text-xs text-[var(--text-muted)] shrink-0">
                    {deployment.commitHash.slice(0, 7)}
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)] shrink-0 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden />
                  {formatTimeAgo(deployment.createdAt, t)}
                </span>
                {deployment.trigger && (
                  <span className="dash-section-label shrink-0">{deployment.trigger}</span>
                )}
              </div>
              {deployment.commitMessage && (
                <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 truncate">{deployment.commitMessage}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {['pending', 'building', 'deploying'].includes(deployment.status) && (
                <button onClick={() => onCancel(deployment.id)} className="btn btn-ghost btn-sm text-[var(--status-error)]">
                  {t('projectDetail', 'cancel')}
                </button>
              )}
              {canRollbackToDeployment(deployment) && (
                <button
                  type="button"
                  onClick={() => handleRollback(deployment)}
                  className="btn btn-secondary btn-sm"
                  title={
                    deployment.dockerImageId
                      ? t('projectDetail', 'rollbackQuickHint')
                      : undefined
                  }
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  {t('projectDetail', 'rollbackToVersion')}
                </button>
              )}
              {deployment.status === 'failed' && lastGood && deployment.id === deployments[0]?.id && (
                <button
                  type="button"
                  onClick={() => handleRollback(lastGood)}
                  className="btn btn-secondary btn-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('projectDetail', 'rollbackToLastGood')}
                </button>
              )}
              {deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {t('projectDetail', 'preview')}
                </a>
              )}
              <button
                onClick={() => onViewLogs(deployment)}
                className="btn btn-ghost btn-sm"
                title={t('projectDetail', 'logsHelpBuild')}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                {t('projectDetail', 'viewLogs')}
              </button>
              {deployment.status === 'running' && (
                <button
                  onClick={() => onViewContainerLogs(deployment.id)}
                  className="btn btn-ghost btn-sm"
                  title={t('projectDetail', 'logsHelpContainer')}
                >
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  {t('projectDetail', 'containerLogs')}
                </button>
              )}
              {(deployment.status === 'running' || deployment.status === 'stopped' || deployment.status === 'failed') && (
                <button
                  onClick={() => onViewHistoricalLogs(deployment.id)}
                  className="btn btn-ghost btn-sm"
                  title={t('projectDetail', 'logsHelpHistorical')}
                >
                  <History className="w-3.5 h-3.5 shrink-0" />
                  {t('projectDetail', 'historicalLogs')}
                </button>
              )}
            </div>
          </div>
          {deployment.status === 'failed' && (
            <div className="mt-3 [&>div]:mb-0">
              <DeploymentFailureSummary
                logs={deployment.buildLogs}
                errorMessage={deployment.errorMessage}
              />
            </div>
          )}
          {(() => {
            const diff = deploymentDiff(deployment, deployments[index + 1], gitRepoUrl);
            return diff ? <DeploymentDiffLine diff={diff} t={t} /> : null;
          })()}
          <DeploymentTimeline deployment={deployment} />
        </div>
      ))}
      </div>
    </div>
  );
}
