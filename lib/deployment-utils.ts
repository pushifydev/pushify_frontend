import type { Deployment } from '@/lib/api/types';

export function canRollbackToDeployment(deployment: Deployment): boolean {
  return deployment.status === 'running' || deployment.status === 'stopped';
}

/** Previous successful deployment to restore when the latest deploy failed */
export function findLastGoodDeployment(deployments: Deployment[]): Deployment | null {
  if (deployments.length < 2) return null;
  const latest = deployments[0];
  if (latest.status !== 'failed') return null;

  return (
    deployments.find(
      (d, index) =>
        index > 0 && (d.status === 'running' || d.status === 'stopped'),
    ) ?? null
  );
}

export function formatDurationMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? `${min}m ${rem}s` : `${min}m`;
}

function diffMs(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  return b - a;
}

export type DeployFailureCategory =
  | 'out_of_memory'
  | 'disk_space'
  | 'platform_native'
  | 'docker_build'
  | 'application_build'
  | 'container_start'
  | 'server_capacity'
  | 'project_config'
  | 'unknown';

export type DeployFailureBlame = 'pushify' | 'server' | 'project';

const CATEGORY_RE = /\[Pushify\] failureCategory=([a-z_]+)/;

export function parseDeployFailureCategory(
  logs?: string | null,
  errorMessage?: string | null,
): DeployFailureCategory | null {
  const text = `${logs ?? ''}\n${errorMessage ?? ''}`;
  const m = text.match(CATEGORY_RE);
  return m ? (m[1] as DeployFailureCategory) : null;
}

export function parseDeployFailureBlame(errorMessage?: string | null): DeployFailureBlame | null {
  if (!errorMessage) return null;
  if (errorMessage.startsWith('[Pushify]')) return 'pushify';
  if (errorMessage.startsWith('[Server]')) return 'server';
  if (errorMessage.startsWith('[Project]')) return 'project';
  return null;
}

const FAILURE_I18N_KEYS: Record<DeployFailureCategory, string> = {
  out_of_memory: 'failureOutOfMemory',
  disk_space: 'failureDiskSpace',
  platform_native: 'failurePlatformNative',
  docker_build: 'failureDockerBuild',
  application_build: 'failureApplicationBuild',
  container_start: 'failureContainerStart',
  server_capacity: 'failureServerCapacity',
  project_config: 'failureProjectConfig',
  unknown: 'failureUnknown',
};

/** i18n keys under projectDetail */
export function getDeployFailureI18nKey(category: DeployFailureCategory | null): string | null {
  if (!category) return null;
  return FAILURE_I18N_KEYS[category];
}

export interface DeploymentTimelineStep {
  key: string;
  labelKey:
    | 'timelineQueued'
    | 'timelineBuild'
    | 'timelineDeploy'
    | 'timelineLive'
    | 'timelineFailed';
  at: string | null;
  duration: string | null;
  state: 'done' | 'active' | 'pending' | 'error';
}

export function getDeploymentTimelineSteps(deployment: Deployment): DeploymentTimelineStep[] {
  const buildMs = diffMs(deployment.buildStartedAt, deployment.buildFinishedAt);
  const deployMs = diffMs(deployment.deployStartedAt, deployment.deployFinishedAt);
  const isFailed = deployment.status === 'failed';
  const isLive = deployment.status === 'running' || deployment.status === 'stopped';
  const inBuild = ['pending', 'building'].includes(deployment.status);
  const inDeploy = deployment.status === 'deploying';

  const steps: DeploymentTimelineStep[] = [
    {
      key: 'queued',
      labelKey: 'timelineQueued',
      at: deployment.createdAt,
      duration: null,
      state: inBuild || inDeploy || isLive || isFailed ? 'done' : 'active',
    },
    {
      key: 'build',
      labelKey: 'timelineBuild',
      at: deployment.buildStartedAt,
      duration: buildMs != null ? formatDurationMs(buildMs) : null,
      state: isFailed && !deployment.buildFinishedAt
        ? 'error'
        : buildMs != null
          ? 'done'
          : inBuild
            ? 'active'
            : 'pending',
    },
    {
      key: 'deploy',
      labelKey: 'timelineDeploy',
      at: deployment.deployStartedAt,
      duration: deployMs != null ? formatDurationMs(deployMs) : null,
      state: isFailed && deployment.buildFinishedAt && !deployment.deployFinishedAt
        ? 'error'
        : deployMs != null
          ? 'done'
          : inDeploy
            ? 'active'
            : 'pending',
    },
    {
      key: 'live',
      labelKey: isFailed ? 'timelineFailed' : 'timelineLive',
      at: deployment.deployFinishedAt ?? (isLive ? deployment.createdAt : null),
      duration: null,
      state: isFailed ? 'error' : isLive ? 'done' : 'pending',
    },
  ];

  return steps;
}
