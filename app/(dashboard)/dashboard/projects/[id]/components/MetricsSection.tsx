'use client';

import { useState } from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useDeployments, useTranslation } from '@/hooks';
import { useMetricsSummary, useMetricsTimeSeries } from '@/hooks/useMetrics';
import { formatStorage } from '@/lib/formatters';

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
      <div className="dash-panel">
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
      <div className="dash-panel">
        <h3 className="dash-section-label mb-1.5">{t('metrics', 'title')}</h3>
        <p className="text-[13px] text-[var(--text-secondary)]">{t('metrics', 'description')}</p>
        <div className="text-center py-8">
          <Activity className="dash-empty-icon mb-3" />
          {hasRunningDeploy ? (
            <>
              <p className="text-sm text-[var(--text-secondary)]">{t('metrics', 'waitingForMetrics')}</p>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">{t('metrics', 'hintWaitCollect')}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--text-secondary)]">{t('metrics', 'noDeploymentRunning')}</p>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">{t('metrics', 'noDeploymentRunningDesc')}</p>
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
      <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 shadow-xl">
        <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-[13px] font-medium text-[var(--text-primary)]">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name !== 'Network In' && entry.name !== 'Network Out' ? '%' : ' MB'}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="dash-panel min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div className="min-w-0">
          <h3 className="dash-section-label mb-1.5">{t('metrics', 'title')}</h3>
          <p className="text-[13px] text-[var(--text-secondary)]">{t('metrics', 'description')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isFetching && (
            <span className="text-xs text-[var(--text-muted)]">{t('metrics', 'refreshing')}</span>
          )}
          <span className={`badge ${current.containerStatus === 'running' ? 'badge-success' : 'badge-error'}`}>
            {current.containerStatus === 'running' ? t('metrics', 'running') : t('metrics', 'stopped')}
          </span>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="dash-stat-mini">
          <p className="dash-stat-label !mt-0 mb-2">{t('metrics', 'cpu')}</p>
          <div className="dash-stat-mini-value tabular-nums">{formatPercent(current.cpuPercent)}</div>
          <div className="dash-metric-track mt-3">
            <div
              className={`dash-metric-fill ${current.cpuPercent >= 90 ? 'is-critical' : current.cpuPercent >= 75 ? 'is-warning' : ''}`}
              style={{ width: `${Math.min(current.cpuPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="dash-stat-mini">
          <p className="dash-stat-label !mt-0 mb-2">{t('metrics', 'memory')}</p>
          <div className="flex items-baseline gap-2">
            <span className="dash-stat-mini-value tabular-nums">{formatPercent(current.memoryPercent)}</span>
            <span className="terminal-text text-[11px] text-[var(--text-muted)]">
              {formatStorage(current.memoryUsageMB)} / {formatStorage(current.memoryLimitMB)}
            </span>
          </div>
          <div className="dash-metric-track mt-3">
            <div
              className={`dash-metric-fill ${current.memoryPercent >= 90 ? 'is-critical' : current.memoryPercent >= 75 ? 'is-warning' : ''}`}
              style={{ width: `${Math.min(current.memoryPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="dash-stat-mini">
          <p className="dash-stat-label !mt-0 mb-2">{t('metrics', 'network')}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-muted)]">↓ {t('metrics', 'networkIn')}</span>
              <span className="terminal-text text-xs text-[var(--text-primary)]">{formatStorage(current.networkRxMB)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-muted)]">↑ {t('metrics', 'networkOut')}</span>
              <span className="terminal-text text-xs text-[var(--text-secondary)]">{formatStorage(current.networkTxMB)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="dash-segmented mb-4" role="group" aria-label={t('metrics', 'title')}>
        {[
          { hours: 1, label: t('metrics', 'last1Hour') },
          { hours: 6, label: t('metrics', 'last6Hours') },
          { hours: 24, label: t('metrics', 'last24Hours') },
        ].map(({ hours, label }) => (
          <button
            key={hours}
            type="button"
            onClick={() => setSelectedHours(hours)}
            aria-pressed={selectedHours === hours}
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
              <span className="dash-section-label">{t('metrics', 'cpuUsage')}</span>
              {stats24h && (
                <span className="terminal-text text-[11px] text-[var(--text-muted)] break-words">
                  {t('metrics', 'avgCpu')}: {formatPercent(stats24h.avgCpu)} | {t('metrics', 'maxCpu')}: {formatPercent(stats24h.maxCpu)}
                </span>
              )}
            </div>
            <div className="h-40 rounded-[10px] border border-[var(--border-subtle)] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGradientProject" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={30} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<MetricsTooltip />} />
                  <Area type="monotone" dataKey="cpuPercent" name="CPU" stroke="var(--chart-1)" fill="url(#cpuGradientProject)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'var(--chart-1)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Chart */}
          <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
              <span className="dash-section-label">{t('metrics', 'memoryUsage')}</span>
              {stats24h && (
                <span className="terminal-text text-[11px] text-[var(--text-muted)] break-words">
                  {t('metrics', 'avgMemory')}: {formatPercent(stats24h.avgMemory)} | {t('metrics', 'maxMemory')}: {formatPercent(stats24h.maxMemory)}
                </span>
              )}
            </div>
            <div className="h-40 rounded-[10px] border border-[var(--border-subtle)] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="memGradientProject" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={30} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip content={<MetricsTooltip />} />
                  <Area type="monotone" dataKey="memoryPercent" name="Memory" stroke="var(--chart-1)" fill="url(#memGradientProject)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'var(--chart-1)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="dash-section-label">{t('metrics', 'network')}</span>
            </div>
            <div className="h-40 rounded-[10px] border border-[var(--border-subtle)] p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `${v.toFixed(0)} MB`} />
                  <Tooltip content={<MetricsTooltip />} />
                  <Line type="monotone" dataKey="networkRxMB" name="Network In" stroke="var(--chart-1)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'var(--chart-1)' }} />
                  <Line type="monotone" dataKey="networkTxMB" name="Network Out" stroke="var(--chart-2)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'var(--chart-2)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 terminal-text text-[11px] text-[var(--text-muted)] text-right">
        {t('metrics', 'lastUpdated')}: {new Date(current.recordedAt).toLocaleString()}
      </div>
    </div>
  );
}
