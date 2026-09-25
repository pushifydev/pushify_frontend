'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';

/** The changelog's page chrome in the reader's language. Release notes themselves are English. */
const copy = {
  en: {
    label: 'Changelog',
    latestTitle: 'What’s new in Pushify',
    latestDescription:
      'Every release across the platform, API and dashboard — features, fixes and improvements as they ship.',
    archiveTitle: 'Release archive',
    archiveDescription: 'Older Pushify releases. The latest updates live on the main changelog.',
    older: (n: number) => `View ${n} older releases`,
    latest: 'Latest releases',
    newer: 'Newer releases',
    olderPage: 'Older releases',
    page: (p: number, total: number) => `Page ${p} of ${total}`,
    pagerLabel: 'Changelog archive pages',
    unavailable: 'The changelog could not be loaded right now. You can read it directly on GitHub:',
    board: 'Latest release per repo',
    changes: (n: number) => `${n} ${n === 1 ? 'change' : 'changes'}`,
    rss: 'RSS feed',
  },
  tr: {
    label: 'Değişiklik günlüğü',
    latestTitle: 'Pushify’da neler yeni',
    latestDescription:
      'Platform, API ve paneldeki her sürüm — yayınlandıkça yeni özellikler, düzeltmeler ve iyileştirmeler. Sürüm notları İngilizce.',
    archiveTitle: 'Sürüm arşivi',
    archiveDescription: 'Pushify’ın eski sürümleri. En son güncellemeler ana değişiklik günlüğünde.',
    older: (n: number) => `${n} eski sürümü gör`,
    latest: 'Son sürümler',
    newer: 'Daha yeni sürümler',
    olderPage: 'Daha eski sürümler',
    page: (p: number, total: number) => `Sayfa ${p} / ${total}`,
    pagerLabel: 'Değişiklik günlüğü arşiv sayfaları',
    unavailable: 'Değişiklik günlüğü şu anda yüklenemedi. Doğrudan GitHub’da okuyabilirsiniz:',
    board: 'Her deponun son sürümü',
    changes: (n: number) => `${n} değişiklik`,
    rss: 'RSS akışı',
  },
};

function useCopy() {
  const { locale } = useTranslation();
  return locale === 'tr' ? copy.tr : copy.en;
}

export function ChangelogHero({ archive = false }: { archive?: boolean }) {
  const c = useCopy();
  return (
    <MarketingPageHero
      label={c.label}
      title={archive ? c.archiveTitle : c.latestTitle}
      description={archive ? c.archiveDescription : c.latestDescription}
    />
  );
}

/** The page's one object: a status board with the newest release of each repo, from the same data as the list. */
export function LatestReleaseBoard({
  rows,
}: {
  rows: { key: string; label: string; version: string; date: string; changes: number; href: string }[];
}) {
  const c = useCopy();
  return (
    <div className="hp-card" style={{ width: '100%' }}>
      <div className="hp-card-head">
        <span>
          <span className="hp-dot" aria-hidden="true" />
          {c.board}
        </span>
        <a href="/changelog/rss.xml" className="underline-offset-4 hover:underline" style={{ color: 'var(--hp-ink)' }}>
          {c.rss}
        </a>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li key={r.key} style={i > 0 ? { borderTop: '1px solid var(--hp-line)' } : undefined}>
            <a
              href={r.href}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[11rem_1fr_auto] items-baseline gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-(--hp-line)"
            >
              <span lang="en" style={{ color: 'var(--hp-muted)' }}>
                {r.label}
              </span>
              <span className="order-3 sm:order-none col-span-2 sm:col-span-1 font-mono text-[0.85rem]" style={{ color: 'var(--hp-ink)' }}>
                v{r.version}
                <span className="ml-3" style={{ color: 'var(--hp-muted)' }}>
                  {c.changes(r.changes)}
                </span>
              </span>
              <time dateTime={r.date} className="tabular-nums text-right" style={{ color: 'var(--hp-body)' }}>
                {r.date}
              </time>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OlderReleasesLink({ count }: { count: number }) {
  const c = useCopy();
  return (
    <div className="flex justify-center pt-12">
      <Link href="/changelog/archive" className="lp-cta-ghost">
        {c.older(count)}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function ChangelogUnavailableNote({ links }: { links: { key: string; label: string; href: string }[] }) {
  const c = useCopy();
  return (
    <div className="border-t py-10 text-[15px] leading-relaxed" style={{ borderColor: 'var(--hp-line)', color: 'var(--hp-body)' }}>
      {c.unavailable}{' '}
      {links.map((l, i) => (
        <span key={l.key}>
          {i > 0 && ' · '}
          <a href={l.href} className="underline underline-offset-4" style={{ color: 'var(--hp-ink)' }}>
            {l.label}
          </a>
        </span>
      ))}
    </div>
  );
}

export function ChangelogPagerNav({
  page,
  pageCount,
  newerHref,
  olderHref,
  className,
}: {
  page: number;
  pageCount: number;
  newerHref: string;
  olderHref: string | null;
  className: string;
}) {
  const c = useCopy();
  const link =
    'inline-flex items-center gap-1.5 hp-mono text-[12px] uppercase tracking-[0.1em] underline-offset-4 hover:underline';

  return (
    <nav className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 ${className}`} aria-label={c.pagerLabel}>
      <Link href={newerHref} className={link} style={{ color: 'var(--hp-ink)' }} rel="prev">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        {page <= 1 ? c.latest : c.newer}
      </Link>

      <span className="hp-mono text-[12px] uppercase tracking-[0.1em] tabular-nums" style={{ color: 'var(--hp-muted)' }}>
        {c.page(page, pageCount)}
      </span>

      {olderHref ? (
        <Link href={olderHref} className={link} style={{ color: 'var(--hp-ink)' }} rel="next">
          {c.olderPage}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
