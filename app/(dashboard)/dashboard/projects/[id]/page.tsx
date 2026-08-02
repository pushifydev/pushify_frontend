'use client';

import { useState, useCallback } from 'react';
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
  Rocket,
  Sparkles,
  Activity,
  Key,
  ChevronRight,
  Copy,
  Check,
  Bell, ScrollText, Cpu } from 'lucide-react';
import { DeploymentLogsModal } from '@/components/DeploymentLogsModal';
import { ContainerLogsModal } from '@/components/ContainerLogsModal';
import { HistoricalLogsModal } from '@/components/HistoricalLogsModal';
import {
  OverviewTab,
  DeploymentsTab,
  EnvironmentTab,
  DomainsTab,
  NotificationsTab,
  ScheduledTasksTab,
  WorkersTab,
  LogsTab,
  SettingsTab,
} from './components';
import {
  useProject,
  useDeleteProject,
  useUpdateProjectStatus,
  useDeploymentStatusEvents,
  useMetricsPushEvents,
  useHealthCheckEvents,
  useDeployments,
  useCancelDeployment,
  useRollbackDeployment,
  useRedeployDeployment,
  useCreateDeployment,
  useEnvVars,
  useCreateEnvVar,
  useUpdateEnvVar,
  useDeleteEnvVar,
  useBulkCreateEnvVars,
  useCloneEnvVars,
  useDomains,
  useAddDomain,
  useDeleteDomain,
  useSetPrimaryDomain,
  useVerifyDomain,
  useTranslation,
} from '@/hooks';
import { useConfirm } from '@/hooks/useConfirm';
import { type ProjectStatus } from '@/lib/api';
import { formatTimeAgo } from '@/lib/formatters';

type Tab = 'overview' | 'deployments' | 'logs' | 'environment' | 'domains' | 'cron' | 'workers' | 'notifications' | 'settings';

