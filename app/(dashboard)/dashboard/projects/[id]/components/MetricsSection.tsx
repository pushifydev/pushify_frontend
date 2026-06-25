'use client';

import { useState } from 'react';
import { Activity, Globe } from 'lucide-react';
import { useDeployments, useTranslation } from '@/hooks';
import { useMetricsSummary, useMetricsTimeSeries } from '@/hooks/useMetrics';
import { formatStorage } from '@/lib/formatters';
import { STATUS_COLORS } from '@/lib/constants';

export function MetricsSection({
  projectId,
  t,
}: {
  projectId: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const { data: deployments = [] } = useDeployments(projectId);
  const latestDeployment = deployments[0];
  const hasRunningDeploy = latestDeployment?.status === 'running';
  const { data: summary, isLoading, isFetching } = useMetricsSummary(projectId);
  const [selectedHours, setSelectedHours] = useState(1);
  const { data: timeSeries = [] } = useMetricsTimeSeries(projectId, selectedHours);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-[var(--bg-tertiary)] rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          {hasRunningDeploy ? (
            <>
              <p className="text-[var(--text-secondary)]">{t('metrics', 'waitingForMetrics')}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{t('metrics', 'hintWaitCollect')}</p>
            </>
          ) : (
            <>
              <p className="text-[var(--text-secondary)]">{t('metrics', 'noDeploymentRunning')}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">{t('metrics', 'noDeploymentRunningDesc')}</p>
              {latestDeployment && (
                <p className="text-xs text-[var(--text-muted)] mt-3 font-mono">
                  {t('metrics', 'lastStatus')}: {latestDeployment.status}
                </p>
              )}
            </>
          )}
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
    <div className="p-4 sm:p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{t('metrics', 'title')}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{t('metrics', 'description')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { hours: 1, label: t('metrics', 'last1Hour') },
          { hours: 6, label: t('metrics', 'last6Hours') },
          { hours: 24, label: t('metrics', 'last24Hours') },
        ].map(({ hours, label }) => (
          <button
            key={hours}
            onClick={() => setSelectedHours(hours)}
            className={`px-3 py-1 text-xs rounded transition-colors border border-transparent ${
              selectedHours === hours
                ? 'dash-accent-fill'
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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'cpuUsage')}</span>
              {stats24h && (
                <span className="text-xs text-[var(--text-muted)] break-words">
                  {t('metrics', 'avgCpu')}: {formatPercent(stats24h.avgCpu)} | {t('metrics', 'maxCpu')}: {formatPercent(stats24h.maxCpu)}
                </span>
              )}
            </div>
            <div className="h-40 bg-[var(--bg-tertiary)] rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGradientProject" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">{t('metrics', 'memoryUsage')}</span>
              {stats24h && (
                <span className="text-xs text-[var(--text-muted)] break-words">
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
