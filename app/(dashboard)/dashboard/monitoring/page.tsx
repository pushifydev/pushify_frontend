'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  ArrowDownRight,
  ArrowUpRight,
  Container,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useMetricsOverview,
  useMetricsTimeSeries,
  useTranslation,
} from '@/hooks';
import { formatStorage } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/constants';

// ============ Chart Tooltip ============

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] px-3 py-2 shadow-xl">
      <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">
        {label ? new Date(label).toLocaleTimeString() : ''}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[var(--text-secondary)]">{entry.name}:</span>
          <span className="font-mono font-medium text-[var(--text-primary)]">
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name?.includes('CPU') || entry.name?.includes('Memory') ? '%' : ' MB'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============ Gauge Card ============

function GaugeCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
  maxValue = 100,
  suffix = '%',
}: {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  maxValue?: number;
  suffix?: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor =
    percentage > 85 ? 'var(--status-error)' : percentage > 60 ? 'var(--status-warning)' : color;

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold font-mono" style={{ color }}>
        {value.toFixed(1)}{suffix}
      </div>
      {subValue && (
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{subValue}</p>
      )}
      <div className="mt-3 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// ============ Time Range Selector ============

function TimeRangeSelector({
  selected,
  onChange,
  t,
}: {
  selected: number;
  onChange: (h: number) => void;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const options = [
    { value: 1, label: t('monitoring', 'last1Hour') },
    { value: 6, label: t('monitoring', 'last6Hours') },
    { value: 24, label: t('monitoring', 'last24Hours') },
  ];

  return (
    <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
            selected === opt.value
              ? 'bg-[var(--accent-cyan)] text-[var(--bg-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ============ Main Page ============

export default function MonitoringPage() {
  const { t } = useTranslation();
  const { data: overview, isLoading, dataUpdatedAt } = useMetricsOverview();
  const [selectedHours, setSelectedHours] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Get time series for the selected project (or first project)
  const timeSeriesProjectId = selectedProjectId || overview?.projects?.[0]?.projectId || '';
  const { data: timeSeries = [] } = useMetricsTimeSeries(timeSeriesProjectId, selectedHours);

  // Format chart data
  const chartData = [...timeSeries]
    .reverse()
    .map((point) => ({
      ...point,
      time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : '';

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('monitoring', 'title')}</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{t('monitoring', 'description')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] animate-pulse" />
      </div>
    );
  }

  const agg = overview?.aggregate;
  const projects = overview?.projects || [];

  // No data state
  if (!overview || projects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-in">
        <div>
          <h1 className="text-2xl font-bold">{t('monitoring', 'title')}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{t('monitoring', 'description')}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <Activity className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('monitoring', 'noData')}</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md text-center">{t('monitoring', 'noDataDesc')}</p>
        </div>
      </div>
    );
  }

  // System health status
  const healthStatus =
    agg && agg.avgCpuPercent > 90 ? 'unhealthy' :
    agg && agg.avgCpuPercent > 70 ? 'degraded' : 'healthy';

  const healthConfig = {
    healthy: { icon: CheckCircle2, color: 'var(--status-success)', bg: 'rgba(34, 197, 94, 0.1)' },
    degraded: { icon: AlertTriangle, color: 'var(--status-warning)', bg: 'rgba(234, 179, 8, 0.1)' },
    unhealthy: { icon: AlertCircle, color: 'var(--status-error)', bg: 'rgba(239, 68, 68, 0.1)' },
  }[healthStatus];

  const HealthIcon = healthConfig.icon;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('monitoring', 'title')}</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{t('monitoring', 'description')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* System Health Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ backgroundColor: healthConfig.bg, borderColor: healthConfig.color + '30' }}
          >
            <HealthIcon className="w-4 h-4" style={{ color: healthConfig.color }} />
            <span className="text-xs font-medium" style={{ color: healthConfig.color }}>
              {t('monitoring', healthStatus)}
            </span>
          </div>
          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
            {lastUpdated}
          </div>
        </div>
      </div>

      {/* Gauge Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GaugeCard
          label={t('monitoring', 'avgCpu')}
          value={agg?.avgCpuPercent || 0}
          subValue={`${t('monitoring', 'totalCpu')}: ${agg?.totalCpuPercent.toFixed(1) || 0}%`}
          icon={Cpu}
          color="#22d3ee"
        />
        <GaugeCard
          label={t('monitoring', 'totalMemory')}
          value={agg?.avgMemoryPercent || 0}
          subValue={`${formatStorage(agg?.totalMemoryUsageMB || 0)} ${t('monitoring', 'memoryOf')} ${formatStorage(agg?.totalMemoryLimitMB || 0)}`}
          icon={HardDrive}
          color="#a78bfa"
        />
        <GaugeCard
          label={t('monitoring', 'networkIO')}
          value={agg?.totalNetworkRxMB || 0}
          subValue={`↓ ${formatStorage(agg?.totalNetworkRxMB || 0)} / ↑ ${formatStorage(agg?.totalNetworkTxMB || 0)}`}
          icon={Network}
          color="#34d399"
          maxValue={Math.max((agg?.totalNetworkRxMB || 0) * 1.5, 100)}
          suffix=" MB"
        />
        <GaugeCard
          label={t('monitoring', 'runningContainers')}
          value={overview?.runningContainers || 0}
          subValue={`${overview?.totalProjects || 0} ${t('monitoring', 'allProjects').toLowerCase()}`}
          icon={Container}
          color="#fbbf24"
          maxValue={Math.max(overview?.totalProjects || 1, 1)}
          suffix=""
        />
      </div>

      {/* Project Filter + Time Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            className="input py-2 px-3 text-sm w-full sm:w-64"
          >
            <option value="">{projects[0]?.projectName || t('monitoring', 'allProjects')}</option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
        <TimeRangeSelector selected={selectedHours} onChange={setSelectedHours} t={t} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU Chart */}
        <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#22d3ee]" />
              <span className="text-sm font-medium">{t('monitoring', 'cpuUsage')}</span>
            </div>
          </div>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(v) => `${v}%`}
                    width={45}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cpuPercent"
                    name="CPU"
                    stroke="#22d3ee"
                    fill="url(#cpuGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#22d3ee', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
                {t('monitoring', 'noData')}
              </div>
            )}
          </div>
        </div>

        {/* Memory Chart */}
        <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-sm font-medium">{t('monitoring', 'memoryUsage')}</span>
            </div>
          </div>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(v) => `${v}%`}
                    width={45}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="memoryPercent"
                    name="Memory"
                    stroke="#a78bfa"
                    fill="url(#memGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#a78bfa', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
                {t('monitoring', 'noData')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Network Chart - Full Width */}
      <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#34d399]" />
            <span className="text-sm font-medium">{t('monitoring', 'networkIO')}</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#34d399] rounded" />
              <ArrowDownRight className="w-3 h-3 text-[#34d399]" />
              {t('monitoring', 'totalNetworkIn')}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[#3b82f6] rounded" />
              <ArrowUpRight className="w-3 h-3 text-[#3b82f6]" />
              {t('monitoring', 'totalNetworkOut')}
            </span>
          </div>
        </div>
        <div className="h-56">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v} MB`}
                  width={55}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="networkRxMB"
                  name="Network In"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#34d399', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="networkTxMB"
                  name="Network Out"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
              {t('monitoring', 'noData')}
            </div>
          )}
        </div>
      </div>

      {/* Project Resources Table */}
      <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold">{t('monitoring', 'projectResources')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                  {t('monitoring', 'project')}
                </th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                  {t('monitoring', 'cpu')}
                </th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                  {t('monitoring', 'memory')}
                </th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                  {t('monitoring', 'network')}
                </th>
                <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-5 py-3">
                  {t('monitoring', 'status')}
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => {
                const cpuColor =
                  project.cpuPercent > 85 ? 'var(--status-error)' :
                  project.cpuPercent > 60 ? 'var(--status-warning)' : STATUS_COLORS.cyan;
                const memColor =
                  project.memoryPercent > 85 ? 'var(--status-error)' :
                  project.memoryPercent > 60 ? 'var(--status-warning)' : STATUS_COLORS.purple;

                return (
                  <tr
                    key={project.projectId}
                    className={`border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer ${
                      selectedProjectId === project.projectId ? 'bg-[var(--bg-tertiary)]' : ''
                    }`}
                    onClick={() => setSelectedProjectId(
                      selectedProjectId === project.projectId ? null : project.projectId
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent-cyan)]">
                          {project.projectName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{project.projectName}</p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">{project.projectSlug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(project.cpuPercent, 100)}%`, backgroundColor: cpuColor }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-mono" style={{ color: cpuColor }}>
                          {project.cpuPercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(project.memoryPercent, 100)}%`, backgroundColor: memColor }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-mono" style={{ color: memColor }}>
                          {formatStorage(project.memoryUsageMB)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 text-sm font-mono">
                        <ArrowDownRight className="w-3 h-3 text-[#34d399]" />
                        <span className="text-[#34d399]">{formatStorage(project.networkRxMB)}</span>
                        <span className="text-[var(--text-muted)]">/</span>
                        <ArrowUpRight className="w-3 h-3 text-[#3b82f6]" />
                        <span className="text-[#3b82f6]">{formatStorage(project.networkTxMB)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${
                          project.containerStatus === 'running' ? 'badge-success' : 'badge-error'
                        }`}
                      >
                        {project.containerStatus === 'running'
                          ? t('monitoring', 'running')
                          : t('monitoring', 'stopped')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/projects/${project.projectId}`}
                        className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
