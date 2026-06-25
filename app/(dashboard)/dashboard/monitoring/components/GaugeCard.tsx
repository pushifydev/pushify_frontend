'use client';

import React from 'react';

export function GaugeCard({
  label,
  value,
  subValue,
  icon: Icon,
  color,
  maxValue = 100,
  suffix = '%',
}: {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  maxValue?: number;
  suffix?: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const barColor =
    percentage > 85 ? 'var(--status-error)' : percentage > 60 ? 'var(--status-warning)' : color;

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold font-mono" style={{ color }}>
        {value.toFixed(1)}{suffix}
      </div>
      {subValue && (
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">{subValue}</p>
      )}
      <div className="mt-3 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
