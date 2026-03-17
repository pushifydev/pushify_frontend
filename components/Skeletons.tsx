'use client';

interface CardGridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3;
  height?: number;
}

/** Skeleton placeholder for card grids (projects, servers, databases) */
export function CardGridSkeleton({ count = 3, columns = 3, height = 160 }: CardGridSkeletonProps) {
  const colClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl animate-pulse"
          style={{ background: 'var(--bg-secondary)', height }}
        />
      ))}
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
  height?: number;
}

/** Skeleton placeholder for list/table rows */
export function ListSkeleton({ rows = 5, height = 56 }: ListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg animate-pulse"
          style={{ background: 'var(--bg-secondary)', height }}
        />
      ))}
    </div>
  );
}

/** Skeleton for a detail page header area */
export function DetailHeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded" style={{ background: 'var(--bg-secondary)' }} />
      <div className="h-4 w-80 rounded" style={{ background: 'var(--bg-secondary)' }} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
        ))}
      </div>
    </div>
  );
}
