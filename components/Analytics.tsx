import Script from 'next/script';

// Public GA4 Measurement ID (not a secret — visible in any GA site's page source).
// Set NEXT_PUBLIC_GA_ID to use your own property. The Pushify default applies only to builds
// that talk to Pushify's own API, so a self-hosted instance never reports to Pushify's GA.
const PUSHIFY_CLOUD = (process.env.NEXT_PUBLIC_API_URL ?? '').includes('api.pushify.dev');
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || (PUSHIFY_CLOUD ? 'G-SW4LNQEV9M' : '');

/**
 * Google Analytics 4. Loads in production builds only (skipped in local dev) so analytics
 * isn't polluted by development traffic.
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
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
