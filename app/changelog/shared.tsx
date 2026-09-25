import type { ReactNode } from 'react';
import { ChangelogPagerNav, ChangelogUnavailableNote } from './copy';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Content source order: local file (dev + a checkout deploy where the repos sit side by side),
// then GitHub raw (works once the repos are public — e.g. the standalone Docker image, which
// doesn't ship the markdown files).
export const SOURCES = [
  {
    key: 'platform',
    label: 'Platform & API',
    localPath: process.env.CHANGELOG_BACKEND_PATH || '../pushify_backend/CHANGELOG.md',
    raw: 'https://raw.githubusercontent.com/pushifydev/pushify_backend/master/CHANGELOG.md',
    repo: 'https://github.com/pushifydev/pushify_backend',
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    localPath: 'CHANGELOG.md',
    raw: 'https://raw.githubusercontent.com/pushifydev/pushify_frontend/master/CHANGELOG.md',
    repo: 'https://github.com/pushifydev/pushify_frontend',
  },
] as const;

export type SourceKey = (typeof SOURCES)[number]['key'];

interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  source: SourceKey;
  sections: ChangelogSection[];
}

/** Parse "## [version] - date" entries with "### Section" groups and "- item" bullets. */
function parseChangelog(md: string, source: SourceKey): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let entry: ChangelogEntry | null = null;
  let section: ChangelogSection | null = null;

  for (const line of md.split('\n')) {
    const heading = line.match(/^## \[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (heading) {
      entry = { version: heading[1], date: heading[2], source, sections: [] };
      entries.push(entry);
      section = null;
      continue;
    }
    if (!entry) continue;

    const sectionHeading = line.match(/^### (.+)/);
    if (sectionHeading) {
      section = { title: sectionHeading[1].trim(), items: [] };
      entry.sections.push(section);
      continue;
    }

    const bullet = line.match(/^- (.+)/);
    if (bullet) {
      if (!section) {
        section = { title: '', items: [] };
        entry.sections.push(section);
      }
      section.items.push(bullet[1]);
      continue;
    }

    // Indented continuation of the previous bullet
    if (/^\s+\S/.test(line) && section?.items.length) {
      section.items[section.items.length - 1] += ' ' + line.trim();
    }
  }

  return entries;
}

/** Minimal inline markdown: `code`, **bold**, [text](url). */
function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={i}
          className="font-mono px-1 py-0.5 rounded-md text-[0.85em] bg-[var(--hp-card)] border border-[var(--hp-line)] text-[var(--hp-ink)] [overflow-wrap:anywhere]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} className="font-medium text-[var(--hp-ink)]">
          {token.slice(2, -2)}
        </strong>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} className="underline underline-offset-4 decoration-[var(--hp-line-strong)] hover:decoration-[var(--hp-ink)] text-[var(--hp-ink)]"
          target="_blank"
          rel="noreferrer">
          {link[1]}
        </a>
      );
    }
    return token;
  });
}

