'use client';

import Link from 'next/link';
import { Check, ArrowRight, ArrowUpRight } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from './MarketingShell';
import { LandingSectionHeader } from './LandingSectionHeader';
import { JsonLd } from '@/components/JsonLd';

export interface ComparisonRow {
  label: string;
  pushify: boolean;
  competitor: boolean;
}

export interface ComparisonPageViewProps {
  eyebrow: string;
  h1: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  tldrTitle: string;
  tldrBody: string;
  choosePushifyTitle: string;
  pushifyReasons: string[];
  chooseCompetitorTitle: string;
  competitorReasons: string[];
  tableTitle: string;
  tableNote: string;
  colFeature: string;
  colPushify: string;
  colCompetitor: string;
  rows: ComparisonRow[];
  diffTitle: string;
  diffs: { title: string; body: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  relatedTitle?: string;
  relatedLinks?: { href: string; label: string }[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}

function cell(val: boolean, highlight: boolean) {
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

export function ComparisonPageView(p: ComparisonPageViewProps) {
  return (
    <>
      {/* FAQ rich-result schema, built from the same FAQ content rendered below. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: p.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <MarketingShell noPad>
        <MarketingPageHero label={p.eyebrow} title={p.h1} description={p.subtitle} />

      <div className="lp-container -mt-4 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/register" className="lp-cta group">
          {p.ctaPrimary}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link href="/pricing" className="lp-cta-ghost">
          {p.ctaSecondary}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* TL;DR */}
      <section className="lp-section pt-10">
        <div className="lp-container max-w-3xl">
          <div className="lp-card p-6 md:p-8">
            <h2 className="lp-section-title mb-3">{p.tldrTitle}</h2>
            <p className="lp-body" style={{ color: 'var(--lp-body)' }}>{p.tldrBody}</p>
          </div>
        </div>
      </section>

      {/* Choose if */}
      <section className="lp-section">
        <div className="lp-container grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl">
          <div className="lp-card p-6" style={{ borderColor: 'var(--accent-cyan)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--lp-ink)' }}>
              {p.choosePushifyTitle}
            </h3>
            <ul className="space-y-2.5">
              {p.pushifyReasons.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--lp-body)' }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--accent-cyan)' }} strokeWidth={2.5} />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-card p-6">
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--lp-ink)' }}>
              {p.chooseCompetitorTitle}
            </h3>
            <ul className="space-y-2.5">
              {p.competitorReasons.map((r) => (
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
          <LandingSectionHeader title={p.tableTitle} align="center" className="mx-auto text-center" />
          <div className="lp-card overflow-hidden">
            <div
              className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-5 py-4 text-sm font-medium border-b border-[var(--lp-border)]"
              style={{ color: 'var(--lp-muted)', background: 'var(--bg-tertiary)' }}
            >
              <div>{p.colFeature}</div>
              <div className="text-center" style={{ color: 'var(--lp-ink)' }}>{p.colPushify}</div>
              <div className="text-center">{p.colCompetitor}</div>
            </div>
            {p.rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.5fr_1fr_1fr] gap-2 px-5 py-3.5 border-b border-[var(--lp-border)] last:border-b-0 items-center"
              >
                <div className="text-sm" style={{ color: 'var(--lp-ink)' }}>{row.label}</div>
                <div className="text-center">{cell(row.pushify, true)}</div>
                <div className="text-center">{cell(row.competitor, false)}</div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 text-center max-w-2xl mx-auto" style={{ color: 'var(--lp-muted)' }}>
            {p.tableNote}
          </p>
        </div>
      </section>

      {/* Key differences */}
      <section className="lp-section">
        <div className="lp-container max-w-4xl">
          <LandingSectionHeader title={p.diffTitle} align="center" className="mx-auto text-center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {p.diffs.map((d) => (
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
          <LandingSectionHeader title={p.faqTitle} align="center" className="mx-auto text-center" />
          <div className="space-y-3">
            {p.faqs.map((f) => (
              <div key={f.q} className="lp-card p-5">
                <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>{f.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related pages — internal linking for topical authority */}
      {p.relatedLinks && p.relatedLinks.length > 0 && (
        <section className="lp-section">
          <div className="lp-container max-w-4xl">
            {p.relatedTitle && (
              <LandingSectionHeader title={p.relatedTitle} align="center" className="mx-auto text-center" />
            )}
            <div className="flex flex-wrap justify-center gap-3">
              {p.relatedLinks.map((l) => (
                <Link key={l.href} href={l.href} className="lp-cta-ghost">
                  {l.label}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="lp-section">
        <div className="lp-container max-w-2xl text-center">
          <h2 className="lp-section-title mb-3">{p.ctaTitle}</h2>
          <p className="lp-lead mb-7">{p.ctaBody}</p>
          <Link href="/register" className="lp-cta group inline-flex">
            {p.ctaButton}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
      </MarketingShell>
    </>
  );
}
