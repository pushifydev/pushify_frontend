'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GitBranch,
  Globe,
  Clock,
  ExternalLink,
  RefreshCw,
  Settings,
  Trash2,
  Play,
  Pause,
  Rocket,
  Activity,
  Key,
  ChevronRight,
  Terminal,
  Copy,
  Check,
  FileText,
  Bell,
  Plus,
  Send,
  Server,
  Sliders,
  X,
  ToggleLeft,
  ToggleRight,
  History,
} from 'lucide-react';
import { DeploymentLogsModal } from '@/components/DeploymentLogsModal';
import { ContainerLogsModal } from '@/components/ContainerLogsModal';
import { HistoricalLogsModal } from '@/components/HistoricalLogsModal';
import {
  useProject,
  useDeleteProject,
  useDeployments,
  useCancelDeployment,
  useRollbackDeployment,
  useRedeployDeployment,
  useCreateDeployment,
  useEnvVars,
  useCreateEnvVar,
  useDeleteEnvVar,
  useBulkCreateEnvVars,
  useDomains,
  useDnsSetup,
  useAddDomain,
  useDeleteDomain,
  useSetPrimaryDomain,
  useVerifyDomain,
  useNginxSettings,
  useUpdateNginxSettings,
  useTranslation,
  useWebhookInfo,
  useRegenerateWebhookSecret,
  useUpdateProjectSettings,
  useUpdateProject,
  useNotificationChannels,
  useCreateNotificationChannel,
  useUpdateNotificationChannel,
  useDeleteNotificationChannel,
  useTestNotificationChannel,
  useServers,
} from '@/hooks';
import {
  useHealthCheckConfig,
  useHealthCheckLogs,
  useUpdateHealthCheckConfig,
  useDeleteHealthCheckConfig,
} from '@/hooks/useHealthCheck';
import { useActivePreviewDeployments } from '@/hooks/usePreviews';
import { useMetricsSummary, useMetricsTimeSeries } from '@/hooks/useMetrics';
import { projectsService, type ProjectStatus, type NotificationChannel, type NotificationChannelType, type NotificationEvent, type ChannelConfig, type NginxSettings } from '@/lib/api';
import { formatTimeAgo, formatStorage } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/constants';

type Tab = 'overview' | 'deployments' | 'environment' | 'domains' | 'notifications' | 'settings';

