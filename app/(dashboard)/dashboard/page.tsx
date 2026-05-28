'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  GitBranch,
  Globe,
  Rocket,
  ExternalLink,
  Server,
  Cpu,
  HardDrive,
  BarChart3,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { useProjects, useServers, useTranslation, useMetricsOverview } from '@/hooks';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { DashboardAttentionZone } from '@/components/dashboard/DashboardAttentionZone';
import { useAuthStore } from '@/stores/auth';
import { formatTimeAgo, formatStorage } from '@/lib/formatters';
import { getStatusColor } from '@/lib/constants';
import { Skeleton, SkeletonDashboardProjectRow } from '@/components/Skeleton';

function metricFillLevel(percent: number): 'is-critical' | 'is-warning' | 'is-low' {
  if (percent > 85) return 'is-critical';
  if (percent > 60) return 'is-warning';
  return 'is-low';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: servers = [], isLoading: serversLoading } = useServers();
  const { data: metricsOverview, isLoading: metricsLoading } = useMetricsOverview();
  const { t } = useTranslation();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard', 'greetingMorning');
    if (h < 18) return t('dashboard', 'greetingAfternoon');
    return t('dashboard', 'greetingEvening');
  };

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const hasMetrics = !!metricsOverview && metricsOverview.runningContainers > 0;

  const statCards = [
    {
      label: t('dashboard', 'totalProjects'),
      value: String(projects.length),
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      label: t('dashboard', 'activeProjects'),
      value: String(activeProjects),
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: t('dashboard', 'runningContainers'),
      value: hasMetrics ? String(metricsOverview!.runningContainers) : '0',
      icon: <Server className="w-4 h-4" />,
    },
    {
      label: t('dashboard', 'avgCpu'),
      value: hasMetrics ? `${metricsOverview!.aggregate.avgCpuPercent.toFixed(1)}%` : '—',
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  const quickActions = [
    {
      title: t('dashboard', 'connectRepo'),
      desc: t('dashboard', 'connectRepoDesc'),
      icon: <GitBranch className="w-4 h-4" />,
      href: '/dashboard/projects/new',
    },
    {
      title: t('dashboard', 'addDomain'),
      desc: t('dashboard', 'addDomainDesc'),
      icon: <Globe className="w-4 h-4" />,
      href: '/dashboard/projects',
    },
    {
      title: t('dashboard', 'viewLogs'),
      desc: t('dashboard', 'viewLogsDesc'),
      icon: <Activity className="w-4 h-4" />,
      href: '/dashboard/projects',
    },
  ];

  return (
    <div className="dash-page pb-10 stagger-children">
      <section className="dash-card px-6 py-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="dash-eyebrow mb-2">{getGreeting()}</p>
            <h1 className="dash-page-title stat-number">
              {user?.name?.split(' ')[0] || t('common', 'fallbackDisplayName')}.
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              {t('dashboard', 'whatsHappening')}
              {activeProjects > 0 && (
                <span className="text-[var(--text-muted)]">
                  {' '}
                  · {activeProjects} {t('dashboard', 'activeProjects').toLowerCase()}
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard/projects/new" className="btn btn-primary shrink-0">
            <Rocket className="w-4 h-4" />
            {t('navigation', 'newProject')}
          </Link>
        </div>
      </section>

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {statCards.map((card, idx) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            loading={(idx < 2 && projectsLoading) || (idx >= 2 && metricsLoading)}
          />
        ))}
      </div>

      {hasMetrics && (
        <section className="dash-panel p-5 mb-5">
          <div className="dash-panel-header">
            <div className="dash-panel-title">
              <BarChart3 className="w-4 h-4 text-[var(--text-secondary)]" />
              {t('dashboard', 'systemHealth')}
            </div>
            <Link href="/dashboard/monitoring" className="dash-link flex items-center gap-1">
              {t('navigation', 'monitoring')}
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
              label="↓ Net In"
              value={formatStorage(metricsOverview!.aggregate.totalNetworkRxMB)}
              percent={Math.min((metricsOverview!.aggregate.totalNetworkRxMB / 1024) * 100, 100)}
            />
            <MetricBar
              label="↑ Net Out"
              value={formatStorage(metricsOverview!.aggregate.totalNetworkTxMB)}
              percent={Math.min((metricsOverview!.aggregate.totalNetworkTxMB / 1024) * 100, 100)}
            />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 space-y-2">
          <SectionLabel label={t('dashboard', 'yourProjects')}>
            <Link href="/dashboard/projects" className="dash-link flex items-center gap-1">
              {t('common', 'viewAll')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </SectionLabel>

          {projectsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <SkeletonDashboardProjectRow key={i} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="dash-panel p-10 text-center">
              <Zap className="dash-empty-icon mb-3" />
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                {t('dashboard', 'noProjectsYet')}
              </p>
              <p className="text-sm mb-4 text-[var(--text-secondary)]">
                {t('dashboard', 'createFirstProject')}
              </p>
              <Link href="/dashboard/projects/new" className="btn btn-primary">
                <Rocket className="w-4 h-4" />
                {t('projects', 'createProject')}
              </Link>
            </div>
          ) : (
            projects.slice(0, 7).map((project) => {
              const m = metricsOverview?.projects.find((p) => p.projectId === project.id);
              const isActive = project.status === 'active';

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group dash-list-row"
                >
                  <span
                    className={`dash-status-dot ${isActive ? 'is-active' : ''}`}
                    style={!isActive ? { background: getStatusColor(project.status) } : undefined}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[var(--text-primary)] group-hover:underline underline-offset-2">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {project.framework && (
                          <span className="dash-mono-caption">{project.framework}</span>
                        )}
                        <span className="dash-caption">
                          {project.framework ? '· ' : ''}
                          {formatTimeAgo(project.updatedAt, t)}
                        </span>
                      </div>
                    </div>

                    {m && (
                      <div className="hidden sm:flex items-center gap-3 dash-mono-caption">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          {m.cpuPercent.toFixed(1)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatStorage(m.memoryUsageMB)}
                        </span>
                      </div>
                    )}

                    {project.productionUrl && (
                      <span className="hidden md:block dash-mono-caption truncate max-w-28">
                        {project.productionUrl.replace('https://', '')}
                      </span>
                    )}

                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="space-y-2">
          <SectionLabel label={t('dashboard', 'recentActivity')} />

          {hasMetrics && metricsOverview!.projects.length > 0 ? (
            metricsOverview!.projects.slice(0, 6).map((pm) => (
              <Link
                key={pm.projectId}
                href={`/dashboard/projects/${pm.projectId}`}
                className="group dash-list-row"
              >
                <span
                  className={`dash-status-dot ${
                    pm.containerStatus === 'running' ? 'is-success' : 'is-error'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[var(--text-primary)] group-hover:underline underline-offset-2">
                    {pm.projectName}
                  </p>
                  <p className="dash-mono-caption mt-0.5">
                    CPU {pm.cpuPercent.toFixed(1)}% · RAM {pm.memoryPercent.toFixed(0)}%
                  </p>
                </div>
                <MetricBar
                  compact
                  label=""
                  value=""
                  percent={pm.cpuPercent}
                  stressed
                />
              </Link>
            ))
          ) : (
            <div className="dash-panel p-6 text-center">
              <TrendingUp className="dash-empty-icon mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">{t('dashboard', 'activityWillAppear')}</p>
            </div>
          )}
        </div>
      </div>

      <Link
        href="/dashboard/sites"
        className="group dash-panel block mb-5 px-6 py-5 transition-colors hover:border-[var(--border-default)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-tight text-[var(--text-primary)] mb-1">
              {t('siteStudio', 'dashboardCtaTitle')}
            </p>
            <p className="text-sm leading-relaxed max-w-lg text-[var(--text-muted)]">
              {t('siteStudio', 'dashboardCtaDesc')}
            </p>
          </div>
          <span className="dash-link flex items-center gap-1 shrink-0">
            {t('siteStudio', 'dashboardCtaButton')}
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href} className="group dash-list-row">
            <div className="dash-icon-box shrink-0 group-hover:border-[var(--border-default)]">
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{action.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed text-[var(--text-muted)]">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="dash-section-label">{label}</span>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="dash-stat-card p-5">
      <div className="dash-icon-box mb-4">{icon}</div>
      <p className="dash-stat-value stat-number">
        {loading ? (
          <Skeleton className="inline-block align-middle h-7 w-[3ch] max-w-[80px] rounded" />
        ) : (
          value
        )}
      </p>
      <p className="dash-stat-label">{label}</p>
    </div>
  );
}

function MetricBar({
  label,
  value,
  percent,
  stressed = false,
  compact = false,
}: {
  label: string;
  value: string;
  percent: number;
  stressed?: boolean;
  compact?: boolean;
}) {
  const fillClass = stressed ? metricFillLevel(percent) : 'is-low';
  const width = `${Math.min(percent, 100)}%`;
  const fillStyle = stressed ? { width } : { width, opacity: Math.max(0.2, percent / 100) };

  if (compact) {
    return (
      <div className="w-10 shrink-0">
        <div className="dash-metric-track">
          <div className={`dash-metric-fill bar-grow ${fillClass}`} style={fillStyle} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="dash-caption">{label}</span>
        <span className="dash-mono-caption text-[var(--text-secondary)]">{value}</span>
      </div>
      <div className="dash-metric-track">
        <div className={`dash-metric-fill bar-grow ${fillClass}`} style={fillStyle} />
      </div>
    </div>
  );
}
