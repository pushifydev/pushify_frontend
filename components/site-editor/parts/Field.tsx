'use client';

export function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      {multiline ? (
        <textarea className="textarea w-full" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input w-full" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
