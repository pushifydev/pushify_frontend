'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { MarketingShell } from '@/components/landing';
import { MSection, RuleGrid, Steps } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';
import { CATEGORY_LABELS, type CatalogApp } from '@/lib/apps-catalog';
import { AppIcon } from '../AppIcon';
import { LongDescription } from '@/components/LongDescription';

const copy = {
  en: {
    back: 'All apps',
    deploy: (name: string) => `Deploy ${name}`,
    deployNote: 'On one of your servers, or any VPS over SSH.',
    installTitle: 'Install log',
    live: 'Live',
    log: {
      compose: '→ docker compose up',
      pull: (image: string) => `→ pull ${image}`,
      db: (type: string) => `→ ${type} created, backups scheduled`,
      secrets: '→ secrets generated',
      health: (path: string) => `→ health check ${path}`,
      passed: '✓ passed',
      https: '✓ certificate issued',
    },
    requirementsTitle: 'Requirements',
    ram: 'RAM',
    disk: 'Disk',
    database: 'Database',
    none: 'None',
    linksTitle: 'Links',
    website: 'Official site',
    docs: 'Documentation',
    aboutEyebrow: 'About',
    about: (name: string) => `What ${name} is`,
    includedEyebrow: 'Included',
    includedTitle: 'What Pushify sets up.',
    included: {
      https: 'HTTPS with an automatic certificate. Add your own domain any time.',
      health: 'A health check, with an alert if it stops answering.',
      db: (type: string) => `Managed ${type}, backups restore-tested weekly.`,
      env: 'Generated secrets and passwords, all editable later.',
    },
    configEyebrow: 'Configuration',
    configTitle: 'Set in the dashboard when you deploy.',
    configIntro: 'Required values are asked for; secrets are generated.',
    required: 'required',
    generated: 'generated',
    defaultLabel: 'default',
    howEyebrow: 'How it works',
    howTitle: (name: string) => `${name} in three steps.`,
    how: [
      { title: 'Pick a server', body: 'On the free plan, connect a VPS of your own.' },
      { title: 'Click deploy', body: 'The image is pulled; HTTPS and the health check are set up.' },
      { title: 'Open the app', body: 'Updates, restarts and logs are in the dashboard.' },
    ],
    relatedEyebrow: 'Related',
    relatedTitle: 'More from the catalog.',
    ctaTitle: (name: string) => `Run ${name} on a server you own.`,
  },
  tr: {
    back: 'Tüm uygulamalar',
    deploy: (name: string) => `${name} kurun`,
    deployNote: 'Sunucularınızdan birine ya da SSH ile bağlı herhangi bir VPS’e.',
    installTitle: 'Kurulum kaydı',
    live: 'Yayında',
    log: {
      compose: '→ docker compose up',
      pull: (image: string) => `→ pull ${image}`,
      db: (type: string) => `→ ${type} oluşturuldu, yedekler planlandı`,
      secrets: '→ gizli anahtarlar üretildi',
      health: (path: string) => `→ sağlık kontrolü ${path}`,
      passed: '✓ geçti',
      https: '✓ sertifika alındı',
    },
    requirementsTitle: 'Gereksinimler',
    ram: 'RAM',
    disk: 'Disk',
    database: 'Veritabanı',
    none: 'Yok',
    linksTitle: 'Bağlantılar',
    website: 'Resmi site',
    docs: 'Dokümantasyon',
    aboutEyebrow: 'Hakkında',
    about: (name: string) => `${name} nedir`,
    includedEyebrow: 'Dahil olanlar',
    includedTitle: 'Pushify’ın kurdukları.',
    included: {
      https: 'Otomatik sertifikalı HTTPS. Kendi alan adınızı istediğiniz an bağlayın.',
      health: 'Sağlık kontrolü; yanıt vermezse uyarı.',
      db: (type: string) => `Yönetilen ${type}; yedekleri her hafta geri yükleme testinden geçer.`,
      env: 'Üretilmiş gizli anahtarlar ve parolalar; hepsi sonradan düzenlenebilir.',
    },
    configEyebrow: 'Yapılandırma',
    configTitle: 'Kurarken panelden ayarlanır.',
    configIntro: 'Zorunlu değerler sorulur, gizli anahtarlar üretilir.',
    required: 'zorunlu',
    generated: 'üretilir',
    defaultLabel: 'varsayılan',
    howEyebrow: 'Nasıl çalışır',
    howTitle: (name: string) => `Üç adımda ${name}.`,
    how: [
      { title: 'Bir sunucu seçin', body: 'Ücretsiz planda kendi VPS’inizi bağlayın.' },
      { title: 'Kur’a tıklayın', body: 'İmaj çekilir; HTTPS ve sağlık kontrolü kurulur.' },
      { title: 'Uygulamayı açın', body: 'Güncelleme, yeniden başlatma ve loglar panelde.' },
    ],
    relatedEyebrow: 'İlgili',
    relatedTitle: 'Katalogdan daha fazlası.',
    ctaTitle: (name: string) => `${name} kendi sunucunuzda çalışsın.`,
  },
} as const;

