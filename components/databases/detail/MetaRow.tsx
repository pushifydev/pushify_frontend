'use client';

/** One key/value line (`.dash-kv`): muted label left, mono value right, hairline between siblings. */
export function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="dash-kv">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
