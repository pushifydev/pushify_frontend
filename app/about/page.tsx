'use client';

import type { ReactNode } from 'react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';
import { Rocket, Server, Database, Package } from 'lucide-react';

const content = {
  en: {
    label: 'About',
    title: 'Ship apps to servers you own',
    intro: 'Pushify turns a git push into an app served over HTTPS, on a server you own. The code is MIT-licensed.',
    record: 'Company record',
    openSource: 'Open source',
    web: 'Web',
    email: 'Email',
    source: 'Source',
    license: 'Licence',
    location: 'Address',
    locationValue: '30 N Gould St Ste N, Sheridan, WY 82801, USA',
    missionLabel: 'Mission',
    mission: 'Infrastructure should be a solved problem for small teams.',
    missionLead: 'You write the product. Pushify handles builds, certificates, databases, backups and rollbacks.',
    whatWeDoLabel: 'What Pushify does',
    whatWeDoTitle: 'Four things, done properly.',
    items: [
      { title: 'Deploys', desc: 'Connect a repository; it is built and switched over with zero downtime.' },
      { title: 'Servers', desc: 'Connect any VPS over SSH, or open a Hetzner server from the dashboard.' },
      { title: 'Databases', desc: 'PostgreSQL, MySQL, Redis and MongoDB, with scheduled backups.' },
      { title: 'Apps', desc: '24 open-source apps, from WordPress to n8n, installed in one click.' },
    ],
    valuesLabel: 'Principles',
    valuesTitle: 'How we decide.',
    values: [
      { title: 'Open source', desc: 'The API, dashboard and CLI are MIT-licensed. Self-host it for free.' },
      { title: 'Your data stays yours', desc: 'Apps and databases run on your servers. Leaving means taking them with you.' },
      { title: 'Published prices', desc: 'Plans, limits and hourly server rates are all on the pricing page.' },
    ],
  },
  tr: {
    label: 'Hakkımızda',
    title: 'Uygulamalarınızı kendi sunucularınıza taşıyın',
    intro: 'Pushify bir git push’u, kendi sunucunuzda HTTPS ile yayındaki bir uygulamaya dönüştürür. Kodu MIT lisanslı.',
    record: 'Şirket bilgileri',
    openSource: 'Açık kaynak',
    web: 'Web',
    email: 'E-posta',
    source: 'Kaynak',
    license: 'Lisans',
    location: 'Adres',
    locationValue: '30 N Gould St Ste N, Sheridan, WY 82801, ABD',
    missionLabel: 'Misyon',
    mission: 'Küçük ekipler için altyapı çözülmüş bir problem olmalı.',
    missionLead: 'Siz ürünü yazın. Derlemeyi, sertifikaları, veritabanlarını, yedekleri ve geri almaları Pushify üstlensin.',
    whatWeDoLabel: 'Ne yapıyoruz',
    whatWeDoTitle: 'Dört iş, düzgünce.',
    items: [
      { title: 'Deploy', desc: 'Bir depo bağlayın; derlenir ve kesintisiz olarak yeni sürüme geçilir.' },
      { title: 'Sunucular', desc: 'Herhangi bir VPS’i SSH ile bağlayın ya da panelden Hetzner sunucusu açın.' },
      { title: 'Veritabanları', desc: 'PostgreSQL, MySQL, Redis ve MongoDB; zamanlanmış yedeklerle.' },
      { title: 'Uygulamalar', desc: 'WordPress’ten n8n’e 24 açık kaynak uygulama, tek tıkla kurulur.' },
    ],
    valuesLabel: 'İlkeler',
    valuesTitle: 'Nasıl karar veriyoruz.',
    values: [
      { title: 'Açık kaynak', desc: 'API, panel ve CLI MIT lisanslı. Kendiniz ücretsiz çalıştırabilirsiniz.' },
      { title: 'Veriniz sizde kalır', desc: 'Uygulamalar ve veritabanları sizin sunucularınızda. Ayrılırken yanınızda götürürsünüz.' },
      { title: 'Açık fiyatlar', desc: 'Planlar, limitler ve saatlik sunucu ücretleri fiyatlandırma sayfasında.' },
    ],
  },
};

const ICONS = [Rocket, Server, Database, Package];
const linkCls = 'hover:underline underline-offset-4';

export default function AboutPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];

  const record: { label: string; value: ReactNode }[] = [
    { label: c.web, value: <a href="https://pushify.dev" className={linkCls}>pushify.dev</a> },
    { label: c.email, value: <a href="mailto:support@pushify.dev" className={linkCls}>support@pushify.dev</a> },
    {
      label: c.source,
      value: (
        <a href="https://github.com/pushifydev" className={linkCls} target="_blank" rel="noopener noreferrer">
          github.com/pushifydev
        </a>
      ),
    },
    { label: c.license, value: 'MIT' },
    { label: c.location, value: c.locationValue },
  ];

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      {/* The one object on this page: the company, as a record card. */}
      <div className="lp-container pb-20 md:pb-28">
        <div role="group" aria-label={c.record} className="hp-card mx-auto" style={{ width: '100%', maxWidth: '34rem' }}>
          <div className="hp-card-head">
            <span style={{ color: 'var(--hp-ink)' }}>Pushify LLC</span>
            <span>
              <span className="hp-dot" data-tone="event" aria-hidden="true" />
              {c.openSource}
            </span>
          </div>
          <dl className="px-4 py-3" style={{ fontSize: '0.8rem' }}>
            {record.map((row) => (
              <div key={row.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-1.5">
                <dt className="uppercase tracking-widest text-[0.65rem] pt-0.5" style={{ color: 'var(--hp-muted)' }}>
                  {row.label}
                </dt>
                <dd className="min-w-0 wrap-break-word" style={{ color: 'var(--hp-ink)' }}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <MSection eyebrow={c.missionLabel} title={c.mission} lead={c.missionLead} />

      <MSection eyebrow={c.whatWeDoLabel} title={c.whatWeDoTitle}>
        <RuleGrid cols={4}>
          {c.items.map((item, i) => (
            <RuleCell key={item.title} icon={ICONS[i]} title={item.title}>
              {item.desc}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>

      <MSection eyebrow={c.valuesLabel} title={c.valuesTitle}>
        <RuleGrid cols={3}>
          {c.values.map((v) => (
            <RuleCell key={v.title} title={v.title}>
              {v.desc}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>
    </MarketingShell>
  );
}
