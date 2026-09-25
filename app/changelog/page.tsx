import { MarketingShell } from '@/components/landing';
import { ChangelogHero, LatestReleaseBoard, OlderReleasesLink } from './copy';
import { ChangelogEntryList, ChangelogUnavailable, PAGE_SIZE, getChangelogEntries, latestPerSource } from './shared';

// Re-render at most hourly; each release lands here without a frontend redeploy.
export const revalidate = 3600;

// Keep the primary document light (~2k DOM nodes hurt INP with 90+ entries);
// older releases live on /changelog/archive, itself paged at the same size.

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();
  const latest = entries.slice(0, PAGE_SIZE);
  const archivedCount = Math.max(0, entries.length - PAGE_SIZE);

  return (
    <MarketingShell noPad>
      <ChangelogHero />

      {entries.length > 0 && (
        <div className="lp-container max-w-3xl pb-16 md:pb-20">
          <LatestReleaseBoard rows={latestPerSource(entries, latest)} />
        </div>
      )}

      <div className="lp-container max-w-5xl mx-auto pb-24 md:pb-32">
        {entries.length === 0 && <ChangelogUnavailable />}
        <ChangelogEntryList entries={latest} />

        {archivedCount > 0 && <OlderReleasesLink count={archivedCount} />}
      </div>
    </MarketingShell>
  );
}
