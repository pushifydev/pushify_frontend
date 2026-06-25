'use client';

import type { MetricsChartPoint } from './types';

function formatMetricTooltipTime(ts: string | undefined, hours: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  if (hours >= 24) {
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ChartTooltip({
  active,
  payload,
  hours = 1,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; payload?: MetricsChartPoint }>;
  hours?: number;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const timeLabel = formatMetricTooltipTime(point?.timestamp, hours);

  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] px-3 py-2 shadow-xl">
      <p className="text-xs text-[var(--text-muted)] mb-1 font-mono">
        {timeLabel}
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
