'use client';

import { useTranslation } from '@/hooks';
import { ArrowUpRight, Code2, Server, Cloud, Package } from 'lucide-react';
import { LandingSectionHeader } from './LandingSectionHeader';
import { Reveal } from './Reveal';

export function WhatIsPushifySection() {
  const { t } = useTranslation();

  const pillars = [
    { titleKey: 'pillar1Title' as const, detailKey: 'pillar1Detail' as const, Icon: Code2 },
    { titleKey: 'pillar2Title' as const, detailKey: 'pillar2Detail' as const, Icon: Server },
    { titleKey: 'pillar3Title' as const, detailKey: 'pillar3Detail' as const, Icon: Cloud },
    { titleKey: 'pillar4Title' as const, detailKey: 'pillar4Detail' as const, Icon: Package },
  ];

  return (
    <section id="what-is-pushify" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'whatIsPushifyEyebrow')}
          title={t('homepage', 'whatIsPushifyTitle')}
        />

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 mb-16">
          <div className="lg:col-span-2 space-y-5 lp-body">
            <p>{t('homepage', 'whatIsPushifyP1')}</p>
            <p>{t('homepage', 'whatIsPushifyP2')}</p>
            <p>{t('homepage', 'whatIsPushifyP3')}</p>
          </div>

          <aside className="lp-card p-6 h-fit">
            <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--lp-muted)' }}>
              {t('homepage', 'whatIsLicenseHeading')}
            </p>
            <p className="text-3xl font-semibold tracking-tight mb-3" style={{ color: 'var(--lp-ink)' }}>
              MIT
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--lp-body)' }}>
              {t('homepage', 'whatIsLicenseDescription')}
            </p>
            <a
              href="https://github.com/pushifydev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--lp-ink)' }}
            >
              github.com/pushifydev
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </aside>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {pillars.map((p, i) => (
            <Reveal key={p.titleKey} delay={i * 100}>
              <div className="lp-card p-5 h-full">
                <span
                  className="inline-flex w-9 h-9 items-center justify-center rounded-lg mb-3.5"
                  style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
                >
                  <p.Icon className="w-4 h-4" />
                </span>
                <h3 className="text-[0.9375rem] font-semibold mb-2" style={{ color: 'var(--lp-ink)' }}>
                  {t('homepage', p.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                  {t('homepage', p.detailKey)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
