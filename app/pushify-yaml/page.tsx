'use client';

import Link from 'next/link';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';
import { Reveal } from '@/components/landing/Reveal';

const EXAMPLE = `# pushify.yaml — lives at the root of your repository
framework: nextjs
install: pnpm install --frozen-lockfile
build: pnpm build
start: pnpm start
port: 3000

cron:
  - name: nightly-report
    schedule: "0 3 * * *"
    timezone: Europe/Istanbul
    command: node scripts/report.js
    timeoutSeconds: 600

volumes:
  - name: uploads
    path: /app/uploads

workers:
  - name: queue
    command: node worker.js
`;

const copy = {
  en: {
    label: 'Reference',
    title: 'pushify.yaml',
    intro:
      'Declare how your app builds and runs next to the code. Anything set here wins over the dashboard on the next deploy — and it travels with the repository, so a "Deploy to Pushify" click or a teammate\'s fork gets the same setup.',
    exampleTitle: 'Complete example',
    rules: [
      'The file is read from the repository root on every deploy. Unknown keys are rejected so typos surface as a build error instead of silently doing nothing.',
      'Every field is optional. Leave one out and the dashboard value (or auto-detection) applies.',
      'Cron, volumes and workers are synced declaratively: what is in the file is what exists after the deploy.',
    ],
    fieldsTitle: 'Fields',
    fields: [
      { key: 'framework', type: 'string', desc: 'Skip auto-detection and force a build strategy: nextjs, react, vue, nuxt, svelte, astro, remix, nodejs, python, django, go, laravel, rails, static… If you have a Dockerfile, it still wins.' },
      { key: 'install', type: 'string', desc: 'Dependency install command run before build (e.g. pnpm install --frozen-lockfile).' },
      { key: 'build', type: 'string', desc: 'Build command. Its dependency layer is cached between deploys.' },
      { key: 'start', type: 'string', desc: 'Process command for the web container.' },
      { key: 'output', type: 'string', desc: 'Output directory for static sites (e.g. dist, out, build).' },
      { key: 'port', type: 'number', desc: 'Port your process listens on (1–65535). Pushify routes HTTPS traffic to it.' },
    ],
    cronTitle: 'cron[]',
    cronIntro: 'Up to 20 scheduled commands, each executed inside your app container.',
    cron: [
      { key: 'name', type: 'string · required', desc: 'Unique within the project. Shown in the Cron tab and run history.' },
      { key: 'schedule', type: 'string · required', desc: '5-field cron expression ("*/15 * * * *"). Validated at deploy.' },
      { key: 'command', type: 'string · required', desc: 'Shell command run via docker exec in the running container.' },
      { key: 'timezone', type: 'string', desc: 'IANA zone for the schedule (default UTC), e.g. Europe/Istanbul.' },
      { key: 'timeoutSeconds', type: 'number', desc: '5–3600. The run is killed past this. Default from the dashboard.' },
    ],
    volumesTitle: 'volumes[]',
    volumesIntro: 'Up to 10 named volumes that survive deploys, restarts and rollbacks.',
    volumes: [
      { key: 'name', type: 'string · required', desc: 'Lowercase letters, digits and dashes, max 32 chars. Unique within the project.' },
      { key: 'path', type: 'string · required', desc: 'Absolute mount path inside the container (e.g. /app/uploads).' },
    ],
    workersTitle: 'workers[]',
    workersIntro: 'Background processes started from the same image after each successful deploy — queues, schedulers, consumers.',
    workers: [
      { key: 'name', type: 'string · required', desc: 'Lowercase, dashes allowed, max 40 chars. Container becomes pushify-<project>-worker-<name>.' },
      { key: 'command', type: 'string · required', desc: 'Command override for the worker container (e.g. node worker.js, celery -A app worker).' },
    ],
    seeAlso: 'See also',
    links: [
      { label: 'Deploy to Pushify button', href: '/deploy-button' },
      { label: 'How zero-downtime deploys work', href: '/blog/how-zero-downtime-deploys-work' },
      { label: 'API documentation', href: '/docs' },
    ],
  },
  tr: {
    label: 'Referans',
    title: 'pushify.yaml',
    intro:
      'Uygulamanızın nasıl derlenip çalışacağını kodun yanında tanımlayın. Buradaki her ayar bir sonraki deploy’da panelin önüne geçer — ve repo ile taşınır: bir "Deploy to Pushify" tıklaması ya da ekip arkadaşınızın fork’u aynı kurulumu alır.',
    exampleTitle: 'Tam örnek',
    rules: [
      'Dosya her deploy’da repo kökünden okunur. Bilinmeyen anahtarlar reddedilir; yazım hataları sessizce yutulmak yerine build hatası olarak görünür.',
      'Her alan isteğe bağlıdır. Yazmadığınız alan için panel değeri (ya da otomatik algılama) geçerlidir.',
      'Cron, volume ve worker’lar bildirimsel senkronlanır: deploy sonrası var olan şey dosyada yazandır.',
    ],
    fieldsTitle: 'Alanlar',
    fields: [
      { key: 'framework', type: 'string', desc: 'Otomatik algılamayı atlayıp build stratejisini zorlar: nextjs, react, vue, nuxt, svelte, astro, remix, nodejs, python, django, go, laravel, rails, static… Dockerfile varsa yine o kazanır.' },
      { key: 'install', type: 'string', desc: 'Build öncesi bağımlılık kurulum komutu (ör. pnpm install --frozen-lockfile).' },
      { key: 'build', type: 'string', desc: 'Build komutu. Bağımlılık katmanı deploy’lar arasında önbelleğe alınır.' },
      { key: 'start', type: 'string', desc: 'Web container’ının süreç komutu.' },
      { key: 'output', type: 'string', desc: 'Statik siteler için çıktı dizini (ör. dist, out, build).' },
      { key: 'port', type: 'number', desc: 'Sürecinizin dinlediği port (1–65535). Pushify HTTPS trafiğini buraya yönlendirir.' },
    ],
    cronTitle: 'cron[]',
    cronIntro: 'En fazla 20 zamanlanmış komut; her biri uygulama container’ının içinde çalışır.',
    cron: [
      { key: 'name', type: 'string · zorunlu', desc: 'Proje içinde benzersiz. Cron sekmesinde ve çalışma geçmişinde görünür.' },
      { key: 'schedule', type: 'string · zorunlu', desc: '5 alanlı cron ifadesi ("*/15 * * * *"). Deploy’da doğrulanır.' },
      { key: 'command', type: 'string · zorunlu', desc: 'Çalışan container’da docker exec ile koşturulan kabuk komutu.' },
      { key: 'timezone', type: 'string', desc: 'Zamanlama için IANA bölgesi (varsayılan UTC), ör. Europe/Istanbul.' },
      { key: 'timeoutSeconds', type: 'number', desc: '5–3600. Süre aşılınca çalışma sonlandırılır. Varsayılan panelden.' },
    ],
    volumesTitle: 'volumes[]',
    volumesIntro: 'Deploy, yeniden başlatma ve geri almalardan sağ çıkan en fazla 10 adlandırılmış volume.',
    volumes: [
      { key: 'name', type: 'string · zorunlu', desc: 'Küçük harf, rakam ve tire, en fazla 32 karakter. Proje içinde benzersiz.' },
      { key: 'path', type: 'string · zorunlu', desc: 'Container içindeki mutlak bağlama yolu (ör. /app/uploads).' },
    ],
    workersTitle: 'workers[]',
    workersIntro: 'Her başarılı deploy’dan sonra aynı imajdan başlatılan arka plan süreçleri — kuyruklar, zamanlayıcılar, tüketiciler.',
    workers: [
      { key: 'name', type: 'string · zorunlu', desc: 'Küçük harf, tire serbest, en fazla 40 karakter. Container adı pushify-<proje>-worker-<ad> olur.' },
      { key: 'command', type: 'string · zorunlu', desc: 'Worker container’ı için komut (ör. node worker.js, celery -A app worker).' },
    ],
    seeAlso: 'Ayrıca bakın',
    links: [
      { label: 'Deploy to Pushify butonu', href: '/deploy-button' },
      { label: 'Kesintisiz deploy nasıl çalışır', href: '/blog/how-zero-downtime-deploys-work' },
      { label: 'API dokümantasyonu', href: '/docs' },
    ],
  },
} as const;

