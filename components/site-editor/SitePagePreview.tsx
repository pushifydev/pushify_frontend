'use client';

import { useMemo } from 'react';
import { Monitor, Smartphone, MousePointer2, Maximize2 } from 'lucide-react';
import type { SiteBlock, SiteSeo } from '@/lib/api';
import type { SiteTheme } from '@/lib/site-editor/theme';
import { renderSiteHtmlClient } from '@/lib/site-editor/render-html';
import { EditableSiteCanvas } from './EditableSiteCanvas';

export type PreviewMode = 'canvas' | 'iframe';

interface SitePagePreviewProps {
  seo: SiteSeo;
  blocks: SiteBlock[];
  siteName: string;
  theme: SiteTheme;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onBlockChange: (id: string, patch: Partial<SiteBlock>) => void;
  onReorder: (blocks: SiteBlock[]) => void;
  onBannerImagePick?: (blockId: string, file: File) => void;
  dragToReorderLabel: string;
  labelFor: (block: SiteBlock) => string;
  previewLabel: string;
  viewport: 'desktop' | 'mobile';
  onViewportChange: (v: 'desktop' | 'mobile') => void;
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  canvasModeLabel: string;
  fullPreviewLabel: string;
  clickToEditHint: string;
}

export function SitePagePreview({
  seo,
  blocks,
  siteName,
  theme,
  selectedBlockId,
  onSelectBlock,
  onBlockChange,
  onReorder,
  onBannerImagePick,
  dragToReorderLabel,
  labelFor,
  previewLabel,
  viewport,
  onViewportChange,
  mode,
  onModeChange,
  canvasModeLabel,
  fullPreviewLabel,
  clickToEditHint,
}: SitePagePreviewProps) {
  const html = useMemo(
    () => renderSiteHtmlClient(seo, blocks, siteName, theme),
    [seo, blocks, siteName, theme],
  );

  return (
    <div className="flex flex-col h-full min-h-0 rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-tertiary)]">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <span className="text-xs font-medium text-[var(--text-muted)]">{previewLabel}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onModeChange('canvas')}
            title={canvasModeLabel}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              mode === 'canvas'
                ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <MousePointer2 className="w-3.5 h-3.5" />
            {canvasModeLabel}
          </button>
          <button
            type="button"
            onClick={() => onModeChange('iframe')}
            title={fullPreviewLabel}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              mode === 'iframe'
                ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {fullPreviewLabel}
          </button>
          <span className="w-px h-4 bg-[var(--border-subtle)] mx-1" />
          <button
            type="button"
            onClick={() => onViewportChange('desktop')}
            className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewportChange('mobile')}
            className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div
          className={`bg-white shadow-lg transition-all duration-300 rounded-lg overflow-hidden ${
            viewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
          }`}
          style={{ minHeight: viewport === 'mobile' ? 640 : 480 }}
        >
          {mode === 'canvas' ? (
            <EditableSiteCanvas
              blocks={blocks}
              theme={theme}
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
              onBlockChange={onBlockChange}
              onReorder={onReorder}
              onBannerImagePick={onBannerImagePick}
              clickToEditHint={clickToEditHint}
              dragToReorderLabel={dragToReorderLabel}
              labelFor={labelFor}
            />
          ) : (
            <iframe
              title="site-preview"
              srcDoc={html}
              className="w-full h-full min-h-[480px] border-0"
              sandbox="allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
}
