'use client';

export function AuthPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-[2rem] leading-tight font-medium mb-2" style={{ color: 'var(--hp-ink, var(--text-primary))' }}>
        {title}
      </h2>
      {description && (
        <p className="text-[15px]" style={{ color: 'var(--hp-body, var(--text-secondary))' }}>{description}</p>
      )}
    </div>
  );
}