const VALID_TABS: Tab[] = ['overview', 'deployments', 'logs', 'environment', 'domains', 'cron', 'workers', 'notifications', 'settings'];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const confirm = useConfirm();
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
  const updateProjectStatus = useUpdateProjectStatus(projectId);
  useDeploymentStatusEvents(projectId);
  useMetricsPushEvents(projectId);
  useHealthCheckEvents(projectId);
  const cancelDeployment = useCancelDeployment(projectId);
  const rollbackDeployment = useRollbackDeployment(projectId);
  const redeployDeployment = useRedeployDeployment(projectId);
  const createDeployment = useCreateDeployment(projectId);
  const createEnvVar = useCreateEnvVar(projectId);
  const updateEnvVar = useUpdateEnvVar(projectId);
  const deleteEnvVar = useDeleteEnvVar(projectId);
  const bulkCreateEnvVars = useBulkCreateEnvVars(projectId);
  const cloneEnvVars = useCloneEnvVars(projectId);
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
    await updateProjectStatus.mutateAsync(status);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      variant: 'danger',
      title: t('projectDetail', 'deleteProject'),
      description: t('projectDetail', 'deleteProjectConfirm'),
      confirmText: t('common', 'delete'),
      cancelText: t('common', 'cancel'),
    });
    if (ok) {
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

  const fromStudio = searchParams.get('studio') === '1';
  const projectSettings = (project.settings || {}) as Record<string, unknown>;
  const isSiteStudioProject = typeof projectSettings.siteStudioTemplateId === 'string';
  const isCalcomStack =
    projectSettings.siteStudioStack === 'calcom' ||
    projectSettings.marketplaceTemplateId === 'calcom';
  const latestDeployment = deployments[0];
  const deployInProgress =
    latestDeployment &&
    ['pending', 'queued', 'building', 'deploying'].includes(latestDeployment.status);
  const siteUrl = project.productionUrl || null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: t('projectDetail', 'overview'), icon: <Activity className="w-4 h-4" /> },
    { id: 'deployments', label: t('projectDetail', 'deployments'), icon: <Rocket className="w-4 h-4" /> },
    { id: 'logs', label: t('logs', 'title'), icon: <ScrollText className="w-4 h-4" /> },
    { id: 'environment', label: t('projectDetail', 'environment'), icon: <Key className="w-4 h-4" /> },
    { id: 'domains', label: t('projectDetail', 'domains'), icon: <Globe className="w-4 h-4" /> },
    { id: 'cron', label: t('cron', 'title'), icon: <Clock className="w-4 h-4" /> },
    { id: 'workers', label: t('workers', 'title'), icon: <Cpu className="w-4 h-4" /> },
    { id: 'notifications', label: t('notifications', 'title'), icon: <Bell className="w-4 h-4" /> },
    { id: 'settings', label: t('projectDetail', 'settings'), icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] min-w-0">
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('navigation', 'projects')}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--text-primary)] truncate">{project.name}</span>
      </div>

      {(fromStudio || isSiteStudioProject) && (
        <div
          className="rounded-xl p-5 border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5"
          role="status"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-2">
              <p className="font-semibold text-[var(--text-primary)]">
                {fromStudio
                  ? t('siteStudio', 'projectDeployBannerTitle')
                  : t('siteEditor', 'openEditor')}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {fromStudio
                  ? t('siteStudio', 'projectDeployBannerDesc')
                  : t('siteEditor', 'openEditorDesc')}
              </p>
              {deployInProgress && (
                <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  {t('siteStudio', 'projectDeployInProgress')}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {!deployInProgress && (
                  <Link
                    href={`/dashboard/projects/${project.id}/site-editor`}
                    className="btn btn-primary btn-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('siteEditor', 'openEditor')}
                  </Link>
                )}
                {siteUrl && !deployInProgress && (
                  <>
                    <a
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('siteStudio', 'projectDeployOpenSite')}
                    </a>
                    {isCalcomStack && (
                      <a
                        href={`${siteUrl.replace(/\/$/, '')}/auth/setup`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        {t('siteStudio', 'projectDeploySetupCalcom')}
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
              <GitBranch className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--text-muted)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold truncate max-w-full">{project.name}</h1>
                <span className={`badge shrink-0 ${getStatusBadge(project.status)}`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-[var(--text-secondary)] mt-1 text-sm leading-relaxed break-words">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 text-sm text-[var(--text-muted)]">
                {project.framework && (
                  <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] terminal-text text-xs shrink-0">
                    {project.framework}
                  </span>
                )}
                {project.gitRepoUrl && (
                  <a
                    href={project.gitRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 min-w-0 max-w-full hover:text-[var(--text-secondary)] transition-colors"
                  >
                    <GitBranch className="w-4 h-4 shrink-0" />
                    <span className="truncate">{project.gitRepoUrl.replace('https://github.com/', '')}</span>
                  </a>
                )}
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-4 h-4 shrink-0" />
                  {t('projectDetail', 'updated')} {formatTimeAgo(project.updatedAt, t)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
            {(project.productionUrl || domains?.find((d: any) => d.isAutoGenerated)) && (
              <a
                href={project.productionUrl || `https://${domains?.find((d: any) => d.isAutoGenerated)?.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary justify-center flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4" />
                {t('projectDetail', 'visit')}
              </a>
            )}
            <button onClick={handleRedeploy} className="btn btn-primary justify-center flex-1 sm:flex-none">
              <RefreshCw className="w-4 h-4" />
              {t('projectDetail', 'redeploy')}
            </button>
          </div>
        </div>

        {/* Production URL or Auto Subdomain URL */}
        {(project.productionUrl || domains?.find((d: any) => d.isAutoGenerated)) && (
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-tertiary)] min-w-0">
              <Globe className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
              <span className="terminal-text text-sm flex-1 min-w-0 truncate">
                {project.productionUrl || `https://${domains?.find((d: any) => d.isAutoGenerated)?.domain}`}
              </span>
              {!project.productionUrl && (
                <span className="text-xs text-[var(--accent-cyan)] font-medium shrink-0">Pushify URL</span>
              )}
              <button
                onClick={() => copyToClipboard(project.productionUrl || `https://${domains?.find((d: any) => d.isAutoGenerated)?.domain}`)}
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
      <div className="border-b border-[var(--border-subtle)] -mx-1 px-1 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-0.5 sm:gap-1 min-w-max pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
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
      <div className="min-w-0">
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            projectId={projectId}
            deployments={deployments}
            formatTimeAgo={formatTimeAgo}
            getStatusBadge={getStatusBadge}
            onRollback={(id) => rollbackDeployment.mutate(id)}
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
        {activeTab === 'logs' && <LogsTab projectId={projectId} t={t} />}
        {activeTab === 'environment' && (
          <EnvironmentTab
            envVars={envVars}
            onCreate={(data) => createEnvVar.mutate(data)}
            onUpdate={(id, value) => updateEnvVar.mutate({ envVarId: id, input: { value } })}
            onDelete={(id) => deleteEnvVar.mutate(id)}
            onBulkCreate={(data) => bulkCreateEnvVars.mutate(data)}
            onClone={(input) => cloneEnvVars.mutate(input)}
            marketplaceTemplateId={
              typeof projectSettings.marketplaceTemplateId === 'string'
                ? projectSettings.marketplaceTemplateId
                : undefined
            }
            productionUrl={project.productionUrl ?? null}
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
        {activeTab === 'cron' && <ScheduledTasksTab projectId={projectId} t={t} />}
        {activeTab === 'workers' && <WorkersTab projectId={projectId} t={t} />}
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
