'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * A navigation link that stays inside the app.
 *
 * The navbar and footer used a plain `<a>` for every link, including the ones pointing at our own
 * pages. Every click was therefore a full document load: the router never ran, the page was built
 * again from scratch, and — because the locale lives in the browser and the Turkish dictionary is
 * a lazy chunk — a Turkish visitor watched the whole site render in English and then switch, on
 * every single page change.
 *
 * Internal hrefs go through next/link. External ones keep the anchor, because they genuinely leave.
 */
export function MarketingLink({
  href,
  external,
  children,
  ...rest
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  // A hash on the current page, a mailto: or an absolute URL is not ours to route.
  const leavesTheApp =
    external || /^(https?:|mailto:|tel:|#)/.test(href);

  if (leavesTheApp) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
