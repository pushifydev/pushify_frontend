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
      <h2 className="text-3xl font-semibold tracking-tight mb-2 text-neutral-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
      )}
    </div>
  );
}
