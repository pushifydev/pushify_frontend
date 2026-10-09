'use client';

import { useTranslation } from '@/hooks';
import { LogoMark, LogoGlyph } from '@/components/logo';
import { MarketingLink } from './MarketingLink';
import { Github, Mail, ArrowUpRight, Heart } from 'lucide-react';

/** X's logo; lucide's `X` is a close icon. */
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** `lit` (the homepage): a large faint mark lit from below opens the footer. */
export function LandingFooter({ lit = false }: { lit?: boolean } = {}) {
  const { t } = useTranslation();

  const links = {
    [t('landing', 'product')]: [
      { label: t('landing', 'features'), href: '/features' },
      { label: t('landing', 'sites'), href: '/sites' },
      { label: t('landing', 'apps'), href: '/apps' },
      { label: t('domainSales', 'title'), href: '/domains' },
      { label: t('landing', 'pricing'), href: '/pricing' },
      {
        label: t('landing', 'cli'),
        href: 'https://www.npmjs.com/package/pushify-cli',
        external: true,
      },
    ],
    [t('landing', 'resources')]: [
      { label: t('branding', 'documentation'), href: '/docs' },
      { label: 'pushify.yaml', href: '/pushify-yaml' },
      {
        label: t('branding', 'github'),
        href: 'https://github.com/pushifydev',
        external: true,
      },
      {
        label: t('landing', 'changelog'),
        href: '/changelog',
      },
      { label: 'Status', href: '/status' },
      { label: t('landing', 'blog'), href: '/blog' },
      { label: t('landing', 'deployButton'), href: '/deploy-button' },
    ],
    // The four comparison links sat at the bottom of Resources and made that column twice the
    // height of the others — the last one wrapping onto three lines. They are a subject of their
    // own, and as a column they balance the row.
    [t('landing', 'compare')]: [
      { label: 'Coolify', href: '/vs/coolify' },
      { label: 'Dokploy', href: '/vs/dokploy' },
      { label: 'Vercel', href: '/vs/vercel' },
      { label: 'Heroku', href: '/vs/heroku' },
      { label: 'Railway', href: '/vs/railway' },
      { label: 'Render', href: '/vs/render' },
      { label: t('landing', 'allAlternatives'), href: '/alternatives' },
    ],
    [t('landing', 'company')]: [
      { label: t('legal', 'about'), href: '/about' },
      { label: t('landing', 'partners'), href: '/partners' },
      { label: t('landing', 'contact'), href: '/contact' },
    ],
    [t('legal', 'legal')]: [
      { label: t('legal', 'privacy'), href: '/privacy' },
      { label: t('legal', 'terms'), href: '/terms' },
      { label: t('legal', 'refund'), href: '/refund' },
      { label: t('legal', 'acceptableUse'), href: '/acceptable-use' },
      { label: t('legal', 'reportAbuse'), href: '/abuse' },
      { label: t('legal', 'security'), href: '/security' },
      { label: t('legal', 'exitPlan'), href: '/exit-plan' },
    ],
  };

  const socials = [
    {
      icon: <Github className="w-4 h-4" />,
      href: 'https://github.com/pushifydev',
      label: t('landing', 'socialGithub'),
    },
    {
      icon: <XLogo className="w-4 h-4" />,
      href: 'https://x.com/pushifydev',
      label: t('landing', 'socialX'),
    },
    {
      icon: <Mail className="w-4 h-4" />,
      href: 'mailto:support@pushify.dev',
      label: t('landing', 'socialEmail'),
    },
  ];

  return (
    <footer className="hp-footer border-t border-[var(--lp-border)]">
      {lit && (
        <div className="hp-footer-mark" aria-hidden="true">
          <LogoGlyph size={176} />
        </div>
      )}
      {/* Light rising from the bottom edge of the page. */}
      <div className="hp-footer-glow" aria-hidden="true" />
      <div className="lp-container py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-8 gap-y-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark size={28} tone="page" />
              <span className="font-semibold text-base tracking-tight">Pushify</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: 'var(--lp-muted)' }}>
              {t('landing', 'footerDescription')}
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md flex items-center justify-center border border-[var(--lp-border)] transition-colors hover:bg-[var(--hover-overlay-md)]"
                  style={{ color: 'var(--lp-muted)' }}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h2
                className="text-[12px] uppercase tracking-[0.1em] mb-4"
                style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-label)' }}
              >
                {title}
              </h2>
              <ul className="space-y-2.5">
                {items.map((link) => {
                  const isExternal = (link as { external?: boolean }).external;
                  return (
                    <li key={link.label}>
                      <MarketingLink
                        href={link.href}
                        external={isExternal}
                        className="text-sm inline-flex items-center gap-1 py-1 transition-colors hover:underline underline-offset-4"
                        style={{ color: 'var(--lp-body)' }}
                      >
                        {link.label}
                        {isExternal && <ArrowUpRight className="w-3 h-3 opacity-50" />}
                      </MarketingLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-8 border-t border-[var(--lp-border)] flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: 'var(--lp-muted)' }}
        >
          <p>
            &copy; {new Date().getFullYear()} Pushify LLC. {t('landing', 'openSourceUnderMit')}.
          </p>
          {/* The heart was missing, so every page read "Built with for developers". Both
              halves are ordered so the icon sits correctly in English and Turkish alike. */}
          <p className="inline-flex items-center gap-1.5">
            {t('landing', 'builtWithLove')}
            <Heart className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            {t('landing', 'forDevelopers')}
          </p>
        </div>
      </div>
    </footer>
  );
}
