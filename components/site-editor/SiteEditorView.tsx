'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Palette,
  Save,
  Rocket,
  RefreshCw,
  Eye,
  BookOpen,
  SlidersHorizontal,
  LayoutGrid,
  Search,
  Settings,
  Monitor,
  Smartphone,
  MousePointer2,
  Maximize2,
  Files,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import {
  useSiteEditor,
  useUpdateSiteTheme,
  useUpdateSiteCms,
  useUpdateSitePages,
  usePublishSite,
} from '@/hooks/useSiteEditor';
import type { SiteBlock, SiteSeo, SiteBlockType, CmsMode, SitePage } from '@/lib/api';
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
import { DesignGallery } from './DesignGallery';
import { PagesPanel } from './PagesPanel';
import { ToolbarToggle, SectionHeading, Field } from './parts';

type Section = 'pages' | 'blocks' | 'design' | 'seo' | 'cms' | 'settings';

interface SiteEditorViewProps {
  projectId: string;
  projectName?: string;
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function SiteEditorView({ projectId, projectName }: SiteEditorViewProps) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useSiteEditor(projectId);
  const updateTheme = useUpdateSiteTheme(projectId);
  const updateCms = useUpdateSiteCms(projectId);
  const updatePages = useUpdateSitePages(projectId);
  const publish = usePublishSite(projectId);

  const [section, setSection] = useState<Section>('pages');
  const [pages, setPages] = useState<SitePage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
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

  // Load editor state. Runs on every refetch (save/apply-template); keeps the active page if
  // it still exists (so saving doesn't bounce you back to Home), else falls back to Home.
  useEffect(() => {
    if (!data) return;
    const pgs: SitePage[] =
      data.pages && data.pages.length > 0
        ? data.pages
        : [{ id: 'home', title: 'Home', slug: '', blocks: data.blocks, seo: data.seo }];
    setPages(pgs);
    const active = pgs.find((p) => p.id === activePageId) ?? pgs[0];
    setActivePageId(active.id);
    setBlocks(active.blocks);
    setSeo(active.seo);
    setTheme(normalizeSiteTheme(data.theme));
    setCmsMode(data.cmsConfig.mode);
    setCmsApiUrl(data.cmsConfig.apiUrl ?? '');
    setCmsCollection(data.cmsConfig.collection ?? '');
    setSelectedBlockId((prev) =>
      prev && active.blocks.some((b) => b.id === prev) ? prev : active.blocks[0]?.id ?? null,
    );
    setDirty(false);
    // activePageId intentionally omitted: switching pages must not re-trigger a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as SiteBlock) : b)));
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
    }
  };

  // Fold the in-progress edits to the active page back into the pages array.
  const commitActivePage = useCallback(
    (): SitePage[] => pages.map((p) => (p.id === activePageId ? { ...p, blocks, seo } : p)),
    [pages, activePageId, blocks, seo],
  );

  const switchPage = (id: string) => {
    if (id === activePageId) return;
    const committed = commitActivePage();
    const target = committed.find((p) => p.id === id);
    if (!target) return;
    setPages(committed);
    setActivePageId(id);
    setBlocks(target.blocks);
    setSeo(target.seo);
    setSelectedBlockId(target.blocks[0]?.id ?? null);
    setPreviewMode('canvas');
  };

  const addPage = () => {
    const title = window.prompt(t('siteEditor', 'pageNamePrompt'));
    if (!title || !title.trim()) return;
    const committed = commitActivePage();
    const newPage: SitePage = {
      id: crypto.randomUUID(),
      title: title.trim(),
      slug: slugify(title) || `page-${committed.length}`,
      blocks: [createDefaultBlock('hero', data?.siteName), createDefaultBlock('footer', data?.siteName)],
      seo: { title: title.trim(), description: '', ogImage: '', keywords: '' },
    };
    setPages([...committed, newPage]);
    setActivePageId(newPage.id);
    setBlocks(newPage.blocks);
    setSeo(newPage.seo);
    setSelectedBlockId(newPage.blocks[0]?.id ?? null);
    markDirty();
  };

