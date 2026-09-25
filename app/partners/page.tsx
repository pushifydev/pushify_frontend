'use client';

import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell, Steps } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';
import { Building2, Paintbrush, Users, ArrowUpRight } from 'lucide-react';

const CONTACT = 'support@pushify.dev';
const SELF_HOST_DOCS = 'https://github.com/pushifydev/pushify_backend/blob/master/docs/SELF_HOSTING.md';

const mailto = (subject: string) => `mailto:${CONTACT}?subject=${encodeURIComponent(`[Partners] ${subject}`)}`;

/* An example of the one dashboard an agency works from: every client app, the server it runs
   on, its state. Names are placeholders; nothing here is a customer. */
const BOARD = [
  { app: 'bakery-shop', kind: 'Next.js', server: 'vps-eu-1' },
  { app: 'clinic-portal', kind: 'Laravel', server: 'vps-eu-1' },
  { app: 'studio-blog', kind: 'WordPress', server: 'vps-eu-2' },
  { app: 'law-firm-site', kind: 'Static', server: 'vps-us-1' },
  { app: 'events-api', kind: 'Node.js', server: 'vps-us-1' },
];

const content = {
  en: {
    label: 'Partners',
    title: 'Run Pushify for your clients',
    intro: 'Pushify is open source. Agencies and hosting providers can run it for every client, on their own servers.',
    boardTitle: 'All clients',
    boardLive: 'Live',
    boardCols: ['App', 'Stack', 'Server', 'State'],
    boardCaption: 'Every client app, on servers you choose, in one dashboard. Example data.',
    offersEyebrow: 'Ways to work with us',
    offersTitle: 'Three ways to put Pushify in front of clients',
    offersLead: 'Pick by how much of the platform you want to operate yourselves.',
    offers: [
      {
        icon: Building2,
        title: 'Agency setup',
        desc: 'We install Pushify on your servers, migrate client apps and train your team.',
        cta: 'Request a setup quote',
        subject: 'Agency setup',
      },
      {
        icon: Paintbrush,
        title: 'White-label',
        desc: 'Your brand, domain and customer accounts on a licensed deployment, with priority support.',
        cta: 'Ask about white-label',
        subject: 'White-label licensing',
      },
      {
        icon: Users,
        title: 'Teams on managed cloud',
        desc: 'Use pushify.dev with per-project roles and volume pricing for larger fleets.',
        cta: 'Talk about team pricing',
        subject: 'Team / volume pricing',
      },
    ],
    whyEyebrow: 'For client work',
    whyTitle: 'What each client app gets',
    why: [
      { title: 'Your servers', text: 'Any VPS provider, any region, at costs you control.' },
      { title: 'Push to deploy', text: 'Git push, build, live on HTTPS with a zero-downtime switch.' },
      { title: 'Databases', text: 'PostgreSQL, MySQL, Redis and MongoDB with scheduled backups.' },
      { title: 'One-click apps', text: 'WordPress, Ghost, n8n, Uptime Kuma and more from the marketplace.' },
      { title: 'MIT licensed', text: 'Public code. If we disappeared, your platform keeps running.' },
      { title: 'English and Turkish', text: 'The dashboard ships in both languages.' },
    ],
    howEyebrow: 'Process',
    howTitle: 'How it starts',
    how: [
      { title: 'A short call', desc: 'Tell us about your clients and servers. We will say if it is not a fit.' },
      { title: 'Pilot install', desc: 'A working platform with one or two real client apps on your servers.' },
      { title: 'Rollout and support', desc: 'The rest of the migration, team training and an agreed support line.' },
    ],
    ctaEyebrow: 'Contact',
    ctaTitle: 'Tell us what you run',
    ctaDesc: 'A few sentences about your agency or hosting business is enough to start.',
    ctaButton: 'Email us',
    ctaAlt: 'Read the self-host docs',
  },
  tr: {
    label: 'İş ortaklığı',
    title: "Pushify'ı müşterileriniz için çalıştırın",
    intro: 'Pushify açık kaynak. Ajanslar ve hosting sağlayıcıları onu her müşterisi için kendi sunucularında çalıştırabilir.',
    boardTitle: 'Tüm müşteriler',
    boardLive: 'Yayında',
    boardCols: ['Uygulama', 'Teknoloji', 'Sunucu', 'Durum'],
    boardCaption: 'Seçtiğiniz sunuculardaki tüm müşteri uygulamaları, tek panelde. Örnek veri.',
    offersEyebrow: 'Birlikte çalışma',
    offersTitle: "Pushify'ı müşterilerinize sunmanın üç yolu",
    offersLead: 'Platformun ne kadarını kendiniz işletmek istediğinize göre seçin.',
    offers: [
      {
        icon: Building2,
        title: 'Ajans kurulumu',
        desc: 'Pushify’ı sunucularınıza kuruyor, müşteri uygulamalarını taşıyor ve ekibinizi eğitiyoruz.',
        cta: 'Kurulum teklifi isteyin',
        subject: 'Ajans kurulumu',
      },
      {
        icon: Paintbrush,
        title: 'White-label',
        desc: 'Sizin markanız, alan adınız ve müşteri hesaplarınızla lisanslı kurulum ve öncelikli destek.',
        cta: 'White-label için yazın',
        subject: 'White-label lisans',
      },
      {
        icon: Users,
        title: 'Yönetilen bulutta ekipler',
        desc: 'pushify.dev’i proje bazlı yetkilerle ve büyük filolar için hacim fiyatıyla kullanın.',
        cta: 'Ekip fiyatını konuşalım',
        subject: 'Ekip / hacim fiyatlandırması',
      },
    ],
    whyEyebrow: 'Müşteri işleri için',
    whyTitle: 'Her müşteri uygulamasının aldıkları',
    why: [
      { title: 'Sizin sunucularınız', text: 'İstediğiniz VPS sağlayıcısı ve bölge, kontrolünüzdeki maliyet.' },
      { title: 'Push ile deploy', text: 'Git push, build ve kesintisiz geçişle HTTPS üzerinden yayında.' },
      { title: 'Veritabanları', text: 'Zamanlanmış yedeklerle PostgreSQL, MySQL, Redis ve MongoDB.' },
      { title: 'Tek tıkla uygulamalar', text: 'Marketplace’ten WordPress, Ghost, n8n, Uptime Kuma ve dahası.' },
      { title: 'MIT lisanslı', text: 'Kod açık. Biz ortadan kalksak da platformunuz çalışmaya devam eder.' },
      { title: 'Türkçe ve İngilizce', text: 'Panel iki dilde birden gelir.' },
    ],
    howEyebrow: 'Süreç',
    howTitle: 'Nasıl başlıyor',
    how: [
      { title: 'Kısa bir görüşme', desc: 'Müşterilerinizi ve sunucularınızı anlatın. Uygun değilse açıkça söyleriz.' },
      { title: 'Pilot kurulum', desc: 'Sunucularınızda bir iki gerçek müşteri uygulamasıyla çalışan bir platform.' },
      { title: 'Yaygınlaştırma ve destek', desc: 'Kalan taşımalar, ekip eğitimi ve üzerinde anlaşılan bir destek hattı.' },
    ],
    ctaEyebrow: 'İletişim',
    ctaTitle: 'Ne çalıştırdığınızı anlatın',
    ctaDesc: 'Ajansınızı ya da hosting işinizi birkaç cümleyle anlatmanız başlamak için yeterli.',
    ctaButton: 'E-posta gönderin',
    ctaAlt: 'Self-host dokümanlarını okuyun',
  },
} as const;

