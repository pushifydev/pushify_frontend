import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from './providers';
import { Analytics } from '@/components/Analytics';
import './globals.css';

// Vendored in app/fonts (SIL OFL) so a build never depends on reaching Google Fonts — a failed
// font download failed the whole build. Inter and JetBrains Mono from google/fonts, weights
// 400–700, Latin + Latin Extended-A (Turkish), subset with fonttools.
const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  weight: '400 700',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMonoVariable.woff2',
  variable: '--font-jetbrains-mono',
  weight: '400 700',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pushify.dev'),
  title: {
    default: 'Pushify - Open Source Cloud Deployment Platform',
    template: '%s | Pushify',
  },
  description:
    'Open-source deployment platform: deploy apps from a Git repository to your own servers, with builds, HTTPS and zero-downtime deploys. MIT licensed.',
  keywords: [
    'cloud deployment',
    'open source PaaS',
    'deploy applications',
    'Vercel alternative',
    'Railway alternative',
    'self-hosted deployment',
    'VPS deployment',
    'Hetzner',
    'Next.js deploy',
    'pushify',
  ],
  authors: [{ name: 'Pushify', url: 'https://pushify.dev' }],
  creator: 'Pushify',
  publisher: 'Pushify',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pushify.dev',
    siteName: 'Pushify',
    title: 'Pushify - Open Source Cloud Deployment Platform',
    description:
      'Open-source deployment platform. Connect a repository, pick a server (yours or ours) and ship with HTTPS and zero-downtime deploys.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pushify - Open Source Cloud Deployment Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pushify - Open Source Cloud Deployment Platform',
    description:
      'Open-source deployment platform. Connect a repository, pick a server (yours or ours) and ship with HTTPS and zero-downtime deploys.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Google's result-page favicon wants a PNG/ICO at a multiple of 48px (SVG is often
  // ignored, and a missing /favicon.ico falls back to the generic globe). `?v=` busts the
  // browser favicon cache when the mark changes (scripts/gen-favicons.mjs) — bump it with it.
  icons: {
    icon: [
      { url: '/favicon-48x48.png?v=2', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png?v=2', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png?v=2',
  },
  manifest: '/site.webmanifest',
};

// Runs before React hydration to prevent flash of wrong theme (FOUC), and to put the right
// language on <html> — the document is prerendered as English, so without this a Turkish
// visitor's browser is told the page is English until React has hydrated.
const themeScript = `(function(){
  function resolveTheme(pref) {
    if (pref === 'system' || !pref) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return pref === 'light' ? 'light' : 'dark';
  }
  try {
    var s = localStorage.getItem('pushify-theme');
    var p = s ? JSON.parse(s) : null;
    var pref = p && p.state ? p.state.theme : 'system';
    var resolved = resolveTheme(pref);
    document.documentElement.classList.add(resolved);
  } catch(e) {
    document.documentElement.classList.add(resolveTheme('system'));
  }
  try {
    var l = localStorage.getItem('pushify-locale');
    var lp = l ? JSON.parse(l) : null;
    var locale = lp && lp.state ? lp.state.locale : null;
    if (!locale) locale = (navigator.language || 'en').split('-')[0];
    document.documentElement.lang = locale === 'tr' ? 'tr' : 'en';
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://pushify.dev/#organization',
                  name: 'Pushify',
                  legalName: 'Pushify LLC',
                  url: 'https://pushify.dev',
                  // Square raster of the current mark (Google wants ≥112px; the old SVG was a retired design)
                  logo: 'https://pushify.dev/logo-512.png',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: '30 N Gould St Ste N',
                    addressLocality: 'Sheridan',
                    addressRegion: 'WY',
                    postalCode: '82801',
                    addressCountry: 'US',
                  },
                  sameAs: [
                    'https://github.com/pushifydev',
                    'https://www.npmjs.com/package/pushify-cli',
                  ],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'support@pushify.dev',
                    contactType: 'customer service',
                    availableLanguage: ['English', 'Turkish'],
                  },
                },
                {
                  '@type': 'SoftwareApplication',
                  '@id': 'https://pushify.dev/#software',
                  name: 'Pushify',
                  applicationCategory: 'DeveloperApplication',
                  operatingSystem: 'Linux, macOS, Windows',
                  url: 'https://pushify.dev',
                  description:
                    'Open-source cloud deployment platform that deploys applications from a Git repository to your own VPS servers, with automatic builds, HTTPS and zero-downtime deploys.',
                  featureList: [
                    'Push-to-deploy from GitHub with framework auto-detection (26 frameworks)',
                    'Zero-downtime deploys with instant rollbacks',
                    "Automatic SSL via Let's Encrypt",
                    'One-click managed databases (PostgreSQL, MySQL, Redis, MongoDB)',
                    'Bring your own server (BYOS) or managed Hetzner Cloud',
                    'Team collaboration with role-based access control',
                    'No-code site builder',
                    'App marketplace with 24 one-click apps',
                  ],
                  offers: {
                    '@type': 'AggregateOffer',
                    priceCurrency: 'USD',
                    lowPrice: '0',
                    highPrice: '13',
                    offerCount: 5,
                    availability: 'https://schema.org/InStock',
                    url: 'https://pushify.dev/pricing',
                  },
                  license: 'https://opensource.org/licenses/MIT',
                  downloadUrl: 'https://www.npmjs.com/package/pushify-cli',
                  softwareVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0-beta.14',
                  publisher: { '@id': 'https://pushify.dev/#organization' },
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://pushify.dev/#website',
                  name: 'Pushify',
                  url: 'https://pushify.dev',
                  inLanguage: ['en', 'tr'],
                  publisher: { '@id': 'https://pushify.dev/#organization' },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://pushify.dev/docs?q={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
