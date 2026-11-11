'use client';

import Link from 'next/link';
import { Activity, ArrowUpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useServer, useServerHealth } from '@/hooks/useServers';
import { formatMessage } from '@/lib/i18n/format-message';
import {
  type DeployFailureCategory,
  parseDeployFailureBlame,
  parseDeployFailureCategory,
} from '@/lib/deployment-utils';

const BOX_CLASS =
  'mb-4 px-3 py-2.5 sm:px-4 sm:py-3 rounded-[10px] border border-[var(--status-error)]/25 bg-[var(--status-error)]/[0.04]';

export function DeploymentFailureSummary({
  logs,
  errorMessage,
  serverId,
}: {
  logs?: string | null;
  errorMessage?: string | null;
  /** Server the project deploys to; lets a full disk point at its health and resize */
  serverId?: string | null;
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

  if (category === 'disk_space' && serverId) {
    return <DiskSpaceFailureCard serverId={serverId} blameLabel={blameLabel} />;
  }

  return (
    <div className={BOX_CLASS}>
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

/** Full disk: name the server, show how full it is and link to its health and resize. */
export function DiskSpaceFailureCard({
  serverId,
  blameLabel,
}: {
  serverId: string;
  blameLabel: string | null;
}) {
  const { t } = useTranslation();
  const { data: server } = useServer(serverId);
  // Same gate as the server health panel: the scan needs a running, set-up host
  const canScan = server?.setupStatus === 'completed' && server?.status === 'running';
  const { data: health } = useServerHealth(serverId, canScan);
  const canResize = !!server && server.isManaged && server.provider === 'hetzner';

  const usedPercent = health?.disk.usedPercent ?? server?.diskUsedPercent ?? null;
  const availGb = health?.disk.availGb ?? null;
  const serverHref = `/dashboard/servers/${serverId}`;

  return (
    <div className={BOX_CLASS}>
      <p className="dash-section-label !text-[var(--status-error)] mb-1.5">
        {t('projectDetail', 'deploymentErrorTitle')}
      </p>
      <p className="text-[13px] text-[var(--text-muted)] mb-1.5">
        {blameLabel ? <>{blameLabel} · </> : null}
        {server
          ? formatMessage(t('projectDetail', 'diskFullOnServer'), { server: server.name })
          : t('projectDetail', 'diskFullOnUnknownServer')}
      </p>
      {typeof usedPercent === 'number' && (
        <p className="terminal-text text-xs tabular-nums text-[var(--status-error)] mb-1.5">
          {typeof availGb === 'number'
            ? formatMessage(t('projectDetail', 'diskFullUsageFree'), {
                percent: usedPercent,
                free: availGb,
              })
            : formatMessage(t('projectDetail', 'diskFullUsage'), { percent: usedPercent })}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-2.5">
        <Link href={serverHref} className="btn btn-secondary btn-sm">
          <Activity className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {t('projectDetail', 'diskFullOpenHealth')}
        </Link>
        {canResize && (
          <Link href={`${serverHref}?resize=1`} className="btn btn-secondary btn-sm">
            <ArrowUpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {t('projectDetail', 'diskFullResize')}
          </Link>
        )}
      </div>
    </div>
  );
}
