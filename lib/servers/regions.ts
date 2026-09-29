import type { Region } from '@/lib/api/services/servers.service';

/**
 * Regions worth offering on the create-server forms. The API marks `availableForPlan: false`
 * where the organization's plan cannot create any in-stock size (e.g. Hobby in nbg1 while cx23
 * is sold out); those are hidden. Out-of-stock regions stay listed but disabled. When the plan
 * can use no region at all (Free has no managed servers), the full list is kept so the form's
 * own upgrade message stays in context.
 */
export function usableRegions(regions: Region[]): Region[] {
  const forPlan = regions.filter((r) => r.availableForPlan !== false);
  return forPlan.length > 0 ? forPlan : regions;
}

/** First region a server can actually be created in, for the initial selection. */
export function defaultRegion(regions: Region[]): Region | undefined {
  return regions.find((r) => r.available !== false && r.availableForPlan !== false) ?? regions[0];
}
