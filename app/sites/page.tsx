'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, LayoutTemplate, Files, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell, MarketingPageHero, LandingSectionHeader, SiteBuilderMockup } from '@/components/landing';

export default function SitesPage() {
  const { t } = useTranslation();

  const steps = [
    { title: t('sitesPage', 'step1Title'), desc: t('sitesPage', 'step1Desc') },
    { title: t('sitesPage', 'step2Title'), desc: t('sitesPage', 'step2Desc') },
    { title: t('sitesPage', 'step3Title'), desc: t('sitesPage', 'step3Desc') },
    { title: t('sitesPage', 'step4Title'), desc: t('sitesPage', 'step4Desc') },
  ];

  const feats = [
    { icon: LayoutTemplate, title: t('sitesPage', 'feat1Title'), desc: t('sitesPage', 'feat1Desc') },
    { icon: Files, title: t('sitesPage', 'feat2Title'), desc: t('sitesPage', 'feat2Desc') },
    { icon: Globe, title: t('sitesPage', 'feat3Title'), desc: t('sitesPage', 'feat3Desc') },
  ];

  const faqs = [
    { q: t('sitesPage', 'faq1Q'), a: t('sitesPage', 'faq1A') },
    { q: t('sitesPage', 'faq2Q'), a: t('sitesPage', 'faq2A') },
    { q: t('sitesPage', 'faq3Q'), a: t('sitesPage', 'faq3A') },
    { q: t('sitesPage', 'faq4Q'), a: t('sitesPage', 'faq4A') },
  ];

  return (
    <MarketingShell noPad>
      <MarketingPageHero
        label={t('sitesPage', 'eyebrow')}
        title={t('sitesPage', 'h1')}
        description={t('sitesPage', 'subtitle')}
      />

      <div className="lp-container -mt-4 mb-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/register" className="lp-cta group">
          {t('sitesPage', 'ctaPrimary')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="/pricing" className="lp-cta-ghost">
          {t('sitesPage', 'ctaSecondary')}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="lp-container max-w-4xl pt-10">
        <SiteBuilderMockup />
      </div>

      {/* How it works */}
      <section className="lp-section">
        <div className="lp-container">
          <LandingSectionHeader
            title={t('sitesPage', 'howTitle')}
            align="center"
            className="mx-auto text-center"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <div key={s.title} className="lp-card p-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold mb-3.5"
                  style={{ color: 'var(--accent-cyan)', background: 'color-mix(in srgb, var(--accent-cyan) 12%, transparent)' }}
                >
                  {i + 1}
                </div>
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature deep-dives */}
      <section className="lp-section">
        <div className="lp-container grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {feats.map((f) => (
            <div key={f.title} className="lp-card p-6">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3.5"
                style={{ color: 'var(--lp-ink)', background: 'var(--lp-border)' }}
              >
                <f.icon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--lp-ink)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section">
        <div className="lp-container max-w-3xl">
          <LandingSectionHeader title={t('sitesPage', 'faqTitle')} align="center" className="mx-auto text-center" />
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.q} className="lp-card p-5">
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>{f.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section">
        <div className="lp-container max-w-2xl text-center">
          <h2 className="lp-section-title mb-3">{t('sitesPage', 'ctaTitle')}</h2>
          <p className="lp-lead mb-7">{t('sitesPage', 'ctaBody')}</p>
          <Link href="/register" className="lp-cta group inline-flex">
            {t('sitesPage', 'ctaButton')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
