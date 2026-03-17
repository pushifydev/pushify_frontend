import type { Metadata } from 'next';
import { Public_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pushify - Deploy at the speed of thought',
  description: 'Open-source cloud platform for deploying applications instantly',
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
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
