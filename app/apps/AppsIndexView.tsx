'use client';

import Link from 'next/link';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';
import { Reveal } from '@/components/landing/Reveal';
import { CATEGORY_LABELS, type AppCategory, type CatalogApp } from '@/lib/apps-catalog';
import { AppIcon } from './AppIcon';

const copy = {
  en: {
    label: 'Apps',
    title: 'Self-host the tools you love, in one click',
    intro:
      'Every app below installs on your own server with HTTPS, a health check and — where it needs one — a managed database with restore-tested backups. No Docker files to write, nothing to babysit.',
    deployHint: 'Deploy on your server',
    count: (n: number) => `${n} apps`,
  },
  tr: {
    label: 'Uygulamalar',
    title: 'Sevdiğiniz araçları tek tıkla kendi sunucunuzda çalıştırın',
    intro:
      'Aşağıdaki her uygulama kendi sunucunuza HTTPS, sağlık kontrolü ve — gerekiyorsa — geri yükleme testinden geçmiş yedekli yönetilen veritabanıyla kurulur. Yazılacak Docker dosyası yok, bakılacak şey yok.',
    deployHint: 'Sunucunuza kurun',
    count: (n: number) => `${n} uygulama`,
  },
} as const;

export function AppsIndexView({ groups }: { groups: { category: AppCategory; apps: CatalogApp[] }[] }) {
  const { locale } = useTranslation();
  const lang = locale === 'tr' ? 'tr' : 'en';
  const c = copy[lang];
  const total = groups.reduce((n, g) => n + g.apps.length, 0);

  return (
    <MarketingShell>
      <MarketingPageHero label={`${c.label} · ${c.count(total)}`} title={c.title} description={c.intro} />

      <div className="lp-container max-w-5xl pb-24 space-y-14">
        {groups.map((group) => (
          <Reveal key={group.category}>
            <section>
              <h2
                className="text-xs font-semibold uppercase tracking-[0.08em] mb-4"
                style={{ color: 'var(--lp-muted)' }}
              >
                {CATEGORY_LABELS[group.category][lang]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.apps.map((app) => (
                  <Link
                    key={app.id}
                    href={`/apps/${app.id}`}
                    className="group rounded-2xl border p-5 flex flex-col gap-3 transition-colors"
                    style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-tertiary)' }}
                      >
                        <AppIcon id={app.id} name={app.name} size={22} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--lp-ink)' }}>
                          {app.name}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--lp-muted)' }}>
                          {app.tags.slice(0, 3).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--lp-body)' }}>
                      {app.description}
                    </p>
                    <p
                      className="text-xs font-medium group-hover:underline underline-offset-4"
                      style={{ color: 'var(--lp-ink)' }}
                    >
                      {c.deployHint} →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        ))}
      </div>
    </MarketingShell>
  );
}
