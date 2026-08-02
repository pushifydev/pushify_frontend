'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { Reveal } from '@/components/landing/Reveal';
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

function MatrixTable({ rows, t }: { rows: (typeof MATRIX)['selfHosted']; t: ReturnType<typeof useTranslation>['t'] }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--lp-border)' }}>
      <table className="w-full text-sm" style={{ minWidth: 640 }}>
        <thead>
          <tr className="text-left text-xs" style={{ color: 'var(--lp-muted)', background: 'var(--lp-surface)' }}>
            <th className="px-4 py-3 font-medium">{t('alternatives', 'colPlatform')}</th>
            <th className="px-4 py-3 font-medium">{t('alternatives', 'colLicense')}</th>
            <th className="px-4 py-3 font-medium text-center">{t('alternatives', 'colSelfHost')}</th>
            <th className="px-4 py-3 font-medium text-center">{t('alternatives', 'colManagedCloud')}</th>
            <th className="px-4 py-3 font-medium">{t('alternatives', 'colFrom')}</th>
            <th className="px-4 py-3 font-medium">{t('alternatives', 'colModel')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isPushify = row.name === 'Pushify';
            return (
              <tr
                key={row.name}
                style={{
                  borderTop: '1px solid var(--lp-border)',
                  background: isPushify ? 'color-mix(in srgb, var(--lp-ink) 5%, transparent)' : undefined,
                }}
              >
                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--lp-ink)' }}>
                  {row.name}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--lp-body)' }}>{row.license}</td>
                <td className="px-4 py-3 text-center">
                  {row.selfHost ? (
                    <Check className="w-4 h-4 mx-auto" style={{ color: 'var(--lp-ink)' }} />
                  ) : (
                    <span style={{ color: 'var(--lp-muted)', opacity: 0.4 }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.cloud ? (
                    <Check className="w-4 h-4 mx-auto" style={{ color: 'var(--lp-ink)' }} />
                  ) : (
                    <span style={{ color: 'var(--lp-muted)', opacity: 0.4 }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--lp-body)' }}>{row.from}</td>
                <td className="px-4 py-3" style={{ color: 'var(--lp-body)' }}>{row.model}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AlternativesPage() {
  const { t } = useTranslation();

  return (
    <MarketingShell>
      <MarketingPageHero
        label={t('alternatives', 'eyebrow')}
        title={t('alternatives', 'h1')}
        description={t('alternatives', 'subtitle')}
      />

      <div className="lp-container max-w-4xl pb-20 md:pb-28 space-y-14">
        <Reveal>
          <p className="lp-lead text-center max-w-3xl mx-auto">{t('alternatives', 'intro')}</p>
        </Reveal>

        {/* Matrix */}
        <Reveal>
          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-2" style={{ color: 'var(--lp-ink)' }}>
              {t('alternatives', 'matrixTitle')}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--lp-muted)' }}>
              {t('alternatives', 'matrixNote')}
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--lp-muted)' }}>
                  {t('alternatives', 'selfHostedTitle')}
                </h3>
                <MatrixTable rows={MATRIX.selfHosted} t={t} />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--lp-muted)' }}>
                  {t('alternatives', 'managedTitle')}
                </h3>
                <MatrixTable rows={MATRIX.managed} t={t} />
              </div>
            </div>
          </section>
        </Reveal>

        {/* Per-tool honest reviews */}
        <section className="space-y-4">
          {TOOL_KEYS.map((tool, i) => (
            <Reveal key={tool.name} delay={i * 60}>
              <article className="lp-card p-6">
                <h3 className="text-base font-semibold tracking-tight mb-2" style={{ color: 'var(--lp-ink)' }}>
                  {tool.name}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--lp-body)' }}>
                  {t('alternatives', tool.body)}
                </p>
                <p className="text-sm" style={{ color: 'var(--lp-muted)' }}>
                  <span className="font-medium" style={{ color: 'var(--lp-ink)' }}>
                    {t('alternatives', 'bestFor')}:
                  </span>{' '}
                  {t('alternatives', tool.best)}
                </p>
              </article>
            </Reveal>
          ))}

          {/* Pushify — same honest format, spotlighted */}
          <Reveal delay={100}>
            <article
              className="lp-card p-6"
              style={{ borderColor: 'color-mix(in srgb, var(--lp-ink) 25%, transparent)' }}
            >
              <h3 className="text-base font-semibold tracking-tight mb-2" style={{ color: 'var(--lp-ink)' }}>
                {t('alternatives', 'pushifyTitle')}
              </h3>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--lp-body)' }}>
                {t('alternatives', 'pushifyBody')}
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--lp-muted)' }}>
                <span className="font-medium" style={{ color: 'var(--lp-ink)' }}>
                  {t('alternatives', 'bestFor')}:
                </span>{' '}
                {t('alternatives', 'pushifyBest')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="lp-cta h-9 px-4 text-sm">
                  {t('alternatives', 'ctaButton')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/vs/coolify" className="lp-cta-ghost h-9 px-4 text-sm">
                  {t('vsCoolify', 'h1')}
                </Link>
                <Link href="/vs/heroku" className="lp-cta-ghost h-9 px-4 text-sm">
                  {t('vsHeroku', 'h1')}
                </Link>
                <Link href="/vs/railway" className="lp-cta-ghost h-9 px-4 text-sm">
                  {t('vsRailway', 'h1')}
                </Link>
                <Link href="/vs/render" className="lp-cta-ghost h-9 px-4 text-sm">
                  {t('vsRender', 'h1')}
                </Link>
              </div>
            </article>
          </Reveal>
        </section>

        {/* How to choose */}
        <Reveal>
          <section className="lp-card p-6 md:p-8">
            <h2 className="text-xl font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>
              {t('alternatives', 'howToChooseTitle')}
            </h2>
            <ul className="space-y-3">
              {[
                t('alternatives', 'howToChoose1'),
                t('alternatives', 'howToChoose2'),
                t('alternatives', 'howToChoose3'),
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--lp-muted)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <p className="text-xs text-center max-w-2xl mx-auto" style={{ color: 'var(--lp-muted)' }}>
          {t('alternatives', 'disclaimer')}
        </p>

        {/* CTA */}
        <Reveal>
          <section className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: 'var(--lp-ink)' }}>
              {t('alternatives', 'ctaTitle')}
            </h2>
            <p className="mb-6" style={{ color: 'var(--lp-body)' }}>
              {t('alternatives', 'ctaBody')}
            </p>
            <Link href="/register" className="lp-cta">
              {t('alternatives', 'ctaButton')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </Reveal>
      </div>
    </MarketingShell>
  );
}
