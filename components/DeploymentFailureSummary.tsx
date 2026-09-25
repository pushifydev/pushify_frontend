'use client';

import { useTranslation } from '@/hooks';
import {
  type DeployFailureCategory,
  parseDeployFailureBlame,
  parseDeployFailureCategory,
} from '@/lib/deployment-utils';

export function DeploymentFailureSummary({
  logs,
  errorMessage,
}: {
  logs?: string | null;
  errorMessage?: string | null;
}) {
  const { t } = useTranslation();
  const category = parseDeployFailureCategory(logs, errorMessage);
  const blame = parseDeployFailureBlame(errorMessage);

  if (!errorMessage && !category) return null;

  const hintByCategory: Record<DeployFailureCategory, () => string> = {
    repository_access: () => t('projectDetail', 'failureRepositoryAccess'),
    out_of_memory: () => t('projectDetail', 'failureOutOfMemory'),
    disk_space: () => t('projectDetail', 'failureDiskSpace'),
    platform_native: () => t('projectDetail', 'failurePlatformNative'),
    docker_build: () => t('projectDetail', 'failureDockerBuild'),
    application_build: () => t('projectDetail', 'failureApplicationBuild'),
    container_start: () => t('projectDetail', 'failureContainerStart'),
    server_capacity: () => t('projectDetail', 'failureServerCapacity'),
    project_config: () => t('projectDetail', 'failureProjectConfig'),
    unknown: () => t('projectDetail', 'failureUnknown'),
  };

  const blameLabel =
    blame === 'pushify'
      ? t('projectDetail', 'failureBlamePushify')
      : blame === 'server'
        ? t('projectDetail', 'failureBlameServer')
        : blame === 'project'
          ? t('projectDetail', 'failureBlameProject')
          : null;

  return (
    <div className="mb-4 px-3 py-2.5 sm:px-4 sm:py-3 rounded-[10px] border border-[var(--status-error)]/25 bg-[var(--status-error)]/[0.04]">
      {errorMessage && (
        <p className="dash-section-label !text-[var(--status-error)] mb-1.5">
          {t('projectDetail', 'deploymentErrorTitle')}
        </p>
      )}
      {category && (
        <p className="text-[13px] text-[var(--text-muted)] mb-1.5">
          {blameLabel ? <>{blameLabel} · </> : null}
          {hintByCategory[category]()}
        </p>
      )}
      {errorMessage && (
        <p className="terminal-text text-xs text-[var(--status-error)] break-all whitespace-pre-wrap leading-relaxed">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
