'use client';

import { useState, useEffect } from 'react';
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
  ErrorsSection,
  VALID_SECTIONS,
} from './sections';

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
  errors: Shield,
};

function DocsPageContent() {
  const { content: c } = useDocsContent();
  const [activeSection, setActiveSection] = useState<DocsSectionId>('intro');
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState('');

  // Read the ?section= deep-link after mount (client only). Using
  // window.location instead of useSearchParams keeps this route server-rendered
  // (all sections in the HTML for crawlers) instead of bailing to client-only.
  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get('section');
    if (section && VALID_SECTIONS.includes(section as DocsSectionId)) {
      setActiveSection(section as DocsSectionId);
    }
  }, []);

  const navigate = (section: DocsSectionId) => {
    setActiveSection(section);
    setMobileNav(false);
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
    <div className="lp-page docs-page min-h-screen">
      <LandingNavbar />

      <div className="pt-14 md:pt-16">
      {/* Mobile-only strip: just the nav trigger + page name. On desktop the
          sidebar carries the title and actions so the landing navbar stands alone. */}
      <header
        className="lg:hidden sticky top-14 md:top-16 z-40 border-b backdrop-blur-xl"
        style={{ borderColor: 'var(--lp-border)', background: 'color-mix(in srgb, var(--bg-primary) 92%, transparent)' }}
      >
        <div className="lp-container flex items-center gap-3 h-12">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            className="p-1.5 -ml-1.5 rounded-md hover:opacity-70"
            style={{ color: 'var(--lp-muted)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--lp-muted)' }}>
            {c.shell.title}
          </span>
        </div>
      </header>

      <div className="lp-container max-w-7xl flex">
        {mobileNav && (
          <div
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            onClick={() => setMobileNav(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-14 md:top-28 lg:top-16 left-0 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] w-72 lg:w-64 border-r lg:border-0 z-50 lg:z-0 transition-transform lg:translate-x-0 shrink-0 ${
            mobileNav ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--lp-border)' }}
        >
          <div className="flex flex-col h-full p-4 lg:py-8 lg:pr-6 lg:pl-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <span className="text-sm font-semibold docs-h3 mb-0">{c.shell.navigation}</span>
              <button
                type="button"
                onClick={() => setMobileNav(false)}
                className="p-1 rounded-md hover:bg-[var(--hover-overlay-md)]"
                style={{ color: 'var(--lp-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p
              className="hidden lg:block px-3 mb-4 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: 'var(--lp-muted)' }}
            >
              {c.shell.title}
            </p>

            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--lp-muted)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={c.shell.searchPlaceholder}
                className="docs-sidebar-input"
              />
            </div>

            <nav className="space-y-5 flex-1">
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
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="pt-4 mt-4 space-y-2" style={{ borderTop: '1px solid var(--lp-border)' }}>
              <Link
                href="/dashboard/settings"
                className="lp-cta w-full text-sm py-2 px-4 h-auto min-h-0"
              >
                {c.shell.getApiKey}
              </Link>
              <Link
                href="/dashboard"
                className="docs-nav-item justify-center text-center"
              >
                {c.shell.dashboard}
              </Link>
              <div className="flex items-center gap-2 px-3 pt-1 docs-muted-sm">
                <Gauge className="w-3.5 h-3.5" />
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
          <div className={activeSection === 'intro' ? undefined : 'hidden'}>
            <IntroSection c={c} apiBase={API_BASE} onNavigate={navigate} />
          </div>
          <div className={activeSection === 'auth' ? undefined : 'hidden'}>
            <AuthSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'projects' ? undefined : 'hidden'}>
            <ProjectsSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'deployments' ? undefined : 'hidden'}>
            <DeploymentsSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'envvars' ? undefined : 'hidden'}>
            <EnvVarsSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'domains' ? undefined : 'hidden'}>
            <DomainsSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'servers' ? undefined : 'hidden'}>
            <ServersSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'databases' ? undefined : 'hidden'}>
            <DatabasesSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'webhooks' ? undefined : 'hidden'}>
            <WebhooksSection c={c} apiBase={API_BASE} />
          </div>
          <div className={activeSection === 'errors' ? undefined : 'hidden'}>
            <ErrorsSection c={c} apiBase={API_BASE} />
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return <DocsPageContent />;
}
