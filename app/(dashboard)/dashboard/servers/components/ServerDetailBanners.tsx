'use client';

import type { ReactNode } from 'react';
import { SERVER_STATUS_COLORS } from '@/lib/constants';
import type { ServerStatus } from '@/lib/api';

export function StatusBadge({
  status,
  label,
}: {
  status: ServerStatus;
  label: string;
}) {
  const accent = SERVER_STATUS_COLORS[status] ?? 'var(--text-muted)';

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: `${accent}18`,
        border: `1px solid ${accent}35`,
        color: accent,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: accent }}
      />
      {label}
    </span>
  );
}

export function SetupBanner({
  variant,
  title,
  description,
  icon,
}: {
  variant: 'info' | 'error' | 'success';
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const styles = {
    info: {
      border: 'var(--accent-cyan)',
      bg: 'rgba(34,211,238,0.06)',
      title: 'var(--accent-cyan)',
    },
    error: {
      border: 'var(--status-error)',
      bg: 'rgba(239,68,68,0.06)',
      title: 'var(--status-error)',
    },
    success: {
      border: 'var(--status-success)',
      bg: 'rgba(34,197,94,0.06)',
      title: 'var(--status-success)',
    },
  }[variant];

  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4"
      style={{
        background: styles.bg,
        border: `1px solid color-mix(in srgb, ${styles.border} 35%, transparent)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg dash-section-icon"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold" style={{ color: styles.title }}>
          {title}
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
