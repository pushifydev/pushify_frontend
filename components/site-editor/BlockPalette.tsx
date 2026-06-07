'use client';

import {
  LayoutTemplate,
  Image,
  Grid3x3,
  Type,
  Megaphone,
  HelpCircle,
  CreditCard,
  BarChart3,
  PanelBottom,
} from 'lucide-react';
import type { SiteBlockType } from '@/lib/api';

const BLOCK_META: { type: SiteBlockType; icon: typeof LayoutTemplate }[] = [
  { type: 'hero', icon: LayoutTemplate },
  { type: 'banner', icon: Image },
  { type: 'features', icon: Grid3x3 },
  { type: 'stats', icon: BarChart3 },
  { type: 'text', icon: Type },
  { type: 'pricing', icon: CreditCard },
  { type: 'faq', icon: HelpCircle },
  { type: 'cta', icon: Megaphone },
  { type: 'footer', icon: PanelBottom },
];

interface BlockPaletteProps {
  onAdd: (type: SiteBlockType) => void;
  title: string;
  labelFor: (type: SiteBlockType) => string;
}

export function BlockPalette({ onAdd, title, labelFor }: BlockPaletteProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {BLOCK_META.map(({ type, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--accent-primary)]/5 hover:text-[var(--text-primary)] transition-colors"
          >
            <Icon className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-center leading-tight">{labelFor(type)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
