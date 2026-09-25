'use client';

import React from 'react';

export function GaugeCard({
  label,
  value,
  subValue,
  icon: Icon,
  maxValue = 100,
  suffix = '%',
  thresholds = true,
}: {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ElementType;
  /** @deprecated cards are monochrome; kept so callers need not change */
  color?: string;
  maxValue?: number;
  suffix?: string;
  /** Warn/alert colours only mean something for a utilisation figure, not for a count or a total. */
  thresholds?: boolean;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor = !thresholds
    ? 'var(--text-primary)'
    : percentage > 85
      ? 'var(--status-error)'
      : percentage > 60
        ? 'var(--status-warning)'
        : 'var(--text-primary)';

  return (
    <div className="dash-stat-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="dash-stat-label mt-0!">{label}</span>
        <Icon className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
      </div>
      <div className="dash-stat-value">
        {value.toFixed(1)}{suffix}
      </div>
      {subValue && (
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{subValue}</p>
      )}
      <div className="mt-4 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
