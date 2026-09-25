'use client';

import { useState, useEffect } from 'react';
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
import { getScaleEvents, type ProjectStatus, type ScaleEvent } from '@/lib/api';
import { HealthCheckSection } from './HealthCheckSection';
import { VolumesSection } from './VolumesSection';
import { PreviewDeploymentsSection } from './PreviewDeploymentsSection';
import { GitHubAccessSection } from './GitHubAccessSection';
import { SettingsField, SettingsSection, SettingsSwitch } from './SettingsParts';

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
  const [stagingBranch, setStagingBranch] = useState(project.stagingBranch || '');
  const [replicas, setReplicas] = useState(String(project.replicas ?? 1));
  // With autoscaling on, the replica count is Pushify's to set — the field becomes a range
  const [autoscaleEnabled, setAutoscaleEnabled] = useState(project.autoscaleEnabled ?? false);
  const [autoscaleMin, setAutoscaleMin] = useState(String(project.autoscaleMin ?? 1));
  const [autoscaleMax, setAutoscaleMax] = useState(String(project.autoscaleMax ?? 3));
  const [autoscaleObserveOnly, setAutoscaleObserveOnly] = useState(project.autoscaleObserveOnly ?? false);
  // What it decided, so the thresholds can be judged against real traffic rather than trusted
  const [scaleEvents, setScaleEvents] = useState<ScaleEvent[]>([]);

  useEffect(() => {
    if (!autoscaleEnabled) return;
    let cancelled = false;
    getScaleEvents(projectId).then((result) => {
      if (!cancelled && result.data) setScaleEvents(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [autoscaleEnabled, projectId]);
  const [installCommand, setInstallCommand] = useState(project.installCommand || '');
  const [buildCommand, setBuildCommand] = useState(project.buildCommand || '');
  const [outputDirectory, setOutputDirectory] = useState(project.outputDirectory || '');
  const [startCommand, setStartCommand] = useState(project.startCommand || '');
  const [port, setPort] = useState(project.port?.toString() || '');
  const [rootDirectory, setRootDirectory] = useState(project.rootDirectory || '');
  // Set: the project deploys this image and the repository settings below do not apply
  const [dockerImage, setDockerImage] = useState(project.dockerImage || '');
  const deploysImage = !!dockerImage.trim();
  // Set: the repository is deployed as a compose stack instead of being built
  const [composePath, setComposePath] = useState(project.composePath || '');
  const [composeService, setComposeService] = useState(project.composeService || '');
  const deploysCompose = !deploysImage && !!composePath.trim();

  // Server selection state
  const [selectedServerId, setSelectedServerId] = useState<string | null>(project.serverId || null);
  const [serverSaved, setServerSaved] = useState(false);
  const [sleepEnabled, setSleepEnabled] = useState(project.sleepEnabled);
  const [sleepAfterMinutes, setSleepAfterMinutes] = useState(project.sleepAfterMinutes || 30);
  const [sleepSaved, setSleepSaved] = useState(false);

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
      stagingBranch: stagingBranch.trim() || null,
      replicas: Math.min(10, Math.max(1, parseInt(replicas, 10) || 1)),
      autoscaleEnabled,
      autoscaleMin: Math.min(10, Math.max(1, parseInt(autoscaleMin, 10) || 1)),
      autoscaleMax: Math.min(10, Math.max(1, parseInt(autoscaleMax, 10) || 1)),
      autoscaleObserveOnly,
      installCommand: installCommand || undefined,
      buildCommand: buildCommand || undefined,
      outputDirectory: outputDirectory || undefined,
      startCommand: startCommand || undefined,
      port: port ? parseInt(port, 10) : undefined,
      rootDirectory: rootDirectory || undefined,
      dockerImage: dockerImage.trim() || null,
      composePath: composePath.trim() || null,
      composeService: composeService.trim() || null,
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

  const handleSaveSleep = async () => {
    await updateProject.mutateAsync({
      sleepEnabled,
      sleepAfterMinutes: Math.min(1440, Math.max(5, sleepAfterMinutes || 30)),
    });
    setSleepSaved(true);
    setTimeout(() => setSleepSaved(false), 3000);
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

  const isGithub = !!project.gitRepoUrl?.includes('github.com');
  const savedNote = (text: string) => (
    <span className="text-[13px] text-[var(--status-success)] inline-flex items-center gap-1" role="status">
      <Check className="w-4 h-4" />
      {text}
    </span>
  );
  const nav: { id: string; label: string; show: boolean }[] = [
    { id: 'settings-general', label: t('projectDetail', 'general'), show: true },
    { id: 'settings-build', label: t('projectDetail', 'buildSettings'), show: true },
    { id: 'settings-server', label: t('projectDetail', 'deploymentServer'), show: true },
    { id: 'settings-git', label: t('projectDetail', 'gitAccessTitle'), show: isGithub },
    { id: 'settings-webhooks', label: t('projectDetail', 'webhooks'), show: true },
    { id: 'settings-pr-checks', label: t('projectDetail', 'prStatusChecks'), show: isGithub },
    { id: 'settings-sleep', label: t('sleep', 'title'), show: true },
    { id: 'settings-volumes', label: t('volumes', 'title'), show: true },
    { id: 'settings-health', label: t('healthChecks', 'title'), show: true },
    { id: 'settings-previews', label: t('previews', 'title'), show: isGithub },
    { id: 'settings-status', label: t('projectDetail', 'projectStatus'), show: true },
    { id: 'settings-danger', label: t('projectDetail', 'dangerZone'), show: true },
  ];

  return (
    <div className="dash-settings">
      <nav className="dash-settings-nav" aria-label={t('projectDetail', 'settings')}>
        {nav.filter((item) => item.show).map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="dash-settings-stack">
      {/* General settings */}
      <SettingsSection id="settings-general" title={t('projectDetail', 'general')}>
        <SettingsField label={t('projectDetail', 'projectName')} htmlFor="settings-name">
          <input id="settings-name" type="text" defaultValue={project.name} className="input" />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'description')} htmlFor="settings-description">
          <textarea id="settings-description" defaultValue={project.description || ''} rows={3} className="input resize-none" />
        </SettingsField>
      </SettingsSection>

      {/* Build Settings */}
      <SettingsSection
        id="settings-build"
        title={t('projectDetail', 'buildSettings')}
        description={t('projectDetail', 'buildSettingsDesc')}
        footer={
          <>
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
            {buildSettingsSaved && savedNote(t('projectDetail', 'buildSettingsSaved'))}
          </>
        }
      >
        <SettingsField label={t('projectDetail', 'gitBranch')} htmlFor="settings-branch">
          <input
            id="settings-branch"
            type="text"
            value={gitBranch}
            onChange={(e) => setGitBranch(e.target.value)}
            placeholder={t('projectDetail', 'gitBranchPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField
          label={t('projectDetail', 'stagingBranch')}
          hint={t('projectDetail', 'stagingBranchHint')}
          htmlFor="settings-staging-branch"
        >
          <input
            id="settings-staging-branch"
            type="text"
            value={stagingBranch}
            onChange={(e) => setStagingBranch(e.target.value)}
            placeholder={t('projectDetail', 'stagingBranchPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField
          label={t('projectDetail', 'dockerImage')}
          hint={deploysImage ? t('projectDetail', 'dockerImageActive') : t('projectDetail', 'dockerImageHint')}
          htmlFor="settings-image"
        >
          <input
            id="settings-image"
            type="text"
            value={dockerImage}
            onChange={(e) => setDockerImage(e.target.value)}
            placeholder="ghcr.io/acme/api:1.4"
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField
          label={t('projectDetail', 'composePath')}
          hint={deploysCompose ? t('projectDetail', 'composePathActive') : t('projectDetail', 'composePathHint')}
          htmlFor="settings-compose"
        >
          <input
            id="settings-compose"
            type="text"
            value={composePath}
            onChange={(e) => setComposePath(e.target.value)}
            placeholder="docker-compose.yml"
            className="input terminal-text"
            disabled={deploysImage}
          />
        </SettingsField>
        {deploysCompose && (
          <SettingsField
            label={t('projectDetail', 'composeService')}
            hint={t('projectDetail', 'composeServiceHint')}
            htmlFor="settings-compose-service"
          >
            <input
              id="settings-compose-service"
              type="text"
              value={composeService}
              onChange={(e) => setComposeService(e.target.value)}
              placeholder="web"
              className="input terminal-text"
            />
          </SettingsField>
        )}
        <SettingsField label={t('projectDetail', 'rootDirectoryLabel')} htmlFor="settings-root">
          <input
            id="settings-root"
            type="text"
            value={rootDirectory}
            onChange={(e) => setRootDirectory(e.target.value)}
            placeholder={t('projectDetail', 'rootDirectoryPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'installCommand')} htmlFor="settings-install">
          <input
            id="settings-install"
            type="text"
            value={installCommand}
            onChange={(e) => setInstallCommand(e.target.value)}
            placeholder={t('projectDetail', 'installCommandPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'buildCommandLabel')} htmlFor="settings-build-cmd">
          <input
            id="settings-build-cmd"
            type="text"
            value={buildCommand}
            onChange={(e) => setBuildCommand(e.target.value)}
            placeholder={t('projectDetail', 'buildCommandPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'outputDirectory')} htmlFor="settings-output">
          <input
            id="settings-output"
            type="text"
            value={outputDirectory}
            onChange={(e) => setOutputDirectory(e.target.value)}
            placeholder={t('projectDetail', 'outputDirectoryPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'startCommand')} htmlFor="settings-start">
          <input
            id="settings-start"
            type="text"
            value={startCommand}
            onChange={(e) => setStartCommand(e.target.value)}
            placeholder={t('projectDetail', 'startCommandPlaceholder')}
            className="input terminal-text"
          />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'port')} htmlFor="settings-port">
          <input
            id="settings-port"
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder={t('projectDetail', 'portPlaceholder')}
            className="input w-32 terminal-text"
          />
        </SettingsField>
        <SettingsField
          label={t('projectDetail', 'replicas')}
          hint={autoscaleEnabled ? t('projectDetail', 'replicasManagedHint') : t('projectDetail', 'replicasHint')}
          htmlFor="settings-replicas"
        >
          <input
            id="settings-replicas"
            type="number"
            min={1}
            max={10}
            value={replicas}
            onChange={(e) => setReplicas(e.target.value)}
            className="input w-32 terminal-text"
          />
        </SettingsField>
        <SettingsField label={t('projectDetail', 'autoscale')} hint={t('projectDetail', 'autoscaleHint')}>
          <div className="space-y-4">
            <div className="md:pt-2">
              <SettingsSwitch
                checked={autoscaleEnabled}
                onChange={setAutoscaleEnabled}
                label={t('projectDetail', 'autoscale')}
              />
            </div>
            {autoscaleEnabled && (
              <>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <label className="block">
                    <span className="dash-section-label block mb-1.5">{t('projectDetail', 'autoscaleMin')}</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={autoscaleMin}
                      onChange={(e) => setAutoscaleMin(e.target.value)}
                      className="input terminal-text"
                    />
                  </label>
                  <label className="block">
                    <span className="dash-section-label block mb-1.5">{t('projectDetail', 'autoscaleMax')}</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={autoscaleMax}
                      onChange={(e) => setAutoscaleMax(e.target.value)}
                      className="input terminal-text"
                    />
                  </label>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoscaleObserveOnly}
                    onChange={(e) => setAutoscaleObserveOnly(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <span className="text-[13px] font-medium block">{t('projectDetail', 'autoscaleObserve')}</span>
                    <span className="text-xs text-[var(--text-muted)]">{t('projectDetail', 'autoscaleObserveHint')}</span>
                  </span>
                </label>

                <div>
                  <p className="dash-section-label mb-2">{t('projectDetail', 'scaleHistory')}</p>
                  {scaleEvents.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">{t('projectDetail', 'scaleHistoryEmpty')}</p>
                  ) : (
                    <div className="rounded-[10px] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
                      {scaleEvents.slice(0, 8).map((event) => (
                        <div key={event.id} className="px-3 py-2 text-xs flex items-baseline gap-x-3 gap-y-1 flex-wrap">
                          <span className="terminal-text text-[var(--text-muted)]">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                          <span className="terminal-text text-[var(--text-primary)]">
                            {event.from} → {event.to}
                          </span>
                          <span className="text-[var(--text-secondary)]">{event.reason}</span>
                          {!event.applied && (
                            <span className="badge badge-neutral">{t('projectDetail', 'scaleNotApplied')}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </SettingsField>
      </SettingsSection>

      {/* Deployment Server */}
      <SettingsSection
        id="settings-server"
        title={t('projectDetail', 'deploymentServer')}
        description={t('projectDetail', 'deploymentServerDesc')}
        padded={isLoadingServers || availableServers.length === 0}
        footer={
          !isLoadingServers && availableServers.length > 0 &&
          ((selectedServerId && selectedServerId !== project.serverId) || (!selectedServerId && project.serverId)) ? (
            <>
              <button
                onClick={handleSaveServer}
                disabled={updateProject.isPending}
                className={selectedServerId ? 'btn btn-primary' : 'btn btn-secondary'}
              >
                {updateProject.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t('projectDetail', 'saving')}
                  </>
                ) : selectedServerId ? (
                  t('projectDetail', 'saveServerSelection')
                ) : (
                  t('projectDetail', 'removeServerAssignment')
                )}
              </button>
              {serverSaved && savedNote(t('projectDetail', 'serverSaved'))}
            </>
          ) : serverSaved ? (
            savedNote(t('projectDetail', 'serverSaved'))
          ) : undefined
        }
      >
        {isLoadingServers ? (
          <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            {t('projectDetail', 'loadingServers')}
          </div>
        ) : availableServers.length === 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[var(--text-secondary)]">
              {t('projectDetail', 'noServersAvailable')}
            </p>
            <Link href="/dashboard/servers" className="btn btn-secondary btn-sm shrink-0">
              <Server className="w-3.5 h-3.5" />
              {t('projectDetail', 'createServerLink')}
            </Link>
          </div>
        ) : (
          <>
            <SettingsField
              label={t('projectDetail', 'selectServer')}
              hint={t('projectDetail', 'serverSelectionHint')}
              htmlFor="settings-server-select"
            >
              <select
                id="settings-server-select"
                value={selectedServerId || ''}
                onChange={(e) => setSelectedServerId(e.target.value || null)}
                className="input"
              >
                <option value="">{t('projectDetail', 'noServerSelected')}</option>
                {availableServers.map((server) => (
                  <option key={server.id} value={server.id}>
                    {server.name} ({server.ipv4})
                  </option>
                ))}
              </select>
            </SettingsField>
            {project.serverId && (
              <SettingsField label={t('projectDetail', 'currentServer')}>
                <p className="text-[13px] md:pt-2.5 text-[var(--text-primary)]">
                  {servers.find((s) => s.id === project.serverId)?.name || project.serverId}
                </p>
              </SettingsField>
            )}
          </>
        )}
      </SettingsSection>

      {/* GitHub access — which credential pulls the repo, and how to fix it when none can */}
      {isGithub && <GitHubAccessSection projectId={projectId} t={t} />}

      {/* Webhook settings */}
      <SettingsSection
        id="settings-webhooks"
        title={t('projectDetail', 'webhooks')}
        description={
          webhookInfo?.gitProvider === 'gitlab'
            ? t('projectDetail', 'webhooksDescGitlab')
            : t('projectDetail', 'webhooksDesc')
        }
      >
        <SettingsField
          label={t('projectDetail', 'webhookUrl')}
          hint={
            webhookInfo?.gitProvider === 'gitlab'
              ? t('projectDetail', 'webhookUrlHintGitlab')
              : t('projectDetail', 'webhookUrlHint')
          }
          htmlFor="settings-webhook-url"
        >
          <div className="flex items-center gap-2">
            <input
              id="settings-webhook-url"
              type="text"
              value={webhookInfo?.webhookUrl || ''}
              readOnly
              className="input flex-1 min-w-0 terminal-text text-[13px] bg-[var(--bg-primary)]"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="btn btn-secondary !px-3 shrink-0"
              title={t('projectDetail', 'copyUrl')}
              aria-label={t('projectDetail', 'copyUrl')}
            >
              {copiedUrl ? <Check className="w-4 h-4 text-[var(--status-success)]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {webhookInfo?.gitProvider !== 'gitlab' && webhookInfo?.hasSecret && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => installGithubWebhook.mutate()}
                disabled={installGithubWebhook.isPending}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${installGithubWebhook.isPending ? 'animate-spin' : ''}`}
                />
                {t('projectDetail', 'installGithubWebhook')}
              </button>
              <p className="dash-field-hint">
                {t('projectDetail', 'installGithubWebhookHint')}
              </p>
            </div>
          )}
        </SettingsField>

        <SettingsField label={t('projectDetail', 'webhookSecret')}>
          {newSecret && showSecret ? (
            <div className="space-y-2">
              <div className="p-3 rounded-[10px] border border-[var(--status-success)]/30 bg-[var(--status-success)]/[0.06]">
                <p className="text-[13px] text-[var(--status-success)] mb-2">{t('projectDetail', 'secretGenerated')}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 px-2.5 py-2 rounded-lg bg-[var(--bg-primary)] text-[13px] terminal-text break-all">
                    {newSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="btn btn-secondary !px-3 shrink-0"
                    aria-label={t('projectDetail', 'webhookSecret')}
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-[var(--status-success)]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">{t('projectDetail', 'secretWarning')}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSecret(false);
                  setNewSecret(null);
                }}
                className="dash-link"
              >
                {t('projectDetail', 'hideSecret')}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 md:pt-1">
              <span className="inline-flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                <span className={`dash-status-dot ${webhookInfo?.hasSecret ? 'is-success' : ''}`} aria-hidden />
                {webhookInfo?.hasSecret ? t('projectDetail', 'secretConfigured') : t('projectDetail', 'noSecretConfigured')}
              </span>
              <button
                type="button"
                onClick={handleRegenerateSecret}
                disabled={regenerateSecret.isPending}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw className={`w-4 h-4 ${regenerateSecret.isPending ? 'animate-spin' : ''}`} />
                {webhookInfo?.hasSecret ? t('projectDetail', 'regenerateSecret') : t('projectDetail', 'generateSecret')}
              </button>
            </div>
          )}
        </SettingsField>

        <SettingsField
          label={
            webhookInfo?.gitProvider === 'gitlab'
              ? 'GitLab'
              : t('projectDetail', 'githubSetup')
          }
        >
          <ol className="text-[13px] text-[var(--text-secondary)] space-y-1.5 md:pt-2 [counter-reset:step]">
            {(webhookInfo?.gitProvider === 'gitlab'
              ? [
                  t('projectDetail', 'gitlabStep1'),
                  t('projectDetail', 'gitlabStep2'),
                  t('projectDetail', 'gitlabStep3'),
                  t('projectDetail', 'gitlabStep4'),
                ]
              : [
                  t('projectDetail', 'githubStep1'),
                  t('projectDetail', 'githubStep2'),
                  t('projectDetail', 'githubStep3'),
                  t('projectDetail', 'githubStep4'),
                ]
            ).map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="terminal-text text-xs text-[var(--text-muted)] pt-px shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        </SettingsField>
      </SettingsSection>

      {/* PR Status Checks */}
      {isGithub && (
        <SettingsSection
          id="settings-pr-checks"
          title={t('projectDetail', 'prStatusChecks')}
          description={t('projectDetail', 'prStatusChecksDesc')}
          action={
            <>
              {updateSettings.isPending && (
                <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
              )}
              <SettingsSwitch
                checked={prStatusChecksEnabled}
                onChange={() => handlePrStatusChecksToggle()}
                disabled={updateSettings.isPending}
                label={t('projectDetail', 'enablePrStatusChecks')}
              />
            </>
          }
          padded
        >
          <p className="text-[13px] text-[var(--text-secondary)]">
            {t('projectDetail', 'enablePrStatusChecks')}
          </p>
          {prStatusChecksEnabled && (
            <p className="dash-mono-caption mt-2">
              {t('projectDetail', 'prStatusContext')}
            </p>
          )}
        </SettingsSection>
      )}

      {/* Auto-sleep (scale to zero) */}
      <SettingsSection
        id="settings-sleep"
        title={t('sleep', 'title')}
        description={t('sleep', 'description')}
        footer={
          <>
            <button onClick={handleSaveSleep} disabled={updateProject.isPending} className="btn btn-secondary">
              {sleepSaved ? t('sleep', 'saved') : t('sleep', 'save')}
            </button>
            <span className="text-xs text-[var(--text-muted)] min-w-0">{t('sleep', 'note')}</span>
          </>
        }
      >
        <SettingsField label={t('sleep', 'enable')}>
          <div className="md:pt-2">
            <SettingsSwitch checked={sleepEnabled} onChange={setSleepEnabled} label={t('sleep', 'enable')} />
          </div>
        </SettingsField>
        <SettingsField label={t('sleep', 'afterMinutes')} htmlFor="settings-sleep-minutes">
          <input
            id="settings-sleep-minutes"
            type="number"
            min={5}
            max={1440}
            value={sleepAfterMinutes}
            onChange={(e) => setSleepAfterMinutes(parseInt(e.target.value, 10) || 30)}
            disabled={!sleepEnabled}
            className="input w-32 terminal-text"
          />
        </SettingsField>
      </SettingsSection>

      {/* Persistent Volumes */}
      <VolumesSection projectId={projectId} t={t} />

      {/* Health Checks */}
      <HealthCheckSection projectId={projectId} t={t} />

      {/* Preview Deployments */}
      {isGithub && (
        <PreviewDeploymentsSection projectId={projectId} project={project} t={t} />
      )}

      {/* Project status */}
      <SettingsSection
        id="settings-status"
        title={t('projectDetail', 'projectStatus')}
        description={t('projectDetail', 'projectStatusDesc')}
        action={
          project.status === 'active' ? (
            <button onClick={() => onStatusChange('paused')} className="btn btn-secondary btn-sm">
              <Pause className="w-4 h-4" />
              {t('projectDetail', 'pauseProject')}
            </button>
          ) : (
            <button onClick={() => onStatusChange('active')} className="btn btn-primary btn-sm">
              <Play className="w-4 h-4" />
              {t('projectDetail', 'resumeProject')}
            </button>
          )
        }
      />

      {/* Danger zone */}
      <SettingsSection
        id="settings-danger"
        danger
        title={t('projectDetail', 'dangerZone')}
        description={t('projectDetail', 'dangerZoneDesc')}
        action={
          <button onClick={onDelete} className="btn btn-danger btn-sm">
            <Trash2 className="w-4 h-4" />
            {t('projectDetail', 'deleteProject')}
          </button>
        }
      />
      </div>
    </div>
  );
}
