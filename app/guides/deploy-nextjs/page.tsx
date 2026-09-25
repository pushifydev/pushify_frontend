import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, CodePanel } from '@/components/landing/MarketingKit';
import { JsonLd } from '@/components/JsonLd';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'How to Deploy Next.js to Your Own Server (2026 Guide)',
  description:
    'Step-by-step: deploy a Next.js app to your own VPS with Node 22, PM2, nginx reverse proxy and free SSL — plus the one-command alternative.',
  keywords: [
    'deploy nextjs own server',
    'nextjs vps deployment',
    'nextjs nginx pm2',
    'self host nextjs',
    'nextjs ubuntu deploy',
  ],
  alternates: { canonical: '/guides/deploy-nextjs' },
  openGraph: {
    images: OG_IMAGE,
    title: 'Deploy Next.js to Your Own Server | Pushify',
    description:
      'The complete manual path (Node, PM2, nginx, SSL) and the automated one — both on servers you own.',
    url: 'https://pushify.dev/guides/deploy-nextjs',
  },
};

const OUTLINE = [
  { id: 'node', title: 'Install Node.js 22', tool: 'nodesource' },
  { id: 'build', title: 'Clone and build', tool: 'npm' },
  { id: 'pm2', title: 'Keep it running', tool: 'pm2' },
  { id: 'nginx', title: 'Reverse proxy', tool: 'nginx' },
  { id: 'ssl', title: 'Free SSL', tool: 'certbot' },
  { id: 'redeploy', title: 'Redeploys', tool: 'deploy.sh' },
];

function Code({ children, title = 'bash' }: { children: string; title?: string }) {
  return (
    <div className="my-6">
      <CodePanel title={title}>{children}</CodePanel>
    </div>
  );
}

function H2({ children, id, step }: { children: React.ReactNode; id: string; step?: number }) {
  return (
    <h2 id={id} className="scroll-mt-28 mt-16 mb-4 pt-10 border-t" style={{ borderColor: 'var(--hp-line)' }}>
      {step !== undefined && (
        <span className="hp-eyebrow block mb-3">
          <span aria-hidden="true">[&nbsp;</span>Step {step}
          <span aria-hidden="true">&nbsp;]</span>
        </span>
      )}
      <span
        className="block text-[1.6rem] md:text-[1.85rem] leading-tight font-medium"
        style={{ color: 'var(--hp-ink)', letterSpacing: '-0.02em' }}
      >
        {children}
      </span>
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] leading-[1.75] mb-5" style={{ color: 'var(--hp-body)' }}>
      {children}
    </p>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[0.9em] px-1.5 py-0.5 rounded border" style={{ fontFamily: 'var(--font-mono)', color: 'var(--hp-ink)', borderColor: 'var(--hp-line)', background: 'var(--hp-card)' }}>
      {children}
    </code>
  );
}

