'use client';

import { useMemo, useState } from 'react';
import {
  Cpu,
  HardDrive,
  Network,
  Container,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  useMetricsOverview,
  useMetricsTimeSeries,
  useProjects,
  useTranslation,
} from '@/hooks';
import { MonitoringEmptyState } from '@/components/monitoring/MonitoringEmptyState';
import { formatStorage } from '@/lib/formatters';
import { SkeletonMonitoringGaugeCard, SkeletonMonitoringChartBlock } from '@/components/Skeleton';
import {
  GaugeCard,
  TimeRangeSelector,
  ChartsSection,
  ProjectResourcesTable,
  formatChartAxisTime,
  pickXAxisTickLabels,
  type MetricsChartPoint,
} from './components';

// ============ Main Page ============

export default function MonitoringPage() {
  const { t } = useTranslation();
  const { data: overview, isLoading, dataUpdatedAt } = useMetricsOverview();
  const { data: projectsList = [] } = useProjects();
  const [selectedHours, setSelectedHours] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Get time series for the selected project (or first project)
  const timeSeriesProjectId = selectedProjectId || overview?.projects?.[0]?.projectId || '';
  const { data: timeSeries = [] } = useMetricsTimeSeries(timeSeriesProjectId, selectedHours);

  const chartData = useMemo<MetricsChartPoint[]>(
    () =>
      [...timeSeries]
        .reverse()
        .map((point) => ({
          ...point,
          axisTime: formatChartAxisTime(point.timestamp, selectedHours),
        })),
    [timeSeries, selectedHours]
  );

  const xAxisTicks = useMemo(() => pickXAxisTickLabels(chartData), [chartData]);
  const xAxisAngled = selectedHours >= 24;
  const chartMargin = { top: 4, right: 8, left: 0, bottom: xAxisAngled ? 4 : 0 };

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : '';

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('monitoring', 'title')}</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{t('monitoring', 'description')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonMonitoringGaugeCard key={i} />
          ))}
        </div>
        <SkeletonMonitoringChartBlock />
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
        <MonitoringEmptyState projectCount={projectsList.length} />
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
          color="var(--accent-cyan)"
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

      <ChartsSection
        chartData={chartData}
        chartMargin={chartMargin}
        xAxisTicks={xAxisTicks}
        xAxisAngled={xAxisAngled}
        selectedHours={selectedHours}
        t={t}
      />

      <ProjectResourcesTable
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        t={t}
      />
    </div>
  );
}
