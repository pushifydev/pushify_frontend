'use client';

import type { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  /** Right-aligned footer content (e.g. a Save button). When provided, the quiet footer bar renders. */
  footer?: ReactNode;
  /** Muted helper text shown on the left of the footer bar. */
  footerHint?: string;
}

/**
 * Cal.com-style settings card: a quiet bordered panel with a title + muted description,
 * a body for the controls, and an optional footer bar (border-top, tinted) for the primary
 * action. Kept deliberately minimal — restraint is the design here.
 */
export function SettingsCard({ title, description, children, footer, footerHint }: SettingsCardProps) {
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-5 md:px-6 pt-5 md:pt-6">
        <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
        )}
      </div>

      <div className="px-5 md:px-6 py-5">{children}</div>

      {footer && (
        <div className="flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 px-5 md:px-6 py-3.5">
          <p className="min-w-0 text-xs leading-relaxed text-[var(--text-muted)]">{footerHint}</p>
          <div className="shrink-0">{footer}</div>
        </div>
      )}
    </section>
  );
}

interface SettingsFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + optional hint, with the spacing rhythm used across the settings cards. */
export function SettingsField({ label, htmlFor, hint, children }: SettingsFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}

/** A single labelled row toggle/control, e.g. for notification preferences. */
export function SettingsRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
