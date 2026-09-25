'use client';

import { Palette } from 'lucide-react';

export function ToolbarToggle({
  active,
  onClick,
  icon: Icon,
  label,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Palette;
  label?: string;
  /** Accessible name for icon-only toggles. */
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label ?? ariaLabel}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)] ${
        active
          ? 'bg-[var(--hover-overlay-lg)] text-[var(--text-primary)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}
