import { redirect } from 'next/navigation';

/**
 * Public entry for the "Deploy to Pushify" button:
 *   https://pushify.dev/new?repo=https://github.com/org/app[&branch=main]
 *
 * Validates the repository URL and hands off to the new-project wizard with
 * the source prefilled. Unauthenticated visitors bounce through login and
 * land back here with the params intact (the dashboard guard carries the
 * full path in `redirect=`).
 */

const ALLOWED_HOSTS = new Set(['github.com', 'www.github.com', 'gitlab.com', 'www.gitlab.com', 'bitbucket.org']);

function sanitizeRepo(raw: string | undefined): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  // Hosted forges by name; anything else must at least look like a git remote.
  if (!ALLOWED_HOSTS.has(url.hostname) && !url.pathname.endsWith('.git')) return null;
  if (url.username || url.password) return null;
  const path = url.pathname.replace(/\/+$/, '');
  if (path.split('/').filter(Boolean).length < 2) return null;
  return `${url.origin}${path}`;
}

function sanitizeBranch(raw: string | undefined): string | null {
  if (!raw) return null;
  const b = raw.trim();
  return /^[\w.\-/]{1,120}$/.test(b) ? b : null;
}

export default async function NewFromButtonPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const repo = sanitizeRepo(typeof params.repo === 'string' ? params.repo : undefined);
  const branch = sanitizeBranch(typeof params.branch === 'string' ? params.branch : undefined);

  if (!repo) redirect('/dashboard/projects/new');

  const qs = new URLSearchParams({ repo });
  if (branch) qs.set('branch', branch);
  redirect(`/dashboard/projects/new?${qs.toString()}`);
}
