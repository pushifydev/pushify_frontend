'use client';

import {
  Check,
  GitBranch,
  Github,
  Globe,
  Loader2,
  RefreshCw,
  Unlink,
  Zap,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { FRAMEWORKS } from '@/lib/frameworks';
import type { useImportSource } from '../hooks/useImportSource';

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('newProject', 'importSource')}</h2>
        <p className="text-[var(--text-secondary)]">{t('newProject', 'importSourceDesc')}</p>
      </div>

      {/* Source Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setSourceType('git')}
          className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
            sourceType === 'git'
              ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          }`}
        >
          <GitBranch className={`w-8 h-8 mb-3 ${sourceType === 'git' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className="font-semibold mb-1">{t('newProject', 'gitUrl')}</h3>
          <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'gitUrlDesc')}</p>
        </button>

        <button
          onClick={() => setSourceType('github')}
          className={`p-5 rounded-xl border-2 text-left transition-all duration-200 relative ${
            sourceType === 'github'
              ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/5'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          }`}
        >
          {githubStatus?.connected && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs bg-[var(--status-success)]/20 text-[var(--status-success)] flex items-center gap-1">
              <Check className="w-3 h-3" />
              {t('newProject', 'connected')}
            </div>
          )}
          <Github className={`w-8 h-8 mb-3 ${sourceType === 'github' ? 'text-[var(--accent-purple)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className="font-semibold mb-1">{t('newProject', 'connectGithub')}</h3>
          <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'connectGithubDesc')}</p>
        </button>

        <button
          onClick={() => setSourceType('gitlab')}
          className={`p-5 rounded-xl border-2 text-left transition-all duration-200 relative ${
            sourceType === 'gitlab'
              ? 'border-orange-500 bg-orange-500/5'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          }`}
        >
          {gitlabStatus?.connected && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs bg-[var(--status-success)]/20 text-[var(--status-success)] flex items-center gap-1">
              <Check className="w-3 h-3" />
              {t('newProject', 'connected')}
            </div>
          )}
          <Globe className={`w-8 h-8 mb-3 ${sourceType === 'gitlab' ? 'text-orange-500' : 'text-[var(--text-muted)]'}`} />
          <h3 className="font-semibold mb-1">{t('newProject', 'connectGitlab')}</h3>
          <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'connectGitlabDesc')}</p>
        </button>

        <button
          onClick={() => setSourceType('template')}
          className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${
            sourceType === 'template'
              ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          }`}
        >
          <Sparkles className={`w-8 h-8 mb-3 ${sourceType === 'template' ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className="font-semibold mb-1">{t('newProject', 'template')}</h3>
          <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'templateDesc')}</p>
        </button>
      </div>

      {/* Git URL Input */}
      {sourceType === 'git' && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'repositoryUrl')}</label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
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
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          {hasAppInstallation && !useAppPicker && (
            <button
              type="button"
              onClick={() => setPreferOAuthPicker(false)}
              className="mb-3 text-xs font-medium text-[var(--accent-purple)] hover:underline underline-offset-4"
            >
              ← {t('newProject', 'githubAppUsePicker')}
            </button>
          )}
          {isLoadingGitHubStatus ? (
            <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-purple)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'checkingGitHub')}</p>
            </div>
          ) : useAppPicker ? (
            <div className="space-y-4">
              {(() => {
                const inst = installations.find((i) => i.installationId === selectedAppInstallationId) ?? installations[0];
                const manageUrl = inst
                  ? inst.accountType === 'Organization'
                    ? `https://github.com/organizations/${inst.accountLogin}/settings/installations/${inst.installationId}`
                    : `https://github.com/settings/installations/${inst.installationId}`
                  : 'https://github.com/settings/installations';
                return (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-sm min-w-0">
                      <Check className="w-4 h-4 shrink-0 text-[var(--status-success)]" />
                      <span className="truncate">
                        {t('newProject', 'githubAppInstalledOn')}{' '}
                        {installations.length > 1 ? (
                          <select
                            value={selectedAppInstallationId ?? ''}
                            onChange={(e) => setSelectedAppInstallationId(Number(e.target.value))}
                            className="input inline-block w-auto py-0.5 px-2 text-sm"
                          >
                            {installations.map((i) => (
                              <option key={i.installationId} value={i.installationId}>@{i.accountLogin}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium">@{inst?.accountLogin}</span>
                        )}
                        <span className="text-[var(--text-muted)]">
                          {' '}· {inst?.repositorySelection === 'all' ? t('newProject', 'githubAppAllRepos') : t('newProject', 'githubAppSelectedRepos')}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <a href={manageUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs py-1.5 px-3">
                        {t('newProject', 'githubAppManage')}
                      </a>
                      <button type="button" onClick={() => githubAppInstall.mutate()} disabled={githubAppInstall.isPending} className="btn btn-ghost text-xs py-1.5 px-3 text-[var(--text-secondary)]">
                        {t('newProject', 'githubAppAddAccount')}
                      </button>
                      {githubStatus?.connected && (
                        <button type="button" onClick={() => setPreferOAuthPicker(true)} className="btn btn-ghost text-xs py-1.5 px-3 text-[var(--text-secondary)]">
                          {t('newProject', 'githubAppUseOAuth')}
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

              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
                {isLoadingAppRepos ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-purple)] mx-auto mb-2" />
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
                        onClick={() => selectAppRepo(repo)}
                        className={`w-full p-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors ${active ? 'bg-[var(--accent-purple)]/10' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-tertiary)]'}`}>
                            {repo.private ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{repo.fullName.split('/').pop()}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">{repo.fullName} · {repo.defaultBranch}</div>
                          </div>
                          {active && <Check className="w-5 h-5 text-[var(--accent-purple)]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedAppRepo && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
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
            <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <Github className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('newProject', 'githubIntegration')}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t('newProject', 'githubIntegrationDesc')}</p>
              <div className="flex flex-col items-center gap-2">
                {appInstallations?.configured && (
                  <>
                    <button
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
                  onClick={() => githubConnect.mutate()}
                  disabled={githubConnect.isPending}
                  className={appInstallations?.configured ? 'btn btn-ghost text-sm' : 'btn btn-primary'}
                >
                  {githubConnect.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'connecting')}
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      {t('newProject', 'connectGithubBtn')}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-sm text-[var(--status-success)] min-w-0">
                  <Check className="w-4 h-4 shrink-0" />
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
                    className="btn btn-secondary text-xs py-1.5 px-3"
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
                    className="btn btn-ghost text-xs py-1.5 px-3 text-[var(--text-secondary)]"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {t('newProject', 'disconnectGithub')}
                  </button>
                </div>
              </div>

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
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
                {isLoadingRepos ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-purple)] mx-auto mb-2" />
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
                        onClick={() => setSelectedRepo(repo)}
                        className={`w-full p-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors ${
                          selectedRepo?.id === repo.id ? 'bg-[var(--accent-purple)]/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedRepo?.id === repo.id
                              ? 'bg-[var(--accent-purple)] text-white'
                              : 'bg-[var(--bg-tertiary)]'
                          }`}>
                            {repo.private ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Globe className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{repo.name}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">
                              {repo.description || repo.full_name}
                            </div>
                          </div>
                          {selectedRepo?.id === repo.id && (
                            <Check className="w-5 h-5 text-[var(--accent-purple)]" />
                          )}
                        </div>
                      </button>
                    ))}
                    {/* Load More Button */}
                    {hasMore && !repoSearchQuery && (
                      <button
                        onClick={() => loadMore()}
                        disabled={isLoadingMore}
                        className="w-full p-3 text-center text-sm text-[var(--accent-purple)] hover:bg-[var(--bg-tertiary)] transition-colors border-t border-[var(--border-subtle)] disabled:opacity-50"
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
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
                  {isLoadingBranches ? (
                    <div className="input flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'loadingBranches')}
                    </div>
                  ) : (
                    <select
                      value={gitBranch}
                      onChange={(e) => setGitBranch(e.target.value)}
                      className="input"
                    >
                      {githubBranches?.map((branch) => (
                        <option key={branch.name} value={branch.name}>
                          {branch.name} {branch.protected && '🔒'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Framework detection status */}
              {selectedRepo && gitBranch && (
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                  {isDetectingFramework ? (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'detectingFramework')}
                    </div>
                  ) : frameworkDetection?.framework ? (
                    <div className="flex items-center gap-2 text-[var(--status-success)]">
                      <Zap className="w-4 h-4" />
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
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          {isLoadingGitLabStatus ? (
            <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-sm text-[var(--text-muted)]">{t('newProject', 'checkingGitLab')}</p>
            </div>
          ) : !gitlabStatus?.connected ? (
            <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] text-center">
              <Globe className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('newProject', 'gitlabIntegration')}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t('newProject', 'gitlabIntegrationDesc')}</p>
              <button
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-sm text-[var(--status-success)] min-w-0">
                  <Check className="w-4 h-4 shrink-0" />
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
                    className="btn btn-secondary text-xs py-1.5 px-3"
                  >
                    {gitlabBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {t('newProject', 'changeGitlabAccount')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectGitlab}
                    disabled={gitlabBusy}
                    className="btn btn-ghost text-xs py-1.5 px-3 text-[var(--text-secondary)]"
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

              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
                {isLoadingGitLabRepos ? (
                  <div className="p-6 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
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
                        onClick={() => setSelectedGitLabRepo(repo)}
                        className={`w-full p-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-tertiary)] transition-colors ${
                          selectedGitLabRepo?.id === repo.id ? 'bg-orange-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{repo.full_name}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">
                              {repo.description || repo.html_url}
                            </div>
                          </div>
                          {selectedGitLabRepo?.id === repo.id && (
                            <Check className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                      </button>
                    ))}
                    {gitlabHasMore && !gitlabRepoSearchQuery && (
                      <button
                        onClick={() => gitlabLoadMore()}
                        disabled={isLoadingMoreGitlab}
                        className="w-full p-3 text-center text-sm text-orange-500 hover:bg-[var(--bg-tertiary)] transition-colors border-t border-[var(--border-subtle)]"
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
                  <label className="block text-sm font-medium mb-2">{t('newProject', 'branch')}</label>
                  {isLoadingGitLabBranches ? (
                    <div className="input flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'loadingBranches')}
                    </div>
                  ) : (
                    <select
                      value={gitBranch}
                      onChange={(e) => setGitBranch(e.target.value)}
                      className="input"
                    >
                      {gitlabBranches?.map((branch) => (
                        <option key={branch.name} value={branch.name}>
                          {branch.name} {branch.protected && '🔒'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {selectedGitLabRepo && gitBranch && (
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                  {isDetectingFramework ? (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('newProject', 'detectingFramework')}
                    </div>
                  ) : frameworkDetection?.framework ? (
                    <div className="flex items-center gap-2 text-[var(--status-success)]">
                      <Zap className="w-4 h-4" />
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
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {FRAMEWORKS.slice(0, 6).map((fw) => (
              <button
                key={fw.id}
                onClick={() => {
                  setSelectedFramework(fw.id);
                  setProjectName(`my-${fw.id}-app`);
                }}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  selectedFramework === fw.id
                    ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                }`}
              >
                <span className="text-3xl mb-2 block">{fw.icon}</span>
                <span className="font-medium">{fw.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