const DB_LABEL: Record<string, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
};

const labelCls = 'hp-mono text-[11px] uppercase tracking-widest';

export function AppDetailView({ app, related }: { app: CatalogApp; related: CatalogApp[] }) {
  const { locale } = useTranslation();
  const lang = locale === 'tr' ? 'tr' : 'en';
  const c = copy[lang];
  const deployHref = `/dashboard/marketplace/${app.id}`;
  const visibleEnv = app.envVars.filter((v) => v.type !== 'password' || v.required);
  const dbLabel = app.requiresDatabase ? (DB_LABEL[app.requiresDatabase.type] ?? app.requiresDatabase.type) : null;
  const generatesSecrets = app.envVars.some((v) => v.generated);

  // What a deploy of this app writes to its log, built from the catalogue entry — no timings.
  const log: { kind?: 'ok'; text: string }[] = [
    { text: app.deploymentType === 'docker-compose' || !app.dockerImage ? c.log.compose : c.log.pull(app.dockerImage) },
    ...(dbLabel ? [{ text: c.log.db(dbLabel) }] : []),
    ...(generatesSecrets ? [{ text: c.log.secrets }] : []),
    { text: c.log.health(app.healthCheckPath) },
    { kind: 'ok', text: c.log.passed },
    { kind: 'ok', text: c.log.https },
  ];

  const included = [
    c.included.https,
    c.included.health,
    ...(dbLabel ? [c.included.db(dbLabel)] : []),
    ...(generatesSecrets ? [c.included.env] : []),
  ];

  const specs: { label: string; value: React.ReactNode }[] = [
    { label: c.ram, value: app.minMemoryMb >= 1024 ? `${app.minMemoryMb / 1024} GB` : `${app.minMemoryMb} MB` },
    { label: c.disk, value: `${app.minDiskGb} GB` },
    { label: c.database, value: dbLabel ?? c.none },
  ];

  const relatedCols = related.length >= 4 ? 4 : related.length === 3 ? 3 : 2;

  return (
    <MarketingShell noPad>
      <article>
        {/* Hero, with the one object on this page beside it: the install log. */}
        <header className="lp-container hp-page-hero">
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 text-sm mb-10 hover:underline underline-offset-4"
            style={{ color: 'var(--hp-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {c.back}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-12 lg:gap-16 lg:items-center">
            <div className="min-w-0">
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ border: '1px solid var(--hp-line-strong)', background: 'var(--hp-card)' }}
              >
                <AppIcon id={app.id} name={app.name} size={28} />
              </span>
              <p className="lp-label mt-8">
                {CATEGORY_LABELS[app.category][lang]} · v{app.appVersion}
              </p>
              <h1 className="lp-hero-title mt-5">{app.name}</h1>
              <p className="lp-lead mt-5">{app.description}</p>
              <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
                <Link href={deployHref} className="lp-cta group self-start">
                  {c.deploy(app.name)}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <span className="text-[13px]" style={{ color: 'var(--hp-muted)' }}>
                  {c.deployNote}
                </span>
              </div>
            </div>

            <div className="hp-card" style={{ width: '100%' }} aria-label={c.installTitle} role="figure">
              <div className="hp-card-head">
                <span className="hp-live">
                  <span className="hp-dot" aria-hidden="true" />
                  {c.live}
                </span>
                <span className="truncate ml-4">{app.id}</span>
              </div>
              <div className="hp-card-body" style={{ overflowX: 'auto' }}>
                {log.map((l) => (
                  <div key={l.text} className={l.kind}>
                    {l.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Requirements + links, as a hairline spec strip */}
          <div className="mt-16">
            <h2 className="sr-only">{c.requirementsTitle}</h2>
            <dl className="hp-rule-grid grid-cols-2 lg:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="px-5 py-5 md:px-6">
                  <dt className={labelCls} style={{ color: 'var(--hp-muted)' }}>
                    {s.label}
                  </dt>
                  <dd className="hp-mono mt-2 text-[15px] tabular-nums" style={{ color: 'var(--hp-ink)' }}>
                    {s.value}
                  </dd>
                </div>
              ))}
              <div className="px-5 py-5 md:px-6">
                <dt className={labelCls} style={{ color: 'var(--hp-muted)' }}>
                  {c.linksTitle}
                </dt>
                <dd className="mt-2 flex flex-col gap-1 text-[14px]">
                  <a
                    href={app.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                    style={{ color: 'var(--hp-ink)' }}
                  >
                    {c.website}
                    <ArrowUpRight className="w-3 h-3" style={{ color: 'var(--hp-muted)' }} aria-hidden="true" />
                  </a>
                  <a
                    href={app.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                    style={{ color: 'var(--hp-ink)' }}
                  >
                    {c.docs}
                    <ArrowUpRight className="w-3 h-3" style={{ color: 'var(--hp-muted)' }} aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </header>

        {/* About */}
        <MSection eyebrow={c.aboutEyebrow} title={c.about(app.name)} width="narrow">
          <div className="-mt-4">
            <LongDescription text={app.longDescription} />
            {app.tags.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2">
                {app.tags.map((tag) => (
                  <li
                    key={tag}
                    className="hp-mono text-[11px] px-2.5 py-1 rounded-full"
                    style={{ border: '1px solid var(--hp-line-strong)', color: 'var(--hp-muted)' }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MSection>

        {/* What gets set up — a list, so three or four rows never leave a half-empty grid. */}
        <MSection eyebrow={c.includedEyebrow} title={c.includedTitle} width="narrow">
          <ul style={{ borderTop: '1px solid var(--hp-line)' }}>
            {included.map((line) => (
              <li
                key={line}
                className="py-4 text-[0.975rem] leading-relaxed"
                style={{ borderBottom: '1px solid var(--hp-line)', color: 'var(--hp-body)' }}
              >
                {line}
              </li>
            ))}
          </ul>
        </MSection>

        {/* Configuration */}
        {visibleEnv.length > 0 && (
          <MSection eyebrow={c.configEyebrow} title={c.configTitle} lead={c.configIntro} width="narrow">
            <dl style={{ borderTop: '1px solid var(--hp-line)' }}>
              {visibleEnv.map((v) => (
                <div
                  key={v.key}
                  className="py-4 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-1"
                  style={{ borderBottom: '1px solid var(--hp-line)' }}
                >
                  <dt className="min-w-0">
                    <span className="block text-[0.975rem] font-medium" style={{ color: 'var(--hp-ink)' }}>
                      {v.label}
                    </span>
                    <span className="block mt-1 text-[0.9rem] leading-relaxed" style={{ color: 'var(--hp-body)' }}>
                      {v.description}
                    </span>
                  </dt>
                  <dd className={`${labelCls} self-start sm:text-right sm:pt-1`} style={{ color: 'var(--hp-muted)' }}>
                    {v.generated ? c.generated : v.required ? c.required : v.default ? `${c.defaultLabel}: ${v.default}` : ''}
                  </dd>
                </div>
              ))}
            </dl>
          </MSection>
        )}

        {/* How it works — these really happen in order */}
        <MSection eyebrow={c.howEyebrow} title={c.howTitle(app.name)}>
          <Steps items={[...c.how]} />
        </MSection>

        {/* Related */}
        {related.length > 0 && (
          <MSection eyebrow={c.relatedEyebrow} title={c.relatedTitle}>
            <RuleGrid cols={relatedCols}>
              {related.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/apps/${r.id}`}
                  className="group flex flex-col p-6 transition-colors hover:bg-(--hp-card)"
                >
                  <span className="flex items-center gap-3">
                    <AppIcon id={r.id} name={r.name} size={18} />
                    <span className="text-[1rem] font-medium" style={{ color: 'var(--hp-ink)' }}>
                      {r.name}
                    </span>
                  </span>
                  <span className="mt-3 text-[0.9rem] leading-relaxed line-clamp-2" style={{ color: 'var(--hp-body)' }}>
                    {r.description}
                  </span>
                </Link>
              ))}
            </RuleGrid>
          </MSection>
        )}

        {/* Closing call */}
        <MSection title={c.ctaTitle(app.name)} lead={c.deployNote} align="center">
          <div className="-mt-4 flex justify-center">
            <Link href={deployHref} className="lp-cta group">
              {c.deploy(app.name)}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </MSection>
      </article>
    </MarketingShell>
  );
}
