'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthPrimaryLink({
  href,
  children,
  showArrow = true,
  className,
}: {
  href: string;
  children: React.ReactNode;
  showArrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn('lp-cta w-full h-12 text-base group text-[var(--lp-btn-fg)]', className)}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {children}
        {showArrow && (
          <ArrowRight className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
    </Link>
  );
}
