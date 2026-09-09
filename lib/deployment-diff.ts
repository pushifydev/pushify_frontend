import type { Deployment } from '@/lib/api/types';

/**
 * "What changed vs the previous deploy" — pure helpers for the deployments list.
 * The list is newest-first, so `previous` is the next item down.
 */

export interface DeploymentDiff {
  /** Build wall-clock seconds for this deployment (null while building / unknown). */
  buildSeconds: number | null;
  /** Signed difference vs the previous deploy's build (positive = slower). */
  buildDeltaSeconds: number | null;
  /** Both deploys point at the same commit — a redeploy or rollback, not new code. */
  sameCommit: boolean;
  /** Forge compare URL between the two commits, when we can build one. */
  compareUrl: string | null;
  fromSha: string | null;
  toSha: string | null;
}

export function buildSeconds(d: Pick<Deployment, 'buildStartedAt' | 'buildFinishedAt'>): number | null {
  if (!d.buildStartedAt || !d.buildFinishedAt) return null;
  const ms = new Date(d.buildFinishedAt).getTime() - new Date(d.buildStartedAt).getTime();
  return Number.isFinite(ms) && ms >= 0 ? Math.round(ms / 1000) : null;
}

/** GitHub and GitLab both expose a compare view; GitLab nests it under /-/. */
export function compareUrl(gitRepoUrl: string | null | undefined, from: string, to: string): string | null {
  if (!gitRepoUrl) return null;
  let url: URL;
  try {
    url = new URL(gitRepoUrl);
  } catch {
    return null;
  }
  const base = `${url.origin}${url.pathname.replace(/\.git$/, '').replace(/\/+$/, '')}`;
  if (url.hostname.endsWith('github.com')) return `${base}/compare/${from}...${to}`;
  if (url.hostname.endsWith('gitlab.com')) return `${base}/-/compare/${from}...${to}`;
  return null;
}

export function deploymentDiff(
  current: Deployment,
  previous: Deployment | undefined,
  gitRepoUrl?: string | null,
): DeploymentDiff | null {
  if (!previous) return null;

  const cur = buildSeconds(current);
  const prev = buildSeconds(previous);
  const sameCommit = !!current.commitHash && current.commitHash === previous.commitHash;

  return {
    buildSeconds: cur,
    buildDeltaSeconds: cur !== null && prev !== null ? cur - prev : null,
    sameCommit,
    compareUrl:
      !sameCommit && current.commitHash && previous.commitHash
        ? compareUrl(gitRepoUrl, previous.commitHash, current.commitHash)
        : null,
    fromSha: previous.commitHash?.slice(0, 7) ?? null,
    toSha: current.commitHash?.slice(0, 7) ?? null,
  };
}

export function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m}m ${rest}s` : `${m}m`;
}
