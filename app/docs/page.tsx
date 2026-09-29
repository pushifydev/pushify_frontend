import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsGuideShell } from '@/components/docs/DocsGuideShell';
import { LegacyAnchorRedirect } from '@/components/docs/LegacyAnchorRedirect';
import { DOC_NAV } from '@/lib/docs';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'How to deploy on Pushify: connect or rent a server, deploy from Git, domains, databases, scaling, teams, billing and the CLI.',
  alternates: { canonical: '/docs' },
};

const starts = [
  {
    title: 'Your own server',
    body: 'Connect any Ubuntu VPS over SSH. Pushify installs what it needs and deploys there.',
    href: '/docs/getting-started#connect-your-own-server',
  },
  {
    title: 'A server from Pushify',
    body: 'Rent a Hetzner server from the dashboard, billed by the hour from a prepaid balance.',
    href: '/docs/servers#managed-servers',
  },
  {
    title: 'No server',
    body: 'Upload a static site and get a https://…pushify.dev address.',
    href: '/docs/getting-started#try-it-without-a-server',
  },
];

export default function DocsOverviewPage() {
  return (
    <DocsGuideShell current={null}>
      <LegacyAnchorRedirect />
      <h1 className="text-[2rem] font-medium tracking-[-0.02em]" style={{ color: 'var(--hp-ink)' }}>
        Documentation
      </h1>
      <p className="mt-3 text-[1.0625rem]" style={{ color: 'var(--hp-body)' }}>
        Deploy apps from Git to a server you own or one Pushify rents for you. Start with one of these:
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {starts.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="rounded-xl border p-5 transition-colors hover:bg-(--hp-card)"
            style={{ borderColor: 'var(--hp-line-strong)' }}
          >
            <span className="block font-medium" style={{ color: 'var(--hp-ink)' }}>
              {s.title}
            </span>
            <span className="mt-1.5 block text-[0.9375rem]" style={{ color: 'var(--hp-body)' }}>
              {s.body}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {DOC_NAV.map((g) => (
          <section key={g.group}>
            <h2 className="docs-guide-group" style={{ marginTop: 0 }}>
              {g.group}
            </h2>
            {g.items.map((item) => (
              <Link key={item.slug} href={`/docs/${item.slug}`} className="docs-guide-link">
                {item.title}
              </Link>
            ))}
          </section>
        ))}
        <section>
          <h2 className="docs-guide-group" style={{ marginTop: 0 }}>
            Reference
          </h2>
          <Link href="/docs/api" className="docs-guide-link">
            API reference
          </Link>
          <Link href="/pushify-yaml" className="docs-guide-link">
            pushify.yaml
          </Link>
        </section>
      </div>
    </DocsGuideShell>
  );
}
