'use client';

import React from 'react';

/** One aggregate figure: mono label, value, a quiet sub line and the metric track. */
export function GaugeCard({
  label,
  value,
  subValue,
  maxValue = 100,
  suffix = '%',
  thresholds = true,
  decimals = 1,
}: {
  label: string;
  value: number;
  subValue?: string;
  /** @deprecated stat cards no longer draw an icon; kept so callers need not change */
  icon?: React.ElementType;
  /** @deprecated cards are monochrome; kept so callers need not change */
  color?: string;
  maxValue?: number;
  suffix?: string;
  /** Warn/alert colours only mean something for a utilisation figure, not for a count or a total. */
  thresholds?: boolean;
  decimals?: number;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const level = !thresholds
    ? ''
    : percentage > 85
      ? ' is-critical'
      : percentage > 60
        ? ' is-warning'
        : '';

  return (
    <div className="dash-stat-card p-4 sm:p-5 min-w-0">
      <p className="dash-stat-label mt-0! mb-3">{label}</p>
      <div className="dash-stat-value">
        {value.toFixed(decimals)}{suffix}
      </div>
      {subValue && (
        <p className="terminal-text text-[11px] text-[var(--text-muted)] mt-2 truncate">{subValue}</p>
      )}
      <div
        className="dash-metric-track mt-4"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
      >
        <div className={`dash-metric-fill${level}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
