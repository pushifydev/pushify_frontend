export type MetricsChartPoint = {
  timestamp: string;
  axisTime: string;
  cpuPercent?: number;
  memoryPercent?: number;
  memoryUsageMB?: number;
  networkRxMB?: number;
  networkTxMB?: number;
};

export const MAX_X_AXIS_TICKS = 6;

export function formatChartAxisTime(ts: string, hours: number): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  if (hours >= 24) {
    return d.toLocaleString([], {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (hours >= 6) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Evenly spaced axis labels — avoids hundreds of ticks when metrics poll every ~15s. */
export function pickXAxisTickLabels(data: MetricsChartPoint[], maxTicks = MAX_X_AXIS_TICKS): string[] {
  if (data.length === 0) return [];
  if (data.length <= maxTicks) {
    return data.map((p) => p.axisTime);
  }
  const last = data.length - 1;
  const indices = Array.from({ length: maxTicks }, (_, i) =>
    i === maxTicks - 1 ? last : Math.round((i * last) / (maxTicks - 1))
  );
  const unique = [...new Set(indices)].sort((a, b) => a - b);
  return unique.map((i) => data[i].axisTime);
}
