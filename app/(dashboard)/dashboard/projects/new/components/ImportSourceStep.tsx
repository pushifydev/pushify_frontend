'use client';

import {
  Check,
  GitBranch,
  Github,
  Globe,
  Loader2,
  RefreshCw,
  Unlink,
  EyeOff,
  AlertCircle,
  Sparkles, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { SettingsSection } from '@/components/dashboard/SettingsParts';
import { FRAMEWORKS } from '@/lib/frameworks';
import type { useImportSource } from '../hooks/useImportSource';
import { Select } from '@/components/ui/select';

type ImportSource = ReturnType<typeof useImportSource>;

type ImportSourceStepProps = Pick<
  ImportSource,
  | 'sourceType'
  | 'setSourceType'
  | 'repositoryUrl'
  | 'setRepositoryUrl'
  | 'gitBranch'
  | 'setGitBranch'
  | 'selectedRepo'
  | 'setSelectedRepo'
  | 'repoSearchQuery'
  | 'setRepoSearchQuery'
  | 'selectedGitLabRepo'
  | 'setSelectedGitLabRepo'
  | 'gitlabRepoSearchQuery'
  | 'setGitlabRepoSearchQuery'
  | 'githubStatus'
  | 'isLoadingGitHubStatus'
  | 'githubConnect'
  | 'githubAppInstall'
  | 'appInstallations'
  | 'hasAppInstallation'
  | 'useAppPicker'
  | 'setPreferOAuthPicker'
  | 'installations'
  | 'selectedAppInstallationId'
  | 'setSelectedAppInstallationId'
  | 'selectedAppRepo'
  | 'selectAppRepo'
  | 'appRepoSearchQuery'
  | 'setAppRepoSearchQuery'
  | 'filteredAppRepos'
  | 'isLoadingAppRepos'
  | 'appReposError'
  | 'githubBusy'
  | 'handleDisconnectGithub'
  | 'handleChangeGithubAccount'
  | 'gitlabStatus'
  | 'isLoadingGitLabStatus'
  | 'gitlabConnect'
  | 'gitlabBusy'
  | 'handleDisconnectGitlab'
  | 'handleChangeGitlabAccount'
  | 'isLoadingRepos'
  | 'hasMore'
  | 'loadMore'
  | 'isLoadingMore'
  | 'githubBranches'
  | 'isLoadingBranches'
  | 'filteredRepos'
  | 'isLoadingGitLabRepos'
  | 'gitlabHasMore'
  | 'gitlabLoadMore'
  | 'isLoadingMoreGitlab'
  | 'gitlabBranches'
  | 'isLoadingGitLabBranches'
  | 'filteredGitlabRepos'
  | 'frameworkDetection'
  | 'isDetectingFramework'
> & {
  selectedFramework: string | null;
  setSelectedFramework: (value: string | null) => void;
  setProjectName: (value: string) => void;
};

export function ImportSourceStep({
  sourceType,
  setSourceType,
  repositoryUrl,
  setRepositoryUrl,
  gitBranch,
  setGitBranch,
  selectedRepo,
  setSelectedRepo,
  repoSearchQuery,
  setRepoSearchQuery,
  selectedGitLabRepo,
  setSelectedGitLabRepo,
  gitlabRepoSearchQuery,
  setGitlabRepoSearchQuery,
  githubStatus,
  isLoadingGitHubStatus,
  githubConnect,
  githubAppInstall,
  appInstallations,
  hasAppInstallation,
  useAppPicker,
  setPreferOAuthPicker,
  installations,
  selectedAppInstallationId,
  setSelectedAppInstallationId,
  selectedAppRepo,
  selectAppRepo,
  appRepoSearchQuery,
  setAppRepoSearchQuery,
  filteredAppRepos,
  isLoadingAppRepos,
  appReposError,
  githubBusy,
  handleDisconnectGithub,
  handleChangeGithubAccount,
  gitlabStatus,
  isLoadingGitLabStatus,
  gitlabConnect,
  gitlabBusy,
  handleDisconnectGitlab,
  handleChangeGitlabAccount,
  isLoadingRepos,
  hasMore,
  loadMore,
  isLoadingMore,
  githubBranches,
  isLoadingBranches,
  filteredRepos,
  isLoadingGitLabRepos,
  gitlabHasMore,
  gitlabLoadMore,
  isLoadingMoreGitlab,
  gitlabBranches,
  isLoadingGitLabBranches,
  filteredGitlabRepos,
  frameworkDetection,
  isDetectingFramework,
  selectedFramework,
  setSelectedFramework,
  setProjectName,
}: ImportSourceStepProps) {
  const { t } = useTranslation();

  const sources: {
    id: typeof sourceType;
    icon: React.ReactNode;
    title: string;
    desc: string;
    connected?: boolean;
  }[] = [
    { id: 'git', icon: <GitBranch className="w-4 h-4" />, title: t('newProject', 'gitUrl'), desc: t('newProject', 'gitUrlDesc') },
    {
      id: 'github',
      icon: <Github className="w-4 h-4" />,
      title: t('newProject', 'connectGithub'),
      desc: t('newProject', 'connectGithubDesc'),
      connected: !!githubStatus?.connected,
    },
    {
      id: 'gitlab',
      icon: <Globe className="w-4 h-4" />,
      title: t('newProject', 'connectGitlab'),
      desc: t('newProject', 'connectGitlabDesc'),
      connected: !!gitlabStatus?.connected,
    },
    { id: 'template', icon: <Sparkles className="w-4 h-4" />, title: t('newProject', 'template'), desc: t('newProject', 'templateDesc') },
  ];

  return (
    <SettingsSection
      id="np-source"
      title={t('newProject', 'importSource')}
      description={t('newProject', 'importSourceDesc')}
      padded
    >
    <div className="space-y-5">
      {/* Source Type Selection */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        role="radiogroup"
        aria-label={t('newProject', 'importSource')}
      >
        {sources.map((src) => (
          <button
            key={src.id}
            type="button"
            role="radio"
            aria-checked={sourceType === src.id}
            onClick={() => setSourceType(src.id)}
            className="dash-option text-left !flex-col !gap-2"
          >
            <span className="flex items-center justify-between w-full gap-2 text-[var(--text-secondary)]">
              {src.icon}
              {src.connected && (
                <span className="inline-flex items-center gap-1.5 dash-section-label !text-[10px]">
                  <span className="dash-status-dot is-success" aria-hidden />
                  {t('newProject', 'connected')}
                </span>
              )}
            </span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{src.title}</span>
            <span className="text-xs leading-relaxed text-[var(--text-muted)]">{src.desc}</span>
          </button>
        ))}
      </div>

      {/* Git URL Input */}
      {sourceType === 'git' && (
        <div className="space-y-4 pt-5 border-t border-[var(--border-subtle)]">
          <div>
            <label className="dash-field-label !pt-0 mb-2">{t('newProject', 'repositoryUrl')}</label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="input"
            />
          </div>
          <div>
            <label className="dash-field-label !pt-0 mb-2">{t('newProject', 'branch')}</label>
            <input
              type="text"
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
              placeholder="main"
              className="input"
            />
          </div>
        </div>
      )}

      {/* GitHub Connect */}
      {sourceType === 'github' && (
        <div className="pt-5 border-t border-[var(--border-subtle)]">
          {hasAppInstallation && !useAppPicker && (
            <button
              type="button"
              onClick={() => setPreferOAuthPicker(false)}
              className="mb-3 text-xs font-medium text-[var(--text-muted)] hover:underline underline-offset-4"
            >
              ← {t('newProject', 'githubAppUsePicker')}
            </button>
          )}
          {isLoadingGitHubStatus ? (
            <div className="dash-empty is-bare">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'checkingGitHub')}</p>
            </div>
          ) : useAppPicker ? (
            <div className="space-y-4">
              {(() => {
                const inst = installations.find((i) => i.installationId === selectedAppInstallationId) ?? installations[0];
                const manageUrl =
                  inst?.manageUrl ??
                  (inst
                    ? inst.accountType === 'Organization'
                      ? `https://github.com/organizations/${inst.accountLogin}/settings/installations/${inst.installationId}`
                      : `https://github.com/settings/installations/${inst.installationId}`
                    : 'https://github.com/settings/installations');
                return (
                  <div className="dash-callout flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <span className="dash-status-dot is-success" aria-hidden />
                      <span className="truncate">
                        {t('newProject', 'githubAppInstalledOn')}{' '}
                        {installations.length > 1 ? (
                          <Select
                            size="sm"
                            value={String(selectedAppInstallationId ?? '')}
                            onValueChange={(v) => setSelectedAppInstallationId(Number(v))}
                            className="align-middle"
                            aria-label={t('newProject', 'githubAppInstalledOn')}
                            options={installations.map((i) => ({
                              value: String(i.installationId),
                              label: `@${i.accountLogin}`,
                            }))}
                          />
                        ) : (
                          <span className="font-medium">@{inst?.accountLogin}</span>
                        )}
                        <span className="text-[var(--text-muted)]">
                          {' '}· {inst?.repositorySelection === 'all' ? t('newProject', 'githubAppAllRepos') : t('newProject', 'githubAppSelectedRepos')}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <a href={manageUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        {t('newProject', 'githubAppManage')}
                      </a>
                      <button type="button" onClick={() => githubAppInstall.mutate()} disabled={githubAppInstall.isPending} className="btn btn-ghost btn-sm">
                        {t('newProject', 'githubAppAddAccount')}
                      </button>
                      {githubStatus?.connected ? (
                        <button type="button" onClick={() => setPreferOAuthPicker(true)} className="btn btn-ghost btn-sm">
                          {t('newProject', 'githubAppUseOAuth')}
                        </button>
                      ) : (
                        <button type="button" onClick={() => githubConnect.mutate()} disabled={githubConnect.isPending} className="btn btn-ghost btn-sm">
                          {t('newProject', 'githubOrConnectAccount')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="relative">
                <input
                  type="text"
                  value={appRepoSearchQuery}
                  onChange={(e) => setAppRepoSearchQuery(e.target.value)}
                  placeholder={t('newProject', 'searchRepos')}
                  className="input pl-10!"
                />
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>

              <div className="dash-rows max-h-72 !overflow-y-auto">
                {isLoadingAppRepos ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'loadingRepos')}</p>
                  </div>
                ) : appReposError ? (
                  <div className="p-6 text-center text-sm text-[var(--status-error)]">
                    {appReposError instanceof Error ? appReposError.message : String(appReposError)}
                  </div>
                ) : filteredAppRepos.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                    {appRepoSearchQuery ? t('newProject', 'noReposFound') : t('newProject', 'githubAppNoRepos')}
                  </div>
                ) : (
                  filteredAppRepos.map((repo) => {
                    const active = selectedAppRepo?.id === repo.id;
                    return (
                      <button
                        key={repo.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectAppRepo(repo)}
                        className={`w-full px-4 py-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--hover-overlay)] transition-colors ${active ? 'bg-[var(--hover-overlay-lg)]' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--text-muted)] shrink-0" title={repo.private ? 'Private' : 'Public'}>
                            {repo.private ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--text-primary)] truncate">{repo.fullName.split('/').pop()}</div>
                            <div className="terminal-text text-xs text-[var(--text-muted)] truncate">{repo.fullName} · {repo.defaultBranch}</div>
                          </div>
                          {active && <Check className="w-4 h-4 text-[var(--text-primary)]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedAppRepo && (
                <div>
                  <label className="dash-field-label !pt-0 mb-2">{t('newProject', 'branch')}</label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    placeholder={selectedAppRepo.defaultBranch || 'main'}
                    className="input"
                  />
                </div>
              )}
            </div>
          ) : !githubStatus?.connected ? (
            <div className="dash-empty is-bare">
                            <h3 className="dash-empty-title mb-1.5">{t('newProject', 'githubIntegration')}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t('newProject', 'githubIntegrationDesc')}</p>
              <div className="flex flex-col items-center gap-2">
                {appInstallations?.configured && (
                  <>
                    <button
                      type="button"
                      onClick={() => githubAppInstall.mutate()}
                      disabled={githubAppInstall.isPending}
                      className="btn btn-primary"
                    >
                      {githubAppInstall.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('newProject', 'connecting')}
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4" />
                          {t('newProject', 'githubAppInstall')}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-[var(--text-muted)]">
                      {t('newProject', 'githubAppRecommended')}
                    </p>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => githubConnect.mutate()}
                  disabled={githubConnect.isPending}
                  className={appInstallations?.configured ? 'btn btn-ghost text-sm mt-1' : 'btn btn-primary'}
                >
                  {githubConnect.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'connecting')}
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      {appInstallations?.configured
                        ? t('newProject', 'githubOrConnectAccount')
                        : t('newProject', 'connectGithubBtn')}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="dash-callout flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
                  <span className="dash-status-dot is-success" aria-hidden />
                  <span className="truncate">
                    {t('newProject', 'connectedAs')}{' '}
                    <span className="font-medium">@{githubStatus.username}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleChangeGithubAccount}
                    disabled={githubBusy}
                    className="btn btn-secondary btn-sm"
                  >
                    {githubBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {t('newProject', 'changeGithubAccount')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGithub}
                    disabled={githubBusy}
                    className="btn btn-ghost btn-sm"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {t('newProject', 'disconnectGithub')}
                  </button>
                </div>
              </div>

              {githubStatus?.hasRepoScope === false && (
                <div
                  className="dash-callout dash-callout-attention flex-col sm:flex-row sm:items-center gap-3 text-sm text-[var(--text-secondary)]"
                >
                  <span className="flex-1">{t('newProject', 'githubOauthPublicOnly')}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => githubConnect.mutate()} disabled={githubConnect.isPending} className="btn btn-primary btn-sm">
                      {githubConnect.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      {t('newProject', 'githubReconnect')}
                    </button>
                    {hasAppInstallation ? (
                      <button type="button" onClick={() => setPreferOAuthPicker(false)} className="btn btn-ghost btn-sm">
                        {t('newProject', 'githubAppUsePicker')}
                      </button>
                    ) : appInstallations?.configured ? (
                      <button type="button" onClick={() => githubAppInstall.mutate()} disabled={githubAppInstall.isPending} className="btn btn-ghost btn-sm">
                        {t('newProject', 'githubAppInstall')}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Search repos */}
              <div className="relative">
                <input
                  type="text"
                  value={repoSearchQuery}
                  onChange={(e) => setRepoSearchQuery(e.target.value)}
                  placeholder={t('newProject', 'searchRepos')}
                  className="input pl-10!"
                />
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>

              {/* Repository list */}
              <div className="dash-rows max-h-72 !overflow-y-auto">
                {isLoadingRepos ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'loadingRepos')}</p>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-muted)]">
                    {repoSearchQuery ? t('newProject', 'noReposFound') : t('newProject', 'noRepos')}
                  </div>
                ) : (
                  <>
                    {filteredRepos.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        aria-pressed={selectedRepo?.id === repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`w-full px-4 py-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--hover-overlay)] transition-colors ${
                          selectedRepo?.id === repo.id ? 'bg-[var(--hover-overlay-lg)]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--text-muted)] shrink-0" title={repo.private ? 'Private' : 'Public'}>
                            {repo.private ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--text-primary)] truncate">{repo.name}</div>
                            <div className="terminal-text text-xs text-[var(--text-muted)] truncate">
                              {repo.description || repo.full_name}
                            </div>
                          </div>
                          {selectedRepo?.id === repo.id && (
                            <Check className="w-4 h-4 text-[var(--text-primary)]" />
                          )}
                        </div>
                      </button>
                    ))}
                    {/* Load More Button */}
                    {hasMore && !repoSearchQuery && (
                      <button
                        type="button"
                        onClick={() => loadMore()}
                        disabled={isLoadingMore}
                        className="w-full p-3 text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] transition-colors border-t border-[var(--border-subtle)] disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('newProject', 'loadingMore')}
                          </span>
                        ) : (
                          t('newProject', 'loadMore')
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Branch selection */}
              {selectedRepo && (
                <div>
                  <label className="dash-field-label !pt-0 mb-2">{t('newProject', 'branch')}</label>
                  {isLoadingBranches ? (
                    <div className="input flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'loadingBranches')}
                    </div>
                  ) : (
                    <Select
                      value={gitBranch}
                      onValueChange={setGitBranch}
                      className="w-full"
                      mono
                      aria-label={t('newProject', 'branch')}
                      options={(githubBranches ?? []).map((branch) => ({
                        value: branch.name,
                        label: branch.name,
                        icon: branch.protected ? <Lock className="w-3.5 h-3.5" aria-label="protected" /> : undefined,
                      }))}
                    />
                  )}
                </div>
              )}

              {/* Framework detection status */}
              {selectedRepo && gitBranch && (
                <div className="dash-callout text-[13px]">
                  {isDetectingFramework ? (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'detectingFramework')}
                    </div>
                  ) : frameworkDetection?.framework ? (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="dash-status-dot is-success" aria-hidden />
                      {t('newProject', 'detectedFramework')}: <span className="font-medium">{frameworkDetection.framework}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <AlertCircle className="w-4 h-4" />
                      {t('newProject', 'noFrameworkDetected')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {sourceType === 'gitlab' && (
        <div className="pt-5 border-t border-[var(--border-subtle)]">
          {isLoadingGitLabStatus ? (
            <div className="dash-empty is-bare">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'checkingGitLab')}</p>
            </div>
          ) : !gitlabStatus?.connected ? (
            <div className="dash-empty is-bare">
                            <h3 className="dash-empty-title mb-1.5">{t('newProject', 'gitlabIntegration')}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t('newProject', 'gitlabIntegrationDesc')}</p>
              <button
                type="button"
                onClick={() => gitlabConnect.mutate()}
                disabled={gitlabConnect.isPending}
                className="btn btn-primary"
              >
                {gitlabConnect.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('newProject', 'connecting')}
                  </>
                ) : (
                  t('newProject', 'connectGitlabBtn')
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="dash-callout flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] min-w-0">
                  <span className="dash-status-dot is-success" aria-hidden />
                  <span className="truncate">
                    {t('newProject', 'connectedAs')}{' '}
                    <span className="font-medium">@{gitlabStatus.username}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleChangeGitlabAccount}
                    disabled={gitlabBusy}
                    className="btn btn-secondary btn-sm"
                  >
                    {gitlabBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {t('newProject', 'changeGitlabAccount')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGitlab}
                    disabled={gitlabBusy}
                    className="btn btn-ghost btn-sm"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {t('newProject', 'disconnectGitlab')}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={gitlabRepoSearchQuery}
                  onChange={(e) => setGitlabRepoSearchQuery(e.target.value)}
                  placeholder={t('newProject', 'searchRepos')}
                  className="input pl-10!"
                />
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              </div>

              <div className="dash-rows max-h-72 !overflow-y-auto">
                {isLoadingGitLabRepos ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'loadingRepos')}</p>
                  </div>
                ) : filteredGitlabRepos.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-muted)]">
                    {gitlabRepoSearchQuery ? t('newProject', 'noReposFound') : t('newProject', 'noRepos')}
                  </div>
                ) : (
                  <>
                    {filteredGitlabRepos.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        aria-pressed={selectedGitLabRepo?.id === repo.id}
                        onClick={() => setSelectedGitLabRepo(repo)}
                        className={`w-full px-4 py-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--hover-overlay)] transition-colors ${
                          selectedGitLabRepo?.id === repo.id ? 'bg-[var(--hover-overlay-lg)]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--text-primary)] truncate">{repo.full_name}</div>
                            <div className="terminal-text text-xs text-[var(--text-muted)] truncate">
                              {repo.description || repo.html_url}
                            </div>
                          </div>
                          {selectedGitLabRepo?.id === repo.id && (
                            <Check className="w-4 h-4 text-[var(--text-primary)]" />
                          )}
                        </div>
                      </button>
                    ))}
                    {gitlabHasMore && !gitlabRepoSearchQuery && (
                      <button
                        type="button"
                        onClick={() => gitlabLoadMore()}
                        disabled={isLoadingMoreGitlab}
                        className="w-full p-3 text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] transition-colors border-t border-[var(--border-subtle)]"
                      >
                        {isLoadingMoreGitlab ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('newProject', 'loadingMore')}
                          </span>
                        ) : (
                          t('newProject', 'loadMore')
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              {selectedGitLabRepo && (
                <div>
                  <label className="dash-field-label !pt-0 mb-2">{t('newProject', 'branch')}</label>
                  {isLoadingGitLabBranches ? (
                    <div className="input flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'loadingBranches')}
                    </div>
                  ) : (
                    <Select
                      value={gitBranch}
                      onValueChange={setGitBranch}
                      className="w-full"
                      mono
                      aria-label={t('newProject', 'branch')}
                      options={(gitlabBranches ?? []).map((branch) => ({
                        value: branch.name,
                        label: branch.name,
                        icon: branch.protected ? <Lock className="w-3.5 h-3.5" aria-label="protected" /> : undefined,
                      }))}
                    />
                  )}
                </div>
              )}

              {selectedGitLabRepo && gitBranch && (
                <div className="dash-callout text-[13px]">
                  {isDetectingFramework ? (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'detectingFramework')}
                    </div>
                  ) : frameworkDetection?.framework ? (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span className="dash-status-dot is-success" aria-hidden />
                      {t('newProject', 'detectedFramework')}:{' '}
                      <span className="font-medium">{frameworkDetection.framework}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <AlertCircle className="w-4 h-4" />
                      {t('newProject', 'noFrameworkDetected')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Template Selection */}
      {sourceType === 'template' && (
        <div className="pt-5 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2" role="radiogroup" aria-label={t('newProject', 'template')}>
            {FRAMEWORKS.slice(0, 6).map((fw) => (
              <button
                key={fw.id}
                onClick={() => {
                  setSelectedFramework(fw.id);
                  setProjectName(`my-${fw.id}-app`);
                }}
                type="button"
                role="radio"
                aria-checked={selectedFramework === fw.id}
                className="dash-option !items-center"
              >
                <span className="text-xl leading-none" aria-hidden>{fw.icon}</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{fw.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
    </SettingsSection>
  );
}
