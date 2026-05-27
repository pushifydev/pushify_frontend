'use client';

import type { ReactNode } from 'react';

interface LandingSectionHeaderProps {
  label?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function LandingSectionHeader({
  label,
  title,
  description,
  align = 'left',
  className = '',
}: LandingSectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <header className={`max-w-2xl mb-12 md:mb-14 ${alignClass} ${className}`}>
      {label && <p className="lp-label mb-3">{label}</p>}
      <h2 className="lp-section-title">{title}</h2>
      {description && <p className="lp-lead mt-4">{description}</p>}
    </header>
  );
}
