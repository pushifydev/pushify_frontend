'use client';

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[var(--hp-line,var(--border-subtle))]" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-[var(--hp-bg,var(--bg-primary))] text-[var(--hp-muted,var(--text-muted))] hp-mono text-[11px] uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>
    </div>
  );
}
