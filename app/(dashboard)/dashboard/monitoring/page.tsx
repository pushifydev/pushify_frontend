'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  useMetricsOverview,
  useMetricsTimeSeries,
  useProjects,
  useTranslation,
} from '@/hooks';
import { MonitoringEmptyState } from '@/components/monitoring/MonitoringEmptyState';
import { formatStorage } from '@/lib/formatters';
import { SkeletonMonitoringGaugeCard, SkeletonMonitoringChartBlock } from '@/components/Skeleton';
import { PageHeader, MetaLabel } from '@/components/dashboard/PageKit';
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
  const { t, locale } = useTranslation();
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

  const header = (badge?: ReactNode, meta?: ReactNode[]) => (
    <PageHeader
      title={t('monitoring', 'title')}
      description={t('monitoring', 'description')}
      badge={badge}
      meta={meta}
    />
  );

  if (isLoading) {
    return (
      <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
        {header()}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
      <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
        {header()}
        <MonitoringEmptyState projectCount={projectsList.length} />
      </div>
    );
  }

  // System health status
  const healthStatus =
    agg && agg.avgCpuPercent > 90 ? 'unhealthy' :
    agg && agg.avgCpuPercent > 70 ? 'degraded' : 'healthy';

  const healthBadge = {
    healthy: 'badge-success',
    degraded: 'badge-warning',
    unhealthy: 'badge-error',
  }[healthStatus];

  const selectedName =
    projects.find((p) => p.projectId === timeSeriesProjectId)?.projectName ?? '';

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      {header(
        <span className={`badge shrink-0 ${healthBadge}`} role="status">
          {t('monitoring', healthStatus)}
        </span>,
        [
          <MetaLabel key="projects">
            {overview.totalProjects} {t('monitoring', 'allProjects').toLowerCase()}
          </MetaLabel>,
          <MetaLabel key="running">
            {overview.runningContainers} {t('monitoring', 'running').toLowerCase()}
          </MetaLabel>,
          lastUpdated ? (
            <span key="updated" className="inline-flex items-center gap-1.5">
              <span className="dash-status-dot is-success animate-pulse" aria-hidden />
              <span className="terminal-text text-xs">
                {locale === 'tr' ? 'Güncellendi' : 'Updated'} {lastUpdated}
              </span>
            </span>
          ) : null,
        ],
      )}

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GaugeCard
          label={t('monitoring', 'avgCpu')}
          value={agg?.avgCpuPercent || 0}
          subValue={`${t('monitoring', 'totalCpu')}: ${agg?.totalCpuPercent.toFixed(1) || 0}%`}
        />
        <GaugeCard
          label={t('monitoring', 'totalMemory')}
          value={agg?.avgMemoryPercent || 0}
          subValue={`${formatStorage(agg?.totalMemoryUsageMB || 0)} ${t('monitoring', 'memoryOf')} ${formatStorage(agg?.totalMemoryLimitMB || 0)}`}
        />
        <GaugeCard
          label={t('monitoring', 'networkIO')}
          value={agg?.totalNetworkRxMB || 0}
          subValue={`↓ ${formatStorage(agg?.totalNetworkRxMB || 0)} / ↑ ${formatStorage(agg?.totalNetworkTxMB || 0)}`}
          thresholds={false}
          maxValue={Math.max((agg?.totalNetworkRxMB || 0) * 1.5, 100)}
          suffix=" MB"
        />
        <GaugeCard
          label={t('monitoring', 'runningContainers')}
          value={overview?.runningContainers || 0}
          subValue={`${overview?.totalProjects || 0} ${t('monitoring', 'allProjects').toLowerCase()}`}
          thresholds={false}
          maxValue={Math.max(overview?.totalProjects || 1, 1)}
          suffix=""
          decimals={0}
        />
      </div>

      {/* Charts: project filter + range live in the card's toolbar */}
      <section className="dash-card overflow-hidden min-w-0" aria-label={t('monitoring', 'overview')}>
        <div className="dash-toolbar justify-between">
          <label className="min-w-0 w-full sm:w-auto">
            <span className="sr-only">{t('monitoring', 'project')}</span>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="select h-8 py-0! text-[13px] w-full sm:w-64"
            >
              <option value="">{projects[0]?.projectName || t('monitoring', 'allProjects')}</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </label>
          <TimeRangeSelector selected={selectedHours} onChange={setSelectedHours} t={t} />
        </div>
        <ChartsSection
          chartData={chartData}
          chartMargin={chartMargin}
          xAxisTicks={xAxisTicks}
          xAxisAngled={xAxisAngled}
          selectedHours={selectedHours}
          projectName={selectedName}
          t={t}
        />
      </section>

      <ProjectResourcesTable
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        t={t}
      />
    </div>
  );
}
