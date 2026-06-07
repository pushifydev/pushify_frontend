'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Palette,
  Database,
  Save,
  Rocket,
  RefreshCw,
  Eye,
  BookOpen,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  useSiteEditor,
  useUpdateSiteSeo,
  useUpdateSiteBlocks,
  useUpdateSiteTheme,
  useUpdateSiteCms,
  usePublishSite,
} from '@/hooks/useSiteEditor';
import type { SiteBlock, SiteSeo, SiteBlockType, CmsMode } from '@/lib/api';
import { uploadSiteImage } from '@/lib/api';
import { toast } from 'sonner';
import { DEFAULT_SITE_THEME, normalizeSiteTheme } from '@/lib/site-editor/theme';
import { createDefaultBlock, duplicateBlock } from '@/lib/site-editor/block-factory';
import { BlockLayers } from './BlockLayers';
import { BlockPalette } from './BlockPalette';
import { BlockInspector } from './BlockInspector';
import { ThemePanel } from './ThemePanel';
import { SitePagePreview, type PreviewMode } from './SitePagePreview';
import { ImageUploadField } from './ImageUploadField';

type Tab = 'design' | 'cms' | 'headless';
type RightPanel = 'block' | 'theme';

interface SiteEditorViewProps {
  projectId: string;
  projectName?: string;
}

