'use client';

import {
  Cpu,
  HardDrive,
  Network,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
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

export function ChartsSection({
  chartData,
  chartMargin,
  xAxisTicks,
  xAxisAngled,
  selectedHours,
  t,
}: {
  chartData: MetricsChartPoint[];
  chartMargin: { top: number; right: number; left: number; bottom: number };
  xAxisTicks: string[];
  xAxisAngled: boolean;
  selectedHours: number;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU Chart */}
        <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--accent-cyan)]" />
              <span className="text-sm font-medium">{t('monitoring', 'cpuUsage')}</span>
            </div>
          </div>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                  <MetricsXAxis ticks={xAxisTicks} angled={xAxisAngled} />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(v) => `${v}%`}
                    width={45}
                  />
                  <Tooltip content={<ChartTooltip hours={selectedHours} />} />
                  <Area
                    type="monotone"
                    dataKey="cpuPercent"
                    name="CPU"
                    stroke="var(--accent-cyan)"
                    fill="url(#cpuGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--accent-cyan)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
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
                <AreaChart data={chartData} margin={chartMargin}>
                  <defs>
                    <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                  <MetricsXAxis ticks={xAxisTicks} angled={xAxisAngled} />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'auto']}
                    tickFormatter={(v) => `${v}%`}
                    width={45}
                  />
                  <Tooltip content={<ChartTooltip hours={selectedHours} />} />
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
              <LineChart data={chartData} margin={chartMargin}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                <MetricsXAxis ticks={xAxisTicks} angled={xAxisAngled} />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v} MB`}
                  width={55}
                />
                <Tooltip content={<ChartTooltip hours={selectedHours} />} />
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
    </>
  );
}
