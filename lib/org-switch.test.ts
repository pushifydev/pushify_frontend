import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { listRouteAfterOrgSwitch, resetQueriesForOrgSwitch } from './org-switch';

describe('resetQueriesForOrgSwitch', () => {
  // Org A's data cached before the switch; the queryFn now runs with org B's token.
  const projectKey = ['projects', 'detail', 'p-of-org-a'];
  const invoicesKey = ['billing', 'invoices'];
  let queryClient: QueryClient;
  const unsubscribers: Array<() => void> = [];

  const observe = (queryKey: unknown[], queryFn: () => Promise<unknown>, enabled = true) => {
    const observer = new QueryObserver(queryClient, {
      queryKey,
      queryFn,
      enabled,
      retry: false,
      staleTime: Infinity, // no fetch on subscribe; only the switch triggers one
    });
    unsubscribers.push(observer.subscribe(() => undefined));
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.setQueryData(projectKey, { id: 'p-of-org-a', name: "A's project" });
    queryClient.setQueryData(invoicesKey, [{ id: 'inv-of-org-a' }]);
  });

  afterEach(() => {
    unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
    queryClient.clear();
  });

  it('drops the old data when the refetch fails (old org resource 404s)', async () => {
    observe(projectKey, () => Promise.reject(new Error('Project not found')));
    await resetQueriesForOrgSwitch(queryClient);
    expect(queryClient.getQueryData(projectKey)).toBeUndefined();
    expect(queryClient.getQueryState(projectKey)?.status).toBe('error');
  });

  it('drops the old data of a query that is now disabled (non-admin invoices)', async () => {
    observe(invoicesKey, () => Promise.resolve([{ id: 'inv-of-org-b' }]), false);
    await resetQueriesForOrgSwitch(queryClient);
    expect(queryClient.getQueryData(invoicesKey)).toBeUndefined();
  });

  it('drops the old data of inactive queries', async () => {
    await resetQueriesForOrgSwitch(queryClient);
    expect(queryClient.getQueryData(projectKey)).toBeUndefined();
    expect(queryClient.getQueryData(invoicesKey)).toBeUndefined();
  });

  it('refetches active queries for the new org', async () => {
    observe(['projects'], () => Promise.resolve([{ id: 'p-of-org-b' }]));
    queryClient.setQueryData(['projects'], [{ id: 'p-of-org-a' }]);
    await resetQueriesForOrgSwitch(queryClient);
    expect(queryClient.getQueryData(['projects'])).toEqual([{ id: 'p-of-org-b' }]);
  });

  it('is needed: invalidateQueries would keep the old org data on screen', async () => {
    observe(projectKey, () => Promise.reject(new Error('Project not found')));
    observe(invoicesKey, () => Promise.resolve([]), false);
    await queryClient.invalidateQueries();
    expect(queryClient.getQueryData(projectKey)).toEqual({ id: 'p-of-org-a', name: "A's project" });
    expect(queryClient.getQueryData(invoicesKey)).toEqual([{ id: 'inv-of-org-a' }]);
  });
});

describe('listRouteAfterOrgSwitch', () => {
  it.each([
    ['/dashboard/projects/p1', '/dashboard/projects'],
    ['/dashboard/projects/p1/shell', '/dashboard/projects'],
    ['/dashboard/projects/p1/site-editor', '/dashboard/projects'],
    ['/dashboard/servers/s1', '/dashboard/servers'],
    ['/dashboard/servers/s1/terminal', '/dashboard/servers'],
    ['/dashboard/databases/d1', '/dashboard/databases'],
    ['/dashboard/databases/d1/studio', '/dashboard/databases'],
    ['/dashboard/domains/example.com', '/dashboard/domains'],
  ])('sends %s to %s', (pathname, expected) => {
    expect(listRouteAfterOrgSwitch(pathname)).toBe(expected);
  });

  it.each([
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/projects/',
    '/dashboard/projects/new',
    '/dashboard/servers/new',
    '/dashboard/billing',
    '/dashboard/settings/organization',
    '/dashboard/projectsx/p1',
  ])('keeps %s', (pathname) => {
    expect(listRouteAfterOrgSwitch(pathname)).toBeNull();
  });
});