const VALID_TABS: Tab[] = ['overview', 'deployments', 'environment', 'domains', 'notifications', 'settings'];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const { t } = useTranslation();

  // Get tab from URL, default to 'overview'
  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview';

  const setActiveTab = useCallback((tab: Tab) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (tab === 'overview') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', tab);
    }
    const queryString = newParams.toString();
    router.push(`/dashboard/projects/${projectId}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router, projectId, searchParams]);

  const { data: project, isLoading } = useProject(projectId);
  const { data: deployments = [] } = useDeployments(projectId);
  const { data: envVars = [] } = useEnvVars(projectId);
  const { data: domains = [] } = useDomains(projectId);

  const deleteProjectMutation = useDeleteProject();
  const cancelDeployment = useCancelDeployment(projectId);
  const rollbackDeployment = useRollbackDeployment(projectId);
  const redeployDeployment = useRedeployDeployment(projectId);
  const createDeployment = useCreateDeployment(projectId);
  const createEnvVar = useCreateEnvVar(projectId);
  const deleteEnvVar = useDeleteEnvVar(projectId);
  const bulkCreateEnvVars = useBulkCreateEnvVars(projectId);
  const addDomain = useAddDomain(projectId);
  const deleteDomain = useDeleteDomain(projectId);
  const setPrimaryDomain = useSetPrimaryDomain(projectId);
  const verifyDomain = useVerifyDomain(projectId);
  const [copied, setCopied] = useState(false);
  const [selectedDeploymentForLogs, setSelectedDeploymentForLogs] = useState<{
    id: string;
    branch?: string | null;
    commitHash?: string | null;
  } | null>(null);
  const [showContainerLogs, setShowContainerLogs] = useState<string | null>(null);
  const [showHistoricalLogs, setShowHistoricalLogs] = useState<string | null>(null);

  const handleStatusChange = async (status: ProjectStatus) => {
    await projectsService.updateStatus(projectId, status);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (confirm(t('projectDetail', 'deleteProjectConfirm'))) {
      deleteProjectMutation.mutate(projectId, {
        onSuccess: () => router.push('/dashboard/projects'),
      });
    }
  };

  const handleRedeploy = async () => {
    if (deployments.length > 0) {
      redeployDeployment.mutate(deployments[0].id);
    } else {
      // First deployment - create new (backend will use project's gitBranch or git default)
      createDeployment.mutate({
        branch: project?.gitBranch || undefined,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'ready':
        return 'badge-success';
      case 'building':
      case 'deploying':
      case 'queued':
      case 'paused':
        return 'badge-warning';
      case 'failed':
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  if (isLoading || !project) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded" />
          <div className="h-32 bg-[var(--bg-secondary)] rounded-lg" />
          <div className="h-12 bg-[var(--bg-secondary)] rounded-lg" />
          <div className="h-64 bg-[var(--bg-secondary)] rounded-lg" />
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('projectDetail', 'overview'), icon: <Activity className="w-4 h-4" /> },
    { id: 'deployments', label: t('projectDetail', 'deployments'), icon: <Rocket className="w-4 h-4" /> },
    { id: 'environment', label: t('projectDetail', 'environment'), icon: <Key className="w-4 h-4" /> },
    { id: 'domains', label: t('projectDetail', 'domains'), icon: <Globe className="w-4 h-4" /> },
    { id: 'notifications', label: t('notifications', 'title'), icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: t('projectDetail', 'settings'), icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('navigation', 'projects')}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--text-primary)]">{project.name}</span>
      </div>

      {/* Header */}
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
              <GitBranch className="w-7 h-7 text-[var(--text-muted)]" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <span className={`badge ${getStatusBadge(project.status)}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-[var(--text-secondary)] mt-1">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
                {project.framework && (
                  <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] terminal-text">
                    {project.framework}
                  </span>
                )}
                {project.gitRepoUrl && (
                  <a
                    href={project.gitRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <GitBranch className="w-4 h-4" />
                    {project.gitRepoUrl.replace('https://github.com/', '')}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {t('projectDetail', 'updated')} {formatTimeAgo(project.updatedAt, t)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {project.productionUrl && (
              <a
                href={project.productionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink className="w-4 h-4" />
                {t('projectDetail', 'visit')}
              </a>
            )}
            <button onClick={handleRedeploy} className="btn btn-primary">
              <RefreshCw className="w-4 h-4" />
              {t('projectDetail', 'redeploy')}
            </button>
          </div>
        </div>

        {/* Production URL */}
        {project.productionUrl && (
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-tertiary)]">
              <Globe className="w-4 h-4 text-[var(--accent-cyan)]" />
              <span className="terminal-text text-sm flex-1 truncate">
                {project.productionUrl}
              </span>
              <button
                onClick={() => copyToClipboard(project.productionUrl!)}
                className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[var(--status-success)]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            projectId={projectId}
            deployments={deployments}
            formatTimeAgo={formatTimeAgo}
            getStatusBadge={getStatusBadge}
            t={t}
          />
        )}
        {activeTab === 'deployments' && (
          <DeploymentsTab
            deployments={deployments}
            formatTimeAgo={formatTimeAgo}
            getStatusBadge={getStatusBadge}
            onCancel={(id) => cancelDeployment.mutate(id)}
            onRollback={(id) => rollbackDeployment.mutate(id)}
            onViewLogs={(deployment) => setSelectedDeploymentForLogs({
              id: deployment.id,
              branch: deployment.branch,
              commitHash: deployment.commitHash,
            })}
            onViewContainerLogs={(deploymentId) => setShowContainerLogs(deploymentId)}
            onViewHistoricalLogs={(deploymentId) => setShowHistoricalLogs(deploymentId)}
            t={t}
          />
        )}

        {/* Deployment Logs Modal */}
        {selectedDeploymentForLogs && (
          <DeploymentLogsModal
            projectId={projectId}
            deploymentId={selectedDeploymentForLogs.id}
            branch={selectedDeploymentForLogs.branch}
            commitHash={selectedDeploymentForLogs.commitHash}
            onClose={() => setSelectedDeploymentForLogs(null)}
          />
        )}

        {/* Container Logs Modal */}
        {showContainerLogs && (
          <ContainerLogsModal
            projectId={projectId}
            deploymentId={showContainerLogs}
            projectName={project.name}
            onClose={() => setShowContainerLogs(null)}
          />
        )}

        {/* Historical Logs Modal */}
        {showHistoricalLogs && (
          <HistoricalLogsModal
            projectId={projectId}
            deploymentId={showHistoricalLogs}
            projectName={project.name}
            onClose={() => setShowHistoricalLogs(null)}
          />
        )}
        {activeTab === 'environment' && (
          <EnvironmentTab
            envVars={envVars}
            onCreate={(data) => createEnvVar.mutate(data)}
            onDelete={(id) => deleteEnvVar.mutate(id)}
            onBulkCreate={(data) => bulkCreateEnvVars.mutate(data)}
            t={t}
          />
        )}
        {activeTab === 'domains' && (
          <DomainsTab
            projectId={projectId}
            domains={domains}
            onAdd={(domain) => addDomain.mutate({ domain })}
            onDelete={(id) => deleteDomain.mutate(id)}
            onSetPrimary={(id) => setPrimaryDomain.mutate(id)}
            onVerify={(id) => verifyDomain.mutate(id)}
            isVerifying={verifyDomain.isPending}
            t={t}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab projectId={projectId} t={t} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            project={project}
            projectId={projectId}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

// ============ Tab Components ============

function OverviewTab({
  project,
  projectId,
  deployments,
  formatTimeAgo,
  getStatusBadge,
  t,
}: {
  project: NonNullable<ReturnType<typeof useProject>['data']>;
  projectId: string;
  deployments: ReturnType<typeof useDeployments>['data'];
  formatTimeAgo: (date: string, t?: any) => string;
  getStatusBadge: (status: string) => string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const latestDeployment = deployments?.[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-lg font-semibold">{t('projectDetail', 'latestDeployment')}</h3>
        {latestDeployment ? (
          <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusBadge(latestDeployment.status)}`}>
                  {latestDeployment.status}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  {formatTimeAgo(latestDeployment.createdAt, t)}
                </span>
              </div>
              {latestDeployment.url && (
                <a
                  href={latestDeployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--accent-cyan)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('projectDetail', 'preview')}
                </a>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <GitBranch className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="terminal-text">{latestDeployment.branch}</span>
              {latestDeployment.commitHash && (
                <span className="text-[var(--text-muted)]">
                  @ {latestDeployment.commitHash.slice(0, 7)}
                </span>
              )}
            </div>
            {latestDeployment.commitMessage && (
              <p className="text-sm text-[var(--text-secondary)] mt-2 pl-7">
                {latestDeployment.commitMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
            <Rocket className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
            <p className="text-[var(--text-secondary)]">{t('projectDetail', 'noDeploymentsYet')}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">{t('projectDetail', 'projectInfo')}</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">{t('projectDetail', 'framework')}</span>
              <span className="terminal-text">{project.framework || t('projectDetail', 'unknown')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">{t('projectDetail', 'rootDirectory')}</span>
              <span className="terminal-text">{project.rootDirectory || '/'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">{t('projectDetail', 'buildCommand')}</span>
              <span className="terminal-text">{project.buildCommand || 'npm run build'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Container Metrics */}
      <div className="lg:col-span-3 mt-6">
        <MetricsSection projectId={projectId} t={t} />
      </div>
    </div>
  );
}

function DeploymentsTab({
  deployments,
  formatTimeAgo,
  getStatusBadge,
  onCancel,
  onRollback,
  onViewLogs,
  onViewContainerLogs,
  onViewHistoricalLogs,
  t,
}: {
  deployments: ReturnType<typeof useDeployments>['data'];
  formatTimeAgo: (date: string, t?: any) => string;
  getStatusBadge: (status: string) => string;
  onCancel: (id: string) => void;
  onRollback: (id: string) => void;
  onViewLogs: (deployment: NonNullable<ReturnType<typeof useDeployments>['data']>[number]) => void;
  onViewContainerLogs: (deploymentId: string) => void;
  onViewHistoricalLogs: (deploymentId: string) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  if (!deployments || deployments.length === 0) {
    return (
      <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
        <Rocket className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">{t('projectDetail', 'noDeploymentsYet')}</h3>
        <p className="text-[var(--text-secondary)]">{t('projectDetail', 'pushToTrigger')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deployments.map((deployment) => (
        <div
          key={deployment.id}
          className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`badge ${getStatusBadge(deployment.status)}`}>
                {deployment.status}
              </span>
              <span className="text-sm terminal-text">{deployment.branch}</span>
              {deployment.commitHash && (
                <span className="text-sm text-[var(--text-muted)]">
                  {deployment.commitHash.slice(0, 7)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {['queued', 'building', 'deploying'].includes(deployment.status) && (
                <button onClick={() => onCancel(deployment.id)} className="btn btn-ghost text-[var(--status-error)] h-8 text-xs">
                  {t('projectDetail', 'cancel')}
                </button>
              )}
              {(deployment.status === 'running' || deployment.status === 'stopped') && (
                <button onClick={() => onRollback(deployment.id)} className="btn btn-secondary h-8 text-xs flex items-center gap-1">
                  {deployment.dockerImageId && (
                    <span className="text-[var(--status-success)]" title="Quick rollback - no rebuild needed">⚡</span>
                  )}
                  {t('projectDetail', 'rollback')}
                </button>
              )}
              {deployment.url && (
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary h-8 text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t('projectDetail', 'preview')}
                </a>
              )}
              <button
                onClick={() => onViewLogs(deployment)}
                className="btn btn-ghost h-8 text-xs flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                {t('projectDetail', 'viewLogs')}
              </button>
              {deployment.status === 'running' && (
                <button
                  onClick={() => onViewContainerLogs(deployment.id)}
                  className="btn btn-secondary h-8 text-xs flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3" />
                  {t('projectDetail', 'containerLogs')}
                </button>
              )}
              {(deployment.status === 'running' || deployment.status === 'stopped' || deployment.status === 'failed') && (
                <button
                  onClick={() => onViewHistoricalLogs(deployment.id)}
                  className="btn btn-ghost h-8 text-xs flex items-center gap-1"
                  title="View stored container logs"
                >
                  <History className="w-3 h-3" />
                  {t('projectDetail', 'historicalLogs')}
                </button>
              )}
            </div>
          </div>
          {deployment.commitMessage && (
            <p className="text-sm text-[var(--text-secondary)] mb-3">{deployment.commitMessage}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(deployment.createdAt, t)}
            </span>
            <span className="capitalize">{deployment.trigger}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EnvironmentTab({
  envVars,
  onCreate,
  onDelete,
  onBulkCreate,
  t,
}: {
  envVars: ReturnType<typeof useEnvVars>['data'];
  onCreate: (data: { key: string; value: string }) => void;
  onDelete: (id: string) => void;
  onBulkCreate: (data: { key: string; value: string }[]) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasteForm, setShowPasteForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [envContent, setEnvContent] = useState('');
  const [parsedVars, setParsedVars] = useState<{ key: string; value: string }[]>([]);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const parseEnvContent = (content: string) => {
    const lines = content.split('\n');
    const vars: { key: string; value: string }[] = [];

    for (const line of lines) {
      // Skip empty lines and comments
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Match KEY=VALUE pattern (supports quotes)
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
      if (match) {
        const key = match[1].toUpperCase();
        let value = match[2];

        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        vars.push({ key, value });
      }
    }

    return vars;
  };

  const handleEnvContentChange = (content: string) => {
    setEnvContent(content);
    setParsedVars(parseEnvContent(content));
  };

  const handleBulkAdd = () => {
    if (parsedVars.length === 0) return;
    onBulkCreate(parsedVars);
    setEnvContent('');
    setParsedVars([]);
    setShowPasteForm(false);
  };

  const handleAdd = () => {
    if (!newKey || !newValue) return;
    onCreate({ key: newKey, value: newValue });
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setRevealedIds(newSet);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {t('projectDetail', 'envVarsDesc')}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowPasteForm(true); setShowAddForm(false); }}
            className="btn btn-secondary"
          >
            <FileText className="w-4 h-4" />
            {t('projectDetail', 'pasteEnv')}
          </button>
          <button
            onClick={() => { setShowAddForm(true); setShowPasteForm(false); }}
            className="btn btn-primary"
          >
            <Key className="w-4 h-4" />
            {t('projectDetail', 'addVariable')}
          </button>
        </div>
      </div>

      {/* Paste .env Form */}
      {showPasteForm && (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('projectDetail', 'pasteEnvContent')}
            </label>
            <textarea
              value={envContent}
              onChange={(e) => handleEnvContentChange(e.target.value)}
              placeholder={`# Paste your .env file content here\nAPI_KEY=your-api-key\nDATABASE_URL=postgres://...\nSECRET_KEY="value with spaces"`}
              rows={8}
              className="input terminal-text font-mono text-sm resize-none w-full"
            />
          </div>

          {/* Preview parsed variables */}
          {parsedVars.length > 0 && (
            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {t('projectDetail', 'parsedVariables')} ({parsedVars.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {parsedVars.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="terminal-text font-medium text-[var(--accent-cyan)]">{v.key}</span>
                    <span className="text-[var(--text-muted)]">=</span>
                    <span className="text-[var(--text-secondary)] truncate">{v.value.substring(0, 30)}{v.value.length > 30 ? '...' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => { setShowPasteForm(false); setEnvContent(''); setParsedVars([]); }}
              className="btn btn-ghost"
            >
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleBulkAdd}
              disabled={parsedVars.length === 0}
              className="btn btn-primary disabled:opacity-50"
            >
              {t('projectDetail', 'addVariables')} ({parsedVars.length})
            </button>
          </div>
        </div>
      )}

      {/* Single variable form */}
      {showAddForm && (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'key')}</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                placeholder="API_KEY"
                className="input terminal-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'value')}</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="your-secret-value"
                className="input terminal-text"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">{t('common', 'cancel')}</button>
            <button onClick={handleAdd} className="btn btn-primary">{t('projectDetail', 'addVariable')}</button>
          </div>
        </div>
      )}

      {(!envVars || envVars.length === 0) && !showAddForm && !showPasteForm ? (
        <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <Key className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">{t('projectDetail', 'noEnvVariables')}</h3>
          <p className="text-[var(--text-secondary)]">{t('projectDetail', 'noEnvVariablesDesc')}</p>
        </div>
      ) : envVars && envVars.length > 0 && (
        <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          {envVars.map((envVar, index) => (
            <div
              key={envVar.id}
              className={`p-4 flex items-center justify-between ${
                index !== envVars.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span className="terminal-text font-medium">{envVar.key}</span>
                <span className="text-[var(--text-muted)] terminal-text truncate">
                  {revealedIds.has(envVar.id) ? envVar.value : '••••••••'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleReveal(envVar.id)} className="btn btn-ghost h-8 text-xs">
                  {revealedIds.has(envVar.id) ? t('projectDetail', 'hide') : t('projectDetail', 'reveal')}
                </button>
                <button
                  onClick={() => {
                    if (confirm(t('projectDetail', 'deleteEnvVarConfirm'))) {
                      onDelete(envVar.id);
                    }
                  }}
                  className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DomainsTab({
  projectId,
  domains,
  onAdd,
  onDelete,
  onSetPrimary,
  onVerify,
  isVerifying,
  t,
}: {
  projectId: string;
  domains: ReturnType<typeof useDomains>['data'];
  onAdd: (domain: string) => void;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onVerify: (id: string) => void;
  isVerifying: boolean;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState(false);
  const [settingsDomainId, setSettingsDomainId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newDomain) return;
    onAdd(newDomain);
    setNewDomain('');
    setShowAddForm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const getSslStatusBadge = (sslStatus: string | null) => {
    switch (sslStatus) {
      case 'active':
        return { class: 'badge-success', text: 'SSL Active' };
      case 'configuring':
        return { class: 'badge-warning', text: 'SSL Configuring' };
      case 'failed':
        return { class: 'badge-error', text: 'SSL Failed' };
      default:
        return { class: 'badge-neutral', text: 'SSL Pending' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {t('projectDetail', 'domainsDesc')}
        </p>
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
          <Globe className="w-4 h-4" />
          {t('projectDetail', 'addDomain')}
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('projectDetail', 'domain')}</label>
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="input terminal-text"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setShowAddForm(false)} className="btn btn-ghost">{t('common', 'cancel')}</button>
            <button onClick={handleAdd} className="btn btn-primary">{t('projectDetail', 'addDomain')}</button>
          </div>
        </div>
      )}

      {(!domains || domains.length === 0) && !showAddForm ? (
        <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <Globe className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">{t('projectDetail', 'noCustomDomains')}</h3>
          <p className="text-[var(--text-secondary)]">{t('projectDetail', 'noCustomDomainsDesc')}</p>
        </div>
      ) : domains && domains.length > 0 && (
        <div className="space-y-3">
          {domains.map((domain) => (
            <DomainCard
              key={domain.id}
              projectId={projectId}
              domain={domain}
              isExpanded={expandedDomain === domain.id}
              onToggleExpand={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
              onVerify={onVerify}
              onSetPrimary={onSetPrimary}
              onDelete={onDelete}
              onOpenSettings={() => setSettingsDomainId(domain.id)}
              isVerifying={isVerifying}
              copiedIp={copiedIp}
              onCopyIp={copyToClipboard}
              getSslStatusBadge={getSslStatusBadge}
              t={t}
            />
          ))}

          {/* Nginx Settings Modal */}
          {settingsDomainId && (
            <NginxSettingsModal
              projectId={projectId}
              domainId={settingsDomainId}
              domainName={domains.find(d => d.id === settingsDomainId)?.domain || ''}
              onClose={() => setSettingsDomainId(null)}
              t={t}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DomainCard({
  projectId,
  domain,
  isExpanded,
  onToggleExpand,
  onVerify,
  onSetPrimary,
  onDelete,
  onOpenSettings,
  isVerifying,
  copiedIp,
  onCopyIp,
  getSslStatusBadge,
  t,
}: {
  projectId: string;
  domain: NonNullable<ReturnType<typeof useDomains>['data']>[number];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  isVerifying: boolean;
  copiedIp: boolean;
  onCopyIp: (text: string) => void;
  getSslStatusBadge: (sslStatus: string | null) => { class: string; text: string };
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: dnsSetup, isLoading: isDnsLoading } = useDnsSetup(
    projectId,
    isExpanded && !domain.verifiedAt ? domain.id : null
  );

  const sslBadge = getSslStatusBadge(domain.sslStatus);
  const isVerified = !!domain.verifiedAt;

  return (
    <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Globe className="w-5 h-5 text-[var(--text-muted)]" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="terminal-text font-medium">{domain.domain}</span>
              {domain.isPrimary && <span className="badge badge-info">{t('projectDetail', 'primary')}</span>}
              <span className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`}>
                {isVerified ? t('projectDetail', 'verified') : t('projectDetail', 'pending')}
              </span>
              {isVerified && (
                <span className={`badge ${sslBadge.class}`}>
                  {sslBadge.text}
                </span>
              )}
            </div>
            {!isVerified && (
              <button
                onClick={onToggleExpand}
                className="text-xs text-[var(--accent-cyan)] hover:underline mt-1 flex items-center gap-1"
              >
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                {isExpanded ? 'Hide DNS setup' : 'Show DNS setup instructions'}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <>
              <a
                href={`https://${domain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary h-8 text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </a>
              <button
                onClick={onOpenSettings}
                className="btn btn-secondary h-8 text-xs"
                title="Nginx Settings"
              >
                <Sliders className="w-3 h-3" />
                Settings
              </button>
            </>
          ) : (
            <button
              onClick={() => onVerify(domain.id)}
              disabled={isVerifying}
              className="btn btn-primary h-8 text-xs"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Verifying...
                </>
              ) : (
                t('projectDetail', 'verify')
              )}
            </button>
          )}
          {isVerified && !domain.isPrimary && (
            <button onClick={() => onSetPrimary(domain.id)} className="btn btn-secondary h-8 text-xs">
              {t('projectDetail', 'setPrimary')}
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(t('projectDetail', 'removeDomainConfirm'))) {
                onDelete(domain.id);
              }
            }}
            className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DNS Setup Instructions Panel */}
      {isExpanded && !isVerified && (
        <div className="border-t border-[var(--border-subtle)] p-4 bg-[var(--bg-tertiary)]">
          {isDnsLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
              <span className="ml-2 text-sm text-[var(--text-muted)]">Loading DNS information...</span>
            </div>
          ) : dnsSetup ? (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">DNS Configuration</h4>

              {dnsSetup.serverIp ? (
                <>
                  <div className="text-sm text-[var(--text-secondary)]">
                    <p className="mb-3">
                      Add an <span className="font-semibold text-[var(--text-primary)]">A record</span> in your DNS provider pointing to your server:
                    </p>

                    <div className="bg-[var(--bg-primary)] rounded-lg p-4 border border-[var(--border-subtle)]">
                      <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                        <div>
                          <span className="text-[var(--text-muted)] block mb-1">Type</span>
                          <span className="terminal-text font-medium">A</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block mb-1">Name</span>
                          <span className="terminal-text font-medium">
                            {domain.domain.split('.')[0] === domain.domain ? '@' : domain.domain.split('.')[0]}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)] block mb-1">Value</span>
                          <div className="flex items-center gap-2">
                            <span className="terminal-text font-medium">{dnsSetup.serverIp}</span>
                            <button
                              onClick={() => onCopyIp(dnsSetup.serverIp!)}
                              className="text-[var(--accent-cyan)] hover:text-[var(--text-primary)]"
                            >
                              {copiedIp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    dnsSetup.isConfigured
                      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      : dnsSetup.currentIp
                      ? 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                      : 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                  }`}>
                    {dnsSetup.isConfigured ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>DNS is correctly configured! Click "Verify" to complete setup.</span>
                      </>
                    ) : dnsSetup.currentIp ? (
                      <>
                        <Activity className="w-4 h-4" />
                        <span>
                          DNS currently points to <span className="font-mono">{dnsSetup.currentIp}</span>.
                          Update it to point to <span className="font-mono">{dnsSetup.serverIp}</span>.
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>DNS record not found. Add the A record above, then wait for propagation (may take a few minutes).</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--status-warning)]/10 text-[var(--status-warning)] text-sm">
                  <Server className="w-4 h-4" />
                  <span>No server assigned to this project. Please assign a server in project settings first.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)]">
              Unable to load DNS setup information.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Nginx Settings Modal Component
function NginxSettingsModal({
  projectId,
  domainId,
  domainName,
  onClose,
  t,
}: {
  projectId: string;
  domainId: string;
  domainName: string;
  onClose: () => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: settings, isLoading } = useNginxSettings(projectId, domainId);
  const updateSettings = useUpdateNginxSettings(projectId, domainId);

  // Form state
  const [proxyPort, setProxyPort] = useState<number | ''>('');
  const [proxyTimeout, setProxyTimeout] = useState<number>(86400);
  const [clientMaxBodySize, setClientMaxBodySize] = useState('100m');
  const [enableWebsocket, setEnableWebsocket] = useState(true);
  const [enableGzip, setEnableGzip] = useState(true);
  const [forceHttps, setForceHttps] = useState(true);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false);
  const [rateLimitRps, setRateLimitRps] = useState(10);
  const [rateLimitBurst, setRateLimitBurst] = useState(20);
  const [cachingEnabled, setCachingEnabled] = useState(false);
  const [cachingMaxAge, setCachingMaxAge] = useState(3600);
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [customLocationBlocks, setCustomLocationBlocks] = useState('');

  // Load settings when data arrives
  useEffect(() => {
    if (settings) {
      setProxyPort(settings.proxyPort ?? '');
      setProxyTimeout(settings.proxyTimeout ?? 86400);
      setClientMaxBodySize(settings.clientMaxBodySize ?? '100m');
      setEnableWebsocket(settings.enableWebsocket ?? true);
      setEnableGzip(settings.enableGzip ?? true);
      setForceHttps(settings.forceHttps ?? true);
      setRateLimitEnabled(settings.rateLimit?.enabled ?? false);
      setRateLimitRps(settings.rateLimit?.requestsPerSecond ?? 10);
      setRateLimitBurst(settings.rateLimit?.burst ?? 20);
      setCachingEnabled(settings.caching?.enabled ?? false);
      setCachingMaxAge(settings.caching?.maxAge ?? 3600);
      setCustomLocationBlocks(settings.customLocationBlocks ?? '');
      if (settings.customHeaders) {
        setCustomHeaders(
          Object.entries(settings.customHeaders).map(([key, value]) => ({ key, value }))
        );
      }
    }
  }, [settings]);

  const handleSave = async () => {
    const headersObj: Record<string, string> = {};
    customHeaders.forEach(h => {
      if (h.key.trim()) {
        headersObj[h.key.trim()] = h.value;
      }
    });

    await updateSettings.mutateAsync({
      proxyPort: proxyPort ? Number(proxyPort) : undefined,
      proxyTimeout,
      clientMaxBodySize,
      enableWebsocket,
      enableGzip,
      forceHttps,
      rateLimit: rateLimitEnabled ? {
        enabled: true,
        requestsPerSecond: rateLimitRps,
        burst: rateLimitBurst,
      } : undefined,
      caching: cachingEnabled ? {
        enabled: true,
        maxAge: cachingMaxAge,
      } : undefined,
      customHeaders: Object.keys(headersObj).length > 0 ? headersObj : undefined,
      customLocationBlocks: customLocationBlocks.trim() || undefined,
    });
    onClose();
  };

  const addCustomHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const removeCustomHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const updateCustomHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  // Use portal to render modal at document body level
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div
        className="relative rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-lg font-semibold">Nginx Settings</h2>
            <p className="text-sm text-[var(--text-secondary)]">{domainName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : (
            <>
              {/* Port Configuration */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Port Configuration</h3>
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Proxy Port
                      </label>
                      <input
                        type="number"
                        value={proxyPort}
                        onChange={(e) => setProxyPort(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="Use project default"
                        min={1}
                        max={65535}
                        className="input terminal-text w-48"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Leave empty to use the project&apos;s default port. Override if this domain should route to a different port.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Basic Settings */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Basic Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Proxy Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={proxyTimeout}
                      onChange={(e) => setProxyTimeout(parseInt(e.target.value) || 60)}
                      min={1}
                      max={86400}
                      className="input terminal-text w-full"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">Max: 86400 (24 hours)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Max Body Size
                    </label>
                    <input
                      type="text"
                      value={clientMaxBodySize}
                      onChange={(e) => setClientMaxBodySize(e.target.value)}
                      placeholder="100m"
                      className="input terminal-text w-full"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">e.g., 100m, 1g</p>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  <ToggleOption
                    label="Enable WebSocket Support"
                    description="Allow WebSocket connections through the proxy"
                    enabled={enableWebsocket}
                    onChange={setEnableWebsocket}
                  />
                  <ToggleOption
                    label="Enable Gzip Compression"
                    description="Compress responses to reduce bandwidth"
                    enabled={enableGzip}
                    onChange={setEnableGzip}
                  />
                  <ToggleOption
                    label="Force HTTPS"
                    description="Redirect all HTTP requests to HTTPS"
                    enabled={forceHttps}
                    onChange={setForceHttps}
                  />
                </div>
              </section>

              {/* Rate Limiting */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Rate Limiting</h3>

                <ToggleOption
                  label="Enable Rate Limiting"
                  description="Limit requests per IP address"
                  enabled={rateLimitEnabled}
                  onChange={setRateLimitEnabled}
                />

                {rateLimitEnabled && (
                  <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-[var(--border-subtle)]">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Requests per Second
                      </label>
                      <input
                        type="number"
                        value={rateLimitRps}
                        onChange={(e) => setRateLimitRps(parseInt(e.target.value) || 1)}
                        min={1}
                        max={1000}
                        className="input terminal-text w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                        Burst Size
                      </label>
                      <input
                        type="number"
                        value={rateLimitBurst}
                        onChange={(e) => setRateLimitBurst(parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                        className="input terminal-text w-full"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Caching */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Caching</h3>

                <ToggleOption
                  label="Enable Proxy Caching"
                  description="Cache responses from your application"
                  enabled={cachingEnabled}
                  onChange={setCachingEnabled}
                />

                {cachingEnabled && (
                  <div className="pl-4 border-l-2 border-[var(--border-subtle)]">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Cache Max Age (seconds)
                    </label>
                    <input
                      type="number"
                      value={cachingMaxAge}
                      onChange={(e) => setCachingMaxAge(parseInt(e.target.value) || 60)}
                      min={1}
                      max={31536000}
                      className="input terminal-text w-48"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">How long to cache successful responses</p>
                  </div>
                )}
              </section>

              {/* Custom Headers */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Custom Headers</h3>
                  <button
                    onClick={addCustomHeader}
                    className="btn btn-secondary h-7 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Add Header
                  </button>
                </div>

                {customHeaders.length > 0 ? (
                  <div className="space-y-2">
                    {customHeaders.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateCustomHeader(index, 'key', e.target.value)}
                          placeholder="Header Name"
                          className="input terminal-text flex-1"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
                          placeholder="Header Value"
                          className="input terminal-text flex-1"
                        />
                        <button
                          onClick={() => removeCustomHeader(index)}
                          className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No custom headers configured</p>
                )}
              </section>

              {/* Custom Location Blocks */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Custom Location Blocks</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Advanced: Add custom Nginx location blocks. Use with caution.
                </p>
                <textarea
                  value={customLocationBlocks}
                  onChange={(e) => setCustomLocationBlocks(e.target.value)}
                  placeholder={`location /api/special {\n    proxy_pass http://special-service;\n}`}
                  rows={5}
                  className="input terminal-text w-full font-mono text-sm"
                />
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mb-3 pt-2 px-4 border-t border-[var(--border-subtle)]">
          <button onClick={onClose} className="btn btn-ghost">
            {t('common', 'cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending || isLoading}
            className="btn btn-primary"
          >
            {updateSettings.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Toggle option component for the modal
function ToggleOption({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
      onClick={() => onChange(!enabled)}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      {enabled ? (
        <ToggleRight className="w-6 h-6 text-[var(--accent-primary)]" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-[var(--text-muted)]" />
      )}
    </div>
  );
}

function SettingsTab({
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
    <div className="space-y-6">
      {/* General settings */}
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
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
          {t('projectDetail', 'webhooksDesc')}
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
              {t('projectDetail', 'webhookUrlHint')}
            </p>
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

          {/* GitHub setup instructions */}
          <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]">
            <h4 className="text-sm font-medium mb-2">{t('projectDetail', 'githubSetup')}</h4>
            <ol className="text-sm text-[var(--text-secondary)] space-y-1 list-decimal list-inside">
              <li>{t('projectDetail', 'githubStep1')}</li>
              <li>{t('projectDetail', 'githubStep2')}</li>
              <li>{t('projectDetail', 'githubStep3')}</li>
              <li>{t('projectDetail', 'githubStep4')}</li>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

function NotificationsTab({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [channelType, setChannelType] = useState<NotificationChannelType>('slack');
  const [channelName, setChannelName] = useState('');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [emailAddresses, setEmailAddresses] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<NotificationEvent[]>([
    'deployment.started',
    'deployment.success',
    'deployment.failed',
  ]);

  const { data: channels = [], isLoading } = useNotificationChannels(projectId);
  const createChannel = useCreateNotificationChannel(projectId);
  const updateChannel = useUpdateNotificationChannel(projectId);
  const deleteChannel = useDeleteNotificationChannel(projectId);
  const testChannel = useTestNotificationChannel(projectId);

  const resetForm = () => {
    setChannelName('');
    setChannelType('slack');
    setSlackWebhookUrl('');
    setEmailAddresses('');
    setWebhookUrl('');
    setWebhookSecret('');
    setSelectedEvents(['deployment.started', 'deployment.success', 'deployment.failed']);
    setEditingChannel(null);
    setShowAddForm(false);
  };

  const handleSubmit = async () => {
    let config: ChannelConfig;

    switch (channelType) {
      case 'slack':
        config = { webhookUrl: slackWebhookUrl };
        break;
      case 'email':
        config = { emails: emailAddresses.split(',').map((e) => e.trim()).filter(Boolean) };
        break;
      case 'webhook':
        config = { url: webhookUrl, ...(webhookSecret && { secret: webhookSecret }) };
        break;
    }

    if (editingChannel) {
      await updateChannel.mutateAsync({
        channelId: editingChannel.id,
        input: { name: channelName, config, events: selectedEvents },
      });
    } else {
      await createChannel.mutateAsync({
        type: channelType,
        name: channelName,
        config,
        events: selectedEvents,
      });
    }

    resetForm();
  };

  const handleEdit = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setChannelName(channel.name);
    setChannelType(channel.type);
    setSelectedEvents(channel.events as NotificationEvent[]);
    setShowAddForm(true);
  };

  const handleDelete = async (channelId: string) => {
    if (confirm('Are you sure you want to delete this notification channel?')) {
      await deleteChannel.mutateAsync(channelId);
    }
  };

  const handleTest = async (channelId: string) => {
    try {
      await testChannel.mutateAsync(channelId);
      alert(t('notifications', 'testSuccess'));
    } catch {
      alert(t('notifications', 'testFailed'));
    }
  };

  const toggleEvent = (event: NotificationEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const eventsList: { id: NotificationEvent; label: string }[] = [
    { id: 'deployment.started', label: t('notifications', 'deploymentStarted') },
    { id: 'deployment.success', label: t('notifications', 'deploymentSuccess') },
    { id: 'deployment.failed', label: t('notifications', 'deploymentFailed') },
    { id: 'health.unhealthy', label: t('notifications', 'healthUnhealthy') },
    { id: 'health.recovered', label: t('notifications', 'healthRecovered') },
  ];

  const getChannelTypeIcon = (type: NotificationChannelType) => {
    switch (type) {
      case 'slack':
        return <Send className="w-4 h-4" />;
      case 'email':
        return <Send className="w-4 h-4" />;
      case 'webhook':
        return <Globe className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-[var(--bg-secondary)] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">
            {t('notifications', 'description')}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          {t('notifications', 'addChannel')}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-lg font-semibold">
            {editingChannel ? t('notifications', 'editChannel') : t('notifications', 'addChannel')}
          </h3>

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('notifications', 'channelName')}
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder={t('notifications', 'channelNamePlaceholder')}
              className="input max-w-md"
            />
          </div>

          {/* Channel Type */}
          {!editingChannel && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('notifications', 'channelType')}
              </label>
              <div className="flex gap-2">
                {(['slack', 'email', 'webhook'] as NotificationChannelType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChannelType(type)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      channelType === type
                        ? 'bg-[var(--accent-cyan)] text-black border-[var(--accent-cyan)]'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {t('notifications', type)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type-specific config */}
          {channelType === 'slack' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('notifications', 'slackWebhookUrl')}
              </label>
              <input
                type="text"
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder={t('notifications', 'slackWebhookUrlPlaceholder')}
                className="input max-w-xl terminal-text text-sm"
              />
            </div>
          )}

          {channelType === 'email' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('notifications', 'emailAddresses')}
              </label>
              <input
                type="text"
                value={emailAddresses}
                onChange={(e) => setEmailAddresses(e.target.value)}
                placeholder={t('notifications', 'emailAddressesPlaceholder')}
                className="input max-w-xl"
              />
            </div>
          )}

          {channelType === 'webhook' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('notifications', 'webhookUrl')}
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder={t('notifications', 'webhookUrlPlaceholder')}
                  className="input max-w-xl terminal-text text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t('notifications', 'webhookSecret')}
                </label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder={t('notifications', 'webhookSecretPlaceholder')}
                  className="input max-w-xl terminal-text text-sm"
                />
              </div>
            </>
          )}

          {/* Events */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('notifications', 'events')}
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              {t('notifications', 'eventsDesc')}
            </p>
            <div className="flex flex-wrap gap-2">
              {eventsList.map((event) => (
                <button
                  key={event.id}
                  onClick={() => toggleEvent(event.id)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    selectedEvents.includes(event.id)
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {event.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <button onClick={resetForm} className="btn btn-ghost">
              {t('common', 'cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!channelName || createChannel.isPending || updateChannel.isPending}
              className="btn btn-primary disabled:opacity-50"
            >
              {createChannel.isPending || updateChannel.isPending ? t('common', 'loading') : t('common', 'save')}
            </button>
          </div>
        </div>
      )}

      {/* Channels List */}
      {channels.length === 0 && !showAddForm ? (
        <div className="p-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">{t('notifications', 'noChannels')}</h3>
          <p className="text-[var(--text-secondary)]">{t('notifications', 'noChannelsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                    {getChannelTypeIcon(channel.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{channel.name}</span>
                      <span className="px-2 py-0.5 text-xs rounded bg-[var(--bg-tertiary)]">
                        {t('notifications', channel.type)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          channel.isActive
                            ? 'bg-[var(--status-success)]/20 text-[var(--status-success)]'
                            : 'bg-[var(--text-muted)]/20 text-[var(--text-muted)]'
                        }`}
                      >
                        {channel.isActive ? t('notifications', 'active') : t('notifications', 'inactive')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {channel.events.slice(0, 3).map((event) => (
                        <span key={event} className="text-xs text-[var(--text-muted)]">
                          {event}
                        </span>
                      ))}
                      {channel.events.length > 3 && (
                        <span className="text-xs text-[var(--text-muted)]">
                          +{channel.events.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTest(channel.id)}
                    disabled={testChannel.isPending}
                    className="btn btn-ghost h-8 text-xs"
                  >
                    <Send className="w-3 h-3" />
                    {t('notifications', 'testChannel')}
                  </button>
                  <button onClick={() => handleEdit(channel)} className="btn btn-ghost h-8 text-xs">
                    {t('common', 'edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthCheckSection({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: config, isLoading } = useHealthCheckConfig(projectId);
  const { data: logs = [] } = useHealthCheckLogs(projectId);
  const updateConfig = useUpdateHealthCheckConfig(projectId);
  const deleteConfig = useDeleteHealthCheckConfig(projectId);

  const [isEnabled, setIsEnabled] = useState(false);
  const [endpoint, setEndpoint] = useState('/health');
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);
  const [unhealthyThreshold, setUnhealthyThreshold] = useState(3);
  const [autoRestart, setAutoRestart] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with config data
  if (config && !initialized) {
    setIsEnabled(config.isActive);
    setEndpoint(config.endpoint);
    setIntervalSeconds(config.intervalSeconds);
    setTimeoutSeconds(config.timeoutSeconds);
    setUnhealthyThreshold(config.unhealthyThreshold);
    setAutoRestart(config.autoRestart);
    setInitialized(true);
  }

  const handleSave = async () => {
    await updateConfig.mutateAsync({
      endpoint,
      intervalSeconds,
      timeoutSeconds,
      unhealthyThreshold,
      autoRestart,
      isActive: isEnabled,
    });
    setHasChanges(false);
  };

  const handleDisable = async () => {
    await deleteConfig.mutateAsync();
    setIsEnabled(false);
    setHasChanges(false);
    setInitialized(false);
  };

  const handleToggle = () => {
    if (config && isEnabled) {
      handleDisable();
    } else {
      setIsEnabled(true);
      setHasChanges(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'badge-success';
      case 'unhealthy':
      case 'timeout':
        return 'badge-error';
      default:
        return 'badge-warning';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-4 w-64 bg-[var(--bg-tertiary)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{t('healthChecks', 'title')}</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={updateConfig.isPending || deleteConfig.isPending}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isEnabled || config?.isActive
                ? 'bg-[var(--accent-cyan)]'
                : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isEnabled || config?.isActive ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        {t('healthChecks', 'description')}
      </p>

      {(isEnabled || config?.isActive) && (
        <div className="space-y-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Endpoint */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'endpoint')}
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => { setEndpoint(e.target.value); setHasChanges(true); }}
                placeholder={t('healthChecks', 'endpointPlaceholder')}
                className="input terminal-text text-sm"
              />
            </div>

            {/* Interval */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'interval')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={intervalSeconds}
                  onChange={(e) => { setIntervalSeconds(Number(e.target.value)); setHasChanges(true); }}
                  min={10}
                  max={300}
                  className="input w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">{t('healthChecks', 'seconds')}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('healthChecks', 'intervalDesc')}</p>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'timeout')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={timeoutSeconds}
                  onChange={(e) => { setTimeoutSeconds(Number(e.target.value)); setHasChanges(true); }}
                  min={1}
                  max={60}
                  className="input w-24 text-sm"
                />
                <span className="text-sm text-[var(--text-muted)]">{t('healthChecks', 'seconds')}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('healthChecks', 'timeoutDesc')}</p>
            </div>

            {/* Unhealthy Threshold */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {t('healthChecks', 'unhealthyThreshold')}
              </label>
              <input
                type="number"
                value={unhealthyThreshold}
                onChange={(e) => { setUnhealthyThreshold(Number(e.target.value)); setHasChanges(true); }}
                min={1}
                max={10}
                className="input w-24 text-sm"
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">{t('healthChecks', 'unhealthyThresholdDesc')}</p>
            </div>
          </div>

          {/* Auto Restart Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
            <div>
              <span className="text-sm font-medium">{t('healthChecks', 'autoRestart')}</span>
              <p className="text-xs text-[var(--text-muted)]">{t('healthChecks', 'autoRestartDesc')}</p>
            </div>
            <button
              onClick={() => { setAutoRestart(!autoRestart); setHasChanges(true); }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoRestart
                  ? 'bg-[var(--accent-cyan)]'
                  : 'bg-[var(--bg-secondary)]'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoRestart ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={updateConfig.isPending}
                className="btn btn-primary"
              >
                {updateConfig.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  t('common', 'save')
                )}
              </button>
            </div>
          )}

          {/* Recent Logs */}
          {logs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <h4 className="text-sm font-medium mb-3">{t('healthChecks', 'recentLogs')}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2 rounded bg-[var(--bg-tertiary)] text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`badge ${getStatusBadge(log.status)}`}>
                        {t('healthChecks', log.status as 'healthy' | 'unhealthy' | 'unknown')}
                      </span>
                      {log.responseTimeMs && (
                        <span className="text-[var(--text-muted)]">
                          {log.responseTimeMs}ms
                        </span>
                      )}
                      {log.statusCode && (
                        <span className="text-[var(--text-muted)]">
                          HTTP {log.statusCode}
                        </span>
                      )}
                      {log.actionTaken && log.actionTaken !== 'none' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--status-warning)]/20 text-[var(--status-warning)]">
                          {t('healthChecks', log.actionTaken as 'restarted' | 'notified')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTimeAgo(log.checkedAt, t)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewDeploymentsSection({
  projectId,
  project,
  t,
}: {
  projectId: string;
  project: NonNullable<ReturnType<typeof useProject>['data']>;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: previews = [], isLoading } = useActivePreviewDeployments(projectId);
  const updateSettings = useUpdateProjectSettings(projectId);

  // Get current preview deployments setting from project settings
  const previewDeploymentsEnabled = (project.settings as Record<string, unknown>)?.previewDeploymentsEnabled === true;

  const handleToggle = async () => {
    await updateSettings.mutateAsync({ previewDeploymentsEnabled: !previewDeploymentsEnabled });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return 'badge-success';
      case 'building':
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{t('previews', 'title')}</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            disabled={updateSettings.isPending}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              previewDeploymentsEnabled
                ? 'bg-[var(--accent-cyan)]'
                : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                previewDeploymentsEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
          {updateSettings.isPending && (
            <RefreshCw className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
          )}
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        {t('previews', 'description')}
      </p>

      {previewDeploymentsEnabled && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <h4 className="text-sm font-medium mb-3">{t('previews', 'activePreviews')}</h4>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-16 bg-[var(--bg-tertiary)] rounded" />
            </div>
          ) : previews.length === 0 ? (
            <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] text-center">
              <p className="text-sm text-[var(--text-muted)]">{t('previews', 'noPreviewsDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {previews.map((preview) => (
                <div
                  key={preview.id}
                  className="p-3 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusBadge(preview.status)}`}>
                      {t('previews', preview.status as 'pending' | 'building' | 'running' | 'stopped' | 'failed')}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {t('previews', 'prNumber')} #{preview.prNumber}
                        </span>
                        {preview.prTitle && (
                          <span className="text-sm text-[var(--text-secondary)] truncate max-w-[200px]">
                            {preview.prTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span>{preview.prBranch}</span>
                        <span>→</span>
                        <span>{preview.baseBranch}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(preview.createdAt, t)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {preview.previewUrl && preview.status === 'running' && (
                      <a
                        href={preview.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary h-8 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {t('previews', 'previewUrl')}
                      </a>
                    )}
                    {project.gitRepoUrl && (
                      <a
                        href={`${project.gitRepoUrl}/pull/${preview.prNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost h-8 text-xs"
                      >
                        <GitBranch className="w-3 h-3" />
                        {t('previews', 'viewOnGithub')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Metrics Section ============

function MetricsSection({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: summary, isLoading, isFetching } = useMetricsSummary(projectId);
  const [selectedHours, setSelectedHours] = useState(1);
  const { data: timeSeries = [] } = useMetricsTimeSeries(projectId, selectedHours);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-[var(--bg-tertiary)] rounded" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-[var(--bg-tertiary)] rounded" />
            <div className="h-20 bg-[var(--bg-tertiary)] rounded" />
            <div className="h-20 bg-[var(--bg-tertiary)] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!summary?.current) {
    return (
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <h3 className="text-lg font-semibold mb-2">{t('metrics', 'title')}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t('metrics', 'description')}</p>
        <div className="text-center py-8">
          <Activity className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)]">{t('metrics', 'noData')}</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('metrics', 'noDataDesc')}</p>
        </div>
      </div>
    );
  }

  const { current, stats24h } = summary;
  const chartData = timeSeries.slice().reverse().map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  const MetricsTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 shadow-xl">
        <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name !== 'Network In' && entry.name !== 'Network Out' ? '%' : ' MB'}
          </p>
        ))}
      </div>
    );
  };

  const { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } = require('recharts');

  return (
    <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t('metrics', 'title')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('metrics', 'description')}</p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="text-xs text-[var(--text-muted)]">{t('metrics', 'refreshing')}</span>
          )}
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              current.containerStatus === 'running'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {current.containerStatus === 'running' ? t('metrics', 'running') : t('metrics', 'stopped')}
          </span>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CPU */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'cpu')}</span>
            <Activity className="w-4 h-4 text-[var(--accent-cyan)]" />
          </div>
          <div className="text-2xl font-bold text-[var(--accent-cyan)]">
            {formatPercent(current.cpuPercent)}
          </div>
          <div className="mt-2 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-cyan)] transition-all duration-300"
              style={{ width: `${Math.min(current.cpuPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Memory */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'memory')}</span>
            <div className="w-4 h-4 text-purple-400">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5h16v14H4V5zm2 2v10h12V7H6z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {formatPercent(current.memoryPercent)}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {formatStorage(current.memoryUsageMB)} / {formatStorage(current.memoryLimitMB)}
          </div>
          <div className="mt-2 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-400 transition-all duration-300"
              style={{ width: `${Math.min(current.memoryPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Network */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'network')}</span>
            <Globe className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">↓ {t('metrics', 'networkIn')}</span>
              <span className="text-sm font-medium text-green-400">{formatStorage(current.networkRxMB)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">↑ {t('metrics', 'networkOut')}</span>
              <span className="text-sm font-medium text-blue-400">{formatStorage(current.networkTxMB)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { hours: 1, label: t('metrics', 'last1Hour') },
          { hours: 6, label: t('metrics', 'last6Hours') },
          { hours: 24, label: t('metrics', 'last24Hours') },
        ].map(({ hours, label }) => (
          <button
            key={hours}
            onClick={() => setSelectedHours(hours)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              selectedHours === hours
                ? 'bg-[var(--accent-cyan)] text-black'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Recharts */}
      {chartData.length > 0 && (
        <div className="space-y-6">
          {/* CPU Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'cpuUsage')}</span>
              {stats24h && (
                <span className="text-xs text-[var(--text-muted)]">
                  {t('metrics', 'avgCpu')}: {formatPercent(stats24h.avgCpu)} | {t('metrics', 'maxCpu')}: {formatPercent(stats24h.maxCpu)}
                </span>
              )}
            </div>
            <div className="h-40 bg-[var(--bg-tertiary)] rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGradientProject" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={30} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<MetricsTooltip />} />
                  <Area type="monotone" dataKey="cpuPercent" name="CPU" stroke={STATUS_COLORS.cyan} fill="url(#cpuGradientProject)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: STATUS_COLORS.cyan }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'memoryUsage')}</span>
              {stats24h && (
                <span className="text-xs text-[var(--text-muted)]">
                  {t('metrics', 'avgMemory')}: {formatPercent(stats24h.avgMemory)} | {t('metrics', 'maxMemory')}: {formatPercent(stats24h.maxMemory)}
                </span>
              )}
            </div>
            <div className="h-40 bg-[var(--bg-tertiary)] rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="memGradientProject" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={30} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<MetricsTooltip />} />
                  <Area type="monotone" dataKey="memoryPercent" name="Memory" stroke={STATUS_COLORS.purple} fill="url(#memGradientProject)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: STATUS_COLORS.purple }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'network')}</span>
            </div>
            <div className="h-40 bg-[var(--bg-tertiary)] rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `${v.toFixed(0)} MB`} />
                  <Tooltip content={<MetricsTooltip />} />
                  <Line type="monotone" dataKey="networkRxMB" name="Network In" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#34d399' }} />
                  <Line type="monotone" dataKey="networkTxMB" name="Network Out" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-xs text-[var(--text-muted)] text-right">
        {t('metrics', 'lastUpdated')}: {new Date(current.recordedAt).toLocaleString()}
      </div>
    </div>
  );
}
