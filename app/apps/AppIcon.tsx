'use client';

import { Package } from 'lucide-react';
import { BrandIcon, hasBrandIcon } from '@/components/landing/BrandIcon';

/** Brand mark when simple-icons has one, a neutral package glyph otherwise. */
export function AppIcon({ id, name, size = 24 }: { id: string; name: string; size?: number }) {
  if (hasBrandIcon(id)) {
    return <BrandIcon slug={id} aria-label={name} style={{ width: size, height: size }} />;
  }
  return <Package aria-label={name} style={{ width: size, height: size, color: 'var(--lp-muted)' }} />;
}