function ClientBoard({ c }: { c: (typeof content)['en'] | (typeof content)['tr'] }) {
  return (
    <figure className="mx-auto max-w-3xl">
      <div className="hp-card" style={{ width: '100%' }}>
        <div className="hp-card-head">
          <span>{c.boardTitle}</span>
          <span className="hp-live">
            <span className="hp-dot" aria-hidden="true" />
            {BOARD.length}/{BOARD.length} {c.boardLive}
          </span>
        </div>
        <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--hp-muted)' }} className="text-[0.625rem] uppercase tracking-[0.1em]">
              {c.boardCols.map((col, i) => (
                <th
                  key={col}
                  scope="col"
                  className={`font-normal px-3 sm:px-4 pt-3 pb-2 ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'text-right' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BOARD.map((row) => (
              <tr key={row.app} className="border-t" style={{ borderColor: 'var(--hp-line)' }}>
                <td className="px-3 sm:px-4 py-2.5" style={{ color: 'var(--hp-ink)' }}>
                  {row.app}
                </td>
                <td className="px-3 sm:px-4 py-2.5 hidden sm:table-cell" style={{ color: 'var(--hp-body)' }}>
                  {row.kind}
                </td>
                <td className="px-3 sm:px-4 py-2.5" style={{ color: 'var(--hp-body)' }}>
                  {row.server}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-right hp-live whitespace-nowrap">✓ {c.boardLive.toLowerCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="hp-mono text-center text-[12px] mt-4" style={{ color: 'var(--hp-muted)' }}>
        {c.boardCaption}
      </figcaption>
    </figure>
  );
}

export default function PartnersPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      <section className="pb-20 md:pb-24">
        <div className="lp-container">
          <ClientBoard c={c} />
        </div>
      </section>

      <MSection eyebrow={c.offersEyebrow} title={c.offersTitle} lead={c.offersLead} split>
        <RuleGrid cols={3}>
          {c.offers.map((offer) => (
            <RuleCell key={offer.title} icon={offer.icon} title={offer.title} href={mailto(offer.subject)} linkLabel={offer.cta}>
              {offer.desc}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>

      <MSection eyebrow={c.whyEyebrow} title={c.whyTitle}>
        <RuleGrid cols={3}>
          {c.why.map((item) => (
            <RuleCell key={item.title} title={item.title}>
              {item.text}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>

      <MSection eyebrow={c.howEyebrow} title={c.howTitle}>
        <Steps items={c.how.map((s) => ({ title: s.title, body: s.desc }))} />
      </MSection>

      <MSection eyebrow={c.ctaEyebrow} title={c.ctaTitle} lead={c.ctaDesc} align="center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={mailto('')} className="lp-cta w-full sm:w-auto">
            {c.ctaButton}
          </a>
          <a href={SELF_HOST_DOCS} target="_blank" rel="noopener noreferrer" className="lp-cta-ghost w-full sm:w-auto">
            {c.ctaAlt}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
        <p className="hp-mono text-center text-[12px] mt-8" style={{ color: 'var(--hp-muted)' }}>
          {CONTACT}
        </p>
      </MSection>
    </MarketingShell>
  );
}
