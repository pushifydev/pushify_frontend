'use client';

import { useTranslation } from '@/hooks';
import { LogoMark } from '@/components/logo';
import { Github, Mail, ArrowUpRight } from 'lucide-react';

export function LandingFooter() {
  const { t } = useTranslation();

  const links = {
    [t('landing', 'product')]: [
      { label: t('landing', 'features'), href: '/features' },
      { label: t('landing', 'sites'), href: '/sites' },
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
      {
        label: t('branding', 'github'),
        href: 'https://github.com/pushifydev',
        external: true,
      },
      {
        label: t('landing', 'changelog'),
        href: '/changelog',
      },
      { label: t('vsCoolify', 'h1'), href: '/vs/coolify' },
      { label: t('vsVercel', 'h1'), href: '/vs/vercel' },
    ],
    [t('landing', 'company')]: [
      { label: t('legal', 'about'), href: '/about' },
      { label: t('landing', 'contact'), href: 'mailto:support@pushify.dev' },
    ],
    [t('legal', 'legal')]: [
      { label: t('legal', 'privacy'), href: '/privacy' },
      { label: t('legal', 'terms'), href: '/terms' },
      { label: t('legal', 'refund'), href: '/refund' },
    ],
  };

  const socials = [
    {
      icon: <Github className="w-4 h-4" />,
      href: 'https://github.com/pushifydev',
      label: t('landing', 'socialGithub'),
    },
    {
      icon: <Mail className="w-4 h-4" />,
      href: 'mailto:support@pushify.dev',
      label: t('landing', 'socialEmail'),
    },
  ];

  return (
    <footer className="border-t border-[var(--lp-border)]">
      <div className="lp-container py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark size={28} />
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
              <h4 className="text-xs font-medium mb-4" style={{ color: 'var(--lp-muted)' }}>
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((link) => {
                  const isExternal = (link as { external?: boolean }).external;
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="text-sm inline-flex items-center gap-1 py-1 transition-colors hover:underline underline-offset-4"
                        style={{ color: 'var(--lp-body)' }}
                      >
                        {link.label}
                        {isExternal && <ArrowUpRight className="w-3 h-3 opacity-50" />}
                      </a>
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
            &copy; {new Date().getFullYear()} Pushify. {t('landing', 'openSourceUnderMit')}.
          </p>
          <p>
            {t('landing', 'builtWithLove')} {t('landing', 'forDevelopers')}
          </p>
        </div>
      </div>
    </footer>
  );
}
