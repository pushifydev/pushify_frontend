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
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-4 py-3.5"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {message}
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium shrink-0 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--accent-cyan)' }}
      >
        {ctaLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
