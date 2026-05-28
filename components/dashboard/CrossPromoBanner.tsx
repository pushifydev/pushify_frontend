'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CrossPromoBannerProps {
  message: string;
  ctaLabel: string;
  href: string;
}

export function CrossPromoBanner({ message, ctaLabel, href }: CrossPromoBannerProps) {
  return (
    <div className="dash-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5">
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
      <Link
        href={href}
        className="dash-link inline-flex items-center gap-1.5 shrink-0"
      >
        {ctaLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
