import Script from 'next/script';

// Public GA4 Measurement ID (not a secret — visible in any GA site's page source).
// Override the property by setting NEXT_PUBLIC_GA_ID; otherwise this default is used.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-SW4LNQEV9M';

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
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
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
