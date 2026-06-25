'use client';

import { XAxis } from 'recharts';

export function MetricsXAxis({ ticks, angled }: { ticks: string[]; angled?: boolean }) {
  return (
    <XAxis
      dataKey="axisTime"
      ticks={ticks}
      interval={0}
      tick={{
        fill: 'var(--text-muted)',
        fontSize: 10,
        fontFamily: 'JetBrains Mono',
        ...(angled ? { angle: -32, textAnchor: 'end' as const, dy: 4 } : {}),
      }}
      axisLine={{ stroke: 'var(--border-subtle)' }}
      tickLine={false}
      height={angled ? 48 : 28}
    />
  );
}
