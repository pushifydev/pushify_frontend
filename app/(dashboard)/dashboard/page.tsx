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
import { useProjects, useTranslation, useMetricsOverview } from '@/hooks';
import { useAuthStore } from '@/stores/auth';
import { formatTimeAgo, formatStorage } from '@/lib/formatters';
import { PROJECT_STATUS_COLORS, getStatusColor, STATUS_COLORS } from '@/lib/constants';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: metricsOverview } = useMetricsOverview();
  const { t } = useTranslation();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboard', 'greetingMorning');
    if (h < 18) return t('dashboard', 'greetingAfternoon');
    return t('dashboard', 'greetingEvening');
  };

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const hasMetrics = !!metricsOverview && metricsOverview.runningContainers > 0;

  return (
    <div className="max-w-6xl mx-auto pb-10 stagger-children">

      {/* ── Hero ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl px-7 py-6 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.055) 0%, rgba(129,140,248,0.025) 60%, transparent 100%)',
          border: '1px solid rgba(34,211,238,0.12)',
        }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none" style={{ opacity: 0.35 }} />
        {/* Radial glow */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 right-0 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 8,
              }}
            >
              {getGreeting()}
            </p>
            <h1
              className="stat-number"
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: 'var(--text-primary)',
              }}
            >
              {user?.name?.split(' ')[0] || 'Developer'}
              <span className="gradient-text">.</span>
            </h1>
            <p style={{ marginTop: 10, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('dashboard', 'whatsHappening')}
              {activeProjects > 0 && (
                <span style={{ color: 'var(--accent-cyan)', marginLeft: 8 }}>
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
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: t('dashboard', 'totalProjects'),
            value: String(projects.length),
            icon: <GitBranch className="w-4 h-4" />,
            accent: STATUS_COLORS.cyan,
          },
          {
            label: t('dashboard', 'activeProjects'),
            value: String(activeProjects),
            icon: <Activity className="w-4 h-4" />,
            accent: STATUS_COLORS.success,
          },
          {
            label: t('dashboard', 'runningContainers'),
            value: hasMetrics ? String(metricsOverview!.runningContainers) : '0',
            icon: <Server className="w-4 h-4" />,
            accent: STATUS_COLORS.cyan,
          },
          {
            label: t('dashboard', 'avgCpu'),
            value: hasMetrics ? `${metricsOverview!.aggregate.avgCpuPercent.toFixed(1)}%` : '—',
            icon: <Cpu className="w-4 h-4" />,
            accent: STATUS_COLORS.purple,
          },
        ].map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── System health ─────────────────────────────── */}
      {hasMetrics && (
        <div
          className="rounded-xl p-5 mb-5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
              <span className="text-sm font-semibold">{t('dashboard', 'systemHealth')}</span>
            </div>
            <Link
              href="/dashboard/monitoring"
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: 'var(--accent-cyan)' }}
            >
              {t('navigation', 'monitoring')}
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <MetricBar
              label="CPU"
              value={`${metricsOverview!.aggregate.avgCpuPercent.toFixed(1)}%`}
              percent={metricsOverview!.aggregate.avgCpuPercent}
              color={
                metricsOverview!.aggregate.avgCpuPercent > 85 ? STATUS_COLORS.error
                  : metricsOverview!.aggregate.avgCpuPercent > 60 ? '#f59e0b'
                  : STATUS_COLORS.cyan
              }
            />
            <MetricBar
              label={t('dashboard', 'totalMemory')}
              value={formatStorage(metricsOverview!.aggregate.totalMemoryUsageMB)}
              percent={metricsOverview!.aggregate.avgMemoryPercent}
              color={
                metricsOverview!.aggregate.avgMemoryPercent > 85 ? STATUS_COLORS.error
                  : metricsOverview!.aggregate.avgMemoryPercent > 60 ? '#f59e0b'
                  : STATUS_COLORS.purple
              }
            />
            <MetricBar
              label="↓ Net In"
              value={formatStorage(metricsOverview!.aggregate.totalNetworkRxMB)}
              percent={Math.min((metricsOverview!.aggregate.totalNetworkRxMB / 1024) * 100, 100)}
              color="#34d399"
            />
            <MetricBar
              label="↑ Net Out"
              value={formatStorage(metricsOverview!.aggregate.totalNetworkTxMB)}
              percent={Math.min((metricsOverview!.aggregate.totalNetworkTxMB / 1024) * 100, 100)}
              color="#60a5fa"
            />
          </div>
        </div>
      )}

      {/* ── Main grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Projects — 2/3 */}
        <div className="lg:col-span-2 space-y-2">
          <SectionLabel label={t('dashboard', 'yourProjects')}>
            <Link href="/dashboard/projects" className="flex items-center gap-1 text-xs transition-colors" style={{ color: 'var(--accent-cyan)' }}>
              {t('common', 'viewAll')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </SectionLabel>

          {projectsLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
              ))}
            </>
          ) : projects.length === 0 ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            >
              <Zap className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-semibold mb-1">{t('dashboard', 'noProjectsYet')}</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard', 'createFirstProject')}
              </p>
              <Link href="/dashboard/projects/new" className="btn btn-primary">
                <Rocket className="w-4 h-4" />
                {t('projects', 'createProject')}
              </Link>
            </div>
          ) : (
            projects.slice(0, 7).map((project) => {
              const m = metricsOverview?.projects.find(p => p.projectId === project.id);
              const accent = getStatusColor(project.status);
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="group flex items-stretch rounded-xl overflow-hidden transition-all"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border-strong)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                  }}
                >
                  {/* Left status bar */}
                  <div
                    className="w-[3px] shrink-0"
                    style={{ background: accent, boxShadow: `0 0 6px ${accent}80` }}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate group-hover:text-[var(--accent-cyan)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {project.framework && (
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {project.framework}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          · {formatTimeAgo(project.updatedAt, t)}
                        </span>
                      </div>
                    </div>

                    {m && (
                      <div
                        className="hidden sm:flex items-center gap-3"
                        style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                      >
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" style={{ color: STATUS_COLORS.cyan }} />
                          {m.cpuPercent.toFixed(1)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" style={{ color: STATUS_COLORS.purple }} />
                          {formatStorage(m.memoryUsageMB)}
                        </span>
                      </div>
                    )}

                    {project.productionUrl && (
                      <span
                        className="hidden md:block text-xs truncate max-w-28"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 11 }}
                      >
                        {project.productionUrl.replace('https://', '')}
                      </span>
                    )}

                    <ExternalLink
                      className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Activity — 1/3 */}
        <div className="space-y-2">
          <SectionLabel label={t('dashboard', 'recentActivity')} />

          {hasMetrics && metricsOverview!.projects.length > 0 ? (
            metricsOverview!.projects.slice(0, 6).map((pm) => (
              <Link
                key={pm.projectId}
                href={`/dashboard/projects/${pm.projectId}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border-strong)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: pm.containerStatus === 'running' ? STATUS_COLORS.success : STATUS_COLORS.error,
                    boxShadow: `0 0 5px ${pm.containerStatus === 'running' ? `${STATUS_COLORS.success}80` : `${STATUS_COLORS.error}80`}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{pm.projectName}</p>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 1 }}>
                    CPU {pm.cpuPercent.toFixed(1)}% · RAM {pm.memoryPercent.toFixed(0)}%
                  </p>
                </div>
                <div className="w-10 h-1 rounded-full overflow-hidden shrink-0" style={{ background: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(pm.cpuPercent, 100)}%`,
                      background: pm.cpuPercent > 85 ? STATUS_COLORS.error : pm.cpuPercent > 60 ? '#f59e0b' : STATUS_COLORS.cyan,
                    }}
                  />
                </div>
              </Link>
            ))
          ) : (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard', 'activityWillAppear')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            title: t('dashboard', 'connectRepo'),
            desc: t('dashboard', 'connectRepoDesc'),
            icon: <GitBranch className="w-4 h-4" />,
            href: '/dashboard/projects/new',
            accent: STATUS_COLORS.cyan,
          },
          {
            title: t('dashboard', 'addDomain'),
            desc: t('dashboard', 'addDomainDesc'),
            icon: <Globe className="w-4 h-4" />,
            href: '/dashboard/projects',
            accent: STATUS_COLORS.purple,
          },
          {
            title: t('dashboard', 'viewLogs'),
            desc: t('dashboard', 'viewLogsDesc'),
            icon: <Activity className="w-4 h-4" />,
            href: '/dashboard/projects',
            accent: '#34d399',
          },
        ].map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${a.accent}30`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${a.accent}14`, color: a.accent }}
            >
              {a.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────── */

function SectionLabel({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-1">
      <span
        style={{
          fontSize: 10.5,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5"
      style={{
        background: 'var(--bg-secondary)',
        borderWidth: '2px 1px 1px 1px',
        borderStyle: 'solid',
        borderColor: `${accent} var(--glass-border) var(--glass-border) var(--glass-border)`,
        borderRadius: 12,
      }}
    >
      {/* Corner ambient glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}18 0%, transparent 70%)` }}
      />

      <div style={{ color: accent, opacity: 0.75, marginBottom: 14 }}>{icon}</div>

      <p
        className="stat-number"
        style={{
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 10.5,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {label}
      </p>
    </div>
  );
}

function MetricBar({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <div
          className="h-full rounded-full bar-grow"
          style={{ width: `${Math.min(percent, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}
