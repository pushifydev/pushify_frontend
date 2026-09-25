'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, Minus } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';

/**
 * Locale-neutral facts (licenses, prices) live here; verify against public pricing
 * pages when updating. Editorial copy comes from the `alternatives` i18n namespace.
 * Last verified: July 2026.
 */
const MATRIX = {
  selfHosted: [
    { name: 'Pushify', license: 'MIT', selfHost: true, cloud: true, from: '$0 self-host', model: 'Flat monthly per server' },
    { name: 'Coolify', license: 'Apache-2.0', selfHost: true, cloud: true, from: '$0 self-host · cloud from $5/mo', model: 'Flat' },
    { name: 'Dokploy', license: 'Source-available', selfHost: true, cloud: true, from: '$0 self-host · cloud ~$4.50/server/mo', model: 'Flat per server' },
    { name: 'CapRover', license: 'MIT', selfHost: true, cloud: false, from: '$0 — no paid tier', model: '—' },
    { name: 'Dokku', license: 'MIT (core)', selfHost: true, cloud: false, from: '$0 · Pro is a paid add-on', model: 'One-time (Pro)' },
  ],
  managed: [
    { name: 'Heroku', license: 'Proprietary', selfHost: false, cloud: true, from: '$5 Eco (sleeps) · $7 Basic dyno', model: 'Per dyno + add-ons' },
    { name: 'Railway', license: 'Proprietary', selfHost: false, cloud: true, from: '$5/mo Hobby (incl. $5 usage)', model: 'Usage-based' },
    { name: 'Render', license: 'Proprietary', selfHost: false, cloud: true, from: '$7/mo per always-on service', model: 'Plan + compute' },
  ],
};

const TOOL_KEYS = [
  { name: 'Coolify', body: 'coolifyBody', best: 'coolifyBest', group: 'selfHosted' },
  { name: 'Dokploy', body: 'dokployBody', best: 'dokployBest', group: 'selfHosted' },
  { name: 'CapRover', body: 'caproverBody', best: 'caproverBest', group: 'selfHosted' },
  { name: 'Dokku', body: 'dokkuBody', best: 'dokkuBest', group: 'selfHosted' },
  { name: 'Heroku', body: 'herokuBody', best: 'herokuBest', group: 'managed' },
  { name: 'Railway', body: 'railwayBody', best: 'railwayBest', group: 'managed' },
  { name: 'Render', body: 'renderBody', best: 'renderBest', group: 'managed' },
] as const;

/** Section labels the `alternatives` namespace doesn't carry. */
const copy = {
  en: {
    toolsEyebrow: 'Tool by tool',
    toolsTitle: 'What each one is good at',
    chooseEyebrow: 'Decision guide',
    compareEyebrow: 'Side by side',
    compare: 'Side-by-side comparisons',
    yes: 'Yes',
    no: 'No',
  },
  tr: {
    toolsEyebrow: 'Araç araç',
    toolsTitle: 'Hangisi neyde iyi',
    chooseEyebrow: 'Karar rehberi',
    compareEyebrow: 'Birebir',
    compare: 'Birebir karşılaştırmalar',
    yes: 'Var',
    no: 'Yok',
  },
} as const;

type Copy = (typeof copy)['en' | 'tr'];
type T = ReturnType<typeof useTranslation>['t'];

const OURS_BG = 'color-mix(in srgb, var(--hp-ink) 5%, transparent)';

function Mark({ value, c }: { value: boolean; c: Copy }) {
  return value ? (
    <>
      <Check className="w-4 h-4 mx-auto" style={{ color: 'var(--hp-ink)' }} strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">{c.yes}</span>
    </>
  ) : (
    <>
      <Minus className="w-4 h-4 mx-auto" style={{ color: 'var(--hp-muted)', opacity: 0.6 }} aria-hidden="true" />
      <span className="sr-only">{c.no}</span>
    </>
  );
}

