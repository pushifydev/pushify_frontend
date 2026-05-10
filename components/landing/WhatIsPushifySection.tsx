'use client';

import { useTranslation } from '@/hooks';
import { Github, ArrowUpRight } from 'lucide-react';

export function WhatIsPushifySection() {
  const { t } = useTranslation();

  const pillars = [
    { code: '01', titleKey: 'pillar1Title' as const, detailKey: 'pillar1Detail' as const },
    { code: '02', titleKey: 'pillar2Title' as const, detailKey: 'pillar2Detail' as const },
    { code: '03', titleKey: 'pillar3Title' as const, detailKey: 'pillar3Detail' as const },
    { code: '04', titleKey: 'pillar4Title' as const, detailKey: 'pillar4Detail' as const },
  ];

  return (
    <section
      id="what-is-pushify"
      className="relative border-t border-[var(--glass-border)]"
    >
      <div className="absolute right-2 md:right-10 top-10 lp-index select-none" aria-hidden>
        01
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-12 gap-6 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-3 flex items-start gap-3">
            <span className="lp-crosshair mt-2" />
            <div className="lp-eyebrow">
              §&nbsp;01 / {t('homepage', 'whatIsPushifyEyebrow')}
            </div>
          </div>

          <h2 className="col-span-12 md:col-span-9 lp-editorial text-[40px] md:text-[72px] lg:text-[92px] leading-[0.98] tracking-[-0.025em] text-[var(--text-primary)]">
            <span className="block">{t('homepage', 'whatIsPushifyTitle')}</span>
          </h2>
        </div>

        {/* Body — manifesto removed; restrained 2-column body + spec card */}
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="hidden md:block col-span-1 lp-mono text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)] pt-2">
            {t('homepage', 'whatIsBodyLabel')}
          </div>

          <div className="col-span-12 md:col-span-7 space-y-6 text-[16px] md:text-[17px] leading-[1.65] text-[var(--text-secondary)] max-w-[60ch]">
            <p>{t('homepage', 'whatIsPushifyP1')}</p>
            <p>{t('homepage', 'whatIsPushifyP2')}</p>
            <p>{t('homepage', 'whatIsPushifyP3')}</p>
          </div>

          <aside className="col-span-12 md:col-span-4 md:pl-6 md:border-l md:border-[var(--glass-border)]">
            <div className="lp-card p-6 md:p-7">
              <div className="flex items-center gap-2 mb-5">
                <Github className="w-4 h-4 text-[var(--accent-cyan)]" />
                <span className="lp-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {t('homepage', 'whatIsLicenseHeading')}
                </span>
              </div>

              <div className="lp-editorial text-[44px] leading-none text-[var(--text-primary)]">
                MIT
              </div>

              <p className="mt-4 text-[14px] leading-[1.55] text-[var(--text-secondary)]">
                {t('homepage', 'whatIsLicenseDescription')}
              </p>

              <a
                href="https://github.com/pushifydev"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 lp-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors"
              >
                github.com/pushifydev
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>
        </div>

        {/* Four pillars — catalog row */}
        <div className="lp-rule mt-20 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8">
          {pillars.map((p) => (
            <div key={p.code} className="border-t border-[var(--glass-border)] pt-5">
              <div className="lp-mono text-[11px] tracking-[0.16em] text-[var(--accent-cyan)] mb-3">
                {p.code}
              </div>
              <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5">
                {t('homepage', p.titleKey)}
              </div>
              <div className="text-[14px] leading-[1.55] text-[var(--text-secondary)]">
                {t('homepage', p.detailKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