  const renamePage = (id: string) => {
    const page = pages.find((p) => p.id === id);
    const title = window.prompt(t('siteEditor', 'pageNamePrompt'), page?.title ?? '');
    if (!title || !title.trim()) return;
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title: title.trim() } : p)));
    markDirty();
  };

  const deletePage = (id: string) => {
    if (pages[0]?.id === id) return; // Home can't be deleted.
    if (!window.confirm(t('siteEditor', 'deletePageConfirm'))) return;
    const committed = commitActivePage().filter((p) => p.id !== id);
    setPages(committed);
    if (activePageId === id) {
      const home = committed[0];
      setActivePageId(home.id);
      setBlocks(home.blocks);
      setSeo(home.seo);
      setSelectedBlockId(home.blocks[0]?.id ?? null);
    }
    markDirty();
  };

  const handleSave = async () => {
    const committed = commitActivePage();
    setPages(committed);
    await Promise.all([updatePages.mutateAsync(committed), updateTheme.mutateAsync(theme)]);
    setDirty(false);
  };

  const handleAddBlock = (type: SiteBlockType) => {
    const block = createDefaultBlock(type, data?.siteName);
    setBlocks((prev) => {
      // Footer is unique and always pinned to the very end.
      if (type === 'footer') {
        const withoutFooter = prev.filter((b) => b.type !== 'footer');
        return [...withoutFooter, block];
      }
      const footerIdx = prev.findIndex((b) => b.type === 'footer');
      const selIdx = prev.findIndex((b) => b.id === selectedBlockId);
      let insertAt =
        selIdx >= 0 && prev[selIdx].type !== 'footer'
          ? selIdx + 1
          : footerIdx >= 0
            ? footerIdx
            : prev.length;
      if (footerIdx >= 0 && insertAt > footerIdx) insertAt = footerIdx;
      const next = [...prev];
      next.splice(insertAt, 0, block);
      return next;
    });
    setSelectedBlockId(block.id);
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

  const publishAll = async () => {
    if (dirty) await handleSave();
    publish.mutate();
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

  const tt = (key: string) =>
    t('siteEditor', key as keyof import('@/lib/i18n').TranslationKeys['siteEditor']);

  const sections: { id: Section; label: string; icon: typeof Palette }[] = [
    { id: 'pages', label: t('siteEditor', 'navPages'), icon: Files },
    { id: 'blocks', label: t('siteEditor', 'navBlocks'), icon: LayoutGrid },
    { id: 'design', label: t('siteEditor', 'tabDesign'), icon: Palette },
    { id: 'seo', label: t('siteEditor', 'navSeo'), icon: Search },
    { id: 'cms', label: t('siteEditor', 'tabCms'), icon: Globe },
    { id: 'settings', label: t('siteEditor', 'navSettings'), icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[var(--bg-primary)] animate-fade-in">
      {/* ── Top toolbar ── */}
      <header className="shrink-0 h-14 flex items-center justify-between gap-3 px-3 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
            title={t('siteEditor', 'backToProject')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0 leading-tight">
            <p className="text-[9px] uppercase tracking-widest text-[var(--accent-primary)] font-bold">
              {t('siteEditor', 'badge')}
            </p>
            <h1 className="text-sm font-bold truncate max-w-[36vw]">{projectName || data.siteName}</h1>
          </div>
          {dirty && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              ● {t('siteEditor', 'unsaved')}
            </span>
          )}
        </div>

        {/* device + mode */}
        <div className="hidden md:flex items-center gap-0.5 rounded-lg border border-[var(--border-subtle)] p-0.5 bg-[var(--bg-primary)]">
          <ToolbarToggle active={previewMode === 'canvas'} onClick={() => setPreviewMode('canvas')} icon={MousePointer2} label={t('siteEditor', 'canvasMode')} />
          <ToolbarToggle active={previewMode === 'iframe'} onClick={() => setPreviewMode('iframe')} icon={Maximize2} label={t('siteEditor', 'fullPreview')} />
          <span className="w-px h-5 bg-[var(--border-subtle)] mx-1" />
          <ToolbarToggle active={viewport === 'desktop'} onClick={() => setViewport('desktop')} icon={Monitor} />
          <ToolbarToggle active={viewport === 'mobile'} onClick={() => setViewport('mobile')} icon={Smartphone} />
        </div>

        <div className="flex items-center gap-2">
          {data.previewUrl && (
            <a
              href={data.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm hidden lg:inline-flex"
            >
              <Eye className="w-4 h-4" />
              {t('siteEditor', 'openLiveSite')}
            </a>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSave}
            disabled={updatePages.isPending || updateTheme.isPending || !dirty}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{t('siteEditor', 'saveDesign')}</span>
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={publishAll} disabled={publish.isPending}>
            {publish.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            <span className="hidden sm:inline">{t('siteEditor', 'publish')}</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0">
        {/* icon rail */}
        <nav className="shrink-0 w-16 flex flex-col items-center gap-1 py-3 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          {sections.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                title={s.label}
                className={`w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-medium transition-colors ${
                  active
                    ? 'bg-[var(--accent-primary)]/12 text-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        {/* contextual left panel */}
        <aside className="shrink-0 w-72 hidden md:flex flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 gap-5">
          {section === 'pages' && (
            <PagesPanel
              pages={pages}
              activePageId={activePageId}
              onSelect={switchPage}
              onAdd={addPage}
              onRename={renamePage}
              onDelete={deletePage}
            />
          )}

          {section === 'blocks' && (
            <>
              <BlockPalette onAdd={handleAddBlock} title={t('siteEditor', 'addBlock')} labelFor={paletteLabel} />
              <BlockLayers
                blocks={blocks}
                selectedId={selectedBlockId}
                onSelect={(id) => {
                  setSelectedBlockId(id);
                  setPreviewMode('canvas');
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
            </>
          )}

          {section === 'design' && (
            <>
              <DesignGallery
                projectId={projectId}
                currentPrimary={theme.primaryColor}
                onApplyTheme={(patch) => {
                  setTheme((prev) => ({ ...prev, ...patch }));
                  markDirty();
                }}
              />
              <div className="pt-1 border-t border-[var(--border-subtle)]">
                <ThemePanel
                  theme={theme}
                  onChange={(patch) => {
                    setTheme((prev) => ({ ...prev, ...patch }));
                    markDirty();
                  }}
                  t={tt}
                />
              </div>
            </>
          )}

          {section === 'seo' && (
            <div className="space-y-4">
              <SectionHeading icon={Search} title={t('siteEditor', 'seoTitle')} />
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
              <button type="button" className="btn btn-primary btn-sm w-full" onClick={handleSave} disabled={updatePages.isPending}>
                <Save className="w-4 h-4" />
                {t('siteEditor', 'saveSeo')}
              </button>
            </div>
          )}

          {section === 'cms' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <SectionHeading icon={Globe} title={t('siteEditor', 'cmsBridgeTitle')} />
                <p className="text-xs text-[var(--text-secondary)]">{t('siteEditor', 'cmsBridgeDesc')}</p>
                <div className="flex flex-col gap-2">
                  {data.cmsBridge.adminUrl && (
                    <a href={data.cmsBridge.adminUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm w-full">
                      <ExternalLink className="w-4 h-4" />
                      {data.cmsBridge.label}
                    </a>
                  )}
                  {data.cmsBridge.docsUrl && (
                    <a href={data.cmsBridge.docsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm w-full">
                      <BookOpen className="w-4 h-4" />
                      {t('siteEditor', 'cmsDocs')}
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-1 border-t border-[var(--border-subtle)]">
                <SectionHeading icon={RefreshCw} title={t('siteEditor', 'headlessTitle')} />
                <p className="text-xs text-[var(--text-secondary)]">{t('siteEditor', 'headlessDesc')}</p>
                <label className="block space-y-1">
                  <span className="text-xs text-[var(--text-secondary)]">{t('siteEditor', 'cmsMode')}</span>
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
                      <span className="text-xs text-[var(--text-secondary)]">
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
                  className="btn btn-primary btn-sm w-full"
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
            </div>
          )}

          {section === 'settings' && (
            <div className="space-y-4">
              <SectionHeading icon={Settings} title={t('siteEditor', 'navSettings')} />
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 space-y-1.5">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-semibold">{t('siteEditor', 'badge')}</p>
                <p className="text-sm font-medium truncate">{projectName || data.siteName}</p>
                {data.previewUrl && (
                  <a href={data.previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent-primary)] hover:underline break-all inline-flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    {data.previewUrl}
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {data.previewUrl && (
                  <a href={data.previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-full">
                    <Eye className="w-4 h-4" />
                    {t('siteEditor', 'openLiveSite')}
                  </a>
                )}
                <button type="button" className="btn btn-primary btn-sm w-full" onClick={publishAll} disabled={publish.isPending}>
                  {publish.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  {t('siteEditor', 'publish')}
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* canvas */}
        <main className="flex-1 min-h-0 flex flex-col bg-[var(--bg-tertiary)]">
          <SitePagePreview
            chromeless
            seo={seo}
            blocks={blocks}
            siteName={data.siteName}
            theme={theme}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onBlockChange={updateBlockById}
            onReorder={(next) => {
              setBlocks(next);
              markDirty();
            }}
            onBannerImagePick={handleBannerImagePick}
            dragToReorderLabel={t('siteEditor', 'dragToReorder')}
            labelFor={blockLabel}
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

        {/* right inspector */}
        <aside className="shrink-0 w-80 hidden lg:flex flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="shrink-0 px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="w-4 h-4 text-[var(--accent-primary)]" />
            {t('siteEditor', 'inspectorTab')}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <BlockInspector
              projectId={projectId}
              block={selectedBlock}
              onChange={updateSelectedBlock}
              t={tt}
              emptyLabel={t('siteEditor', 'selectBlock')}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
