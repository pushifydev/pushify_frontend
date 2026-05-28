'use client';

import { Check, Copy, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const ICON_CLASS = 'w-5 h-5 shrink-0';

type ServerDetailSectionProps = {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ServerDetailSection({
  icon: Icon,
  iconColor = 'var(--accent-cyan)',
  title,
  description,
  action,
  children,
  className = '',
}: ServerDetailSectionProps) {
  return (
    <section
      className={`rounded-xl p-6 space-y-5 ${className}`}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
    >
      <div className={`flex gap-3 ${description ? 'items-start' : 'items-center'}`}>
        <div
          className="w-10 h-10 rounded-lg dash-section-icon"
          style={{ background: 'var(--dash-accent-bg)' }}
        >
          <Icon className={ICON_CLASS} style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-3 min-h-[2.5rem]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
            {description && (
              <p className="text-sm mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </p>
            )}
          </div>
          {action ? <div className="shrink-0 flex items-center">{action}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg p-4 min-w-0" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="dash-icon-row mb-2">
        <Icon className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} strokeWidth={2} />
        <p className="text-xs uppercase tracking-wide truncate leading-none" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
      </div>
      <p className="text-xl font-bold tabular-nums truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

export function CopyField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const copied = copiedField === fieldKey;

  return (
    <div
      className="rounded-lg p-4 flex items-center justify-between gap-3 min-w-0"
      style={{ background: 'var(--bg-tertiary)' }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide mb-1 leading-none" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="font-mono text-sm break-all leading-snug" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, fieldKey)}
        className="dash-icon-btn p-2 rounded-md shrink-0 inline-flex items-center justify-center transition-colors"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          color: copied ? 'var(--status-success)' : 'var(--text-muted)',
        }}
        aria-label={label}
      >
        {copied ? <Check className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
      </button>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 border-b last:border-b-0 min-h-[2.75rem]"
      style={{ borderColor: 'var(--glass-divider)' }}
    >
      <span className="text-sm shrink-0 leading-none" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span
        className="text-sm font-medium text-right min-w-0 break-words leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  );
}
