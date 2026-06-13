'use client';

import { useState } from 'react';
import { Check, LayoutTemplate, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSiteDesigns, useApplySiteTemplate } from '@/hooks/useSiteEditor';
import type { SiteTheme } from '@/lib/api';

interface DesignGalleryProps {
  projectId: string;
  /** Current theme primary — used to mark the active design. */
  currentPrimary?: string;
  /** Apply a design's theme locally (instant restyle, non-destructive). */
  onApplyTheme: (theme: Partial<SiteTheme>) => void;
}

/** Accent-tinted mini mock of a page, built from a design's theme. */
function DesignThumb({ theme }: { theme: SiteTheme }) {
  const p = theme.primaryColor;
  return (
    <div className="relative h-16 w-full" style={{ background: theme.backgroundColor }}>
      <div
        className="absolute inset-x-0 top-0 h-3 flex items-center gap-0.5 px-1.5"
        style={{ background: theme.surfaceColor }}
      >
        <span className="w-1 h-1 rounded-full" style={{ background: p }} />
        <span className="ml-auto w-4 h-1 rounded-full" style={{ background: `${p}66` }} />
      </div>
      <div className="absolute inset-x-0 top-5 flex flex-col items-center gap-1 px-3">
        <span className="w-2/3 h-1.5 rounded-full" style={{ background: `${p}cc` }} />
        <span className="w-1/2 h-1 rounded-full" style={{ background: `${p}55` }} />
        <span className="mt-0.5 w-8 h-2 rounded-full" style={{ background: p }} />
      </div>
    </div>
  );
}

export function DesignGallery({ projectId, currentPrimary, onApplyTheme }: DesignGalleryProps) {
  const { t } = useTranslation();
  const { data: designs, isLoading } = useSiteDesigns(projectId);
  const apply = useApplySiteTemplate(projectId);
  const [applying, setApplying] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <LayoutTemplate className="w-4 h-4 text-[var(--accent-primary)]" />
          {t('siteEditor', 'designsTitle')}
        </h2>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-snug">
          {t('siteEditor', 'designsHint')}
        </p>
      </div>

      {isLoading && <div className="h-24 rounded-lg bg-[var(--bg-tertiary)] animate-pulse" />}

      <div className="grid grid-cols-2 gap-2">
        {(designs ?? []).map((d) => {
          const active = currentPrimary === d.theme.primaryColor;
          return (
            <div
              key={d.key}
              className={`group rounded-lg border overflow-hidden bg-[var(--bg-primary)] transition-colors ${
                active ? 'border-[var(--accent-primary)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
              }`}
            >
              <button type="button" onClick={() => onApplyTheme(d.theme)} title={d.label} className="block w-full text-left">
                <DesignThumb theme={d.theme} />
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <span className="text-[11px] font-medium truncate text-[var(--text-primary)]">{d.label}</span>
                  {active && <Check className="w-3 h-3 text-[var(--accent-primary)] shrink-0" />}
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(t('siteEditor', 'replaceConfirm'))) return;
                  setApplying(d.key);
                  apply.mutate(d.key, { onSettled: () => setApplying(null) });
                }}
                disabled={apply.isPending}
                className="w-full text-[10px] py-1 border-t border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)] flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {applying === d.key && <RefreshCw className="w-3 h-3 animate-spin" />}
                {t('siteEditor', 'useTemplate')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
