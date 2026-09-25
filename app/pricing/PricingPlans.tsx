'use client';

import Link from 'next/link';
import { useState } from 'react';
import NumberFlow from '@number-flow/react';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useAvailablePlans } from '@/hooks/useBilling';
import type { AvailablePlans, PlanLimits, PlanType } from '@/lib/api';
import type { TranslationKeys } from '@/lib/i18n/locales/en';
import { MSection } from '@/components/landing/MarketingKit';

type BillingKey = keyof TranslationKeys['billing'];

const COLUMNS: PlanType[] = ['free', 'hobby', 'pro', 'business'];
const RECOMMENDED: PlanType = 'pro';
const YEARLY_DISCOUNT = 0.2;

const HREF: Record<PlanType, string> = {
  free: '/register',
  hobby: '/register?plan=hobby',
  pro: '/register?plan=pro',
  business: '/register?plan=business',
  enterprise: 'mailto:sales@pushify.dev?subject=Enterprise%20plan',
};

const copy = {
  en: {
    monthly: 'Monthly',
    yearly: 'Yearly',
    save: '−20%',
    perMonth: '/mo',
    billedYearly: 'billed yearly',
    billedMonthly: 'billed monthly',
    recommended: 'Recommended',
    names: { free: 'Free', hobby: 'Hobby', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' },
    blurbs: {
      free: 'One server of your own, for personal projects.',
      hobby: 'Side projects, with managed servers available.',
      pro: 'For small teams shipping every day.',
      business: 'More servers, projects and seats.',
      enterprise: 'Custom limits, a contract and a direct line to us.',
    },
    ctas: { free: 'Start free', hobby: 'Choose Hobby', pro: 'Choose Pro', business: 'Choose Business', enterprise: 'Talk to us' },
    freeServerNote: 'your own, over SSH',
    limits: {
      servers: (n: string) => `${n} servers`,
      server: '1 server',
      projects: (n: string) => `${n} projects`,
      deploys: (n: string) => `${n} deploys / mo`,
      members: (n: string) => `${n} team members`,
      member: '1 team member',
    },
    unlimited: 'Unlimited',
    loading: 'Loading plans…',
    unavailable: 'Plans could not be loaded right now. The full list is in the dashboard after you sign up.',
    billsEyebrow: 'Two bills',
    billsTitle: 'The platform and the servers are billed apart.',
    billsLead: 'You always know which charge is which.',
    platformTitle: 'Platform plan',
    platform: [
      'Monthly or yearly, through Stripe.',
      'Sets your limits: projects, deploys, team, domains.',
      'SSL, CI/CD and health checks on every paid plan.',
    ],
    creditsTitle: 'Infrastructure credits',
    credits: [
      'A prepaid USD balance you top up by card.',
      'Managed Hetzner servers draw from it hourly while running.',
      'Servers you connect over SSH never touch it.',
    ],
    compareEyebrow: 'Side by side',
    compareTitle: 'Every limit, per plan.',
    feature: 'Feature',
    enterpriseLine: 'Unlimited servers, projects and deploys, with terms that fit your organisation.',
    yes: 'Included',
    no: 'Not included',
  },
  tr: {
    monthly: 'Aylık',
    yearly: 'Yıllık',
    save: '−%20',
    perMonth: '/ay',
    billedYearly: 'yıllık faturalanır',
    billedMonthly: 'aylık faturalanır',
    recommended: 'Önerilen',
    names: { free: 'Free', hobby: 'Hobby', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' },
    blurbs: {
      free: 'Kişisel projeler için kendi sunucunuz.',
      hobby: 'Yan projeler; yönetilen sunucu da açabilirsiniz.',
      pro: 'Her gün deploy eden küçük ekipler için.',
      business: 'Daha fazla sunucu, proje ve üye.',
      enterprise: 'Size özel limitler, sözleşme ve bizimle doğrudan iletişim.',
    },
    ctas: { free: 'Ücretsiz başla', hobby: 'Hobby’yi seç', pro: 'Pro’yu seç', business: 'Business’ı seç', enterprise: 'Bize yazın' },
    freeServerNote: 'kendi sunucunuz, SSH ile',
    limits: {
      servers: (n: string) => `${n} sunucu`,
      server: '1 sunucu',
      projects: (n: string) => `${n} proje`,
      deploys: (n: string) => `Ayda ${n} deploy`,
      members: (n: string) => `${n} ekip üyesi`,
      member: '1 ekip üyesi',
    },
    unlimited: 'Sınırsız',
    loading: 'Planlar yükleniyor…',
    unavailable: 'Planlar şu an yüklenemedi. Kayıt olduktan sonra panelde tam listeyi görebilirsiniz.',
    billsEyebrow: 'İki ayrı fatura',
    billsTitle: 'Platform ve sunucular ayrı faturalanır.',
    billsLead: 'Hangi ödemenin neye ait olduğunu her zaman bilirsiniz.',
    platformTitle: 'Platform planı',
    platform: [
      'Stripe üzerinden aylık ya da yıllık.',
      'Limitlerinizi belirler: proje, deploy, ekip, domain.',
      'Her ücretli planda SSL, CI/CD ve sağlık kontrolleri.',
    ],
    creditsTitle: 'Altyapı kredisi',
    credits: [
      'Kartla yüklediğiniz ön ödemeli bir USD bakiye.',
      'Yönetilen Hetzner sunucuları çalıştıkça saatlik düşer.',
      'SSH ile bağladığınız sunucular bu bakiyeye hiç dokunmaz.',
    ],
    compareEyebrow: 'Yan yana',
    compareTitle: 'Plan plan tüm limitler.',
    feature: 'Özellik',
    enterpriseLine: 'Sınırsız sunucu, proje ve deploy; kurumunuza uygun koşullarla.',
    yes: 'Dahil',
    no: 'Dahil değil',
  },
};

const COMPARE_ROWS: { key: keyof PlanLimits; labelKey: BillingKey; type: 'number' | 'boolean'; unit?: string }[] = [
  { key: 'servers', labelKey: 'servers', type: 'number' },
  { key: 'databases', labelKey: 'databases', type: 'number' },
  { key: 'projects', labelKey: 'projects', type: 'number' },
  { key: 'deploymentsPerMonth', labelKey: 'deploymentsPerMonthShort', type: 'number' },
  { key: 'teamMembers', labelKey: 'teamMembers', type: 'number' },
  { key: 'customDomains', labelKey: 'customDomains', type: 'number' },
  { key: 'storageGb', labelKey: 'storageGb', type: 'number', unit: 'GB' },
  { key: 'bandwidthGb', labelKey: 'bandwidthGb', type: 'number', unit: 'GB' },
  { key: 'buildMinutesPerMonth', labelKey: 'buildMinutes', type: 'number', unit: 'min' },
  { key: 'previewDeployments', labelKey: 'previewDeployments', type: 'boolean' },
  { key: 'healthChecks', labelKey: 'healthChecks', type: 'boolean' },
  { key: 'prioritySupport', labelKey: 'prioritySupport', type: 'boolean' },
];

const isUnlimited = (n: number) => n === -1 || n >= 9999;
// Fixed locale: the server renders en-US, and a tr-TR browser printing 3.000 would mismatch.
const fmt = (n: number) => n.toLocaleString('en-US');

function Cta({ plan, label, primary }: { plan: PlanType; label: string; primary: boolean }) {
  const cls = `${primary ? 'lp-cta' : 'lp-cta-ghost'} group w-full`;
  const inner = (
    <>
      {label}
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );
  const href = HREF[plan];
  return href.startsWith('mailto:') ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function PricingPlans({ initialPlans }: { initialPlans?: AvailablePlans }) {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const [yearly, setYearly] = useState(false);
  const { data: plans, isLoading } = useAvailablePlans(initialPlans);

  const price = (key: PlanType) => {
    const p = plans?.[key]?.price ?? 0;
    return yearly && p > 0 ? Math.round(p * (1 - YEARLY_DISCOUNT)) : p;
  };

  const limitLines = (key: PlanType): string[] => {
    const l = plans?.[key]?.limits;
    if (!l) return [];
    const n = (v: number, one: string, many: (s: string) => string) =>
      isUnlimited(v) ? many(c.unlimited) : v === 1 ? one : many(fmt(v));
    return [
      key === 'free' ? `${c.limits.server} — ${c.freeServerNote}` : n(l.servers, c.limits.server, c.limits.servers),
      n(l.projects, c.limits.projects('1'), c.limits.projects),
      c.limits.deploys(isUnlimited(l.deploymentsPerMonth) ? c.unlimited : fmt(l.deploymentsPerMonth)),
      n(l.teamMembers, c.limits.member, c.limits.members),
    ];
  };

  return (
    <>
      {/* Plans */}
      <section className="pb-20 md:pb-24" id="plans">
        <div className="lp-container">
          <div className="flex justify-center mb-10">
            <div className="hp-toggle" role="group" aria-label={c.monthly + ' / ' + c.yearly}>
              <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>
                {c.monthly}
              </button>
              <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>
                {c.yearly} <span className="hp-toggle-save">{c.save}</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="hp-mono text-center text-[12px] uppercase tracking-[0.1em]" style={{ color: 'var(--hp-muted)' }}>
              {c.loading}
            </p>
          ) : !plans ? (
            <p className="text-center hp-lead">{c.unavailable}</p>
          ) : (
            <>
              <div className="hp-plans">
                {COLUMNS.filter((k) => plans[k]).map((key) => {
                  const rec = key === RECOMMENDED;
                  const l = plans[key]!.limits;
                  const features: { key: keyof PlanLimits; labelKey: BillingKey }[] = [
                    { key: 'previewDeployments', labelKey: 'previewDeployments' },
                    { key: 'healthChecks', labelKey: 'healthChecks' },
                    { key: 'prioritySupport', labelKey: 'prioritySupport' },
                  ];
                  return (
                    <div key={key} className="hp-plan" data-recommended={rec || undefined}>
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-[1.25rem] font-medium" style={{ color: 'var(--hp-ink)' }}>
                          {c.names[key]}
                        </h2>
                        {rec && <span className="hp-plan-tag">{c.recommended}</span>}
                      </div>
                      <p className="mt-2 text-[15px] leading-snug min-h-[2.6em]" style={{ color: 'var(--hp-body)' }}>
                        {c.blurbs[key]}
                      </p>

                      <p className="mt-8 flex items-baseline gap-1.5">
                        <span className="hp-plan-price">
                          $<NumberFlow value={price(key)} />
                        </span>
                        <span className="text-[15px]" style={{ color: 'var(--hp-muted)' }}>
                          {c.perMonth}
                        </span>
                      </p>
                      <p className="hp-mono mt-1.5 text-[11px] uppercase tracking-[0.1em] h-4" style={{ color: 'var(--hp-muted)' }}>
                        {price(key) > 0 ? (yearly ? c.billedYearly : c.billedMonthly) : ''}
                      </p>

                      <div className="mt-7">
                        <Cta plan={key} label={c.ctas[key]} primary={rec} />
                      </div>

                      <ul className="mt-8 space-y-3 text-[15px]" style={{ color: 'var(--hp-body)' }}>
                        {limitLines(key).map((line) => (
                          <li key={line} className="flex gap-2.5">
                            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--hp-ink)' }} aria-hidden="true" />
                            {line}
                          </li>
                        ))}
                        {features.map((f) => {
                          const on = Boolean(l[f.key]);
                          return (
                            <li key={f.key} className="flex gap-2.5" style={on ? undefined : { color: 'var(--hp-muted)' }}>
                              {on ? (
                                <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--hp-ink)' }} aria-hidden="true" />
                              ) : (
                                <Minus className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                              )}
                              <span className={on ? undefined : 'line-through decoration-[var(--hp-line-strong)]'}>
                                {t('billing', f.labelKey)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {plans.enterprise && (
                <div className="hp-plan-wide">
                  <div className="min-w-0">
                    <h2 className="text-[1.25rem] font-medium" style={{ color: 'var(--hp-ink)' }}>
                      {c.names.enterprise}
                    </h2>
                    <p className="mt-1.5 text-[15px]" style={{ color: 'var(--hp-body)' }}>
                      {c.enterpriseLine}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto shrink-0">
                    <Cta plan="enterprise" label={c.ctas.enterprise} primary={false} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Two bills */}
      <MSection eyebrow={c.billsEyebrow} title={c.billsTitle} lead={c.billsLead} split>
        <div className="hp-rule-grid grid-cols-1 md:grid-cols-2">
          {[
            { title: c.platformTitle, lines: c.platform },
            { title: c.creditsTitle, lines: c.credits },
          ].map((col) => (
            <div key={col.title} className="hp-cell">
              <h3 className="hp-cell-title">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-[1rem]" style={{ color: 'var(--hp-body)' }}>
                {col.lines.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden="true" style={{ color: 'var(--hp-muted)' }}>
                      —
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </MSection>

      {/* Full comparison */}
      {plans && (
        <MSection eyebrow={c.compareEyebrow} title={c.compareTitle}>
          <div className="relative overflow-x-auto">
            <table className="hp-table min-w-[720px]">
              <thead>
                <tr>
                  <th scope="col">{c.feature}</th>
                  {[...COLUMNS, 'enterprise' as PlanType]
                    .filter((k) => plans[k])
                    .map((k) => (
                      <th key={k} scope="col" data-recommended={k === RECOMMENDED || undefined}>
                        {c.names[k]}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{t('billing', row.labelKey)}</th>
                    {[...COLUMNS, 'enterprise' as PlanType]
                      .filter((k) => plans[k])
                      .map((k) => {
                        const v = plans[k]!.limits[row.key];
                        let cell: React.ReactNode;
                        if (row.type === 'boolean') {
                          cell = v ? (
                            <Check className="w-4 h-4 mx-auto" aria-label={c.yes} />
                          ) : (
                            <Minus className="w-4 h-4 mx-auto opacity-40" aria-label={c.no} />
                          );
                        } else {
                          const n = v as number;
                          cell = n === 0 ? '—' : isUnlimited(n) ? c.unlimited : row.unit ? `${fmt(n)} ${row.unit}` : fmt(n);
                        }
                        return (
                          <td key={k} data-recommended={k === RECOMMENDED || undefined}>
                            {cell}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MSection>
      )}
    </>
  );
}
