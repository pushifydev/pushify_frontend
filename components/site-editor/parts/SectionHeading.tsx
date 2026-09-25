'use client';

import { Palette } from 'lucide-react';

export function SectionHeading({ icon: Icon, title }: { icon: typeof Palette; title: string }) {
  return (
    <h2 className="dash-section-label flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
      {title}
    </h2>
  );
}
