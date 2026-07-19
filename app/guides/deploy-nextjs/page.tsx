import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { JsonLd } from '@/components/JsonLd';

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
    title: 'Deploy Next.js to Your Own Server | Pushify',
    description:
      'The complete manual path (Node, PM2, nginx, SSL) and the automated one — both on servers you own.',
    url: 'https://pushify.dev/guides/deploy-nextjs',
  },
};

function Code({ children }: { children: string }) {
  return (
    <pre
      className="rounded-xl p-4 overflow-x-auto text-[13px] leading-relaxed my-4"
      style={{
        background: '#0a0a0f',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {children}
    </pre>
  );
}

function H2({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="text-xl font-semibold tracking-tight mt-12 mb-3" style={{ color: 'var(--lp-ink)' }}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--lp-body)' }}>
      {children}
    </p>
  );
}

export default function DeployNextjsGuide() {
  return (
    <MarketingShell>
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
        description="The complete manual path — Node 22, PM2, nginx, free SSL — on any Ubuntu VPS. About 30 minutes the first time. (There's a one-command shortcut at the end.)"
        align="left"
      />

      <article className="lp-container max-w-3xl pb-20 md:pb-28">
        <P>
          Running Next.js on your own VPS is entirely practical: you get full control, flat
          server pricing, and no platform limits on execution time or regions. This guide uses
          Ubuntu 22.04/24.04, works for both the App and Pages routers, and assumes a plain{' '}
          <code style={{ fontFamily: 'var(--font-mono)' }}>next build</code> app (no static export).
        </P>

        <H2 id="prerequisites">Prerequisites</H2>
        <P>
          A VPS with at least 1 GB RAM (2 GB is comfortable for builds), SSH access as root or a
          sudo user, your app in a git repository, and — for HTTPS — a domain with an A record
          pointing at the server&apos;s IP.
        </P>

        <H2 id="node">Step 1 — Install Node.js 22</H2>
        <Code>{`curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
node -v   # v22.x`}</Code>

        <H2 id="build">Step 2 — Clone and build</H2>
        <Code>{`cd /var/www
sudo git clone https://github.com/you/my-app.git
cd my-app
sudo npm ci
sudo npm run build`}</Code>
        <P>
          If the build gets killed on a 1 GB server, add temporary swap first:{' '}
        </P>
        <Code>{`sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile`}</Code>

        <H2 id="pm2">Step 3 — Keep it running with PM2</H2>
        <P>
          PM2 restarts the app on crashes and on reboot. Next.js serves on port 3000 by default.
        </P>
        <Code>{`sudo npm install -g pm2
pm2 start npm --name my-app -- start
pm2 startup systemd   # prints a command — run it
pm2 save`}</Code>

        <H2 id="nginx">Step 4 — nginx reverse proxy</H2>
        <P>
          Create <code style={{ fontFamily: 'var(--font-mono)' }}>/etc/nginx/sites-available/my-app</code>:
        </P>
        <Code>{`server {
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

        <H2 id="ssl">Step 5 — Free SSL with certbot</H2>
        <Code>{`sudo snap install --classic certbot
sudo certbot --nginx -d example.com`}</Code>
        <P>
          Certbot rewrites the nginx config for HTTPS and installs an auto-renewing Let&apos;s
          Encrypt certificate. Your app is now live at https://example.com.
        </P>

        <H2 id="redeploy">Step 6 — Redeploys</H2>
        <P>Each update is a pull, build and restart. Save this as deploy.sh:</P>
        <Code>{`#!/usr/bin/env bash
set -e
cd /var/www/my-app
git pull
npm ci
npm run build
pm2 restart my-app`}</Code>
        <P>
          Note the trade-off: between <code style={{ fontFamily: 'var(--font-mono)' }}>pm2 restart</code>{' '}
          and the app finishing boot there are a few seconds of downtime, and a failed build can
          leave the previous process serving a half-updated directory. Solving that properly means
          building in isolation and switching atomically — which is exactly what the automated
          route below does.
        </P>

        <H2 id="gotchas">Gotchas worth knowing</H2>
        <ul className="space-y-2 mb-4">
          {[
            'Set output: "standalone" in next.config to shrink what has to exist on the server at runtime.',
            'Environment variables: PM2 does not read .env.production automatically for npm start — Next.js does, at build and runtime, as long as the file sits in the app directory.',
            'next/image optimization uses sharp — npm ci installs it, but on minimal distros you may need build tools (sudo apt-get install -y build-essential).',
            'Open only ports 80/443 in your firewall; the Node port (3000) should stay internal.',
          ].map((item) => (
            <li
              key={item}
              className="text-[15px] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--lp-border)]"
              style={{ color: 'var(--lp-body)' }}
            >
              {item}
            </li>
          ))}
        </ul>

        <H2 id="automated">The automated route</H2>
        <P>
          Everything above — the Docker build, nginx config, SSL, restarts — is what Pushify
          automates on the same servers. Connect the repo, pick the server (your own VPS or a
          managed one), and every git push builds in isolation and goes live with a zero-downtime
          blue-green switch. Framework detection covers Next.js out of the box.
        </P>
        <div
          className="rounded-xl p-6 my-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)' }}
        >
          <div className="flex-1">
            <p className="font-semibold mb-1" style={{ color: 'var(--lp-ink)' }}>
              Same server. One push.
            </p>
            <p className="text-sm" style={{ color: 'var(--lp-body)' }}>
              git push → framework detected → Docker build → live with SSL, in under a minute.
            </p>
          </div>
          <Link href="/deploy/nextjs" className="lp-cta shrink-0">
            Deploy Next.js with Pushify
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs" style={{ color: 'var(--lp-muted)' }}>
          Commands verified on Ubuntu 22.04/24.04 with Node 22 and Next.js 14/15, July 2026.
          Something not working? Email support@pushify.dev and we&apos;ll fix the guide.
        </p>
      </article>
    </MarketingShell>
  );
}
