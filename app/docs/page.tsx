'use client';

import { useState, useEffect, useCallback, useRef, type ComponentType } from 'react';
import Link from 'next/link';
import {
  Key,
  Folder,
  Rocket,
  Shield,
  BookOpen,
  Globe,
  Server,
  Database,
  Variable,
  Webhook,
  KeyRound,
  Package,
  Activity,
  Menu,
  X,
  Search,
  Gauge,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing';
import { DOCS_API_BASE_URL } from '@/lib/api/public-url';
import { useDocsContent } from '@/hooks/useDocsContent';
import type { DocsSectionId } from '@/lib/i18n/docs';
import {
  IntroSection,
  AuthSection,
  ProjectsSection,
  DeploymentsSection,
  EnvVarsSection,
  DomainsSection,
  ServersSection,
  DatabasesSection,
  WebhooksSection,
  SsoSection,
  BuildSourcesSection,
  MonitoringSection,
  ErrorsSection,
  VALID_SECTIONS,
} from './sections';
import type { SectionProps } from './sections/shared';

const API_BASE = DOCS_API_BASE_URL;

const sectionIcons: Record<DocsSectionId, typeof BookOpen> = {
  intro: BookOpen,
  auth: Key,
  projects: Folder,
  deployments: Rocket,
  envvars: Variable,
  domains: Globe,
  servers: Server,
  databases: Database,
  webhooks: Webhook,
  sso: KeyRound,
  buildSources: Package,
  monitoring: Activity,
  errors: Shield,
};

const sectionComponents: Record<Exclude<DocsSectionId, 'intro'>, ComponentType<SectionProps>> = {
  auth: AuthSection,
  projects: ProjectsSection,
  deployments: DeploymentsSection,
  envvars: EnvVarsSection,
  domains: DomainsSection,
  servers: ServersSection,
  databases: DatabasesSection,
  webhooks: WebhooksSection,
  monitoring: MonitoringSection,
  buildSources: BuildSourcesSection,
  sso: SsoSection,
  errors: ErrorsSection,
};

const isSection = (value: string | null | undefined): value is DocsSectionId =>
  !!value && VALID_SECTIONS.includes(value as DocsSectionId);

function DocsPageContent() {
  const { content: c, locale } = useDocsContent();
  const [activeSection, setActiveSection] = useState<DocsSectionId>('intro');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');
  // A heading id to bring into view once its section is shown (it can't be scrolled to while hidden).
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Resolve the URL to a section: `#projects`, `#auth-scopes` (any heading id), or the
  // older `?section=projects`. Read after mount via window.location instead of
  // useSearchParams, which keeps this route server-rendered (every section in the HTML).
  const syncFromUrl = useCallback(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) {
      if (isSection(hash)) {
        setActiveSection(hash);
        setPendingAnchor(hash === 'intro' ? null : hash);
        return;
      }
      const owner = document
        .getElementById(hash)
        ?.closest<HTMLElement>('[data-docs-section]')?.dataset.docsSection;
      if (isSection(owner)) {
        setActiveSection(owner);
        setPendingAnchor(hash);
        return;
      }
    }
    const section = new URLSearchParams(window.location.search).get('section');
    setActiveSection(isSection(section) ? section : 'intro');
  }, []);

  useEffect(() => {
    // Next frame: the sections must be in the DOM before a heading id can be looked up.
    const frame = requestAnimationFrame(syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, [syncFromUrl]);

  useEffect(() => {
    if (!pendingAnchor) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(pendingAnchor)?.scrollIntoView({ block: 'start' });
      setPendingAnchor(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [pendingAnchor, activeSection]);

  // Mobile drawer: Esc closes it, the page behind doesn't scroll, focus moves in and back.
  useEffect(() => {
    if (!mobileNav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNav(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeButtonRef.current?.focus();
    const trigger = menuButtonRef.current;
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      trigger?.focus({ preventScroll: true });
    };
  }, [mobileNav]);

  const navigate = (section: DocsSectionId) => {
    setActiveSection(section);
    setMobileNav(false);
    const url = section === 'intro' ? window.location.pathname : `${window.location.pathname}#${section}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.pushState(null, '', url);
    }
    requestAnimationFrame(() => {
      document.getElementById('docs-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const filteredGroups = search
    ? c.navGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((i) =>
            i.label.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : c.navGroups;

  return (
    <div className="lp-page hp docs-page min-h-screen overflow-x-clip">
      <LandingNavbar />

      <div className="pt-14 md:pt-16">
      {/* Mobile-only strip: just the nav trigger + page name. On desktop the
          sidebar carries the title and actions so the landing navbar stands alone. */}
      <header
        className="lg:hidden sticky top-14 md:top-16 z-40 border-b backdrop-blur-xl"
        style={{ borderColor: 'var(--hp-line)', background: 'color-mix(in srgb, var(--hp-bg) 92%, transparent)' }}
      >
        <div className="lp-container flex items-center gap-3 h-12">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileNav(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:opacity-70"
            style={{ color: 'var(--hp-ink)' }}
            aria-label={c.shell.navigation}
            aria-expanded={mobileNav}
            aria-controls="docs-sidebar"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="docs-sidebar-title">{c.shell.title}</span>
        </div>
      </header>

      <div className="lp-container max-w-7xl flex">
        {mobileNav && (
          <div
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            aria-hidden="true"
            onClick={() => setMobileNav(false)}
          />
        )}

        <aside
          id="docs-sidebar"
          aria-label={c.shell.navigation}
          className={`fixed lg:sticky top-14 md:top-16 left-0 h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] w-72 max-w-[85vw] lg:w-64 lg:max-w-none border-r z-50 lg:z-0 transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:translate-x-0 lg:visible shrink-0 ${
            mobileNav ? 'translate-x-0 visible' : '-translate-x-full invisible'
          }`}
          style={{ background: 'var(--hp-bg)', borderColor: 'var(--hp-line)' }}
        >
          <div className="flex flex-col h-full p-4 lg:py-8 lg:pr-6 lg:pl-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="docs-sidebar-title">{c.shell.navigation}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileNav(false)}
                className="p-1 rounded-md hover:bg-[var(--hp-line)]"
                style={{ color: 'var(--hp-muted)' }}
                aria-label={locale === 'tr' ? 'Kapat' : 'Close'}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p className="hidden lg:block px-3 mb-4 docs-sidebar-title">{c.shell.title}</p>

            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--hp-muted)' }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={c.shell.searchPlaceholder}
                aria-label={c.shell.searchPlaceholder}
                className="docs-sidebar-input"
              />
            </div>

            <nav className="space-y-5 flex-1">
              {filteredGroups.length === 0 && <p className="docs-empty">{c.shell.noResults}</p>}
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <h3 className="docs-nav-group-label">{group.label}</h3>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = sectionIcons[item.id];
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.id)}
                          className={isActive ? 'docs-nav-item docs-nav-item-active' : 'docs-nav-item'}
                          aria-current={isActive ? 'location' : undefined}
                        >
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="pt-5 mt-5 space-y-2" style={{ borderTop: '1px solid var(--hp-line)' }}>
              <Link href="/dashboard/settings" className="lp-cta w-full">
                {c.shell.getApiKey}
              </Link>
              <Link href="/dashboard" className="lp-cta-ghost w-full">
                {c.shell.dashboard}
              </Link>
              <div className="flex items-center gap-2 px-3 pt-2 docs-sidebar-title">
                <Gauge className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>{c.shell.apiVersion}</span>
              </div>
            </div>
          </div>
        </aside>

        <main
          id="docs-main"
          className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-8 lg:py-10 scroll-mt-[6.5rem] md:scroll-mt-28 lg:scroll-mt-20"
        >
          {/* All sections are rendered into the HTML (crawlable); only the
              active one is shown. Inactive sections are hidden, not unmounted. */}
          <section data-docs-section="intro" hidden={activeSection !== 'intro'}>
            <IntroSection c={c} apiBase={API_BASE} onNavigate={navigate} />
          </section>
          {(Object.keys(sectionComponents) as (keyof typeof sectionComponents)[]).map((id) => {
            const Section = sectionComponents[id];
            return (
              <section key={id} data-docs-section={id} hidden={activeSection !== id}>
                <Section c={c} apiBase={API_BASE} />
              </section>
            );
          })}
        </main>
      </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return <DocsPageContent />;
}