export default function DeployNextjsGuide() {
  return (
    <MarketingShell noPad>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': 'https://pushify.dev/guides/deploy-nextjs#article',
          headline: 'How to Deploy Next.js to Your Own Server',
          description:
            'Deploy a Next.js app to your own VPS with Node 22, PM2, nginx and free SSL — step by step, plus the automated alternative.',
          url: 'https://pushify.dev/guides/deploy-nextjs',
          image: 'https://pushify.dev/og-image.png',
          datePublished: '2026-07-19',
          dateModified: '2026-07-19',
          inLanguage: 'en',
          author: { '@id': 'https://pushify.dev/#organization' },
          publisher: { '@id': 'https://pushify.dev/#organization' },
          isPartOf: { '@id': 'https://pushify.dev/#website' },
        }}
      />
      <MarketingPageHero
        label="Guide"
        title="Deploy Next.js to your own server"
        description="Node 22, PM2, nginx and free SSL on any Ubuntu VPS, step by step. The automated route is at the end."
      />

      {/* The route at a glance: each step, the tool it sets up, a jump link. */}
      <nav aria-label="Steps in this guide" className="lp-container max-w-3xl pb-6">
        <div className="hp-code">
          <div className="hp-code-title flex items-center justify-between gap-3">
            <span>The manual route</span>
            <span>Ubuntu 22.04 / 24.04</span>
          </div>
          <ol>
            {OUTLINE.map((step, i) => (
              <li key={step.id} className="border-t first:border-t-0" style={{ borderColor: 'var(--hp-line)' }}>
                <a
                  href={`#${step.id}`}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-[var(--hp-line)] focus-visible:bg-[var(--hp-line)] transition-colors"
                >
                  <span className="hp-mono text-[12px] tabular-nums" style={{ color: 'var(--hp-muted)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[15px]" style={{ color: 'var(--hp-ink)' }}>
                    {step.title}
                  </span>
                  <span className="hp-mono text-[12px]" style={{ color: 'var(--hp-muted)' }}>
                    {step.tool}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <article className="lp-container max-w-3xl pb-20 md:pb-28">
        <H2 id="prerequisites">Prerequisites</H2>
        <P>
          A VPS with at least 1 GB RAM (2 GB is comfortable for builds), SSH access as root or a
          sudo user, your app in a git repository, and — for HTTPS — a domain with an A record
          pointing at the server&apos;s IP. The steps work for both the App and Pages routers with a
          plain <C>next build</C> (no static export).
        </P>

        <H2 id="node" step={1}>Install Node.js 22</H2>
        <Code>{`curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
node -v   # v22.x`}</Code>

        <H2 id="build" step={2}>Clone and build</H2>
        <Code>{`cd /var/www
sudo git clone https://github.com/you/my-app.git
cd my-app
sudo npm ci
sudo npm run build`}</Code>
        <P>
          If the build gets killed on a 1 GB server, add temporary swap first:
        </P>
        <Code>{`sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile`}</Code>

        <H2 id="pm2" step={3}>Keep it running with PM2</H2>
        <P>
          PM2 restarts the app on crashes and on reboot. Next.js serves on port 3000 by default.
        </P>
        <Code>{`sudo npm install -g pm2
pm2 start npm --name my-app -- start
pm2 startup systemd   # prints a command — run it
pm2 save`}</Code>

        <H2 id="nginx" step={4}>nginx reverse proxy</H2>
        <P>
          Create <C>/etc/nginx/sites-available/my-app</C>:
        </P>
        <Code title="/etc/nginx/sites-available/my-app">{`server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}</Code>
        <Code>{`sudo ln -s /etc/nginx/sites-available/my-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`}</Code>

        <H2 id="ssl" step={5}>Free SSL with certbot</H2>
        <Code>{`sudo snap install --classic certbot
sudo certbot --nginx -d example.com`}</Code>
        <P>
          Certbot rewrites the nginx config for HTTPS and installs an auto-renewing Let&apos;s
          Encrypt certificate. Your app is now live at https://example.com.
        </P>

        <H2 id="redeploy" step={6}>Redeploys</H2>
        <P>Each update is a pull, build and restart. Save this as deploy.sh:</P>
        <Code title="deploy.sh">{`#!/usr/bin/env bash
set -e
cd /var/www/my-app
git pull
npm ci
npm run build
pm2 restart my-app`}</Code>
        <P>
          Note the trade-off: between <C>pm2 restart</C>{' '}
          and the app finishing boot there are a few seconds of downtime, and a failed build can
          leave the previous process serving a half-updated directory. Solving that properly means
          building in isolation and switching atomically — which is exactly what the automated
          route below does.
        </P>

        <H2 id="gotchas">Gotchas worth knowing</H2>
        <ul className="mb-4 border-t" style={{ borderColor: 'var(--hp-line)' }}>
          {[
            'Set output: "standalone" in next.config to shrink what has to exist on the server at runtime.',
            'Environment variables: PM2 does not read .env.production automatically for npm start — Next.js does, at build and runtime, as long as the file sits in the app directory.',
            'next/image optimization uses sharp — npm ci installs it, but on minimal distros you may need build tools (sudo apt-get install -y build-essential).',
            'Open only ports 80/443 in your firewall; the Node port (3000) should stay internal.',
          ].map((item) => (
            <li
              key={item}
              className="text-[16px] leading-[1.7] py-4 border-b"
              style={{ color: 'var(--hp-body)', borderColor: 'var(--hp-line)' }}
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="text-[13px] mt-12" style={{ color: 'var(--hp-muted)' }}>
          Written for Ubuntu 22.04/24.04, Node 22 and Next.js 14/15, July 2026. Something off? Email{' '}
          <a href="mailto:support@pushify.dev" className="underline underline-offset-4" style={{ color: 'var(--hp-ink)' }}>
            support@pushify.dev
          </a>{' '}
          and we&apos;ll fix the guide.
        </p>
      </article>

      <MSection
        id="automated"
        eyebrow="The automated route"
        title="Same server. One push."
        lead="Pushify does all of the above on the same kind of server: each git push builds in isolation and goes live with a zero-downtime switch."
        align="center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/deploy/nextjs" className="lp-cta w-full sm:w-auto">
            Deploy Next.js with Pushify
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </MSection>
    </MarketingShell>
  );
}
