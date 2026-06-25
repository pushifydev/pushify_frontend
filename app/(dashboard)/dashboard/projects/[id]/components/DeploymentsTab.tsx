'use client';

import {
  Clock,
  ExternalLink,
  FileText,
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
import { formatMessage } from '@/lib/i18n/format-message';
import { useDeployments, useTranslation } from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';

export function DeploymentsTab({
  deployments,
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
      <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
        <Rocket className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">{t('projectDetail', 'noDeploymentsYet')}</h3>
        <p className="text-[var(--text-secondary)]">{t('projectDetail', 'pushToTrigger')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      <div
        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-3 py-2.5 sm:px-4 text-xs text-[var(--text-secondary)]"
        role="note"
      >
        <p className="font-medium text-[var(--text-primary)] mb-1.5">{t('projectDetail', 'logsHelpTitle')}</p>
        <ul className="space-y-1 text-[var(--text-muted)] list-disc list-inside sm:list-outside sm:pl-4">
          <li>{t('projectDetail', 'logsHelpBuild')}</li>
          <li>{t('projectDetail', 'logsHelpContainer')}</li>
          <li>{t('projectDetail', 'logsHelpHistorical')}</li>
        </ul>
      </div>
      {deployments.map((deployment) => (
        <div
          key={deployment.id}
          className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0 overflow-hidden"
        >
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className={`badge shrink-0 ${getStatusBadge(deployment.status)}`}>
                {deployment.status}
              </span>
              {deployment.status === 'pending' && deployment.inQueue && (
                <span className="badge badge-warning shrink-0 text-xs">
                  {deployment.queuePosition
                    ? formatMessage(t('projectDetail', 'deployQueuePosition'), {
                        position: deployment.queuePosition,
                      })
                    : t('projectDetail', 'deployQueueWaiting')}
                </span>
              )}
              <span className="text-sm terminal-text truncate max-w-[140px] sm:max-w-none">{deployment.branch}</span>
              {deployment.commitHash && (
                <span className="text-sm text-[var(--text-muted)] shrink-0">
                  {deployment.commitHash.slice(0, 7)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {['pending', 'building', 'deploying'].includes(deployment.status) && (
                <button onClick={() => onCancel(deployment.id)} className="btn btn-ghost text-[var(--status-error)] h-8 text-xs">
                  {t('projectDetail', 'cancel')}
                </button>
              )}
              {canRollbackToDeployment(deployment) && (
                <button
                  type="button"
                  onClick={() => handleRollback(deployment)}
                  className="btn btn-secondary h-8 text-xs flex items-center gap-1"
                  title={
                    deployment.dockerImageId
                      ? t('projectDetail', 'rollbackQuickHint')
                      : undefined
                  }
                >
                  {deployment.dockerImageId && (
                    <span className="text-[var(--status-success)]">⚡</span>
                  )}
                  <RotateCcw className="w-3 h-3 shrink-0" />
                  {t('projectDetail', 'rollbackToVersion')}
                </button>
              )}
              {deployment.status === 'failed' && lastGood && deployment.id === deployments[0]?.id && (
                <button
                  type="button"
                  onClick={() => handleRollback(lastGood)}
                  className="btn btn-secondary h-8 text-xs flex items-center gap-1 border-[var(--accent-cyan)]/40"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('projectDetail', 'rollbackToLastGood')}
                </button>
              )}
              {deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary h-8 text-xs inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {t('projectDetail', 'preview')}
                </a>
              )}
              <button
                onClick={() => onViewLogs(deployment)}
                className="btn btn-ghost h-8 text-xs inline-flex items-center gap-1"
                title={t('projectDetail', 'logsHelpBuild')}
              >
                <FileText className="w-3 h-3 shrink-0" />
                {t('projectDetail', 'viewLogs')}
              </button>
              {deployment.status === 'running' && (
                <button
                  onClick={() => onViewContainerLogs(deployment.id)}
                  className="btn btn-secondary h-8 text-xs inline-flex items-center gap-1"
                  title={t('projectDetail', 'logsHelpContainer')}
                >
                  <Terminal className="w-3 h-3 shrink-0" />
                  {t('projectDetail', 'containerLogs')}
                </button>
              )}
              {(deployment.status === 'running' || deployment.status === 'stopped' || deployment.status === 'failed') && (
                <button
                  onClick={() => onViewHistoricalLogs(deployment.id)}
                  className="btn btn-ghost h-8 text-xs inline-flex items-center gap-1"
                  title={t('projectDetail', 'logsHelpHistorical')}
                >
                  <History className="w-3 h-3 shrink-0" />
                  {t('projectDetail', 'historicalLogs')}
                </button>
              )}
            </div>
          </div>
          {deployment.status === 'failed' && (
            <div className="mb-3">
              <DeploymentFailureSummary
                logs={deployment.buildLogs}
                errorMessage={deployment.errorMessage}
              />
            </div>
          )}
          {deployment.commitMessage && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">{deployment.commitMessage}</p>
          )}
          <DeploymentTimeline deployment={deployment} />
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mt-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(deployment.createdAt, t)}
            </span>
            <span className="capitalize">{deployment.trigger}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
