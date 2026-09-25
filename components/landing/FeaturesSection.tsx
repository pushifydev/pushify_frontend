'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Globe, Users, Bot, ScrollText, HeartPulse, Eye, Lock, Bell, Gauge,
  GitCommit, Check, Database, type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingPageHero } from './MarketingShell';
import { MSection, RuleGrid, RuleCell, Eyebrow } from './MarketingKit';
import { SiteBuilderMockup } from './SiteBuilderSection';

/**
 * /features. Every sentence here is something the backend does (checked 2026-09-25): rollback
 * reuses the earlier image, BuildKit keeps layers on the server, GitHub and GitLab webhooks,
 * owner/admin/member/viewer roles, email/webhook/Slack/Discord channels, the CLI's real output.
 * The mockups carry example names and values, never timings.
 */
const copy = {
  en: {
    rows: {
      deploy: {
        eyebrow: 'Deploy',
        title: 'Push to deploy.',
        body: 'Every push to your branch is built and deployed. Traffic moves only after the new container passes its health check.',
      },
      servers: {
        eyebrow: 'Servers',
        title: 'Bring a VPS, or open one from the dashboard.',
        body: 'Connect any VPS over SSH, or open a Hetzner server from the dashboard on a paid plan.',
      },
      data: {
        eyebrow: 'Databases',
        title: 'Databases next to your apps.',
        body: 'PostgreSQL, MySQL, Redis or MongoDB on the same server. Link one and DATABASE_URL is set for you.',
      },
      sites: {
        eyebrow: 'Site builder',
        title: 'A website builder, built in.',
        body: 'Pick a template, edit it on the page, publish to your own server. No code.',
        link: 'See the site builder',
      },
      cli: {
        eyebrow: 'CLI',
        title: 'Deploy from your terminal.',
        body: 'Link a folder, deploy and wait for the result, sync env vars, tail logs.',
      },
    },
    mock: {
      commit: 'feat: add user dashboard',
      detected: 'Detected Next.js',
      built: 'Image built',
      health: 'Health check passed',
      switched: 'Traffic switched',
      liveAt: 'Live at',
      databases: 'Databases',
      running: 'Running',
      memory: 'Memory',
      disk: 'Disk',
    },
    more: {
      eyebrow: 'Also included',
      title: 'And everything else',
      lead: 'The rest of what running an app takes.',
    },
    cells: [
      { icon: Globe, title: 'Custom domains and SSL', body: 'Point one record; the certificate is issued and renewed for you.' },
      { icon: Users, title: 'Team roles', body: 'Owner, admin, member or viewer — limited to the projects they need.' },
      { icon: Bot, title: 'AI assistant', body: 'Built-in help with failed builds and configuration, powered by Claude.' },
      { icon: ScrollText, title: 'Activity log', body: 'Who deployed, changed or removed what, and when.' },
      { icon: HeartPulse, title: 'Health checks', body: 'Three failed checks in a row and the team gets an email.' },
      { icon: Eye, title: 'Preview deployments', body: 'A URL per pull request, removed when it closes.' },
      { icon: Lock, title: 'Environment variables', body: 'Per environment, encrypted at rest, injected at build and run time.' },
      { icon: Bell, title: 'Notifications', body: 'Email, webhook, Slack or Discord.' },
      { icon: Gauge, title: 'Replicas and autoscaling', body: 'Replicas behind nginx, added and removed on CPU.' },
    ],
  },
  tr: {
    rows: {
      deploy: {
        eyebrow: 'Deploy',
        title: 'Push’layın, yayına çıksın.',
        body: 'Dalınıza gelen her push derlenip yayına alınır. Trafik, yeni konteyner sağlık kontrolünden geçmeden taşınmaz.',
      },
      servers: {
        eyebrow: 'Sunucular',
        title: 'VPS’inizi getirin ya da panelden bir tane açın.',
        body: 'Herhangi bir VPS’i SSH ile bağlayın ya da ücretli planda panelden bir Hetzner sunucusu açın.',
      },
      data: {
        eyebrow: 'Veritabanları',
        title: 'Uygulamalarınızın yanında veritabanları.',
        body: 'PostgreSQL, MySQL, Redis ya da MongoDB aynı sunucuda. Bağladığınızda DATABASE_URL sizin için ayarlanır.',
      },
      sites: {
        eyebrow: 'Site kurucu',
        title: 'Dahili bir web sitesi kurucusu.',
        body: 'Bir şablon seçin, sayfanın üzerinde düzenleyin, kendi sunucunuza yayınlayın. Kod yok.',
        link: 'Site kurucuyu inceleyin',
      },
      cli: {
        eyebrow: 'CLI',
        title: 'Terminalden deploy edin.',
        body: 'Klasörü bağlayın, deploy edip sonucu bekleyin, ortam değişkenlerini eşitleyin, logları izleyin.',
      },
    },
    mock: {
      commit: 'feat: add user dashboard',
      detected: 'Next.js algılandı',
      built: 'İmaj derlendi',
      health: 'Sağlık kontrolü geçti',
      switched: 'Trafik geçti',
      liveAt: 'Yayında',
      databases: 'Veritabanları',
      running: 'Çalışıyor',
      memory: 'Bellek',
      disk: 'Disk',
    },
    more: {
      eyebrow: 'Ayrıca',
      title: 'Ve geri kalan her şey',
      lead: 'Bir uygulamayı ayakta tutmanın geri kalanı.',
    },
    cells: [
      { icon: Globe, title: 'Özel alan adı ve SSL', body: 'Tek bir kayıt yeter; sertifika sizin için alınır ve yenilenir.' },
      { icon: Users, title: 'Ekip rolleri', body: 'Sahip, yönetici, üye ya da izleyici — gerektiği projelerle sınırlı.' },
      { icon: Bot, title: 'AI asistan', body: 'Başarısız derleme ve yapılandırmada Claude destekli yardım.' },
      { icon: ScrollText, title: 'Aktivite kaydı', body: 'Kim neyi ne zaman deploy etti, değiştirdi ya da sildi.' },
      { icon: HeartPulse, title: 'Sağlık kontrolleri', body: 'Üst üste üç başarısız kontrolde ekibe e-posta gider.' },
      { icon: Eye, title: 'Önizleme deploy’ları', body: 'Her pull request’e bir adres; kapanınca kaldırılır.' },
      { icon: Lock, title: 'Ortam değişkenleri', body: 'Ortam bazında, şifreli saklanır, derleme ve çalışma anında eklenir.' },
      { icon: Bell, title: 'Bildirimler', body: 'E-posta, webhook, Slack ya da Discord.' },
      { icon: Gauge, title: 'Replikalar ve otomatik ölçekleme', body: 'nginx arkasında replikalar; CPU’ya göre eklenir ve çıkarılır.' },
    ],
  },
};

