'use client';

import Link from 'next/link';
import { Check, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell, MarketingPageHero, LandingSectionHeader } from '@/components/landing';

type Cell = boolean;

function cell(val: Cell, highlight: boolean) {
  return val ? (
    <Check
      className="w-5 h-5 mx-auto"
      style={{ color: highlight ? 'var(--accent-cyan)' : 'var(--lp-ink)' }}
      strokeWidth={2}
    />
  ) : (
    <span className="text-[var(--lp-muted)] opacity-40">—</span>
  );
}

export default function VsCoolifyPage() {
  const { t } = useTranslation();

  const rows: { label: string; pushify: Cell; coolify: Cell }[] = [
    { label: t('homepage', 'rowOpenSource'), pushify: true, coolify: true },
    { label: t('homepage', 'rowSelfHost'), pushify: true, coolify: true },
    { label: t('homepage', 'rowFreeTier'), pushify: true, coolify: true },
    { label: t('homepage', 'rowOwnServers'), pushify: true, coolify: true },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, coolify: true },
    { label: t('homepage', 'rowMarketplace'), pushify: true, coolify: true },
    { label: t('vsCoolify', 'rowManagedCloud'), pushify: true, coolify: true },
    { label: t('vsCoolify', 'rowProvisioning'), pushify: true, coolify: false },
    { label: t('vsCoolify', 'rowOneClickInstall'), pushify: false, coolify: true },
    { label: t('vsCoolify', 'rowCommunity'), pushify: false, coolify: true },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, coolify: false },
    { label: t('homepage', 'rowSiteBuilder'), pushify: true, coolify: false },
    { label: t('vsCoolify', 'rowBilling'), pushify: true, coolify: false },
  ];

  const pushifyReasons = [
    t('vsCoolify', 'choosePushify1'),
    t('vsCoolify', 'choosePushify2'),
    t('vsCoolify', 'choosePushify3'),
    t('vsCoolify', 'choosePushify4'),
  ];
  const coolifyReasons = [
    t('vsCoolify', 'chooseCoolify1'),
    t('vsCoolify', 'chooseCoolify2'),
    t('vsCoolify', 'chooseCoolify3'),
  ];
  const diffs = [
    { title: t('vsCoolify', 'diff1Title'), body: t('vsCoolify', 'diff1Body') },
    { title: t('vsCoolify', 'diff2Title'), body: t('vsCoolify', 'diff2Body') },
    { title: t('vsCoolify', 'diff3Title'), body: t('vsCoolify', 'diff3Body') },
  ];
  const faqs = [
    { q: t('vsCoolify', 'faq1Q'), a: t('vsCoolify', 'faq1A') },
    { q: t('vsCoolify', 'faq2Q'), a: t('vsCoolify', 'faq2A') },
    { q: t('vsCoolify', 'faq3Q'), a: t('vsCoolify', 'faq3A') },
    { q: t('vsCoolify', 'faq4Q'), a: t('vsCoolify', 'faq4A') },
  ];

  return (
    <MarketingShell noPad>
      <MarketingPageHero
        label={t('vsCoolify', 'eyebrow')}
        title={t('vsCoolify', 'h1')}
        description={t('vsCoolify', 'subtitle')}
      />

      <div className="lp-container -mt-4 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/register" className="lp-cta group">
          {t('vsCoolify', 'ctaPrimary')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="/pricing" className="lp-cta-ghost">
          {t('vsCoolify', 'ctaSecondary')}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* TL;DR */}
      <section className="lp-section pt-10">
        <div className="lp-container max-w-3xl">
          <div className="lp-card p-6 md:p-8">
            <h2 className="lp-section-title mb-3">{t('vsCoolify', 'tldrTitle')}</h2>
            <p className="lp-body" style={{ color: 'var(--lp-body)' }}>
              {t('vsCoolify', 'tldrBody')}
            </p>
          </div>
        </div>
      </section>

      {/* Choose if */}
      <section className="lp-section">
        <div className="lp-container grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl">
          <div className="lp-card p-6" style={{ borderColor: 'var(--accent-cyan)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--lp-ink)' }}>
              {t('vsCoolify', 'choosePushifyTitle')}
            </h3>
            <ul className="space-y-2.5">
              {pushifyReasons.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--lp-body)' }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} strokeWidth={2.5} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-card p-6">
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--lp-ink)' }}>
              {t('vsCoolify', 'chooseCoolifyTitle')}
            </h3>
            <ul className="space-y-2.5">
              {coolifyReasons.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--lp-body)' }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--lp-muted)' }} strokeWidth={2.5} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="lp-section">
        <div className="lp-container max-w-4xl">
          <LandingSectionHeader title={t('vsCoolify', 'tableTitle')} align="center" className="mx-auto text-center" />
          <div className="lp-card overflow-hidden">
            <div
              className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-5 py-4 text-sm font-medium border-b border-[var(--lp-border)]"
              style={{ color: 'var(--lp-muted)', background: 'var(--bg-tertiary)' }}
            >
              <div>{t('homepage', 'comparisonColumnFeature')}</div>
              <div className="text-center" style={{ color: 'var(--lp-ink)' }}>{t('homepage', 'colPushify')}</div>
              <div className="text-center">{t('vsCoolify', 'colCoolify')}</div>
            </div>
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-5 py-3.5 border-b border-[var(--lp-border)] last:border-b-0 items-center"
              >
                <div className="text-sm" style={{ color: 'var(--lp-ink)' }}>{row.label}</div>
                <div className="text-center">{cell(row.pushify, true)}</div>
                <div className="text-center">{cell(row.coolify, false)}</div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 text-center max-w-2xl mx-auto" style={{ color: 'var(--lp-muted)' }}>
            {t('vsCoolify', 'tableNote')}
          </p>
        </div>
      </section>

      {/* Key differences */}
      <section className="lp-section">
        <div className="lp-container max-w-4xl">
          <LandingSectionHeader title={t('vsCoolify', 'diffTitle')} align="center" className="mx-auto text-center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {diffs.map((d) => (
              <div key={d.title} className="lp-card p-6">
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--lp-ink)' }}>{d.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section">
        <div className="lp-container max-w-3xl">
          <LandingSectionHeader title={t('vsCoolify', 'faqTitle')} align="center" className="mx-auto text-center" />
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
          <h2 className="lp-section-title mb-3">{t('vsCoolify', 'ctaTitle')}</h2>
          <p className="lp-lead mb-7">{t('vsCoolify', 'ctaBody')}</p>
          <Link href="/register" className="lp-cta group inline-flex">
            {t('vsCoolify', 'ctaButton')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
