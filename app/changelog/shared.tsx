import type { ReactNode } from 'react';
import Link from 'next/link';
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
          className="px-1 py-0.5 rounded text-[0.85em] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i}>{token.slice(2, -2)}</strong>;
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <a key={i} href={link[2]} className="underline underline-offset-2" target="_blank" rel="noreferrer">
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

const badgeStyles: Record<SourceKey, string> = {
  platform: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  dashboard: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
};

const labelFor = (key: SourceKey) => SOURCES.find((s) => s.key === key)!.label;

export function ChangelogEntryList({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <>
      {entries.map((entry) => (
        <article
          key={`${entry.source}-${entry.version}`}
          className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40"
        >
          <header className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="font-mono text-base font-semibold">v{entry.version}</h2>
            <span
              className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${badgeStyles[entry.source]}`}
            >
              {labelFor(entry.source)}
            </span>
            <time dateTime={entry.date} className="ml-auto text-xs text-[var(--text-muted)]">
              {entry.date}
            </time>
          </header>

          <div className="space-y-4">
            {entry.sections.map((section, i) => (
              <div key={i}>
                {section.title && (
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm leading-relaxed text-[var(--text-secondary)] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--border-default)]"
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
    </>
  );
}

export function ChangelogUnavailable() {
  return (
    <div className="p-6 rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)]">
      The changelog could not be loaded right now. You can read it directly on GitHub:{' '}
      {SOURCES.map((src, i) => (
        <span key={src.key}>
          {i > 0 && ' · '}
          <a href={`${src.repo}/blob/master/CHANGELOG.md`} className="underline underline-offset-2">
            {src.label}
          </a>
        </span>
      ))}
    </div>
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

  const link = 'text-sm underline underline-offset-4 hover:no-underline';

  return (
    <nav
      className={`flex items-center justify-between gap-4 ${className}`}
      aria-label="Changelog archive pages"
      style={{ color: 'var(--text-muted)' }}
    >
      {/* Page 1's "newer" target is the changelog itself, not another archive page */}
      <Link href={page <= 1 ? '/changelog' : archiveHref(page - 1)} className={link} rel="prev">
        ← {page <= 1 ? 'Latest releases' : 'Newer releases'}
      </Link>

      <span className="text-xs">
        Page {page} of {pageCount}
      </span>

      {page < pageCount ? (
        <Link href={archiveHref(page + 1)} className={link} rel="next">
          Older releases →
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