function FieldTable({ rows }: { rows: readonly { key: string; type: string; desc: string }[] }) {
  return (
    <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: 'var(--lp-border)' }}>
      {rows.map((r) => (
        <div key={r.key} className="px-4 py-3 grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-x-4 gap-y-1" style={{ borderColor: 'var(--lp-border)' }}>
          <div className="min-w-0">
            <code className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}>{r.key}</code>
            <p className="text-[11px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--lp-muted)' }}>{r.type}</p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>{r.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function PushifyYamlPage() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  return (
    <MarketingShell>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      <div className="lp-container max-w-3xl pb-24 space-y-14">
        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.exampleTitle}</h2>
            <pre
              className="rounded-xl border p-5 overflow-x-auto text-[12.5px] leading-relaxed"
              style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)', fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}
            >
              <code>{EXAMPLE}</code>
            </pre>
            <ul className="mt-5 space-y-2 list-disc pl-5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
              {c.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.fieldsTitle}</h2>
            <FieldTable rows={c.fields} />
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}>{c.cronTitle}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--lp-muted)' }}>{c.cronIntro}</p>
            <FieldTable rows={c.cron} />
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}>{c.volumesTitle}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--lp-muted)' }}>{c.volumesIntro}</p>
            <FieldTable rows={c.volumes} />
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}>{c.workersTitle}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--lp-muted)' }}>{c.workersIntro}</p>
            <FieldTable rows={c.workers} />
          </section>
        </Reveal>

        <Reveal>
          <section className="pt-6 border-t" style={{ borderColor: 'var(--lp-border)' }}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--lp-muted)' }}>{c.seeAlso}</h2>
            <ul className="space-y-1.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:underline underline-offset-4" style={{ color: 'var(--lp-ink)' }}>{l.label} →</Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>
    </MarketingShell>
  );
}
