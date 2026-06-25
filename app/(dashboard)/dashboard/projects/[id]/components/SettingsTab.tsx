'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Pause, Play, RefreshCw, Server, Trash2 } from 'lucide-react';
import {
  useProject,
  useUpdateProjectSettings,
  useUpdateProject,
  useWebhookInfo,
  useRegenerateWebhookSecret,
  useInstallGitHubWebhook,
  useServers,
  useTranslation,
} from '@/hooks';
import { type ProjectStatus } from '@/lib/api';
import { HealthCheckSection } from './HealthCheckSection';
import { PreviewDeploymentsSection } from './PreviewDeploymentsSection';

export function SettingsTab({
  project,
  projectId,
  onStatusChange,
  onDelete,
  t,
}: {
  project: NonNullable<ReturnType<typeof useProject>['data']>;
  projectId: string;
  onStatusChange: (status: ProjectStatus) => void;
  onDelete: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [buildSettingsSaved, setBuildSettingsSaved] = useState(false);

  // Build settings state
  const [gitBranch, setGitBranch] = useState(project.gitBranch || '');
  const [installCommand, setInstallCommand] = useState(project.installCommand || '');
  const [buildCommand, setBuildCommand] = useState(project.buildCommand || '');
  const [outputDirectory, setOutputDirectory] = useState(project.outputDirectory || '');
  const [startCommand, setStartCommand] = useState(project.startCommand || '');
  const [port, setPort] = useState(project.port?.toString() || '');
  const [rootDirectory, setRootDirectory] = useState(project.rootDirectory || '');

  // Server selection state
  const [selectedServerId, setSelectedServerId] = useState<string | null>(project.serverId || null);
  const [serverSaved, setServerSaved] = useState(false);

  const { data: servers = [], isLoading: isLoadingServers } = useServers();
  const { data: webhookInfo } = useWebhookInfo(project.id);
  const regenerateSecret = useRegenerateWebhookSecret(project.id);
  const installGithubWebhook = useInstallGitHubWebhook(project.id);
  const updateSettings = useUpdateProjectSettings(projectId);
  const updateProject = useUpdateProject(projectId);

  // Filter servers to only show ready ones
  const availableServers = servers.filter(
    (s) => s.status === 'running' && s.setupStatus === 'completed'
  );

  const handleSaveBuildSettings = async () => {
    await updateProject.mutateAsync({
      gitBranch: gitBranch || undefined,
      installCommand: installCommand || undefined,
      buildCommand: buildCommand || undefined,
      outputDirectory: outputDirectory || undefined,
      startCommand: startCommand || undefined,
      port: port ? parseInt(port, 10) : undefined,
      rootDirectory: rootDirectory || undefined,
    });
    setBuildSettingsSaved(true);
    setTimeout(() => setBuildSettingsSaved(false), 3000);
  };

  const handleSaveServer = async () => {
    await updateProject.mutateAsync({
      serverId: selectedServerId,
    });
    setServerSaved(true);
    setTimeout(() => setServerSaved(false), 3000);
  };

  // Get current PR status checks setting from project settings
  const prStatusChecksEnabled = (project.settings as Record<string, unknown>)?.prStatusChecksEnabled === true;

  const handlePrStatusChecksToggle = async () => {
    await updateSettings.mutateAsync({ prStatusChecksEnabled: !prStatusChecksEnabled });
  };

  const handleCopyUrl = async () => {
    if (webhookInfo?.webhookUrl) {
      await navigator.clipboard.writeText(webhookInfo.webhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopySecret = async () => {
    if (newSecret) {
      await navigator.clipboard.writeText(newSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleRegenerateSecret = async () => {
    const result = await regenerateSecret.mutateAsync();
    if (result?.secret) {
      setNewSecret(result.secret);
      setShowSecret(true);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* General settings */}
      <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">{t('projectDetail', 'general')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'projectName')}</label>
            <input type="text" defaultValue={project.name} className="input max-w-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'description')}</label>
            <textarea defaultValue={project.description || ''} rows={3} className="input max-w-md resize-none" />
          </div>
        </div>
      </div>

      {/* Build Settings */}
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-2">{t('projectDetail', 'buildSettings')}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('projectDetail', 'buildSettingsDesc')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'gitBranch')}
            </label>
            <input
              type="text"
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
              placeholder={t('projectDetail', 'gitBranchPlaceholder')}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'rootDirectoryLabel')}
            </label>
            <input
              type="text"
              value={rootDirectory}
              onChange={(e) => setRootDirectory(e.target.value)}
              placeholder={t('projectDetail', 'rootDirectoryPlaceholder')}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'installCommand')}
            </label>
            <input
              type="text"
              value={installCommand}
              onChange={(e) => setInstallCommand(e.target.value)}
              placeholder={t('projectDetail', 'installCommandPlaceholder')}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'buildCommandLabel')}
            </label>
            <input
              type="text"
              value={buildCommand}
              onChange={(e) => setBuildCommand(e.target.value)}
              placeholder={t('projectDetail', 'buildCommandPlaceholder')}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'outputDirectory')}
            </label>
            <input
              type="text"
              value={outputDirectory}
              onChange={(e) => setOutputDirectory(e.target.value)}
              placeholder={t('projectDetail', 'outputDirectoryPlaceholder')}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'startCommand')}
            </label>
            <input
              type="text"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder={t('projectDetail', 'startCommandPlaceholder')}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'port')}
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder={t('projectDetail', 'portPlaceholder')}
              className="input w-full"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSaveBuildSettings}
            disabled={updateProject.isPending}
            className="btn btn-primary"
          >
            {updateProject.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('projectDetail', 'saving')}
              </>
            ) : (
              t('projectDetail', 'saveBuildSettings')
            )}
          </button>
          {buildSettingsSaved && (
            <span className="text-sm text-[var(--status-success)] flex items-center gap-1">
              <Check className="w-4 h-4" />
              {t('projectDetail', 'buildSettingsSaved')}
            </span>
          )}
        </div>
      </div>

      {/* Deployment Server */}
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Server className="w-5 h-5 text-[var(--accent-cyan)]" />
          {t('projectDetail', 'deploymentServer')}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('projectDetail', 'deploymentServerDesc')}
        </p>

        {isLoadingServers ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {t('projectDetail', 'loadingServers')}
          </div>
        ) : availableServers.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] text-center">
            <Server className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'noServersAvailable')}
            </p>
            <Link href="/dashboard/servers" className="text-sm text-[var(--accent-cyan)] hover:underline">
              {t('projectDetail', 'createServerLink')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('projectDetail', 'selectServer')}
              </label>
              <select
                value={selectedServerId || ''}
                onChange={(e) => setSelectedServerId(e.target.value || null)}
                className="input w-full max-w-md"
              >
                <option value="">{t('projectDetail', 'noServerSelected')}</option>
                {availableServers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name} ({server.ipv4})
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {t('projectDetail', 'serverSelectionHint')}
              </p>
            </div>

            {selectedServerId && selectedServerId !== project.serverId && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveServer}
                  disabled={updateProject.isPending}
                  className="btn btn-primary"
                >
                  {updateProject.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('projectDetail', 'saving')}
                    </>
                  ) : (
                    t('projectDetail', 'saveServerSelection')
                  )}
                </button>
                {serverSaved && (
                  <span className="text-sm text-[var(--status-success)] flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {t('projectDetail', 'serverSaved')}
                  </span>
                )}
              </div>
            )}

            {!selectedServerId && project.serverId && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveServer}
                  disabled={updateProject.isPending}
                  className="btn btn-secondary"
                >
                  {updateProject.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('projectDetail', 'saving')}
                    </>
                  ) : (
                    t('projectDetail', 'removeServerAssignment')
                  )}
                </button>
              </div>
            )}

            {project.serverId && (
              <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm">
                <span className="text-[var(--text-muted)]">{t('projectDetail', 'currentServer')}: </span>
                <span className="font-medium">
                  {servers.find((s) => s.id === project.serverId)?.name || project.serverId}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Webhook settings */}
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-2">{t('projectDetail', 'webhooks')}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {webhookInfo?.gitProvider === 'gitlab'
            ? t('projectDetail', 'webhooksDescGitlab')
            : t('projectDetail', 'webhooksDesc')}
        </p>

        <div className="space-y-4">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'webhookUrl')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookInfo?.webhookUrl || ''}
                readOnly
                className="input flex-1 max-w-xl terminal-text text-sm bg-[var(--bg-tertiary)]"
              />
              <button
                onClick={handleCopyUrl}
                className="btn btn-secondary h-10 px-3"
                title={t('projectDetail', 'copyUrl')}
              >
                {copiedUrl ? <Check className="w-4 h-4 text-[var(--status-success)]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {webhookInfo?.gitProvider === 'gitlab'
                ? t('projectDetail', 'webhookUrlHintGitlab')
                : t('projectDetail', 'webhookUrlHint')}
            </p>
            {webhookInfo?.gitProvider !== 'gitlab' && webhookInfo?.hasSecret && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => installGithubWebhook.mutate()}
                  disabled={installGithubWebhook.isPending}
                  className="btn btn-primary text-sm inline-flex items-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${installGithubWebhook.isPending ? 'animate-spin' : ''}`}
                  />
                  {t('projectDetail', 'installGithubWebhook')}
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {t('projectDetail', 'installGithubWebhookHint')}
                </p>
              </div>
            )}
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'webhookSecret')}
            </label>
            {newSecret && showSecret ? (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-[var(--status-success)]/10 border border-[var(--status-success)]/20">
                  <p className="text-sm text-[var(--status-success)] mb-2">{t('projectDetail', 'secretGenerated')}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded bg-[var(--bg-tertiary)] text-sm terminal-text break-all">
                      {newSecret}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="btn btn-secondary h-10 px-3"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-[var(--status-success)]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">{t('projectDetail', 'secretWarning')}</p>
                </div>
                <button
                  onClick={() => {
                    setShowSecret(false);
                    setNewSecret(null);
                  }}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {t('projectDetail', 'hideSecret')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-muted)]">
                  {webhookInfo?.hasSecret ? t('projectDetail', 'secretConfigured') : t('projectDetail', 'noSecretConfigured')}
                </span>
                <button
                  onClick={handleRegenerateSecret}
                  disabled={regenerateSecret.isPending}
                  className="btn btn-secondary text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${regenerateSecret.isPending ? 'animate-spin' : ''}`} />
                  {webhookInfo?.hasSecret ? t('projectDetail', 'regenerateSecret') : t('projectDetail', 'generateSecret')}
                </button>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <h4 className="text-sm font-medium mb-2">
              {webhookInfo?.gitProvider === 'gitlab'
                ? 'GitLab'
                : t('projectDetail', 'githubSetup')}
            </h4>
            <ol className="text-sm text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
              {webhookInfo?.gitProvider === 'gitlab' ? (
                <>
                  <li>{t('projectDetail', 'gitlabStep1')}</li>
                  <li>{t('projectDetail', 'gitlabStep2')}</li>
                  <li>{t('projectDetail', 'gitlabStep3')}</li>
                  <li>{t('projectDetail', 'gitlabStep4')}</li>
                </>
              ) : (
                <>
                  <li>{t('projectDetail', 'githubStep1')}</li>
                  <li>{t('projectDetail', 'githubStep2')}</li>
                  <li>{t('projectDetail', 'githubStep3')}</li>
                  <li>{t('projectDetail', 'githubStep4')}</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>

      {/* PR Status Checks */}
      {project.gitRepoUrl?.includes('github.com') && (
        <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <h3 className="text-lg font-semibold mb-2">{t('projectDetail', 'prStatusChecks')}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {t('projectDetail', 'prStatusChecksDesc')}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={handlePrStatusChecksToggle}
                disabled={updateSettings.isPending}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  prStatusChecksEnabled
                    ? 'bg-[var(--accent-cyan)]'
                    : 'bg-[var(--bg-tertiary)]'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    prStatusChecksEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
              <span className="text-sm">
                {t('projectDetail', 'enablePrStatusChecks')}
              </span>
            </div>
            {updateSettings.isPending && (
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
            )}
          </div>
          {prStatusChecksEnabled && (
            <p className="text-xs text-[var(--text-muted)] mt-3">
              {t('projectDetail', 'prStatusContext')}
            </p>
          )}
        </div>
      )}

      {/* Health Checks */}
      <HealthCheckSection projectId={projectId} t={t} />

      {/* Preview Deployments */}
      {project.gitRepoUrl?.includes('github.com') && (
        <PreviewDeploymentsSection projectId={projectId} project={project} t={t} />
      )}

      {/* Project status */}
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-4">{t('projectDetail', 'projectStatus')}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('projectDetail', 'projectStatusDesc')}
        </p>
        <div className="flex items-center gap-3">
          {project.status === 'active' ? (
            <button onClick={() => onStatusChange('paused')} className="btn btn-secondary">
              <Pause className="w-4 h-4" />
              {t('projectDetail', 'pauseProject')}
            </button>
          ) : (
            <button onClick={() => onStatusChange('active')} className="btn btn-primary">
              <Play className="w-4 h-4" />
              {t('projectDetail', 'resumeProject')}
            </button>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="p-6 rounded-lg bg-[var(--status-error)]/5 border border-[var(--status-error)]/20">
        <h3 className="text-lg font-semibold text-[var(--status-error)] mb-2">{t('projectDetail', 'dangerZone')}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t('projectDetail', 'dangerZoneDesc')}
        </p>
        <button onClick={onDelete} className="btn bg-[var(--status-error)] text-white hover:bg-[var(--status-error)]/80">
          <Trash2 className="w-4 h-4" />
          {t('projectDetail', 'deleteProject')}
        </button>
      </div>
    </div>
  );
}