/** The page's one object: every platform in one framed sheet, grouped by how you run it. */
function Matrix({ t, c, groupLabel }: { t: T; c: Copy; groupLabel: Record<keyof typeof MATRIX, string> }) {
  const th = 'hp-mono py-3.5 px-4 text-[11px] font-normal uppercase tracking-[0.1em] whitespace-nowrap';
  return (
    <figure
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: 'var(--hp-line-strong)', background: 'var(--hp-card)' }}
    >
      <div className="relative overflow-x-auto">
        <table className="w-full text-left border-collapse text-[0.9rem]" style={{ minWidth: 720 }}>
          <caption className="sr-only">{t('alternatives', 'matrixTitle')}</caption>
          <thead>
            <tr style={{ color: 'var(--hp-muted)' }}>
              <th scope="col" className={`${th} pl-5 md:pl-6`}>{t('alternatives', 'colPlatform')}</th>
              <th scope="col" className={th}>{t('alternatives', 'colLicense')}</th>
              <th scope="col" className={`${th} text-center`}>{t('alternatives', 'colSelfHost')}</th>
              <th scope="col" className={`${th} text-center`}>{t('alternatives', 'colManagedCloud')}</th>
              <th scope="col" className={th}>{t('alternatives', 'colFrom')}</th>
              <th scope="col" className={`${th} pr-5 md:pr-6`}>{t('alternatives', 'colModel')}</th>
            </tr>
          </thead>
          {(['selfHosted', 'managed'] as const).map((group) => (
            <tbody key={group}>
              <tr style={{ borderTop: '1px solid var(--hp-line-strong)' }}>
                <th
                  scope="colgroup"
                  colSpan={6}
                  className="hp-mono pt-5 pb-2 pl-5 md:pl-6 text-[11px] font-normal uppercase tracking-[0.1em]"
                  style={{ color: 'var(--hp-muted)' }}
                >
                  {groupLabel[group]}
                </th>
              </tr>
              {MATRIX[group].map((row) => {
                const isPushify = row.name === 'Pushify';
                return (
                  <tr
                    key={row.name}
                    style={{ borderTop: '1px solid var(--hp-line)', background: isPushify ? OURS_BG : undefined }}
                  >
                    <th scope="row" className="py-3.5 px-4 pl-5 md:pl-6 font-medium whitespace-nowrap" style={{ color: 'var(--hp-ink)' }}>
                      {row.name}
                    </th>
                    <td className="py-3.5 px-4" style={{ color: 'var(--hp-body)' }}>{row.license}</td>
                    <td className="py-3.5 px-4 text-center"><Mark value={row.selfHost} c={c} /></td>
                    <td className="py-3.5 px-4 text-center"><Mark value={row.cloud} c={c} /></td>
                    <td className="py-3.5 px-4" style={{ color: 'var(--hp-body)' }}>{row.from}</td>
                    <td className="py-3.5 px-4 pr-5 md:pr-6" style={{ color: 'var(--hp-body)' }}>{row.model}</td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      <figcaption
        className="px-5 md:px-6 py-4 text-[13px] leading-relaxed"
        style={{ color: 'var(--hp-muted)', borderTop: '1px solid var(--hp-line-strong)' }}
      >
        {t('alternatives', 'matrixNote')}
      </figcaption>
    </figure>
  );
}

/** A tool as one row: name and who it suits up front, the longer write-up one click away. */
function ToolRow({ id, group, name, best, body, bestFor }: { id?: string; group: string; name: string; best: string; body: string; bestFor: string }) {
  return (
    <details id={id}>
      <summary>
        <span className="flex-1 grid gap-1.5 md:grid-cols-[12rem_1fr] md:gap-8 text-left">
          <span>
            <span className="block">{name}</span>
            <span className="hp-mono block mt-1 text-[11px] font-normal uppercase tracking-[0.1em]" style={{ color: 'var(--hp-muted)' }}>
              {group}
            </span>
          </span>
          <span className="text-[1rem] font-normal leading-relaxed tracking-normal" style={{ color: 'var(--hp-body)' }}>
            <span className="sr-only">{bestFor}: </span>
            {best}
          </span>
        </span>
      </summary>
      <div className="md:pl-[14rem]">{body}</div>
    </details>
  );
}

/** "Question? Answer." → a cell title and body. */
function splitQuestion(s: string) {
  const i = s.indexOf('?');
  return i > 0 ? { q: s.slice(0, i + 1), a: s.slice(i + 1).trim() } : { q: s, a: '' };
}

export default function AlternativesPage() {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const groupLabel = { selfHosted: t('alternatives', 'selfHostedTitle'), managed: t('alternatives', 'managedTitle') };

  const vsLinks = [
    { href: '/vs/coolify', label: t('vsCoolify', 'h1') },
    { href: '/vs/heroku', label: t('vsHeroku', 'h1') },
    { href: '/vs/railway', label: t('vsRailway', 'h1') },
    { href: '/vs/render', label: t('vsRender', 'h1') },
  ];

  return (
    <MarketingShell noPad>
      <MarketingPageHero
        label={t('alternatives', 'eyebrow')}
        title={t('alternatives', 'h1')}
        description={t('alternatives', 'subtitle')}
      />

      {/* The matrix — the first thing under the hero */}
      <div className="lp-container max-w-5xl pb-20 md:pb-24">
        <Matrix t={t} c={c} groupLabel={groupLabel} />
      </div>

      {/* Per-tool honest write-ups; Pushify last, in the same format. */}
      <MSection eyebrow={c.toolsEyebrow} title={c.toolsTitle} lead={t('alternatives', 'intro')}>
        <div className="hp-faq" style={{ maxWidth: 'none' }}>
          {TOOL_KEYS.map((tool) => (
            <ToolRow
              key={tool.name}
              group={groupLabel[tool.group]}
              name={tool.name}
              best={t('alternatives', tool.best)}
              body={t('alternatives', tool.body)}
              bestFor={t('alternatives', 'bestFor')}
            />
          ))}
          <ToolRow
            id="pushify"
            group="Pushify"
            name={t('alternatives', 'pushifyTitle')}
            best={t('alternatives', 'pushifyBest')}
            body={t('alternatives', 'pushifyBody')}
            bestFor={t('alternatives', 'bestFor')}
          />
        </div>
      </MSection>

      {/* How to choose */}
      <MSection eyebrow={c.chooseEyebrow} title={t('alternatives', 'howToChooseTitle')}>
        <RuleGrid cols={3}>
          {[t('alternatives', 'howToChoose1'), t('alternatives', 'howToChoose2'), t('alternatives', 'howToChoose3')].map(
            (item) => {
              const { q, a } = splitQuestion(item);
              return (
                <RuleCell key={item} title={q}>
                  {a || null}
                </RuleCell>
              );
            }
          )}
        </RuleGrid>
        <p className="text-[13px] leading-relaxed mt-8 max-w-2xl" style={{ color: 'var(--hp-muted)' }}>
          {t('alternatives', 'disclaimer')}
        </p>
      </MSection>

      {/* Side-by-side pages */}
      <MSection eyebrow={c.compareEyebrow} title={c.compare}>
        <RuleGrid cols={4}>
          {vsLinks.map((l) => (
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

      {/* CTA */}
      <MSection title={t('alternatives', 'ctaTitle')} lead={t('alternatives', 'ctaBody')} align="center">
        <div className="-mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="lp-cta group">
            {t('alternatives', 'ctaButton')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/open-source" className="lp-cta-ghost">
            {t('landing', 'openSource')}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </MSection>
    </MarketingShell>
  );
}