async function loadChangelog(source: (typeof SOURCES)[number]): Promise<string | null> {
  try {
    return await readFile(path.resolve(process.cwd(), source.localPath), 'utf-8');
  } catch {
    // No local checkout (e.g. standalone Docker image) — fall through to GitHub.
  }
  try {
    const res = await fetch(source.raw, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function betaNumber(version: string): number {
  const match = version.match(/beta\.(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  const parsed = await Promise.all(
    SOURCES.map(async (src) => {
      const md = await loadChangelog(src);
      return md ? parseChangelog(md, src.key) : [];
    })
  );

  return parsed
    .flat()
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        a.source.localeCompare(b.source) ||
        betaNumber(b.version) - betaNumber(a.version)
    );
}

const labelFor = (key: SourceKey) => SOURCES.find((s) => s.key === key)!.label;

/** Anchor for one release, e.g. #platform-v0.2.0-beta.62. */
export const entryId = (entry: Pick<ChangelogEntry, 'source' | 'version'>) => `${entry.source}-v${entry.version}`;

/** The newest release of each source, for the board at the top of /changelog. */
export function latestPerSource(entries: ChangelogEntry[], onPage: ChangelogEntry[]) {
  return SOURCES.flatMap((src) => {
    const entry = entries.find((e) => e.source === src.key);
    if (!entry) return [];
    return [
      {
        key: src.key,
        label: src.label,
        version: entry.version,
        date: entry.date,
        changes: entry.sections.reduce((n, s) => n + s.items.length, 0),
        href: onPage.includes(entry) ? `#${entryId(entry)}` : `${src.repo}/blob/master/CHANGELOG.md`,
      },
    ];
  });
}

export function ChangelogEntryList({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <div lang="en">
      {entries.map((entry) => (
        <article
          key={`${entry.source}-${entry.version}`}
          id={entryId(entry)}
          className="scroll-mt-28 grid grid-cols-1 md:grid-cols-[13rem_1fr] gap-4 md:gap-10 py-10 border-t border-[var(--hp-line)]"
        >
          <header className="flex md:flex-col flex-wrap items-center md:items-start gap-x-3 gap-y-2 md:sticky md:top-24 self-start">
            <h2 className="font-mono text-[15px] font-medium text-[var(--hp-ink)]">v{entry.version}</h2>
            <span className="hp-mono text-[11px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-[var(--hp-line-strong)] text-[var(--hp-body)]">
              {labelFor(entry.source)}
            </span>
            <time
              dateTime={entry.date}
              className="hp-mono text-[12px] tracking-[0.05em] tabular-nums text-[var(--hp-muted)] ml-auto md:ml-0"
            >
              {entry.date}
            </time>
          </header>

          <div className="space-y-6">
            {entry.sections.map((section, i) => (
              <div key={i}>
                {section.title && (
                  <h3 className="hp-mono text-[11px] uppercase tracking-[0.1em] text-[var(--hp-muted)] mb-3">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-2.5">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="text-[15px] leading-relaxed text-[var(--hp-body)] pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[0.8em] before:w-2.5 before:h-px before:bg-[var(--hp-line-strong)]"
                    >
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ChangelogUnavailable() {
  return (
    <ChangelogUnavailableNote
      links={SOURCES.map((src) => ({ key: src.key, label: src.label, href: `${src.repo}/blob/master/CHANGELOG.md` }))}
    />
  );
}

/* ───────────────── Paging ───────────────── */

/**
 * Releases per page.
 *
 * The archive used to render every older release in one document — 463 KB of HTML and some
 * ninety entries to scroll past. Thirty is the same size as the front page, so a reader moving
 * from /changelog into the archive gets pages of a consistent length.
 */
export const PAGE_SIZE = 30;

/** How many archive pages `total` releases need. Page 1 of the archive holds entries 31–60. */
export function archivePageCount(total: number): number {
  return Math.max(0, Math.ceil((total - PAGE_SIZE) / PAGE_SIZE));
}

/** The slice of releases on archive page `page` (1-based). */
export function archiveSlice<T>(entries: T[], page: number): T[] {
  const start = PAGE_SIZE * page;
  return entries.slice(start, start + PAGE_SIZE);
}

/** Archive page 1 keeps the bare /changelog/archive URL; the rest are numbered. */
export function archiveHref(page: number): string {
  return page <= 1 ? '/changelog/archive' : `/changelog/archive/${page}`;
}

export function ChangelogPager({
  page,
  pageCount,
  className = 'pt-6',
}: {
  page: number;
  pageCount: number;
  /** Spacing differs above and below the list; everything else is identical. */
  className?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    <ChangelogPagerNav
      page={page}
      pageCount={pageCount}
      // Page 1's "newer" target is the changelog itself, not another archive page
      newerHref={page <= 1 ? '/changelog' : archiveHref(page - 1)}
      olderHref={page < pageCount ? archiveHref(page + 1) : null}
      className={className}
    />
  );
}
