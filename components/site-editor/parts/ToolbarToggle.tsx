'use client';

import { Palette } from 'lucide-react';

export function ToolbarToggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Palette;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label && <span className="hidden lg:inline">{label}</span>}
    </button>
  );
}
