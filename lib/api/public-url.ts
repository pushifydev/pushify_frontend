/**
 * Public API base URL for docs, examples, and marketing.
 * Intentionally separate from NEXT_PUBLIC_API_URL (local dev in .env).
 */
export const PRODUCTION_API_BASE_URL = 'https://api.pushify.dev/api/v1';

/** Override for staging docs only, e.g. NEXT_PUBLIC_DOCS_API_URL */
export const DOCS_API_BASE_URL =
  process.env.NEXT_PUBLIC_DOCS_API_URL || PRODUCTION_API_BASE_URL;
