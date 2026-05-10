import type { Metadata } from 'next';
import { Public_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
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
  try {
    var s = localStorage.getItem('pushify-theme');
    var p = s ? JSON.parse(s) : null;
    var t = p && p.state ? p.state.theme : 'dark';
    if (t === 'system') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${publicSans.variable} ${jetbrainsMono.variable}`}>
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
                    contactType: 'customer support',
                  },
                },
                {
                  '@type': 'SoftwareApplication',
                  name: 'Pushify',
                  applicationCategory: 'DeveloperApplication',
                  operatingSystem: 'Linux',
                  url: 'https://pushify.dev',
                  description:
                    'Open-source cloud deployment platform that lets developers deploy applications to their own VPS servers in under 60 seconds with zero configuration.',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                  },
                  license: 'https://opensource.org/licenses/MIT',
                  downloadUrl: 'https://www.npmjs.com/package/pushify-cli',
                  softwareVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
                },
                {
                  '@type': 'WebSite',
                  name: 'Pushify',
                  url: 'https://pushify.dev',
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
      </body>
    </html>
  );
}
