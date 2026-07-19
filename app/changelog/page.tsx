import Link from 'next/link';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { ChangelogEntryList, ChangelogUnavailable, getChangelogEntries } from './shared';

// Re-render at most hourly; each release lands here without a frontend redeploy.
export const revalidate = 3600;

// Keep the primary document light (~2k DOM nodes hurt INP with 90+ entries);
// older releases live on /changelog/archive.
const LATEST_COUNT = 30;

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();
  const latest = entries.slice(0, LATEST_COUNT);
  const archivedCount = Math.max(0, entries.length - LATEST_COUNT);

  return (
    <MarketingShell>
      <MarketingPageHero
        label="Changelog"
        title="What's new in Pushify"
        description="Every release across the platform, API and dashboard — features, fixes and improvements as they ship."
      />

      <div className="lp-container max-w-3xl mx-auto pb-24 space-y-6">
        {entries.length === 0 && <ChangelogUnavailable />}
        <ChangelogEntryList entries={latest} />

        {archivedCount > 0 && (
          <div className="text-center pt-4">
            <Link
              href="/changelog/archive"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-colors hover:underline underline-offset-4"
              style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-ink)' }}
            >
              View {archivedCount} older releases →
            </Link>
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
