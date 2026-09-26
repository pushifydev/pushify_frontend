'use client';

import type { ReactNode } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/hooks';
import { MetricsXAxis } from './MetricsXAxis';
import { ChartTooltip } from './ChartTooltip';
import type { MetricsChartPoint } from './types';

const Y_TICK = { fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' };

/** One chart inside the monitoring card: mono label + optional legend, then the plot. */
function ChartPanel({
  label,
  legend,
  empty,
  emptyText,
  className = '',
  children,
}: {
  label: string;
  legend?: ReactNode;
  empty: boolean;
  emptyText: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`p-4 sm:p-5 min-w-0 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="dash-section-label">{label}</h3>
        {legend}
      </div>
      <div className="h-52">
        {empty ? (
          <div className="h-full flex items-center justify-center text-[13px] text-[var(--text-muted)]">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function ChartsSection({
  chartData,
  chartMargin,
  xAxisTicks,
  xAxisAngled,
  selectedHours,
  projectName,
  t,
}: {
  chartData: MetricsChartPoint[];
  chartMargin: { top: number; right: number; left: number; bottom: number };
  xAxisTicks: string[];
  xAxisAngled: boolean;
  selectedHours: number;
  /** The project the series belongs to, shown quietly next to the first chart. */
  projectName?: string;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const empty = chartData.length === 0;
  const emptyText = t('monitoring', 'noData');
  const projectTag = projectName ? (
    <span className="terminal-text text-[11px] text-[var(--text-muted)] truncate max-w-[12rem]">{projectName}</span>
  ) : null;

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* CPU */}
        <ChartPanel label={t('monitoring', 'cpuUsage')} legend={projectTag} empty={empty} emptyText={emptyText}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
              <MetricsXAxis ticks={xAxisTicks} angled={xAxisAngled} />
              <YAxis tick={Y_TICK} axisLine={false} tickLine={false} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} width={42} />
              <Tooltip content={<ChartTooltip hours={selectedHours} />} />
              <Area
                type="monotone"
                dataKey="cpuPercent"
                name="CPU"
                stroke="var(--chart-1)"
                fill="url(#cpuGradient)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--chart-1)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Memory */}
        <ChartPanel
          label={t('monitoring', 'memoryUsage')}
          empty={empty}
          emptyText={emptyText}
          className="border-t border-[var(--border-subtle)] lg:border-t-0 lg:border-l"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={chartMargin}>
              <defs>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
              <MetricsXAxis ticks={xAxisTicks} angled={xAxisAngled} />
              <YAxis tick={Y_TICK} axisLine={false} tickLine={false} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} width={42} />
              <Tooltip content={<ChartTooltip hours={selectedHours} />} />
              <Area
                type="monotone"
                dataKey="memoryPercent"
                name="Memory"
                stroke="var(--chart-1)"
                fill="url(#memGradient)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--chart-1)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Network */}
      <ChartPanel
        label={t('monitoring', 'networkIO')}
        empty={empty}
        emptyText={emptyText}
        className="border-t border-[var(--border-subtle)]"
        legend={
          <div className="flex items-center gap-4 terminal-text text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-[var(--chart-1)]" aria-hidden />
              ↓ {t('monitoring', 'totalNetworkIn')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded bg-[var(--chart-2)]" aria-hidden />
              ↑ {t('monitoring', 'totalNetworkOut')}
            </span>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={chartMargin}>
            <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
            <MetricsXAxis ticks={xAxisTicks} angled={xAxisAngled} />
            <YAxis tick={Y_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} MB`} width={55} />
            <Tooltip content={<ChartTooltip hours={selectedHours} />} />
            <Line
              type="monotone"
              dataKey="networkRxMB"
              name="Network In"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: 'var(--chart-1)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="networkTxMB"
              name="Network Out"
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: 'var(--chart-2)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}
