import type { Metadata } from 'next';
import { MarketingShell } from '@/components/landing';
import { ChangelogHero } from '../copy';
import {
  ChangelogEntryList,
  ChangelogPager,
  archivePageCount,
  archiveSlice,
  getChangelogEntries,
} from './../shared';
import { OG_IMAGE } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Changelog Archive',
  description: 'Older Pushify releases — the full history of features, fixes and improvements.',
  alternates: { canonical: '/changelog/archive' },
  openGraph: {
    images: OG_IMAGE,
    title: 'Changelog Archive | Pushify',
    url: 'https://pushify.dev/changelog/archive',
  },
};

/** The first archive page: releases 31–60. Later pages live at /changelog/archive/[page]. */
export default async function ChangelogArchivePage() {
  const entries = await getChangelogEntries();
  const pageCount = archivePageCount(entries.length);

  return (
    <MarketingShell noPad>
      <ChangelogHero archive />

      <div className="lp-container max-w-5xl mx-auto pb-24 md:pb-32">
        <ChangelogPager page={1} pageCount={pageCount} className="pb-2" />
        <ChangelogEntryList entries={archiveSlice(entries, 1)} />
        <ChangelogPager page={1} pageCount={pageCount} />
      </div>
    </MarketingShell>
  );
}
