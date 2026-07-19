import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { ChangelogEntryList, getChangelogEntries } from './../shared';

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

const LATEST_COUNT = 30;

export default async function ChangelogArchivePage() {
  const entries = await getChangelogEntries();
  const older = entries.slice(LATEST_COUNT);

  return (
    <MarketingShell>
      <MarketingPageHero
        label="Changelog"
        title="Release archive"
        description="Older Pushify releases. The latest updates live on the main changelog."
      />

      <div className="lp-container max-w-3xl mx-auto pb-24 space-y-6">
        <div className="text-center pb-2">
          <Link
            href="/changelog"
            className="text-sm underline underline-offset-4"
            style={{ color: 'var(--lp-muted)' }}
          >
            ← Back to latest releases
          </Link>
        </div>
        <ChangelogEntryList entries={older} />
      </div>
    </MarketingShell>
  );
}
