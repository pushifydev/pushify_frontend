import { describe, it, expect } from 'vitest';
import { buildSeconds, compareUrl, deploymentDiff, formatSeconds } from './deployment-diff';
import type { Deployment } from '@/lib/api/types';

function dep(over: Partial<Deployment>): Deployment {
  return {
    id: 'd',
    projectId: 'p',
    status: 'running',
    trigger: 'push',
    commitHash: null,
    commitMessage: null,
    branch: 'main',
    url: null,
    buildLogs: null,
    deployLogs: null,
    errorMessage: null,
    buildStartedAt: null,
    buildFinishedAt: null,
    deployStartedAt: null,
    deployFinishedAt: null,
    createdAt: '2026-09-09T00:00:00Z',
    ...over,
  } as Deployment;
}

describe('buildSeconds', () => {
  it('rounds wall-clock build time to whole seconds', () => {
    expect(buildSeconds({ buildStartedAt: '2026-09-09T00:00:00Z', buildFinishedAt: '2026-09-09T00:00:47.4Z' })).toBe(47);
  });
  it('is null while the build is still running or timestamps are missing', () => {
    expect(buildSeconds({ buildStartedAt: '2026-09-09T00:00:00Z', buildFinishedAt: null })).toBeNull();
  });
});

describe('compareUrl', () => {
  it('builds GitHub and GitLab compare links and strips .git', () => {
    expect(compareUrl('https://github.com/org/app.git', 'aaa', 'bbb')).toBe('https://github.com/org/app/compare/aaa...bbb');
    expect(compareUrl('https://gitlab.com/org/app', 'aaa', 'bbb')).toBe('https://gitlab.com/org/app/-/compare/aaa...bbb');
  });
  it('returns null for unknown forges or bad URLs', () => {
    expect(compareUrl('https://git.example.com/x/y.git', 'a', 'b')).toBeNull();
    expect(compareUrl('not a url', 'a', 'b')).toBeNull();
  });
});

describe('deploymentDiff', () => {
  const previous = dep({
    commitHash: 'aaaaaaa1111',
    buildStartedAt: '2026-09-09T00:00:00Z',
    buildFinishedAt: '2026-09-09T00:01:00Z',
  });

  it('is null for the very first deployment', () => {
    expect(deploymentDiff(dep({}), undefined)).toBeNull();
  });

  it('reports a faster build and a compare link for new code', () => {
    const current = dep({
      commitHash: 'bbbbbbb2222',
      buildStartedAt: '2026-09-09T01:00:00Z',
      buildFinishedAt: '2026-09-09T01:00:48Z',
    });
    const diff = deploymentDiff(current, previous, 'https://github.com/org/app')!;
    expect(diff.buildSeconds).toBe(48);
    expect(diff.buildDeltaSeconds).toBe(-12);
    expect(diff.sameCommit).toBe(false);
    expect(diff.compareUrl).toBe('https://github.com/org/app/compare/aaaaaaa1111...bbbbbbb2222');
    expect(diff.fromSha).toBe('aaaaaaa');
    expect(diff.toSha).toBe('bbbbbbb');
  });

  it('flags a redeploy of the same commit and offers no compare link', () => {
    const current = dep({ commitHash: 'aaaaaaa1111' });
    const diff = deploymentDiff(current, previous, 'https://github.com/org/app')!;
    expect(diff.sameCommit).toBe(true);
    expect(diff.compareUrl).toBeNull();
    expect(diff.buildDeltaSeconds).toBeNull();
  });
});

describe('formatSeconds', () => {
  it('formats seconds and minutes compactly', () => {
    expect(formatSeconds(47)).toBe('47s');
    expect(formatSeconds(60)).toBe('1m');
    expect(formatSeconds(125)).toBe('2m 5s');
  });
});
