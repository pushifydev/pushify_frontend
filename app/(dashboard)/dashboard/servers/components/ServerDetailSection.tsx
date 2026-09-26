'use client';

import { Check, Copy, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type ServerDetailSectionProps = {
  /** Kept for older call sites; sections no longer draw an icon tile. */
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * A titled block of the server detail screen, drawn like the project detail: a mono section label
 * (with an optional action on the right) above one hairline card.
 */
export function ServerDetailSection({
  title,
  description,
  action,
  children,
  className = '',
}: ServerDetailSectionProps) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <h2 className="dash-section-label">{title}</h2>
        {action ? <div className="shrink-0 flex items-center">{action}</div> : null}
      </div>
      <div className="dash-card px-4 sm:px-5 py-1.5 min-w-0">
        {description && (
          <p className="text-[13px] text-[var(--text-secondary)] py-2.5 border-b border-[var(--border-subtle)]">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

/** A metric tile: value first, mono label under it (the project overview's stat cards). */
export function StatTile({
  label,
  value,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="dash-stat-card p-4 min-w-0">
      <p className="text-xl font-medium tabular-nums truncate leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
        {value}
      </p>
      <p className="dash-stat-label truncate">{label}</p>
    </div>
  );
}

/** A key / value line whose value can be copied. */
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
    <div className="dash-kv !items-center">
      <span>{label}</span>
      <span className="inline-flex items-center justify-end gap-1.5 min-w-0">
        <span className="break-all">{value}</span>
        <button
          type="button"
          onClick={() => onCopy(value, fieldKey)}
          className="dash-icon-action"
          aria-label={`Copy ${label}`}
          title={`Copy ${label}`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[var(--status-success)]" strokeWidth={2} />
          ) : (
            <Copy className="w-3.5 h-3.5" strokeWidth={2} />
          )}
        </button>
      </span>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="dash-kv">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
