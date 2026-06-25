import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import { Analytics } from '@/components/Analytics';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pushify.dev'),
  title: {
    default: 'Pushify - Open Source Cloud Deployment Platform',
    template: '%s | Pushify',
  },
  description:
    'Deploy applications to your own servers in under 60 seconds. Open-source, zero config, 20+ frameworks supported. MIT licensed.',
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
      'Deploy applications to your own servers in under 60 seconds. Open-source, zero config, 20+ frameworks supported.',
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
      'Deploy applications to your own servers in under 60 seconds. Open-source, zero config, 20+ frameworks supported.',
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
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

// Runs before React hydration to prevent flash of wrong theme (FOUC)
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
                  url: 'https://pushify.dev',
                  logo: 'https://pushify.dev/logo-full.svg',
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
                    'Open-source cloud deployment platform that lets developers deploy applications to their own VPS servers in under 60 seconds with zero configuration.',
                  featureList: [
                    'Push-to-deploy from GitHub with framework auto-detection (20+ frameworks)',
                    'Zero-downtime deploys with instant rollbacks',
                    "Automatic SSL via Let's Encrypt",
                    'One-click managed databases (PostgreSQL, MySQL, Redis, MongoDB)',
                    'Bring your own server (BYOS) or managed Hetzner Cloud',
                    'Team collaboration with role-based access control',
                    'No-code site builder',
                    'App marketplace with 24+ one-click apps',
                  ],
                  offers: {
                    '@type': 'AggregateOffer',
                    priceCurrency: 'USD',
                    lowPrice: '0',
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
