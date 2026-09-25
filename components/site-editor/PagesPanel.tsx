'use client';

import { Files, Plus, Pencil, Trash2, Home } from 'lucide-react';
import { useTranslation } from '@/hooks';
import type { SitePage } from '@/lib/api';

interface PagesPanelProps {
  pages: SitePage[];
  activePageId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PagesPanel({ pages, activePageId, onSelect, onAdd, onRename, onDelete }: PagesPanelProps) {
  const { t, locale } = useTranslation();
  const pageFallback = locale === 'tr' ? 'Sayfa' : 'Page';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="dash-section-label flex items-center gap-2">
          <Files className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
          {t('siteEditor', 'navPages')}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          title={t('siteEditor', 'addPage')}
          className="btn btn-ghost btn-sm"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          {t('siteEditor', 'addPage')}
        </button>
      </div>

      <div className="space-y-1">
        {pages.map((p, i) => {
          const active = p.id === activePageId;
          return (
            <div
              key={p.id}
              className={`group flex items-center gap-1 rounded-[10px] border px-2 py-2 text-sm transition-colors ${
                active
                  ? 'border-[var(--border-strong)] bg-[var(--hover-overlay-md)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-default)]'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                aria-current={active ? 'page' : undefined}
                className="flex-1 flex items-center gap-2 text-left min-w-0 font-medium text-[var(--text-primary)] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
              >
                {i === 0 ? (
                  <Home className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                ) : (
                  <Files className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                )}
                <span className="truncate">{p.title || pageFallback}</span>
              </button>
              <button
                type="button"
                onClick={() => onRename(p.id)}
                aria-label={`${t('siteEditor', 'renamePage')}: ${p.title || pageFallback}`}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  aria-label={`${t('common', 'delete')}: ${p.title || pageFallback}`}
                  className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[var(--text-muted)] hover:text-[var(--status-error)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
