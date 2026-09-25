import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarketingShell } from '@/components/landing';
import { ChangelogHero } from '../../copy';
import {
  ChangelogEntryList,
  ChangelogPager,
  archivePageCount,
  archiveSlice,
  getChangelogEntries,
} from './../../shared';
import { OG_IMAGE } from '@/lib/seo';

export const revalidate = 3600;

type Params = { params: Promise<{ page: string }> };

/**
 * Archive pages 2 and up. Page 1 keeps the bare /changelog/archive URL, so it is deliberately
 * absent here — otherwise the same releases would answer on two addresses.
 */
export async function generateStaticParams() {
  const entries = await getChangelogEntries();
  const pageCount = archivePageCount(entries.length);
  return Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Changelog Archive — page ${page}`,
    description: 'Older Pushify releases — the full history of features, fixes and improvements.',
    alternates: { canonical: `/changelog/archive/${page}` },
    openGraph: {
      images: OG_IMAGE,
      title: `Changelog Archive — page ${page} | Pushify`,
      url: `https://pushify.dev/changelog/archive/${page}`,
    },
  };
}

export default async function ChangelogArchivePagedPage({ params }: Params) {
  const { page: raw } = await params;
  const page = Number(raw);

  const entries = await getChangelogEntries();
  const pageCount = archivePageCount(entries.length);

  // `/changelog/archive/1` would duplicate `/changelog/archive`, and anything past the last page
  // has nothing to show — both are a 404 rather than an empty list.
  if (!Number.isInteger(page) || page < 2 || page > pageCount) notFound();

  return (
    <MarketingShell noPad>
      <ChangelogHero archive />

      <div className="lp-container max-w-5xl mx-auto pb-24 md:pb-32">
        <ChangelogPager page={page} pageCount={pageCount} className="pb-2" />
        <ChangelogEntryList entries={archiveSlice(entries, page)} />
        <ChangelogPager page={page} pageCount={pageCount} />
      </div>
    </MarketingShell>
  );
}
