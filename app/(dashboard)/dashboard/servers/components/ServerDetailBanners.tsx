'use client';

import type { ReactNode } from 'react';
import type { ServerStatus } from '@/lib/api';

const STATUS_BADGE: Record<ServerStatus, string> = {
  running: 'badge-success',
  provisioning: 'badge-warning',
  rebooting: 'badge-warning',
  deleting: 'badge-warning',
  error: 'badge-error',
  stopped: 'badge-neutral',
};

/** Server status as the product's mono status badge. */
export function StatusBadge({
  status,
  label,
}: {
  status: ServerStatus;
  label: string;
}) {
  return <span className={`badge shrink-0 ${STATUS_BADGE[status] ?? 'badge-neutral'}`}>{label}</span>;
}

/** A one-line notice under the header (setup progress, errors, ready). Colour only on the dot. */
export function SetupBanner({
  variant,
  title,
  description,
  icon,
}: {
  variant: 'info' | 'error' | 'success';
  title: string;
  description: string;
  /** Optional leading glyph (a spinner while something runs); a status dot otherwise. */
  icon?: ReactNode;
}) {
  const dot = variant === 'error' ? 'is-error' : variant === 'success' ? 'is-success' : 'is-warning';
  return (
    <div
      className={`dash-callout${variant === 'error' ? ' dash-callout-attention' : ''} items-start`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className="w-4 h-5 flex items-center justify-center shrink-0 text-[var(--text-muted)]" aria-hidden>
        {icon ?? <span className={`dash-status-dot ${dot}`} />}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-[13px] mt-0.5 text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
