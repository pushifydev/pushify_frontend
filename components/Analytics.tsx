import Script from 'next/script';
import { URL_TOKEN_PARAM } from '@/lib/url-token';

// Public GA4 Measurement ID (not a secret — visible in any GA site's page source).
// Set NEXT_PUBLIC_GA_ID to use your own property. The Pushify default applies only to builds
// that talk to Pushify's own API, so a self-hosted instance never reports to Pushify's GA.
const PUSHIFY_CLOUD = (process.env.NEXT_PUBLIC_API_URL ?? '').includes('api.pushify.dev');
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || (PUSHIFY_CLOUD ? 'G-SW4LNQEV9M' : '');

/**
 * Google Analytics 4. Loads in production builds only (skipped in local dev) so analytics
 * isn't polluted by development traffic.
 *
 * The emailed-link pages scrub `?token=` from the address bar themselves, but they render only
 * after the session check — so if GA wins that race, the first page_view's page_location is sent
 * without the token. Other parameters (UTM) are kept; URLs without a token are left untouched.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== 'production' || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          (function () {
            var pageUrl = new URL(window.location.href);
            if (pageUrl.searchParams.has(${JSON.stringify(URL_TOKEN_PARAM)})) {
              pageUrl.searchParams.delete(${JSON.stringify(URL_TOKEN_PARAM)});
              gtag('config', '${GA_ID}', { page_location: pageUrl.href });
            } else {
              gtag('config', '${GA_ID}');
            }
          })();
        `}
      </Script>
    </>
  );
}
