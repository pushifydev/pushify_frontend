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
    <div className="mb-4 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20">
      {category && (
        <p className="text-xs text-[var(--text-muted)] mb-2">
          {blameLabel ? `${blameLabel} · ` : ''}
          {hintByCategory[category]()}
        </p>
      )}
      {errorMessage && (
        <>
          <p className="text-xs sm:text-sm text-[var(--status-error)] font-medium mb-1">
            {t('projectDetail', 'deploymentErrorTitle')}
          </p>
          <p className="text-xs sm:text-sm text-[var(--status-error)] break-all whitespace-pre-wrap">
            {errorMessage}
          </p>
        </>
      )}
    </div>
  );
}
