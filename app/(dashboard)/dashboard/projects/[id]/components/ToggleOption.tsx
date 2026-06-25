'use client';

import { ToggleLeft, ToggleRight } from 'lucide-react';

// Toggle option component for the modal
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
  return (
    <div
      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
      onClick={() => onChange(!enabled)}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      {enabled ? (
        <ToggleRight className="w-6 h-6 text-[var(--accent-primary)] shrink-0" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-[var(--text-muted)] shrink-0" />
      )}
    </div>
  );
}
