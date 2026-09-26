'use client';

import Link from 'next/link';
import { ArrowUpRight, ChevronRight, Rocket, Server } from 'lucide-react';
import { useProjects, useServers, useTranslation, useMetricsOverview } from '@/hooks';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { DashboardAttentionZone } from '@/components/dashboard/DashboardAttentionZone';
import { PageHeader, MetaLabel, RowList } from '@/components/dashboard/PageKit';
import { EmptyState } from '@/components/EmptyState';
import { useAuthStore } from '@/stores/auth';
import { formatTimeAgo, formatStorage } from '@/lib/formatters';
import { Skeleton } from '@/components/Skeleton';

function metricFillLevel(percent: number): 'is-critical' | 'is-warning' | 'is-low' {
  if (percent > 85) return 'is-critical';
  if (percent > 60) return 'is-warning';
  return 'is-low';
}

/** Project status → the one status dot the product uses. */
function projectDot(status: string): string {
  switch (status) {
    case 'active':
      return 'is-success';
    case 'building':
    case 'deploying':
    case 'paused':
      return 'is-warning';
    case 'failed':
    case 'error':
      return 'is-error';
    default:
      return '';
  }
}

const copy = {
  newServer: { en: 'New server', tr: 'Yeni sunucu' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: servers = [], isLoading: serversLoading } = useServers();
  const { data: metricsOverview, isLoading: metricsLoading } = useMetricsOverview();
  const { t, locale } = useTranslation();
  const l = (s: { en: string; tr: string }) => (locale === 'tr' ? s.tr : s.en);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard', 'greetingMorning');
    if (h < 18) return t('dashboard', 'greetingAfternoon');
    return t('dashboard', 'greetingEvening');
  };

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const hasMetrics = !!metricsOverview && metricsOverview.runningContainers > 0;
  const firstName = user?.name?.split(' ')[0] || t('common', 'fallbackDisplayName');

  const statCards = [
    { label: t('dashboard', 'totalProjects'), value: String(projects.length), loading: projectsLoading },
    { label: t('dashboard', 'activeProjects'), value: String(activeProjects), loading: projectsLoading },
    {
      label: t('dashboard', 'runningContainers'),
      value: hasMetrics ? String(metricsOverview!.runningContainers) : '0',
      loading: metricsLoading,
    },
    {
      label: t('dashboard', 'avgCpu'),
      value: hasMetrics ? `${metricsOverview!.aggregate.avgCpuPercent.toFixed(1)}%` : '—',
      loading: metricsLoading,
    },
  ];

  const quickActions = [
    { title: t('dashboard', 'connectRepo'), desc: t('dashboard', 'connectRepoDesc'), href: '/dashboard/projects/new' },
    { title: t('dashboard', 'addDomain'), desc: t('dashboard', 'addDomainDesc'), href: '/dashboard/projects' },
    { title: t('dashboard', 'viewLogs'), desc: t('dashboard', 'viewLogsDesc'), href: '/dashboard/projects' },
    { title: t('siteStudio', 'dashboardCtaTitle'), desc: t('siteStudio', 'dashboardCtaDesc'), href: '/dashboard/sites' },
  ];

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-10 animate-slide-in">
      <PageHeader
        title={`${getGreeting()}, ${firstName}`}
        description={t('dashboard', 'whatsHappening')}
        meta={[
          !projectsLoading && (
            <MetaLabel key="p">
              {projects.length} {t('navigation', 'projects')}
            </MetaLabel>
          ),
          !projectsLoading && activeProjects > 0 && (
            <span key="a" className="inline-flex items-center gap-1.5">
              <span className="dash-status-dot is-success" aria-hidden />
              {activeProjects} {t('dashboard', 'activeProjects').toLowerCase()}
            </span>
          ),
          !serversLoading && (
            <MetaLabel key="s">
              {servers.length} {t('navigation', 'servers')}
            </MetaLabel>
          ),
        ]}
        actions={
          <>
            <Link href="/dashboard/servers/new" className="btn btn-secondary justify-center flex-1 sm:flex-none">
              <Server className="w-4 h-4" />
              {l(copy.newServer)}
            </Link>
            <Link href="/dashboard/projects/new" className="btn btn-primary justify-center flex-1 sm:flex-none">
              <Rocket className="w-4 h-4" />
              {t('navigation', 'newProject')}
            </Link>
          </>
        }
      />

      {!projectsLoading && !serversLoading && (
        <OnboardingChecklist
          progress={{
            hasServer: servers.length > 0,
            hasProject: projects.length > 0,
            hasLiveDeploy: activeProjects > 0,
          }}
        />
      )}

      <DashboardAttentionZone active={projects.length > 0 || servers.length > 0} />

      <div className="grid grid-cols-2 max-[359px]:grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3 min-w-0">
        {statCards.map((card) => (
          <div key={card.label} className="dash-stat-card p-4 sm:p-5 min-w-0">
            <p className="dash-stat-value stat-number">
              {card.loading ? (
                <Skeleton className="inline-block align-middle h-7 w-[3ch] max-w-[80px] rounded" />
              ) : (
                card.value
              )}
            </p>
            <p className="dash-stat-label">{card.label}</p>
          </div>
        ))}
      </div>

      {hasMetrics && (
        <section className="min-w-0" aria-labelledby="dash-health-title">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <h2 id="dash-health-title" className="dash-section-label">
              {t('dashboard', 'systemHealth')}
            </h2>
            <Link href="/dashboard/monitoring" className="dash-link inline-flex items-center gap-1 shrink-0">
              {t('navigation', 'monitoring')}
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="dash-card p-4 sm:p-5 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <MetricBar
              label="CPU"
              value={`${metricsOverview!.aggregate.avgCpuPercent.toFixed(1)}%`}
              percent={metricsOverview!.aggregate.avgCpuPercent}
              stressed
            />
            <MetricBar
              label={t('dashboard', 'totalMemory')}
              value={formatStorage(metricsOverview!.aggregate.totalMemoryUsageMB)}
              percent={metricsOverview!.aggregate.avgMemoryPercent}
              stressed
            />
            <MetricBar
              label="Net in"
              value={formatStorage(metricsOverview!.aggregate.totalNetworkRxMB)}
              percent={Math.min((metricsOverview!.aggregate.totalNetworkRxMB / 1024) * 100, 100)}
            />
            <MetricBar
              label="Net out"
              value={formatStorage(metricsOverview!.aggregate.totalNetworkTxMB)}
              percent={Math.min((metricsOverview!.aggregate.totalNetworkTxMB / 1024) * 100, 100)}
            />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          {projectsLoading ? (
            <RowList label={t('dashboard', 'yourProjects')}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="dash-row space-y-2">
                  <Skeleton className="h-4 w-[45%] max-w-[200px]" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </RowList>
          ) : projects.length === 0 ? (
            <section className="min-w-0">
              <h2 className="dash-section-label mb-2.5">{t('dashboard', 'yourProjects')}</h2>
              <EmptyState
                title={t('dashboard', 'noProjectsYet')}
                description={t('dashboard', 'createFirstProject')}
                action={{
                  label: t('projects', 'createProject'),
                  href: '/dashboard/projects/new',
                  icon: <Rocket className="w-4 h-4" />,
                }}
              />
            </section>
          ) : (
            <RowList
              label={t('dashboard', 'yourProjects')}
              action={
                <Link href="/dashboard/projects" className="dash-link inline-flex items-center gap-1">
                  {t('common', 'viewAll')} <ArrowUpRight className="w-3 h-3" />
                </Link>
              }
            >
              {projects.slice(0, 7).map((project) => {
                const m = metricsOverview?.projects.find((p) => p.projectId === project.id);
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="group dash-row flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
                  >
                    <span className={`dash-status-dot ${projectDot(project.status)}`} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[var(--text-primary)] group-hover:underline underline-offset-2">
                        {project.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-[var(--text-muted)] min-w-0">
                        {project.framework && <MetaLabel>{project.framework}</MetaLabel>}
                        <span>{formatTimeAgo(project.updatedAt, t)}</span>
                        {project.productionUrl && (
                          <span className="terminal-text truncate max-w-full md:hidden">
                            {project.productionUrl.replace('https://', '')}
                          </span>
                        )}
                      </div>
                    </div>
                    {m && (
                      <span className="hidden sm:inline terminal-text text-xs text-[var(--text-muted)] tabular-nums shrink-0">
                        {m.cpuPercent.toFixed(1)}% · {formatStorage(m.memoryUsageMB)}
                      </span>
                    )}
                    {project.productionUrl && (
                      <span className="hidden md:block terminal-text text-xs text-[var(--text-muted)] truncate max-w-[12rem] shrink-0">
                        {project.productionUrl.replace('https://', '')}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] opacity-60" aria-hidden />
                  </Link>
                );
              })}
            </RowList>
          )}
        </div>

        <div className="min-w-0">
          {hasMetrics && metricsOverview!.projects.length > 0 ? (
            <RowList label={t('dashboard', 'recentActivity')}>
              {metricsOverview!.projects.slice(0, 6).map((pm) => (
                <Link
                  key={pm.projectId}
                  href={`/dashboard/projects/${pm.projectId}`}
                  className="group dash-row flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
                >
                  <span
                    className={`dash-status-dot ${pm.containerStatus === 'running' ? 'is-success' : 'is-error'}`}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[var(--text-primary)] group-hover:underline underline-offset-2">
                      {pm.projectName}
                    </p>
                    <p className="terminal-text text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                      CPU {pm.cpuPercent.toFixed(1)}% · RAM {pm.memoryPercent.toFixed(0)}%
                    </p>
                  </div>
                  <div className="w-12 shrink-0">
                    <div className="dash-metric-track">
                      <div
                        className={`dash-metric-fill bar-grow ${metricFillLevel(pm.cpuPercent)}`}
                        style={{ width: `${Math.min(pm.cpuPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </RowList>
          ) : (
            <section className="min-w-0">
              <h2 className="dash-section-label mb-2.5">{t('dashboard', 'recentActivity')}</h2>
              <div className="dash-card px-5 py-8 text-center">
                <p className="text-sm text-[var(--text-secondary)]">{t('dashboard', 'activityWillAppear')}</p>
              </div>
            </section>
          )}
        </div>
      </div>

      <RowList>
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group dash-row flex items-center gap-3 hover:bg-[var(--hover-overlay)] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] group-hover:underline underline-offset-2">
                {action.title}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed text-[var(--text-muted)]">{action.desc}</p>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden />
          </Link>
        ))}
      </RowList>
    </div>
  );
}

function MetricBar({
  label,
  value,
  percent,
  stressed = false,
}: {
  label: string;
  value: string;
  percent: number;
  stressed?: boolean;
}) {
  const fillClass = stressed ? metricFillLevel(percent) : 'is-low';
  const width = `${Math.min(percent, 100)}%`;
  const fillStyle = stressed ? { width } : { width, opacity: Math.max(0.2, percent / 100) };

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="dash-stat-label !mt-0">{label}</span>
        <span className="terminal-text text-xs text-[var(--text-secondary)] tabular-nums">{value}</span>
      </div>
      <div className="dash-metric-track">
        <div className={`dash-metric-fill bar-grow ${fillClass}`} style={fillStyle} />
      </div>
    </div>
  );
}
