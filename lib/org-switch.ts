import type { QueryClient } from '@tanstack/react-query';

/**
 * Drop every cached query after switching the active organization. invalidateQueries() would keep
 * the previous org's data on screen until the refetch succeeds — forever if it fails (the old
 * org's project 404s/403s) or the query is now disabled (e.g. invoices for a non-admin role).
 * resetQueries() clears the data and refetches only the active queries with the new token.
 */
export function resetQueriesForOrgSwitch(queryClient: QueryClient): Promise<void> {
  return queryClient.resetQueries();
}

/** Dashboard sections whose detail routes (/dashboard/<section>/<id>/...) belong to one organization. */
const ORG_SCOPED_SECTIONS = ['projects', 'servers', 'databases', 'domains'] as const;

/** Static child routes of those sections that are not a resource id. */
const NON_RESOURCE_SEGMENTS = new Set(['new']);

/**
 * Where to send the user after an organization switch: a resource detail route (project, server,
 * database, domain) points at the previous org's resource, so go to that section's list instead.
 * Returns null when the current route can stay as is.
 */
export function listRouteAfterOrgSwitch(pathname: string): string | null {
  for (const section of ORG_SCOPED_SECTIONS) {
    const list = `/dashboard/${section}`;
    if (!pathname.startsWith(`${list}/`)) continue;
    const segment = pathname.slice(list.length + 1).split('/')[0];
    if (!segment || NON_RESOURCE_SEGMENTS.has(segment)) return null;
    return list;
  }
  return null;
}
