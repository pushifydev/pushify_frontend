'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Github, Globe, HelpCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useGitHubAppInstall, useGitHubConnect, useProjectGitAccess, useTranslation } from '@/hooks';
import { SettingsSection } from './SettingsParts';

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
    <SettingsSection
      id="settings-git"
      title={t('projectDetail', 'gitAccessTitle')}
      description={t('projectDetail', 'gitAccessDesc')}
      action={
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-ghost btn-sm !px-2"
          title={t('projectDetail', 'gitAccessRecheck')}
          aria-label={t('projectDetail', 'gitAccessRecheck')}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      }
      padded
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]" role="status">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {access?.repoFullName && (
            <div className="flex items-center gap-2 terminal-text text-[13px] text-[var(--text-primary)] min-w-0">
              <Github className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
              <span className="truncate">{access.repoFullName}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
              {icon}
              <span className="min-w-0">{message}</span>
            </div>
          )}

          {scopeLimited && (
            <div className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--status-warning)]" />
              <span className="min-w-0">
                {t('projectDetail', 'gitAccessPublicOnlyScope').replace('{username}', access?.viewer.username ?? '')}
              </span>
            </div>
          )}

          {showActions && (
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {access?.appConfigured && access.repoOwner && status !== 'unknown' && (
                  <button
                    type="button"
                    onClick={() => installApp.mutate(returnTo)}
                    disabled={busy}
                    className="btn btn-primary btn-sm"
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
                    className={access.appConfigured ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                  >
                    {connect.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {access.viewer.connected ? t('projectDetail', 'gitAccessReconnect') : t('projectDetail', 'gitAccessConnect')}
                  </button>
                )}
                {status === 'unknown' && (
                  <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-secondary btn-sm">
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
    </SettingsSection>
  );
}
