'use client';

import { Palette } from 'lucide-react';

export function SectionHeading({ icon: Icon, title }: { icon: typeof Palette; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
      <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
      {title}
    </h2>
  );
}
