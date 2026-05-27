'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/logo';

export function AuthMobileBrand() {
  return (
    <div className="lg:hidden mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-3 text-neutral-900 dark:text-white hover:opacity-90 transition-opacity"
      >
        <LogoMark size={40} />
        <span className="text-xl font-semibold tracking-tight">Pushify</span>
      </Link>
    </div>
  );
}
