'use client';

import type { ReactNode } from 'react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell, CodePanel } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';

/* Checked against pushify_backend/src/lib/pushify-config.ts: the schema is strict, a file that
   fails validation is logged and ignored (the deploy goes on), and cron / volumes / workers are
   upserted by name on production deploys — never deleted. */

const EXAMPLE = `# pushify.yaml — at the root of your repository
framework: nextjs
install: pnpm install --frozen-lockfile
build: pnpm build
start: pnpm start
port: 3000
# output: dist        # static sites only

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

type Row = { key: string; type: string; desc: string };

const copy = {
  en: {
    label: 'Reference',
    title: 'pushify.yaml',
    intro: 'Declare how your app builds and runs, next to the code. The file wins over dashboard settings on every deploy.',
    exampleNote: 'every key, in one file',
    rulesEyebrow: 'How it is read',
    rulesTitle: 'Four rules',
    rules: [
      { title: 'Where it lives', body: 'pushify.yaml or pushify.yml, in the project’s root directory or the repo root.' },
      { title: 'Every field is optional', body: 'Leave one out and the dashboard value applies. Secrets stay in the dashboard.' },
      { title: 'Invalid files are skipped', body: 'An unknown key or bad value logs a warning; the deploy continues without the file.' },
      { title: 'Added, never removed', body: 'Production deploys create or update cron, volumes and workers by name. Nothing is deleted.' },
    ],
    fieldsEyebrow: 'Fields',
    fieldsTitle: 'Every key the file accepts',
    groups: {
      top: { title: 'Build and run', intro: 'Top-level keys. Commands must fit on one line.' },
      cron: { title: 'Scheduled commands', intro: 'Up to 20, each run inside your app container.' },
      volumes: { title: 'Persistent volumes', intro: 'Up to 10 named volumes that survive deploys, restarts and rollbacks.' },
      workers: { title: 'Background workers', intro: 'Up to 5 processes started from the same image after each successful deploy.' },
    },
    fields: [
      { key: 'framework', type: 'string', desc: 'Skip auto-detection and pin a build strategy: nextjs, react, vue, nuxt, svelte, astro, remix, nodejs, python, django, go, laravel, rails, static… An unknown value falls back to auto-detection. A Dockerfile in the repo still wins.' },
      { key: 'install', type: 'string', desc: 'Dependency install command run before build (e.g. pnpm install --frozen-lockfile).' },
      { key: 'build', type: 'string', desc: 'Build command. Its dependency layer is cached between deploys.' },
      { key: 'start', type: 'string', desc: 'Process command for the web container.' },
      { key: 'output', type: 'string', desc: 'Output directory for static sites, relative to the repo (e.g. dist, out, build).' },
      { key: 'port', type: 'number', desc: 'Port your process listens on (1–65535). Pushify routes HTTPS traffic to it.' },
    ],
    cron: [
      { key: 'name', type: 'string · required', desc: 'Unique within the project. Shown in the Cron tab and run history.' },
      { key: 'schedule', type: 'string · required', desc: '5-field cron expression ("*/15 * * * *"). Validated at deploy.' },
      { key: 'command', type: 'string · required', desc: 'Shell command run via docker exec in the running container.' },
      { key: 'timezone', type: 'string', desc: 'IANA zone for the schedule (default UTC), e.g. Europe/Istanbul.' },
      { key: 'timeoutSeconds', type: 'number', desc: '5–3600. The run is killed past this. New jobs default to 120.' },
    ],
    volumes: [
      { key: 'name', type: 'string · required', desc: 'Lowercase letters, digits and dashes, starting with a letter or digit; max 31 chars. Unique within the project.' },
      { key: 'path', type: 'string · required', desc: 'Absolute mount path inside the container (e.g. /app/uploads). System paths such as /etc or /proc are refused.' },
    ],
    workers: [
      { key: 'name', type: 'string · required', desc: '1–40 lowercase letters, digits or dashes, no dash at either end. Container becomes pushify-<project>-worker-<name>.' },
      { key: 'command', type: 'string · required', desc: 'Command override for the worker container (e.g. node worker.js, celery -A app worker).' },
    ],
    seeAlso: 'See also',
    seeAlsoTitle: 'Related pages',
    links: [
      { label: 'Deploy to Pushify button', desc: 'A one-click deploy link for your README.', href: '/deploy-button', cta: 'Open' },
      { label: 'Zero-downtime deploys', desc: 'What happens between the build and the traffic switch.', href: '/blog/how-zero-downtime-deploys-work', cta: 'Read' },
      { label: 'API documentation', desc: 'The HTTP API behind the dashboard and the CLI.', href: '/docs', cta: 'Open' },
    ],
  },
  tr: {
    label: 'Referans',
    title: 'pushify.yaml',
    intro: 'Uygulamanızın nasıl derlenip çalışacağını kodun yanında tanımlayın. Dosya her deploy’da panel ayarlarının önüne geçer.',
    exampleNote: 'tüm anahtarlar, tek dosyada',
    rulesEyebrow: 'Nasıl okunur',
    rulesTitle: 'Dört kural',
    rules: [
      { title: 'Nerede durur', body: 'pushify.yaml ya da pushify.yml; projenin kök dizininde ya da repo kökünde.' },
      { title: 'Her alan isteğe bağlı', body: 'Yazmadığınız alan için panel değeri geçerlidir. Gizli değerler panelde kalır.' },
      { title: 'Geçersiz dosya atlanır', body: 'Bilinmeyen anahtar ya da hatalı değer uyarı olarak loglanır; deploy dosyasız devam eder.' },
      { title: 'Eklenir, silinmez', body: 'Production deploy’ları cron, volume ve worker’ları ada göre oluşturur ya da günceller. Hiçbiri silinmez.' },
    ],
    fieldsEyebrow: 'Alanlar',
    fieldsTitle: 'Dosyanın kabul ettiği tüm anahtarlar',
    groups: {
      top: { title: 'Build ve çalıştırma', intro: 'Üst düzey anahtarlar. Komutlar tek satır olmalı.' },
      cron: { title: 'Zamanlanmış komutlar', intro: 'En fazla 20; her biri uygulama container’ında çalışır.' },
      volumes: { title: 'Kalıcı volume’lar', intro: 'Deploy, yeniden başlatma ve geri almalardan sağ çıkan en fazla 10 volume.' },
      workers: { title: 'Arka plan worker’ları', intro: 'Her başarılı deploy’dan sonra aynı imajdan başlatılan en fazla 5 süreç.' },
    },
    fields: [
      { key: 'framework', type: 'string', desc: 'Otomatik algılamayı atlayıp build stratejisini sabitler: nextjs, react, vue, nuxt, svelte, astro, remix, nodejs, python, django, go, laravel, rails, static… Bilinmeyen bir değerde otomatik algılamaya dönülür. Repoda Dockerfile varsa yine o kazanır.' },
      { key: 'install', type: 'string', desc: 'Build öncesi bağımlılık kurulum komutu (ör. pnpm install --frozen-lockfile).' },
      { key: 'build', type: 'string', desc: 'Build komutu. Bağımlılık katmanı deploy’lar arasında önbelleğe alınır.' },
      { key: 'start', type: 'string', desc: 'Web container’ının süreç komutu.' },
      { key: 'output', type: 'string', desc: 'Statik siteler için repoya göre çıktı dizini (ör. dist, out, build).' },
      { key: 'port', type: 'number', desc: 'Sürecinizin dinlediği port (1–65535). Pushify HTTPS trafiğini buraya yönlendirir.' },
    ],
    cron: [
      { key: 'name', type: 'string · zorunlu', desc: 'Proje içinde benzersiz. Cron sekmesinde ve çalışma geçmişinde görünür.' },
      { key: 'schedule', type: 'string · zorunlu', desc: '5 alanlı cron ifadesi ("*/15 * * * *"). Deploy’da doğrulanır.' },
      { key: 'command', type: 'string · zorunlu', desc: 'Çalışan container’da docker exec ile koşturulan kabuk komutu.' },
      { key: 'timezone', type: 'string', desc: 'Zamanlama için IANA bölgesi (varsayılan UTC), ör. Europe/Istanbul.' },
      { key: 'timeoutSeconds', type: 'number', desc: '5–3600. Süre aşılınca çalışma sonlandırılır. Yeni görevlerde varsayılan 120.' },
    ],
    volumes: [
      { key: 'name', type: 'string · zorunlu', desc: 'Küçük harf, rakam ve tire; harf ya da rakamla başlar, en fazla 31 karakter. Proje içinde benzersiz.' },
      { key: 'path', type: 'string · zorunlu', desc: 'Container içindeki mutlak bağlama yolu (ör. /app/uploads). /etc, /proc gibi sistem yolları reddedilir.' },
    ],
    workers: [
      { key: 'name', type: 'string · zorunlu', desc: '1–40 küçük harf, rakam ya da tire; başında ve sonunda tire olmaz. Container adı pushify-<proje>-worker-<ad> olur.' },
      { key: 'command', type: 'string · zorunlu', desc: 'Worker container’ı için komut (ör. node worker.js, celery -A app worker).' },
    ],
    seeAlso: 'Ayrıca bakın',
    seeAlsoTitle: 'İlgili sayfalar',
    links: [
      { label: 'Deploy to Pushify butonu', desc: 'README’niz için tek tıkla deploy linki.', href: '/deploy-button', cta: 'Aç' },
      { label: 'Kesintisiz deploy', desc: 'Build ile trafiğin geçişi arasında olanlar.', href: '/blog/how-zero-downtime-deploys-work', cta: 'Oku' },
      { label: 'API dokümantasyonu', desc: 'Panelin ve CLI’ın arkasındaki HTTP API.', href: '/docs', cta: 'Aç' },
    ],
  },
} as const;

function FieldTable({ rows }: { rows: readonly Row[] }) {
  return (
    <dl className="border-t" style={{ borderColor: 'var(--hp-line-strong)' }}>
      {rows.map((r) => (
        <div
          key={r.key}
          className="grid grid-cols-1 sm:grid-cols-[11rem_minmax(0,1fr)] gap-x-6 gap-y-1.5 py-4 border-b"
          style={{ borderColor: 'var(--hp-line)' }}
        >
          <dt className="min-w-0">
            <code className="text-[14px] break-words" style={{ fontFamily: 'var(--font-mono)', color: 'var(--hp-ink)' }}>
              {r.key}
            </code>
            <span className="hp-eyebrow block mt-1">{r.type}</span>
          </dt>
          <dd className="text-[15px] leading-relaxed" style={{ color: 'var(--hp-body)' }}>
            {r.desc}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** One group of keys: its path and purpose on the left, the fields on the right. */
function FieldGroup({ id, path, title, intro, rows }: { id: string; path: string; title: string; intro: string; rows: readonly Row[] }) {
  return (
    <div id={id} className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-x-12 gap-y-5 py-10 first:pt-0">
      <div>
        <p className="hp-mono text-[12px]" style={{ color: 'var(--hp-muted)' }}>
          {path}
        </p>
        <h3 className="hp-cell-title mt-2">{title}</h3>
        <p className="text-[15px] leading-relaxed mt-2" style={{ color: 'var(--hp-body)' }}>
          {intro}
        </p>
      </div>
      <FieldTable rows={rows} />
    </div>
  );
}

export default function PushifyYamlPage() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  const exampleTitle: ReactNode = (
    <span className="flex items-center justify-between gap-3">
      <span className="normal-case">pushify.yaml</span>
      <span>{c.exampleNote}</span>
    </span>
  );

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      <section id="example" className="pb-20 md:pb-24">
        <div className="lp-container max-w-3xl">
          <CodePanel title={exampleTitle}>
            <code>{EXAMPLE}</code>
          </CodePanel>
        </div>
      </section>

      <MSection id="rules" eyebrow={c.rulesEyebrow} title={c.rulesTitle}>
        <RuleGrid cols={4}>
          {c.rules.map((r) => (
            <RuleCell key={r.title} title={r.title}>
              {r.body}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>

      <MSection id="fields" eyebrow={c.fieldsEyebrow} title={c.fieldsTitle}>
        <div className="divide-y divide-[var(--hp-line)]">
          <FieldGroup id="build-and-run" path="<root>" title={c.groups.top.title} intro={c.groups.top.intro} rows={c.fields} />
          <FieldGroup id="cron" path="cron[]" title={c.groups.cron.title} intro={c.groups.cron.intro} rows={c.cron} />
          <FieldGroup id="volumes" path="volumes[]" title={c.groups.volumes.title} intro={c.groups.volumes.intro} rows={c.volumes} />
          <FieldGroup id="workers" path="workers[]" title={c.groups.workers.title} intro={c.groups.workers.intro} rows={c.workers} />
        </div>
      </MSection>

      <MSection eyebrow={c.seeAlso} title={c.seeAlsoTitle}>
        <RuleGrid cols={3}>
          {c.links.map((l) => (
            <RuleCell key={l.href} title={l.label} href={l.href} linkLabel={l.cta}>
              {l.desc}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>
    </MarketingShell>
  );
}
