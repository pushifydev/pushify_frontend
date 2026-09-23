import type { Metadata } from 'next';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import {
  ChangelogEntryList,
  ChangelogPager,
  archivePageCount,
  archiveSlice,
  getChangelogEntries,
} from './../shared';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Changelog Archive',
  description: 'Older Pushify releases — the full history of features, fixes and improvements.',
  alternates: { canonical: '/changelog/archive' },
  openGraph: {
    title: 'Changelog Archive | Pushify',
    url: 'https://pushify.dev/changelog/archive',
  },
};

/** The first archive page: releases 31–60. Later pages live at /changelog/archive/[page]. */
export default async function ChangelogArchivePage() {
  const entries = await getChangelogEntries();
  const pageCount = archivePageCount(entries.length);

  return (
    <MarketingShell>
      <MarketingPageHero
        label="Changelog"
        title="Release archive"
        description="Older Pushify releases. The latest updates live on the main changelog."
      />

      <div className="lp-container max-w-3xl mx-auto pb-24 space-y-6">
        <ChangelogPager page={1} pageCount={pageCount} className="pb-2" />
        <ChangelogEntryList entries={archiveSlice(entries, 1)} />
        <ChangelogPager page={1} pageCount={pageCount} />
      </div>
    </MarketingShell>
  );
}