type Mock = (typeof copy)['en']['mock'];

/* ───────────────── Mockups: product objects, drawn in the homepage's card style ───────────────── */

function MockFrame({ head, aside, children }: { head: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <div
      className="w-full overflow-hidden rounded-[14px] border text-[0.8rem]"
      style={{ borderColor: 'var(--hp-line)', background: 'var(--hp-card)', fontFamily: 'var(--font-label)' }}
      aria-hidden="true"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5 border-b text-[0.625rem] uppercase tracking-widest"
        style={{ borderColor: 'var(--hp-line)', color: 'var(--hp-muted)' }}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">{head}</span>
        {aside && <span className="shrink-0">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function LiveDot() {
  return (
    <span
      className="inline-block w-1.75 h-1.75 rounded-full shrink-0"
      style={{ background: 'var(--hp-live)', boxShadow: '0 0 0 3px var(--hp-live-soft)' }}
    />
  );
}

function DeployMockup({ m }: { m: Mock }) {
  const steps = [m.detected, m.built, m.health, m.switched];
  return (
    <MockFrame head={<><GitCommit className="w-3.5 h-3.5" /> main · a1b2c3d</>}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--hp-line)', color: 'var(--hp-ink)' }}>
        {m.commit}
      </div>
      {steps.map((s) => (
        <div
          key={s}
          className="px-4 py-2.5 flex items-center gap-3 border-b"
          style={{ borderColor: 'var(--hp-line)', color: 'var(--hp-body)' }}
        >
          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--hp-live)' }} />
          {s}
        </div>
      ))}
      <div className="px-4 py-3 flex items-center gap-2 min-w-0" style={{ background: 'var(--hp-live-soft)' }}>
        <LiveDot />
        <span style={{ color: 'var(--hp-live)' }}>{m.liveAt}</span>
        <span className="truncate" style={{ color: 'var(--hp-ink)' }}>shop.pushify.dev</span>
      </div>
    </MockFrame>
  );
}

function ServerMockup({ m }: { m: Mock }) {
  const bars = [72, 45, 88, 34, 61, 52, 78, 40, 65, 55, 82, 48];
  const metrics = [
    { label: 'CPU', value: '24%' },
    { label: m.memory, value: '1.2 GB' },
    { label: m.disk, value: '18 GB' },
  ];
  return (
    <MockFrame head={<><LiveDot /> <span style={{ color: 'var(--hp-ink)' }}>prod-01</span></>} aside="Nuremberg, DE">
      <div className="grid grid-cols-3">
        {metrics.map((x, i) => (
          <div
            key={x.label}
            className={`px-3 py-4 text-center ${i > 0 ? 'border-l' : ''}`}
            style={{ borderColor: 'var(--hp-line)' }}
          >
            <div className="text-[0.625rem] uppercase tracking-widest mb-1.5" style={{ color: 'var(--hp-muted)' }}>
              {x.label}
            </div>
            <div className="text-[0.95rem]" style={{ color: 'var(--hp-ink)', fontFamily: 'var(--font-display)' }}>
              {x.value}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--hp-line)' }}>
        <div className="flex items-end gap-0.75 h-10">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${h}%`, background: 'var(--hp-ink)', opacity: 0.18 + (i / bars.length) * 0.5 }}
            />
          ))}
        </div>
      </div>
    </MockFrame>
  );
}

function DatabaseMockup({ m }: { m: Mock }) {
  const dbs = [
    { name: 'main-postgres', type: 'PostgreSQL', size: '2.4 GB' },
    { name: 'cache-redis', type: 'Redis', size: '128 MB' },
    { name: 'analytics-db', type: 'MySQL', size: '890 MB' },
  ];
  return (
    <MockFrame head={<><Database className="w-3.5 h-3.5" /> {m.databases}</>} aside={m.running}>
      {dbs.map((db, i) => (
        <div
          key={db.name}
          className={`px-4 py-3 flex items-center gap-3 ${i < dbs.length - 1 ? 'border-b' : ''}`}
          style={{ borderColor: 'var(--hp-line)' }}
        >
          <LiveDot />
          <div className="flex-1 min-w-0 truncate">
            <span style={{ color: 'var(--hp-ink)' }}>{db.name}</span>
            <span className="ml-2" style={{ color: 'var(--hp-muted)' }}>{db.type}</span>
          </div>
          <span className="shrink-0" style={{ color: 'var(--hp-muted)' }}>{db.size}</span>
        </div>
      ))}
    </MockFrame>
  );
}

/** What `pushify deploy --prod --wait` really prints (pushify-cli/src/commands/deploy.ts). */
function TerminalMockup() {
  return (
    <MockFrame head="terminal">
      <div className="p-4 leading-[1.75] overflow-x-auto whitespace-pre" style={{ color: 'var(--hp-body)' }}>
        <div style={{ color: 'var(--hp-ink)' }}>$ pushify deploy --prod --wait</div>
        <div style={{ color: 'var(--hp-live)' }}>✔ Deployment triggered!</div>
        <div>  Branch: main (production)</div>
        <div style={{ color: 'var(--hp-live)' }}>✔ Deployment successful!</div>
        <div style={{ color: 'var(--hp-live)' }}>  ✓ Your application is now live</div>
      </div>
    </MockFrame>
  );
}

/* ───────────────── One feature: eyebrow, title, lead beside a product mockup ───────────────── */
function FeatureRow({
  id,
  eyebrow,
  title,
  body,
  mockup,
  link,
  reverse = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  mockup: ReactNode;
  link?: { href: string; label: string };
  reverse?: boolean;
}) {
  return (
    <section id={id} className="hp-section" aria-labelledby={`${id}-title`}>
      <div className="lp-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className={reverse ? 'lg:order-2' : undefined}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={`${id}-title`} className="hp-h2 mt-6">
            {title}
          </h2>
          <p className="hp-lead mt-5 max-w-136">{body}</p>
          {link && (
            <p className="hp-cell-link mt-2">
              <Link href={link.href}>
                {link.label}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </p>
          )}
        </div>
        <div className={`min-w-0 ${reverse ? 'lg:order-1' : ''}`}>{mockup}</div>
      </div>
    </section>
  );
}

/* ───────────────── Main Export ───────────────── */
export function FeaturesSection() {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const r = c.rows;

  return (
    <div>
      <MarketingPageHero
        label={t('landing', 'platform')}
        title={
          <>
            {t('landing', 'everythingYouNeedTo')}
            <br />
            {t('landing', 'shipWithConfidence')}
          </>
        }
        description={t('landing', 'featuresPageDescription')}
      />

      <FeatureRow id="deploy" {...r.deploy} mockup={<DeployMockup m={c.mock} />} />
      <FeatureRow id="servers" {...r.servers} mockup={<ServerMockup m={c.mock} />} reverse />
      <FeatureRow id="databases" {...r.data} mockup={<DatabaseMockup m={c.mock} />} />
      <FeatureRow
        id="site-builder"
        eyebrow={r.sites.eyebrow}
        title={r.sites.title}
        body={r.sites.body}
        link={{ href: '/sites', label: r.sites.link }}
        mockup={<SiteBuilderMockup />}
        reverse
      />
      <FeatureRow id="cli" {...r.cli} mockup={<TerminalMockup />} />

      <MSection id="everything-else" eyebrow={c.more.eyebrow} title={c.more.title} lead={c.more.lead}>
        <RuleGrid cols={3}>
          {c.cells.map((cell: { icon: LucideIcon; title: string; body: string }) => (
            // No icons here: X keeps icons for the headline features; nine more would be wallpaper.
            <RuleCell key={cell.title} title={cell.title}>
              {cell.body}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>
    </div>
  );
}
