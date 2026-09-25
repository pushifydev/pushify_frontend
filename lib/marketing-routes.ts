/**
 * The public site: always dark for now, whatever theme someone picked for the dashboard. Shared by
 * the theme store and the boot script in app/layout.tsx (which runs before React and needs a
 * plain pattern string).
 */
export const MARKETING_PATH_PATTERN =
  '^/($|features|pricing|sites|domains|open-source|about|alternatives|apps|blog|changelog|deploy-button|guides|partners|privacy|terms|refund|status|pushify-yaml|vs/|docs|deploy/)';

const marketing = new RegExp(MARKETING_PATH_PATTERN);

export const isMarketingPath = (pathname: string): boolean => marketing.test(pathname);
