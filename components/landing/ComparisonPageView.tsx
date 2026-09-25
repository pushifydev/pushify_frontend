'use client';

import Link from 'next/link';
import { Check, Minus, ArrowRight, ArrowUpRight } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from './MarketingShell';
import { MSection, RuleGrid, RuleCell, Faq } from './MarketingKit';
import { JsonLd } from '@/components/JsonLd';
import { useTranslation } from '@/hooks';

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

/** Section labels the comparison copy doesn't carry; the rest comes from each page's namespace. */
const copy = {
  en: {
    fitEyebrow: 'When to pick which',
    fitTitle: 'Which one fits you?',
    diffEyebrow: 'Differences',
    faqEyebrow: 'FAQ',
    summaryQ: (name: string) => `In short: how do Pushify and ${name} differ?`,
    relatedTitle: 'Other comparisons and guides',
    yes: 'Yes',
    no: 'No',
  },
  tr: {
    fitEyebrow: 'Hangisi ne zaman',
    fitTitle: 'Hangisi size uygun?',
    diffEyebrow: 'Farklar',
    faqEyebrow: 'SSS',
    summaryQ: (name: string) => `Kısaca: Pushify ile ${name} arasındaki fark ne?`,
    relatedTitle: 'Diğer karşılaştırmalar ve rehberler',
    yes: 'Var',
    no: 'Yok',
  },
};

function Mark({ value, ours, yes, no }: { value: boolean; ours: boolean; yes: string; no: string }) {
  return value ? (
    <>
      <Check
        className="w-[18px] h-[18px] mx-auto"
        style={{ color: ours ? 'var(--hp-ink)' : 'var(--hp-body)' }}
        strokeWidth={2}
        aria-hidden="true"
      />
      <span className="sr-only">{yes}</span>
    </>
  ) : (
    <>
      <Minus className="w-4 h-4 mx-auto" style={{ color: 'var(--hp-muted)', opacity: 0.6 }} aria-hidden="true" />
      <span className="sr-only">{no}</span>
    </>
  );
}

/** The Pushify column's tint: a token blend, so it shows in both themes. */
const OURS_BG = 'color-mix(in srgb, var(--hp-ink) 5%, transparent)';

