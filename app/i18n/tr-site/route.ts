import { tr } from '@/lib/i18n/locales/tr';
import { SITE_NAMESPACES } from '@/lib/i18n/site-namespaces';

/**
 * The public site's slice of the Turkish dictionary, as a blocking script (see ../tr/route.ts for
 * why a script). Marked partial so the client loads the rest after the page is up.
 */

export const dynamic = 'force-static';

export function GET() {
  const slice = Object.fromEntries(SITE_NAMESPACES.map((ns) => [ns, tr[ns]]));
  return new Response(
    `globalThis.__PUSHIFY_I18N_TR=${JSON.stringify(slice)};globalThis.__PUSHIFY_I18N_TR_PARTIAL=true;`,
    {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  );
}
