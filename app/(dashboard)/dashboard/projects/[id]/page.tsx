'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  GitBranch,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
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
          <div className="h-4 w-40 bg-[var(--bg-secondary)] rounded" />
          <div className="h-9 w-64 bg-[var(--bg-secondary)] rounded" />
          <div className="h-10 max-w-2xl bg-[var(--bg-secondary)] rounded-[10px]" />
          <div className="h-10 border-b border-[var(--border-subtle)]" />
          <div className="h-64 bg-[var(--bg-secondary)] rounded-[14px]" />
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: t('projectDetail', 'overview') },
    { id: 'deployments', label: t('projectDetail', 'deployments') },
    { id: 'logs', label: t('logs', 'title') },
    { id: 'environment', label: t('projectDetail', 'environment') },
    { id: 'domains', label: t('projectDetail', 'domains') },
    { id: 'cron', label: t('cron', 'title') },
    { id: 'workers', label: t('workers', 'title') },
    { id: 'notifications', label: t('notifications', 'title') },
    { id: 'settings', label: t('projectDetail', 'settings') },
  ];

  const pushifyDomain = domains?.find((d) => d.isAutoGenerated)?.domain;
  const liveUrl = project.productionUrl || (pushifyDomain ? `https://${pushifyDomain}` : null);

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-clip">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] min-w-0">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 rounded hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('navigation', 'projects')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden />
        <span className="text-[var(--text-secondary)] truncate" aria-current="page">{project.name}</span>
      </nav>

      {(fromStudio || isSiteStudioProject) && (
        <div className="dash-callout flex-col items-start gap-3 sm:flex-row sm:items-center" role="status">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {fromStudio
                ? t('siteStudio', 'projectDeployBannerTitle')
                : t('siteEditor', 'openEditor')}
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">
              {fromStudio
                ? t('siteStudio', 'projectDeployBannerDesc')
                : t('siteEditor', 'openEditorDesc')}
            </p>
            {deployInProgress && (
              <p className="text-[13px] text-[var(--text-muted)] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                {t('siteStudio', 'projectDeployInProgress')}
              </p>
            )}
          </div>
          {!deployInProgress && (
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/dashboard/projects/${project.id}/site-editor`}
                className="btn btn-primary btn-sm"
              >
                <Sparkles className="w-4 h-4" />
                {t('siteEditor', 'openEditor')}
              </Link>
              {siteUrl && (
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
          )}
        </div>
      )}

      {/* Header */}
      <header className="min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="truncate max-w-full">{project.name}</h1>
              <span className={`badge shrink-0 ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-[var(--text-secondary)] mt-1.5 text-sm leading-relaxed break-words max-w-2xl">
                {project.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[13px] text-[var(--text-muted)]">
              {project.framework && (
                <span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)] shrink-0">
                  {project.framework}
                </span>
              )}
              {project.gitRepoUrl && (
                <a
                  href={project.gitRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-w-0 max-w-full hover:text-[var(--text-primary)] transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate terminal-text text-xs">{project.gitRepoUrl.replace('https://github.com/', '')}</span>
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {t('projectDetail', 'updated')} {formatTimeAgo(project.updatedAt, t)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
            {liveUrl && (
              <a
                href={liveUrl}
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

        {/* Production URL or auto subdomain URL */}
        {liveUrl && (
          <div className="mt-4 flex items-center gap-2 h-10 pl-3 pr-1 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] min-w-0 max-w-2xl">
            <span className="dash-status-dot is-success" aria-hidden />
            <span className="terminal-text text-[13px] flex-1 min-w-0 truncate text-[var(--text-primary)]">
              {liveUrl}
            </span>
            {!project.productionUrl && (
              <span className="dash-section-label shrink-0 hidden sm:inline">{t('projectDetail', 'pushifyUrl')}</span>
            )}
            <button
              type="button"
              onClick={() => copyToClipboard(liveUrl)}
              aria-label={t('projectDetail', 'copyUrl')}
              title={t('projectDetail', 'copyUrl')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-overlay-md)] transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[var(--status-success)]" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="dash-tabs" role="tablist" aria-label={project.name}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`project-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls="project-tabpanel"
            onClick={() => setActiveTab(tab.id)}
            className="dash-tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-w-0" role="tabpanel" id="project-tabpanel" aria-labelledby={`project-tab-${activeTab}`}>
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
            gitRepoUrl={project?.gitRepoUrl}
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