export function SiteEditorView({ projectId, projectName }: SiteEditorViewProps) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useSiteEditor(projectId);
  const updateSeo = useUpdateSiteSeo(projectId);
  const updateBlocks = useUpdateSiteBlocks(projectId);
  const updateTheme = useUpdateSiteTheme(projectId);
  const updateCms = useUpdateSiteCms(projectId);
  const publish = usePublishSite(projectId);

  const [tab, setTab] = useState<Tab>('design');
  const [rightPanel, setRightPanel] = useState<RightPanel>('block');
  const [seo, setSeo] = useState<SiteSeo>({ title: '', description: '', ogImage: '', keywords: '' });
  const [blocks, setBlocks] = useState<SiteBlock[]>([]);
  const [theme, setTheme] = useState(DEFAULT_SITE_THEME);
  const [cmsMode, setCmsMode] = useState<CmsMode>('builtin');
  const [cmsApiUrl, setCmsApiUrl] = useState('');
  const [cmsToken, setCmsToken] = useState('');
  const [cmsCollection, setCmsCollection] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('canvas');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!data) return;
    setSeo(data.seo);
    setBlocks(data.blocks);
    setTheme(normalizeSiteTheme(data.theme));
    setCmsMode(data.cmsConfig.mode);
    setCmsApiUrl(data.cmsConfig.apiUrl ?? '');
    setCmsCollection(data.cmsConfig.collection ?? '');
    if (!selectedBlockId && data.blocks[0]) {
      setSelectedBlockId(data.blocks[0].id);
    }
    setDirty(false);
  }, [data, selectedBlockId]);

  const blockLabel = useCallback(
    (block: SiteBlock) => {
      const map: Record<SiteBlock['type'], string> = {
        hero: t('siteEditor', 'blockHero'),
        banner: t('siteEditor', 'blockBanner'),
        features: t('siteEditor', 'blockFeatures'),
        stats: t('siteEditor', 'blockStats'),
        text: t('siteEditor', 'blockText'),
        pricing: t('siteEditor', 'blockPricing'),
        faq: t('siteEditor', 'blockFaq'),
        cta: t('siteEditor', 'blockCta'),
        footer: t('siteEditor', 'blockFooter'),
      };
      return map[block.type];
    },
    [t],
  );

  const paletteLabel = (type: SiteBlockType) => blockLabel({ id: '', type } as SiteBlock);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const markDirty = () => setDirty(true);

  const updateBlockById = (id: string, patch: Partial<SiteBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } as SiteBlock : b)),
    );
    markDirty();
  };

  const updateSelectedBlock = (patch: Partial<SiteBlock>) => {
    if (!selectedBlock) return;
    updateBlockById(selectedBlock.id, patch);
  };

  const handleBannerImagePick = async (blockId: string, file: File) => {
    const result = await uploadSiteImage(projectId, file);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    const url = result.data?.imageUrl;
    if (url) {
      updateBlockById(blockId, { imageUrl: url });
      setSelectedBlockId(blockId);
      setRightPanel('block');
    }
  };

  const handleSaveDesign = async () => {
    await Promise.all([
      updateBlocks.mutateAsync(blocks),
      updateTheme.mutateAsync(theme),
    ]);
    setDirty(false);
  };

  const handleAddBlock = (type: SiteBlockType) => {
    const block = createDefaultBlock(type, data?.siteName);
    setBlocks((prev) => {
      if (type === 'footer') {
        const withoutFooter = prev.filter((b) => b.type !== 'footer');
        return [...withoutFooter, block];
      }
      const footerIdx = prev.findIndex((b) => b.type === 'footer');
      if (footerIdx >= 0) {
        const next = [...prev];
        next.splice(footerIdx, 0, block);
        return next;
      }
      return [...prev, block];
    });
    setSelectedBlockId(block.id);
    setRightPanel('block');
    markDirty();
  };

  const handleDuplicate = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const copy = duplicateBlock(block);
    const idx = blocks.findIndex((b) => b.id === id);
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
    setSelectedBlockId(copy.id);
    markDirty();
  };

  const handleDelete = (id: string) => {
    if (blocks.length <= 1) return;
    const next = blocks.filter((b) => b.id !== id);
    setBlocks(next);
    if (selectedBlockId === id) {
      setSelectedBlockId(next[0]?.id ?? null);
    }
    markDirty();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded" />
        <div className="h-[70vh] bg-[var(--bg-secondary)] rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-[var(--border-subtle)] p-6 text-center">
        <p className="text-[var(--text-secondary)]">{t('siteEditor', 'loadError')}</p>
        <Link href={`/dashboard/projects/${projectId}`} className="btn btn-secondary btn-sm mt-4">
          {t('siteEditor', 'backToProject')}
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'design', label: t('siteEditor', 'tabDesign'), icon: <Palette className="w-4 h-4" /> },
    { id: 'cms', label: t('siteEditor', 'tabCms'), icon: <Globe className="w-4 h-4" /> },
    { id: 'headless', label: t('siteEditor', 'tabHeadless'), icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="dash-page min-w-0 flex flex-col h-[calc(100vh-4rem)] pb-4 animate-slide-in">
      <header className="shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-bold">
              {t('siteEditor', 'badge')}
            </p>
            <h1 className="text-lg font-bold truncate">{projectName || data.siteName}</h1>
          </div>
          {dirty && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              {t('siteEditor', 'unsaved')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === 'design' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSaveDesign}
              disabled={updateBlocks.isPending || updateTheme.isPending || !dirty}
            >
              <Save className="w-4 h-4" />
              {t('siteEditor', 'saveDesign')}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={async () => {
              if (dirty) await handleSaveDesign();
              publish.mutate();
            }}
            disabled={publish.isPending}
          >
            {publish.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            {t('siteEditor', 'publish')}
          </button>
        </div>
      </header>

      <div className="shrink-0 flex gap-1 border-b border-[var(--border-subtle)] mb-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === item.id
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'design' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[240px_1fr_280px] gap-4">
          <aside className="hidden xl:flex flex-col gap-4 overflow-y-auto pr-1">
            <BlockPalette onAdd={handleAddBlock} title={t('siteEditor', 'addBlock')} labelFor={paletteLabel} />
            <BlockLayers
              blocks={blocks}
              selectedId={selectedBlockId}
              onSelect={(id) => {
                setSelectedBlockId(id);
                setPreviewMode('canvas');
                setRightPanel('block');
              }}
              onReorder={(next) => {
                setBlocks(next);
                markDirty();
              }}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              labelFor={blockLabel}
              layersTitle={t('siteEditor', 'layersTitle')}
              duplicateLabel={t('siteEditor', 'duplicate')}
              deleteLabel={t('siteEditor', 'deleteBlock')}
            />
          </aside>

          <main className="min-h-0 flex flex-col">
            <SitePagePreview
              seo={seo}
              blocks={blocks}
              siteName={data.siteName}
              theme={theme}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onBlockChange={updateBlockById}
              onBannerImagePick={handleBannerImagePick}
              previewLabel={t('siteEditor', 'livePreview')}
              viewport={viewport}
              onViewportChange={setViewport}
              mode={previewMode}
              onModeChange={setPreviewMode}
              canvasModeLabel={t('siteEditor', 'canvasMode')}
              fullPreviewLabel={t('siteEditor', 'fullPreview')}
              clickToEditHint={t('siteEditor', 'clickToEditHint')}
            />
          </main>

          <aside className="min-h-0 flex flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex border-b border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setRightPanel('block')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
                  rightPanel === 'block'
                    ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {t('siteEditor', 'inspectorTab')}
              </button>
              <button
                type="button"
                onClick={() => setRightPanel('theme')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
                  rightPanel === 'theme'
                    ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                {t('siteEditor', 'themeTab')}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {rightPanel === 'block' ? (
                <BlockInspector
                  projectId={projectId}
                  block={selectedBlock}
                  onChange={updateSelectedBlock}
                  t={(key) => t('siteEditor', key as keyof import('@/lib/i18n').TranslationKeys['siteEditor'])}
                  emptyLabel={t('siteEditor', 'selectBlock')}
                />
              ) : (
                <ThemePanel
                  theme={theme}
                  onChange={(patch) => {
                    setTheme((prev) => ({ ...prev, ...patch }));
                    markDirty();
                  }}
                  t={(key) => t('siteEditor', key as keyof import('@/lib/i18n').TranslationKeys['siteEditor'])}
                />
              )}
            </div>
          </aside>

          <div className="xl:hidden space-y-4 col-span-1">
            <BlockPalette onAdd={handleAddBlock} title={t('siteEditor', 'addBlock')} labelFor={paletteLabel} />
            <BlockLayers
              blocks={blocks}
              selectedId={selectedBlockId}
              onSelect={(id) => {
                setSelectedBlockId(id);
                setPreviewMode('canvas');
                setRightPanel('block');
              }}
              onReorder={(next) => {
                setBlocks(next);
                markDirty();
              }}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              labelFor={blockLabel}
              layersTitle={t('siteEditor', 'layersTitle')}
              duplicateLabel={t('siteEditor', 'duplicate')}
              deleteLabel={t('siteEditor', 'deleteBlock')}
            />
          </div>
        </div>
      )}

      {tab === 'cms' && (
        <div className="overflow-y-auto max-w-2xl space-y-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {t('siteEditor', 'cmsBridgeTitle')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{t('siteEditor', 'cmsBridgeDesc')}</p>
            <div className="flex flex-wrap gap-2">
              {data.cmsBridge.adminUrl && (
                <a href={data.cmsBridge.adminUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  <ExternalLink className="w-4 h-4" />
                  {data.cmsBridge.label}
                </a>
              )}
              {data.previewUrl && (
                <a href={data.previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                  <Eye className="w-4 h-4" />
                  {t('siteEditor', 'openLiveSite')}
                </a>
              )}
              {data.cmsBridge.docsUrl && (
                <a href={data.cmsBridge.docsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  <BookOpen className="w-4 h-4" />
                  {t('siteEditor', 'cmsDocs')}
                </a>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 space-y-4">
            <h2 className="font-semibold">{t('siteEditor', 'seoTitle')}</h2>
            <Field label={t('siteEditor', 'seoPageTitle')} value={seo.title} onChange={(v) => setSeo((s) => ({ ...s, title: v }))} />
            <Field label={t('siteEditor', 'seoDescription')} value={seo.description} onChange={(v) => setSeo((s) => ({ ...s, description: v }))} multiline />
            <ImageUploadField
              projectId={projectId}
              value={seo.ogImage}
              onChange={(v) => setSeo((s) => ({ ...s, ogImage: v }))}
              label={t('siteEditor', 'seoOgImage')}
              uploadLabel={t('siteEditor', 'uploadImage')}
              uploadingLabel={t('siteEditor', 'uploading')}
            />
            <Field label={t('siteEditor', 'seoKeywords')} value={seo.keywords} onChange={(v) => setSeo((s) => ({ ...s, keywords: v }))} />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => updateSeo.mutate(seo)} disabled={updateSeo.isPending}>
              <Save className="w-4 h-4" />
              {t('siteEditor', 'saveSeo')}
            </button>
          </div>
        </div>
      )}

      {tab === 'headless' && (
        <div className="overflow-y-auto max-w-2xl rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 space-y-4">
          <h2 className="font-semibold">{t('siteEditor', 'headlessTitle')}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{t('siteEditor', 'headlessDesc')}</p>
          <label className="block space-y-1">
            <span className="text-sm text-[var(--text-secondary)]">{t('siteEditor', 'cmsMode')}</span>
            <select className="select w-full" value={cmsMode} onChange={(e) => setCmsMode(e.target.value as CmsMode)}>
              <option value="builtin">{t('siteEditor', 'modeBuiltin')}</option>
              <option value="strapi">{t('siteEditor', 'modeStrapi')}</option>
              <option value="directus">{t('siteEditor', 'modeDirectus')}</option>
            </select>
          </label>
          {cmsMode !== 'builtin' && (
            <>
              <Field label={t('siteEditor', 'apiUrl')} value={cmsApiUrl} onChange={setCmsApiUrl} />
              <label className="block space-y-1">
                <span className="text-sm text-[var(--text-secondary)]">
                  {t('siteEditor', 'apiToken')}
                  {data.cmsConfig.hasApiToken ? ` (${t('siteEditor', 'tokenSet')})` : ''}
                </span>
                <input className="input w-full" type="password" value={cmsToken} onChange={(e) => setCmsToken(e.target.value)} />
              </label>
              <Field label={t('siteEditor', 'collection')} value={cmsCollection} onChange={setCmsCollection} />
            </>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() =>
              updateCms.mutate({
                mode: cmsMode,
                apiUrl: cmsApiUrl || undefined,
                apiToken: cmsToken || undefined,
                collection: cmsCollection || undefined,
              })
            }
            disabled={updateCms.isPending}
          >
            <Save className="w-4 h-4" />
            {t('siteEditor', 'saveCms')}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      {multiline ? (
        <textarea className="textarea w-full" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input w-full" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
