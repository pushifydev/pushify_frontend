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
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <Files className="w-4 h-4 text-[var(--accent-primary)]" />
          {t('siteEditor', 'navPages')}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          title={t('siteEditor', 'addPage')}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('siteEditor', 'addPage')}
        </button>
      </div>

      <div className="space-y-1">
        {pages.map((p, i) => {
          const active = p.id === activePageId;
          return (
            <div
              key={p.id}
              className={`group flex items-center gap-1 rounded-lg border px-2 py-2 text-sm transition-colors ${
                active
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-default)]'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                className="flex-1 flex items-center gap-2 text-left min-w-0 font-medium text-[var(--text-primary)]"
              >
                {i === 0 ? (
                  <Home className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                ) : (
                  <Files className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                )}
                <span className="truncate">{p.title || 'Page'}</span>
              </button>
              <button
                type="button"
                onClick={() => onRename(p.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
