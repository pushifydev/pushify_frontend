'use client';

import { useId } from 'react';

// Toggle option row for the Nginx settings modal: label + description, ink switch on the right.
export function ToggleOption({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="text-[13px] font-medium cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className="dash-switch mt-0.5"
      >
        <span className="dash-switch-thumb" />
      </button>
    </div>
  );
}