/** The page's one object: the side-by-side sheet, framed like a card and placed right under the hero. */
function ComparisonTable({ p, yes, no }: { p: ComparisonPageViewProps; yes: string; no: string }) {
  const head = 'hp-mono py-3.5 text-[11px] font-normal uppercase tracking-[0.1em]';
  return (
    <figure
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: 'var(--hp-line-strong)', background: 'var(--hp-card)' }}
    >
      <table className="w-full text-left border-collapse">
        <caption className="sr-only">{p.tableTitle}</caption>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--hp-line-strong)' }}>
            <th scope="col" className={`${head} pl-5 md:pl-7 pr-3`} style={{ color: 'var(--hp-muted)' }}>
              {p.colFeature}
            </th>
            <th
              scope="col"
              className={`${head} px-2 text-center w-[24%] sm:w-[20%]`}
              style={{ color: 'var(--hp-ink)', background: OURS_BG }}
            >
              {p.colPushify}
            </th>
            <th scope="col" className={`${head} px-2 pr-4 md:pr-6 text-center w-[24%] sm:w-[20%]`} style={{ color: 'var(--hp-muted)' }}>
              {p.colCompetitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {p.rows.map((row, i) => (
            <tr key={row.label} style={i > 0 ? { borderTop: '1px solid var(--hp-line)' } : undefined}>
              <th
                scope="row"
                className="py-3.5 pl-5 md:pl-7 pr-3 text-[0.95rem] font-normal leading-snug"
                style={{ color: 'var(--hp-ink)' }}
              >
                {row.label}
              </th>
              <td className="py-3.5 px-2 text-center" style={{ background: OURS_BG }}>
                <Mark value={row.pushify} ours yes={yes} no={no} />
              </td>
              <td className="py-3.5 px-2 pr-4 md:pr-6 text-center">
                <Mark value={row.competitor} ours={false} yes={yes} no={no} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption
        className="px-5 md:px-7 py-4 text-[13px] leading-relaxed"
        style={{ color: 'var(--hp-muted)', borderTop: '1px solid var(--hp-line-strong)' }}
      >
        {p.tableNote}
      </figcaption>
    </figure>
  );
}

/** One side of "choose X if…": short lines under hairlines, no icons. */
function ReasonCard({ title, items, ours }: { title: string; items: string[]; ours: boolean }) {
  return (
    <div className="hp-diff-card" data-ours={ours ? 'true' : undefined}>
      <h3 className="text-[1.25rem] font-medium tracking-[-0.01em]" style={{ color: 'var(--hp-ink)' }}>
        {title}
      </h3>
      <ul className="mt-5">
        {items.map((r) => (
          <li
            key={r}
            className="py-3 text-[0.95rem] leading-relaxed"
            style={{ borderTop: '1px solid var(--hp-line)', color: ours ? 'var(--hp-ink)' : 'var(--hp-body)' }}
          >
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ComparisonPageView(p: ComparisonPageViewProps) {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  // The long "short version" reads best as the first answer, not as a wall of text above the table.
  const faqItems = [{ q: c.summaryQ(p.colCompetitor), a: p.tldrBody }, ...p.faqs];

  return (
    <>
      {/* FAQ rich-result schema, built from the page's FAQ content rendered below. */}
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

        <div className="lp-container -mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="lp-cta group">
            {p.ctaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/pricing" className="lp-cta-ghost">
            {p.ctaSecondary}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* The comparison sheet — the first thing under the hero */}
        <div className="lp-container max-w-3xl pt-14 md:pt-16 pb-20 md:pb-24">
          <ComparisonTable p={p} yes={c.yes} no={c.no} />
        </div>

        {/* Choose if… — the two sides, so these stay as a pair of cards. */}
        <MSection eyebrow={c.fitEyebrow} title={c.fitTitle} align="center">
          <div className="hp-diff">
            <ReasonCard title={p.choosePushifyTitle} items={p.pushifyReasons} ours />
            <ReasonCard title={p.chooseCompetitorTitle} items={p.competitorReasons} ours={false} />
          </div>
        </MSection>

        {/* Key differences */}
        <MSection eyebrow={c.diffEyebrow} title={p.diffTitle}>
          <RuleGrid cols={3}>
            {p.diffs.map((d) => (
              <RuleCell key={d.title} title={d.title}>
                {d.body}
              </RuleCell>
            ))}
          </RuleGrid>
        </MSection>

        {/* FAQ */}
        <MSection eyebrow={c.faqEyebrow} title={p.faqTitle} align="center">
          <Faq items={faqItems} />
        </MSection>

        {/* Related pages — internal linking for topical authority */}
        {p.relatedLinks && p.relatedLinks.length > 0 && (
          <MSection eyebrow={p.relatedTitle} title={c.relatedTitle}>
            <RuleGrid cols={p.relatedLinks.length % 4 === 0 ? 4 : p.relatedLinks.length % 3 === 0 ? 3 : 2}>
              {p.relatedLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-start justify-between gap-4 p-6 md:p-7 transition-colors hover:bg-(--hp-card)"
                >
                  <span className="text-[1rem] font-medium leading-snug" style={{ color: 'var(--hp-ink)' }}>
                    {l.label}
                  </span>
                  <ArrowUpRight
                    className="w-4 h-4 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    style={{ color: 'var(--hp-muted)' }}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </RuleGrid>
          </MSection>
        )}

        {/* Closing call */}
        <MSection title={p.ctaTitle} lead={p.ctaBody} align="center">
          <div className="-mt-4 flex justify-center">
            <Link href="/register" className="lp-cta group">
              {p.ctaButton}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </MSection>
      </MarketingShell>
    </>
  );
}
