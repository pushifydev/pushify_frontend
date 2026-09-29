import Link from 'next/link';
import { MarketingShell } from '@/components/landing';
import { DOC_NAV } from '@/lib/docs';

/** Sidebar + article (+ "on this page") for /docs and /docs/<page>. Server-rendered. */
export function DocsGuideShell({
  current,
  headings = [],
  children,
}: {
  current: string | null;
  headings?: { id: string; text: string }[];
  children: React.ReactNode;
}) {
  const nav = (
    <nav aria-label="Documentation">
      <Link href="/docs" className="docs-guide-link" aria-current={current === null ? 'page' : undefined}>
        Overview
      </Link>
      {DOC_NAV.map((g) => (
        <div key={g.group}>
          <p className="docs-guide-group">{g.group}</p>
          {g.items.map((item) => (
            <Link
              key={item.slug}
              href={`/docs/${item.slug}`}
              className="docs-guide-link"
              aria-current={current === item.slug ? 'page' : undefined}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
      <p className="docs-guide-group">Reference</p>
      <Link href="/docs/api" className="docs-guide-link">
        API reference
      </Link>
      <Link href="/pushify-yaml" className="docs-guide-link">
        pushify.yaml
      </Link>
      <Link href="/exit-plan" className="docs-guide-link">
        Exit plan
      </Link>
    </nav>
  );

  return (
    <MarketingShell noPad>
      <div className="lp-container pt-14 md:pt-16">
        <div className="docs-guide">
          <aside className="docs-guide-nav docs-guide-aside">
            <details className="lg:hidden" open={false}>
              <summary>Documentation menu ▾</summary>
              {nav}
            </details>
            <div className="hidden lg:block">{nav}</div>
          </aside>
          <article className="min-w-0">{children}</article>
          <aside className="docs-guide-toc docs-guide-aside">
            {headings.length > 0 && (
              <>
                <p className="docs-guide-group" style={{ marginTop: 0 }}>
                  On this page
                </p>
                {headings.map((h) => (
                  <a key={h.id} href={`#${h.id}`}>
                    {h.text}
                  </a>
                ))}
              </>
            )}
          </aside>
        </div>
      </div>
    </MarketingShell>
  );
}
