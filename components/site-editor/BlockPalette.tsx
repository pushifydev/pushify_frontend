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
      <p className="dash-section-label">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {BLOCK_META.map(({ type, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="flex flex-col items-center gap-1.5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--hover-overlay)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
          >
            <Icon className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
            <span className="text-center leading-tight">{labelFor(type)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
