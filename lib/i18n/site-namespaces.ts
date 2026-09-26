/**
 * The dictionary namespaces the public site renders. A Turkish visitor on a marketing page gets
 * only these before hydration (/i18n/tr-site, ~40% of the full dictionary), which is what blocks
 * the first paint; the rest follows in the background for when they move into the dashboard.
 *
 * lib/i18n/site-namespaces.test.ts fails if a marketing source uses a namespace missing here —
 * the server renders with the full dictionary, so a missing one would be a hydration mismatch.
 */
export const SITE_NAMESPACES = [
  'alternatives',
  'auth',
  'billing',
  'branding',
  'common',
  'domainSales',
  'errors',
  'homepage',
  'landing',
  'legal',
  'vsCoolify',
  'vsHeroku',
  'vsRailway',
  'vsRender',
  'vsVercel',
] as const;
