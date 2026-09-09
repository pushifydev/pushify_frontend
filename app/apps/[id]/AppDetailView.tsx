'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check, Database, HardDrive, MemoryStick, Globe, BookOpen } from 'lucide-react';
import { MarketingShell } from '@/components/landing';
import { useTranslation } from '@/hooks';
import { CATEGORY_LABELS, type CatalogApp } from '@/lib/apps-catalog';
import { AppIcon } from '../AppIcon';

const copy = {
  en: {
    back: 'All apps',
    deploy: (name: string) => `Deploy ${name} on your server`,
    deployNote: 'Pick one of your servers or connect a VPS over SSH. Live in a few minutes.',
    about: (name: string) => `About ${name}`,
    setupTitle: 'What Pushify sets up for you',
    setup: {
      container: 'Runs the official image as an isolated container on your server',
      compose: 'Runs the official multi-service stack (Docker Compose) on your server',
      https: 'Public HTTPS URL with an automatic Let’s Encrypt certificate — bring your own domain any time',
      health: (path: string) => `Health check on ${path} with alerts if it stops responding`,
      db: (type: string) => `Managed ${type} with scheduled backups that are restore-tested weekly`,
      env: 'Secrets and passwords generated for you; everything editable later',
    },
    requirementsTitle: 'Requirements',
    ram: 'RAM',
    disk: 'Disk',
    database: 'Database',
    none: 'None',
    configTitle: 'Configuration',
    configIntro: 'Set in the dashboard when you deploy — no config files.',
    required: 'required',
    generated: 'generated',
    linksTitle: 'Links',
    website: 'Official site',
    docs: 'Documentation',
    relatedTitle: 'Also popular',
    howTitle: 'How it works',
    how: ['Sign in and pick a server (free plan: connect your own VPS).', 'Click deploy — Pushify pulls the image, wires networking and HTTPS, runs the health check.', 'Open the app at its URL. Updates, restarts and logs live in the dashboard.'],
  },
  tr: {
    back: 'Tüm uygulamalar',
    deploy: (name: string) => `${name}'i sunucunuza kurun`,
    deployNote: 'Sunucularınızdan birini seçin ya da SSH ile bir VPS bağlayın. Birkaç dakikada canlı.',
    about: (name: string) => `${name} hakkında`,
    setupTitle: 'Pushify sizin için ne kuruyor',
    setup: {
      container: 'Resmi imajı sunucunuzda izole bir container olarak çalıştırır',
      compose: 'Resmi çok servisli yığını (Docker Compose) sunucunuzda çalıştırır',
      https: 'Otomatik Let’s Encrypt sertifikalı herkese açık HTTPS adresi — istediğiniz zaman kendi domaininizi bağlayın',
      health: (path: string) => `${path} üzerinde sağlık kontrolü; yanıt vermezse uyarı`,
      db: (type: string) => `Haftalık geri yükleme testinden geçen zamanlanmış yedekli yönetilen ${type}`,
      env: 'Gizli anahtarlar ve parolalar sizin için üretilir; hepsi sonradan düzenlenebilir',
    },
    requirementsTitle: 'Gereksinimler',
    ram: 'RAM',
    disk: 'Disk',
    database: 'Veritabanı',
    none: 'Yok',
    configTitle: 'Yapılandırma',
    configIntro: 'Kurarken panelden ayarlanır — yapılandırma dosyası yok.',
    required: 'zorunlu',
    generated: 'üretilir',
    linksTitle: 'Bağlantılar',
    website: 'Resmi site',
    docs: 'Dokümantasyon',
    relatedTitle: 'Bunlar da popüler',
    howTitle: 'Nasıl çalışır',
    how: ['Giriş yapın ve bir sunucu seçin (ücretsiz plan: kendi VPS’inizi bağlayın).', 'Kur’a tıklayın — Pushify imajı çeker, ağı ve HTTPS’i bağlar, sağlık kontrolünü çalıştırır.', 'Uygulamayı adresinden açın. Güncelleme, yeniden başlatma ve loglar panelde.'],
  },
} as const;

const DB_LABEL: Record<string, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
};

