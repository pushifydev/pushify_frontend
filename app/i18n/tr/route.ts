import { tr } from '@/lib/i18n/locales/tr';

/**
 * The Turkish dictionary as a plain script, so the browser has it before React hydrates.
 *
 * It cannot be a lazy chunk: the server renders Turkish, so the first client render has to
 * produce the same text, and a chunk still in flight cannot. It is not inlined into the HTML
 * either — 55KB gzipped on every page load, never cached, would trade a text flash for a slower
 * first paint. As a file with an immutable URL it is fetched once and reused for every page and
 * every reload, and an English visitor never asks for it at all.
 */

export const dynamic = 'force-static';

export function GET() {
  return new Response(`globalThis.__PUSHIFY_I18N_TR=${JSON.stringify(tr)};`, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      // Content-addressed by the ?v= the layout appends, so it can be kept forever.
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
