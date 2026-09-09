'use client';

import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';
import {
  Building2,
  Paintbrush,
  Users,
  Server,
  ShieldCheck,
  Database,
  Package,
  Languages,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const CONTACT = 'support@pushify.dev';

const content = {
  en: {
    label: 'Partners',
    title: 'Run Pushify for your clients',
    intro:
      'Agencies and hosting providers use Pushify to give every client a modern deployment platform — on infrastructure you control. Open source at the core, with commercial setup, support, and white-label options on top.',
    offersTitle: 'Ways to work with us',
    offers: [
      {
        icon: Building2,
        title: 'Agency setup',
        desc: 'We install a self-hosted Pushify on your servers, migrate your client sites and apps onto it, and train your team. You manage every client from one dashboard instead of a pile of cPanels and SSH sessions.',
        cta: 'Request a setup quote',
        subject: 'Agency setup',
      },
      {
        icon: Paintbrush,
        title: 'White-label',
        desc: 'Your brand, your domain, your customer accounts — powered by Pushify underneath. A licensed deployment with your branding, priority support, and a direct line to us for updates and fixes.',
        cta: 'Ask about white-label',
        subject: 'White-label licensing',
      },
      {
        icon: Users,
        title: 'Teams on managed cloud',
        desc: 'Skip the ops entirely: use pushify.dev with your team, with role-based access per project and volume pricing for larger fleets. Start on a standard plan today and talk to us when you outgrow it.',
        cta: 'Talk about team pricing',
        subject: 'Team / volume pricing',
      },
    ],
    whyTitle: 'Why agencies pick Pushify',
    why: [
      { icon: Server, text: 'Client apps run on your servers — any VPS provider, any region, flat costs you control.' },
      { icon: GitBranch, text: 'Git push → build → live with HTTPS and zero-downtime cutover. No Dockerfiles or nginx configs per project.' },
      { icon: Database, text: 'PostgreSQL, MySQL, Redis and MongoDB with scheduled backups and a web studio.' },
      { icon: Package, text: 'One-click marketplace: WordPress, Ghost, n8n, Grafana and 20+ more for client work.' },
      { icon: ShieldCheck, text: 'MIT-licensed and open source — no vendor risk. If we vanish, your platform keeps running.' },
      { icon: Languages, text: 'English and Turkish interface out of the box.' },
    ],
    howTitle: 'How it starts',
    how: [
      { step: '1', title: 'A short call', desc: 'Tell us about your clients, stack, and servers. We tell you honestly whether Pushify fits.' },
      { step: '2', title: 'Pilot install', desc: 'We set up a working platform with one or two real client apps on your infrastructure.' },
      { step: '3', title: 'Rollout & support', desc: 'Migration of the rest, team training, and an agreed support line for whatever comes up.' },
    ],
    ctaTitle: 'Tell us what you run',
    ctaDesc: 'A few sentences about your agency or hosting business is enough — we reply within one business day.',
    ctaButton: 'Email us',
    ctaAlt: 'or explore the self-host docs first',
  },
  tr: {
    label: 'İş Ortaklığı',
    title: "Pushify'ı müşterileriniz için çalıştırın",
    intro:
      'Ajanslar ve hosting sağlayıcıları, her müşterisine modern bir deploy platformu sunmak için Pushify kullanıyor — kontrolü sizde olan altyapıda. Çekirdek açık kaynak; üzerine ticari kurulum, destek ve white-label seçenekleri.',
    offersTitle: 'Birlikte çalışma modelleri',
    offers: [
      {
        icon: Building2,
        title: 'Ajans kurulumu',
        desc: 'Self-host Pushify’ı sunucularınıza kuruyor, müşteri site ve uygulamalarınızı taşıyor, ekibinizi eğitiyoruz. Bir yığın cPanel ve SSH oturumu yerine tüm müşterileri tek panelden yönetirsiniz.',
        cta: 'Kurulum teklifi isteyin',
        subject: 'Ajans kurulumu',
      },
      {
        icon: Paintbrush,
        title: 'White-label',
        desc: 'Sizin markanız, sizin domaininiz, sizin müşteri hesaplarınız — altında Pushify. Markanızla lisanslı kurulum, öncelikli destek ve güncellemeler için bizimle doğrudan hat.',
        cta: 'White-label için yazın',
        subject: 'White-label lisans',
      },
      {
        icon: Users,
        title: 'Yönetilen bulutta ekipler',
        desc: 'Operasyonu tamamen atlayın: pushify.dev’i ekibinizle kullanın — proje bazlı yetkilendirme ve büyük filolar için hacim fiyatlandırması. Bugün standart planla başlayın, büyüyünce konuşalım.',
        cta: 'Ekip fiyatı konuşalım',
        subject: 'Ekip / hacim fiyatlandırması',
      },
    ],
    whyTitle: 'Ajanslar neden Pushify seçiyor',
    why: [
      { icon: Server, text: 'Müşteri uygulamaları sizin sunucularınızda — istediğiniz VPS sağlayıcısı, sabit ve kontrol edilebilir maliyet.' },
      { icon: GitBranch, text: 'Git push → build → HTTPS ile canlı, kesintisiz geçiş. Proje başına Dockerfile veya nginx ayarı yok.' },
      { icon: Database, text: 'PostgreSQL, MySQL, Redis ve MongoDB — zamanlanmış yedekler ve web studio ile.' },
      { icon: Package, text: 'Tek tık marketplace: WordPress, Ghost, n8n, Grafana ve 20+ uygulama.' },
      { icon: ShieldCheck, text: 'MIT lisanslı, açık kaynak — tedarikçi riski yok. Biz yok olsak bile platformunuz çalışmaya devam eder.' },
      { icon: Languages, text: 'Arayüz Türkçe ve İngilizce.' },
    ],
    howTitle: 'Nasıl başlıyor',
    how: [
      { step: '1', title: 'Kısa bir görüşme', desc: 'Müşterilerinizi, stack’inizi ve sunucularınızı anlatın. Pushify uygun değilse bunu da dürüstçe söyleriz.' },
      { step: '2', title: 'Pilot kurulum', desc: 'Altyapınızda, bir-iki gerçek müşteri uygulamasıyla çalışan bir platform kuruyoruz.' },
      { step: '3', title: 'Yaygınlaştırma & destek', desc: 'Kalan taşımalar, ekip eğitimi ve üzerinde anlaştığımız bir destek hattı.' },
    ],
    ctaTitle: 'Ne çalıştırdığınızı anlatın',
    ctaDesc: 'Ajansınızı veya hosting işinizi birkaç cümleyle anlatmanız yeterli — bir iş günü içinde dönüş yaparız.',
    ctaButton: 'E-posta gönderin',
    ctaAlt: 'veya önce self-host dokümanlarına bakın',
  },
} as const;

export default function PartnersPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];

  return (
    <MarketingShell>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      <div className="lp-container max-w-5xl pb-24 space-y-20">
        {/* Offer cards */}
        <Reveal>
          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-6 text-center" style={{ color: 'var(--lp-ink)' }}>
              {c.offersTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {c.offers.map((offer) => (
                <div
                  key={offer.title}
                  className="rounded-2xl p-6 flex flex-col border"
                  style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}
                >
                  <offer.icon className="w-5 h-5 mb-4" style={{ color: 'var(--lp-ink)' }} />
                  <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--lp-ink)' }}>
                    {offer.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--lp-body)' }}>
                    {offer.desc}
                  </p>
                  <a
                    href={`mailto:${CONTACT}?subject=${encodeURIComponent(`[Partners] ${offer.subject}`)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4"
                    style={{ color: 'var(--lp-ink)' }}
                  >
                    {offer.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Why */}
        <Reveal>
          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-6 text-center" style={{ color: 'var(--lp-ink)' }}>
              {c.whyTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto">
              {c.why.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--lp-muted)' }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* How it starts */}
        <Reveal>
          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-6 text-center" style={{ color: 'var(--lp-ink)' }}>
              {c.howTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {c.how.map((item) => (
                <div key={item.step} className="text-center px-4">
                  <div
                    className="w-9 h-9 rounded-full mx-auto mb-3 flex items-center justify-center text-sm font-semibold border"
                    style={{ borderColor: 'var(--lp-border)', color: 'var(--lp-ink)' }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--lp-ink)' }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <section
            className="rounded-2xl border text-center px-6 py-12"
            style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}
          >
            <h2 className="text-2xl font-semibold tracking-tight mb-3" style={{ color: 'var(--lp-ink)' }}>
              {c.ctaTitle}
            </h2>
            <p className="text-[15px] mb-6 max-w-xl mx-auto" style={{ color: 'var(--lp-body)' }}>
              {c.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:${CONTACT}?subject=${encodeURIComponent('[Partners] ')}`}
                className="lp-cta text-sm"
              >
                {c.ctaButton}
              </a>
              <a
                href="https://github.com/pushifydev/pushify_backend/blob/master/docs/SELF_HOSTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline underline-offset-4"
                style={{ color: 'var(--lp-muted)' }}
              >
                {c.ctaAlt}
              </a>
            </div>
            <p className="text-xs mt-6 tabular-nums" style={{ color: 'var(--lp-muted)' }}>
              {CONTACT}
            </p>
          </section>
        </Reveal>
      </div>
    </MarketingShell>
  );
}