export function AppDetailView({ app, related }: { app: CatalogApp; related: CatalogApp[] }) {
  const { locale } = useTranslation();
  const lang = locale === 'tr' ? 'tr' : 'en';
  const c = copy[lang];
  const deployHref = `/dashboard/marketplace/${app.id}`;
  const visibleEnv = app.envVars.filter((v) => v.type !== 'password' || v.required);

  return (
    <MarketingShell>
      <article className="lp-container max-w-4xl pt-28 md:pt-36 pb-20 md:pb-28">
        <Link
          href="/apps"
          className="inline-flex items-center gap-1.5 text-sm mb-8 hover:underline underline-offset-4"
          style={{ color: 'var(--lp-muted)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {c.back}
        </Link>

        {/* Hero */}
        <header className="flex flex-col md:flex-row md:items-start gap-6 mb-12">
          <span
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}
          >
            <AppIcon id={app.id} name={app.name} size={34} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--lp-muted)' }}>
              {CATEGORY_LABELS[app.category][lang]} · v{app.appVersion}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-3" style={{ color: 'var(--lp-ink)' }}>
              {app.name}
            </h1>
            <p className="text-lg leading-relaxed mb-5" style={{ color: 'var(--lp-body)' }}>
              {app.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link href={deployHref} className="lp-cta text-sm">
                {c.deploy(app.name)}
              </Link>
              <span className="text-xs" style={{ color: 'var(--lp-muted)' }}>{c.deployNote}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">
          <div className="space-y-12 min-w-0">
            <section>
              <h2 className="text-lg font-semibold tracking-tight mb-3" style={{ color: 'var(--lp-ink)' }}>{c.about(app.name)}</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--lp-body)' }}>{app.longDescription}</p>
              {app.tags.length > 0 && (
                <p className="mt-4 flex flex-wrap gap-2">
                  {app.tags.map((tag) => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.setupTitle}</h2>
              <ul className="space-y-2.5">
                {[
                  app.deploymentType === 'docker-compose' ? c.setup.compose : c.setup.container,
                  c.setup.https,
                  c.setup.health(app.healthCheckPath),
                  ...(app.requiresDatabase ? [c.setup.db(DB_LABEL[app.requiresDatabase.type] ?? app.requiresDatabase.type)] : []),
                  c.setup.env,
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#16a34a' }} />
                    {line}
                  </li>
                ))}
              </ul>
            </section>

            {visibleEnv.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: 'var(--lp-ink)' }}>{c.configTitle}</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--lp-muted)' }}>{c.configIntro}</p>
                <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'var(--lp-border)' }}>
                  {visibleEnv.map((v) => (
                    <div key={v.key} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1" style={{ borderColor: 'var(--lp-border)' }}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--lp-ink)' }}>{v.label}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>{v.description}</p>
                      </div>
                      <p className="text-[11px] uppercase tracking-wide self-start sm:text-right" style={{ color: 'var(--lp-muted)' }}>
                        {v.generated ? c.generated : v.required ? c.required : v.default ? `default: ${v.default}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.howTitle}</h2>
              <ol className="space-y-3 list-decimal pl-5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                {c.how.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </section>
          </div>

          <aside className="space-y-8 md:sticky md:top-28 self-start">
            <section className="rounded-2xl border p-5" style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] mb-4" style={{ color: 'var(--lp-muted)' }}>{c.requirementsTitle}</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2" style={{ color: 'var(--lp-muted)' }}><MemoryStick className="w-3.5 h-3.5" />{c.ram}</dt>
                  <dd className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}>{app.minMemoryMb >= 1024 ? `${app.minMemoryMb / 1024} GB` : `${app.minMemoryMb} MB`}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2" style={{ color: 'var(--lp-muted)' }}><HardDrive className="w-3.5 h-3.5" />{c.disk}</dt>
                  <dd className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}>{app.minDiskGb} GB</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2" style={{ color: 'var(--lp-muted)' }}><Database className="w-3.5 h-3.5" />{c.database}</dt>
                  <dd style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}>{app.requiresDatabase ? DB_LABEL[app.requiresDatabase.type] ?? app.requiresDatabase.type : c.none}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--lp-muted)' }}>{c.linksTitle}</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href={app.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline underline-offset-4" style={{ color: 'var(--lp-ink)' }}>
                    <Globe className="w-3.5 h-3.5" />{c.website}<ArrowUpRight className="w-3 h-3 opacity-50" />
                  </a>
                </li>
                <li>
                  <a href={app.documentation} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline underline-offset-4" style={{ color: 'var(--lp-ink)' }}>
                    <BookOpen className="w-3.5 h-3.5" />{c.docs}<ArrowUpRight className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              </ul>
            </section>

            {related.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--lp-muted)' }}>{c.relatedTitle}</h2>
                <ul className="space-y-1.5">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link href={`/apps/${r.id}`} className="flex items-center gap-2.5 text-sm py-1 hover:underline underline-offset-4" style={{ color: 'var(--lp-ink)' }}>
                        <AppIcon id={r.id} name={r.name} size={16} />
                        {r.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </article>
    </MarketingShell>
  );
}
