'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Github, Globe, HelpCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useGitHubAppInstall, useGitHubConnect, useProjectGitAccess, useTranslation } from '@/hooks';

/**
 * Settings → GitHub access: which credential pulls this repository, and — when none can — the
 * two ways to fix it right here (install the App on the repo owner, or connect a GitHub account),
 * both coming back to this tab when GitHub is done.
 */
export function GitHubAccessSection({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: access, isLoading, isFetching, isError, refetch } = useProjectGitAccess(projectId);
  const connect = useGitHubConnect();
  const installApp = useGitHubAppInstall();

  if (access && access.provider !== 'github') return null;

  const returnTo = `/dashboard/projects/${projectId}?tab=settings`;
  const owner = access?.repoOwner ? `@${access.repoOwner}` : '';
  const status = isError ? 'unknown' : access?.status;
  const scopeLimited = !!access?.viewer.connected && access.viewer.hasRepoScope === false;
  const showActions = !!access && (status === 'no_access' || status === 'viewer_only' || status === 'unknown' || scopeLimited);
  const busy = connect.isPending || installApp.isPending;

  let icon: ReactNode = null;
  let message: ReactNode = null;
  switch (status) {
    case 'ok':
      icon = <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-success)]" />;
      message = (
        <>
          {access?.via?.source === 'app' ? t('projectDetail', 'gitAccessOkApp') : t('projectDetail', 'gitAccessOkOAuth')}{' '}
          {access?.via?.account && <strong className="text-[var(--text-primary)]">@{access.via.account}</strong>}
        </>
      );
      break;
    case 'viewer_only':
      icon = <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-warning)]" />;
      message = t('projectDetail', 'gitAccessViewerOnly');
      break;
    case 'public':
      icon = <Globe className="w-4 h-4 shrink-0 mt-0.5 text-[var(--text-muted)]" />;
      message = t('projectDetail', 'gitAccessPublic');
      break;
    case 'no_access':
      icon = <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-error)]" />;
      message = t('projectDetail', 'gitAccessNone').replace('{owner}', owner || access?.repoFullName || '');
      break;
    case 'unknown':
      icon = <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--text-muted)]" />;
      message = t('projectDetail', 'gitAccessUnknown');
      break;
  }

  return (
    <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{t('projectDetail', 'gitAccessTitle')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('projectDetail', 'gitAccessDesc')}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-ghost text-xs py-1.5 px-2.5 shrink-0 text-[var(--text-secondary)]"
          title={t('projectDetail', 'gitAccessRecheck')}
          aria-label={t('projectDetail', 'gitAccessRecheck')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mt-4">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {access?.repoFullName && (
            <div className="flex items-center gap-2 text-sm font-mono text-[var(--text-secondary)] min-w-0">
              <Github className="w-4 h-4 shrink-0" />
              <span className="truncate">{access.repoFullName}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              {icon}
              <span className="min-w-0">{message}</span>
            </div>
          )}

          {scopeLimited && (
            <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-warning)]" />
              <span className="min-w-0">
                {t('projectDetail', 'gitAccessPublicOnlyScope').replace('{username}', access?.viewer.username ?? '')}
              </span>
            </div>
          )}

          {showActions && (
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {access?.appConfigured && access.repoOwner && status !== 'unknown' && (
                  <button
                    type="button"
                    onClick={() => installApp.mutate(returnTo)}
                    disabled={busy}
                    className="btn btn-primary text-sm"
                  >
                    {installApp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                    {t('projectDetail', 'gitAccessInstallApp').replace('{owner}', owner)}
                  </button>
                )}
                {access?.oauthConfigured && status !== 'unknown' && (
                  <button
                    type="button"
                    onClick={() => connect.mutate(returnTo)}
                    disabled={busy}
                    className={access.appConfigured ? 'btn btn-secondary text-sm' : 'btn btn-primary text-sm'}
                  >
                    {connect.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {access.viewer.connected ? t('projectDetail', 'gitAccessReconnect') : t('projectDetail', 'gitAccessConnect')}
                  </button>
                )}
                {status === 'unknown' && (
                  <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-secondary text-sm">
                    <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                    {t('projectDetail', 'gitAccessRecheck')}
                  </button>
                )}
              </div>
              {access?.oauthConfigured && status !== 'unknown' && (
                <p className="text-xs text-[var(--text-muted)]">
                  {access.viewer.connected && access.viewer.username
                    ? `${t('projectDetail', 'gitAccessConnectedAs').replace('{username}', access.viewer.username)} · `
                    : ''}
                  {t('projectDetail', 'gitAccessConnectHint')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
