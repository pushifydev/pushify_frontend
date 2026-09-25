'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';
import { CATEGORY_LABELS, type AppCategory, type CatalogApp } from '@/lib/apps-catalog';
import { AppIcon } from './AppIcon';

const copy = {
  en: {
    label: 'Apps',
    title: 'Self-host the tools you love, in one click',
    intro: 'Open-source apps that install on your own server with HTTPS and a health check. No Dockerfiles to write.',
    filterLabel: 'Filter by category',
    all: 'All',
    count: (n: number) => `${n} apps`,
    moreEyebrow: 'Not listed',
    moreTitle: 'Bring any app with a Dockerfile.',
    moreLead: 'A Dockerfile or docker-compose file in a Git repository deploys as a regular project.',
    start: 'Get started free',
    docs: 'Read the docs',
  },
  tr: {
    label: 'Uygulamalar',
    title: 'Sevdiğiniz araçları tek tıkla kendi sunucunuzda çalıştırın',
    intro: 'Kendi sunucunuza HTTPS ve sağlık kontrolüyle kurulan açık kaynak uygulamalar. Dockerfile yazmanız gerekmez.',
    filterLabel: 'Kategoriye göre filtrele',
    all: 'Tümü',
    count: (n: number) => `${n} uygulama`,
    moreEyebrow: 'Listede yok mu',
    moreTitle: 'Dockerfile’ı olan her uygulamayı getirin.',
    moreLead: 'Git deposunda Dockerfile ya da docker-compose dosyası olan her şey normal bir proje olarak deploy edilir.',
    start: 'Ücretsiz başlayın',
    docs: 'Dokümantasyonu okuyun',
  },
} as const;

const chipBase =
  'hp-mono inline-flex items-center gap-2 h-8 px-3.5 rounded-full border text-[11px] uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

export function AppsIndexView({ groups }: { groups: { category: AppCategory; apps: CatalogApp[] }[] }) {
  const { locale } = useTranslation();
  const lang = locale === 'tr' ? 'tr' : 'en';
  const c = copy[lang];
  const [active, setActive] = useState<AppCategory | 'all'>('all');

  // One grid for the whole catalogue: 24 apps fill four columns exactly, where per-category
  // grids left half-empty rows. The category moves into each cell as a label.
  const all = groups.flatMap((g) => g.apps);
  const shown = active === 'all' ? all : (groups.find((g) => g.category === active)?.apps ?? []);

  const chips: { key: AppCategory | 'all'; label: string; n: number }[] = [
    { key: 'all', label: c.all, n: all.length },
    ...groups.map((g) => ({ key: g.category, label: CATEGORY_LABELS[g.category][lang], n: g.apps.length })),
  ];

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={`${c.label} · ${c.count(all.length)}`} title={c.title} description={c.intro} />

      {/* The one object on this page: the catalogue itself, straight under the hero. */}
      <section id="catalog" aria-label={c.label} className="lp-container pb-20 md:pb-28">
        <div role="group" aria-label={c.filterLabel} className="flex flex-wrap gap-2 mb-8">
          {chips.map((chip) => {
            const on = chip.key === active;
            return (
              <button
                key={chip.key}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(chip.key)}
                className={chipBase}
                style={{
                  borderColor: on ? 'var(--hp-ink)' : 'var(--hp-line-strong)',
                  background: on ? 'var(--hp-btn)' : 'transparent',
                  color: on ? 'var(--hp-btn-fg)' : 'var(--hp-body)',
                  outlineColor: 'var(--hp-ink)',
                }}
              >
                {chip.label}
                <span className="tabular-nums" style={{ opacity: 0.6 }}>
                  {chip.n}
                </span>
              </button>
            );
          })}
        </div>

        <RuleGrid cols={4}>
          {shown.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="group flex flex-col p-6 transition-colors hover:bg-(--hp-card) focus-visible:outline-2 focus-visible:-outline-offset-2"
              style={{ outlineColor: 'var(--hp-ink)' }}
            >
              <span className="hp-mono text-[10.5px] uppercase tracking-widest truncate" style={{ color: 'var(--hp-muted)' }}>
                {CATEGORY_LABELS[app.category][lang]}
              </span>
              <span className="mt-5 flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ border: '1px solid var(--hp-line)', background: 'var(--hp-card)' }}
                >
                  <AppIcon id={app.id} name={app.name} size={18} />
                </span>
                <span className="text-[1.05rem] font-medium truncate" style={{ color: 'var(--hp-ink)' }}>
                  {app.name}
                </span>
                <ArrowRight
                  className="ml-auto w-3.5 h-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  style={{ color: 'var(--hp-ink)' }}
                  aria-hidden="true"
                />
              </span>
              <span className="mt-3 text-[0.9rem] leading-relaxed line-clamp-2" style={{ color: 'var(--hp-body)' }}>
                {app.description}
              </span>
            </Link>
          ))}
        </RuleGrid>
      </section>

      <MSection eyebrow={c.moreEyebrow} title={c.moreTitle} lead={c.moreLead} align="center">
        <div className="-mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="lp-cta group">
            {c.start}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/docs" className="lp-cta-ghost">
            {c.docs}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </MSection>
    </MarketingShell>
  );
}
