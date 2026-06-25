'use client';

export function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 shrink-0" style={{ color: 'var(--text-muted)' }}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-right truncate" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}
