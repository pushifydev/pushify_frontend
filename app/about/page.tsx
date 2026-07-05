'use client';

import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';
import { Mail, MapPin, Globe, Github, Heart, Rocket, Server, Database, Package, Code2, ShieldCheck, Eye } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const content = {
  en: {
    title: 'About Us',
    intro:
      'Pushify is an open-source cloud deployment platform designed to help developers ship their applications to their own servers easily, quickly, and securely.',
    missionTitle: 'Our Mission',
    mission:
      'To let developers focus on building their products instead of managing infrastructure. We eliminate DevOps complexity with one-click deploys, automatic SSL, team collaboration, and advanced monitoring.',
    whatWeDoTitle: 'What We Do',
    items: [
      { title: 'One-Click Deploy', desc: 'Connect your GitHub repo, framework auto-detected, live in minutes.' },
      { title: 'Server Management', desc: 'Provision VPS via Hetzner Cloud or bring your own server.' },
      { title: 'Database Management', desc: 'PostgreSQL, MySQL, Redis, MongoDB with one-click setup.' },
      { title: 'Marketplace', desc: '24+ ready-to-deploy apps (WordPress, Supabase, Appwrite, Cal.com etc.).' },
    ],
    companyTitle: 'Company Information',
    web: 'Web',
    email: 'Email',
    location: 'Location',
    locationValue: 'Remote-first · Global',
    valuesTitle: 'Our Values',
    values: [
      {
        title: 'Open Source',
        desc: 'Our code is MIT-licensed and public on GitHub. Run it on your own server for free, contribute, and shape the future.',
      },
      {
        title: 'Data Ownership',
        desc: 'Your data is yours. No vendor lock-in. Self-host on your servers and move whenever you want.',
      },
      {
        title: 'Transparency',
        desc: 'All pricing and features are publicly published. No hidden fees, no surprise changes.',
      },
    ],
    builtFor: 'for developers',
    builtWith: 'Built with',
  },
  tr: {
    title: 'Hakkımızda',
    intro:
      'Pushify, geliştiricilerin uygulamalarını kendi sunucularına kolayca, hızlı ve güvenli bir şekilde yayınlayabilmesi için tasarlanmış açık kaynaklı bir bulut yayınlama platformudur.',
    missionTitle: 'Misyonumuz',
    mission:
      'Geliştiricilerin altyapı yönetiminden ziyade ürünlerini geliştirmeye odaklanmasını sağlamak. Tek tıkla deploy, otomatik SSL, ekip iş birliği ve gelişmiş izleme araçları ile DevOps karmaşıklığını ortadan kaldırıyoruz.',
    whatWeDoTitle: 'Ne Yapıyoruz?',
    items: [
      { title: 'Tek Tıkla Yayınlama', desc: 'GitHub reponuzu bağlayın, framework otomatik algılansın, dakikalar içinde canlı olun.' },
      { title: 'Sunucu Yönetimi', desc: 'Hetzner Cloud üzerinden tek tıkla VPS sağlayın veya kendi sunucularınızı bağlayın.' },
      { title: 'Veritabanı Yönetimi', desc: 'PostgreSQL, MySQL, Redis, MongoDB tek tıkla kurulum ve yönetim.' },
      { title: 'Marketplace', desc: '24+ hazır uygulama (WordPress, Supabase, Appwrite, Cal.com vb.) tek tıkla yayında.' },
    ],
    companyTitle: 'Şirket Bilgileri',
    web: 'Web',
    email: 'E-posta',
    location: 'Konum',
    locationValue: 'Uzaktan · Küresel',
    valuesTitle: 'Değerlerimiz',
    values: [
      {
        title: 'Açık Kaynak',
        desc: 'Kodumuz MIT lisansı ile GitHub\'da herkese açık. Kendi sunucunuzda ücretsiz olarak çalıştırabilir, katkıda bulunabilirsiniz.',
      },
      {
        title: 'Veri Sahipliği',
        desc: 'Veriniz sizin. Vendor lock-in yok. Kendi sunucunuzda barındırın, istediğiniz zaman taşıyın.',
      },
      {
        title: 'Şeffaflık',
        desc: 'Tüm fiyatlandırmamız ve özelliklerimiz açık şekilde yayınlanır. Gizli ücret veya sürpriz değişiklik yok.',
      },
    ],
    builtFor: 'için',
    builtWith: 'Geliştiriciler',
  },
};

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: 'var(--lp-ink)' }}>
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--lp-ink)' }}>
          {label}
        </p>
        <div className="text-sm" style={{ color: 'var(--lp-muted)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];

  return (
    <MarketingShell>
      <MarketingPageHero label={locale === 'tr' ? 'Hakkımızda' : 'About'} title={c.title} description={c.intro} />

      <div className="lp-container max-w-4xl pb-20 md:pb-24 space-y-8">
        <section className="lp-card p-8">
          <h2 className="text-xl font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.missionTitle}</h2>
          <p className="lp-body">{c.mission}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-6" style={{ color: 'var(--lp-ink)' }}>{c.whatWeDoTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {c.items.map((item, i) => {
              const Icon = [Rocket, Server, Database, Package][i] ?? Rocket;
              return (
                <Reveal key={item.title} delay={i * 80} className="h-full">
                  <div className="lp-card p-5 h-full">
                    <span
                      className="inline-flex w-9 h-9 items-center justify-center rounded-lg mb-3.5"
                      style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--lp-ink)' }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="lp-card p-8">
          <h2 className="text-xl font-semibold tracking-tight mb-6" style={{ color: 'var(--lp-ink)' }}>{c.companyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow icon={<Globe className="w-5 h-5" />} label={c.web}>
              <a href="https://pushify.dev" className="hover:underline" style={{ color: 'var(--lp-ink)' }}>
                pushify.dev
              </a>
            </InfoRow>
            <InfoRow icon={<Mail className="w-5 h-5" />} label={c.email}>
              <a href="mailto:support@pushify.dev" className="hover:underline" style={{ color: 'var(--lp-ink)' }}>
                support@pushify.dev
              </a>
            </InfoRow>
            <InfoRow icon={<Github className="w-5 h-5" />} label="GitHub">
              <a
                href="https://github.com/pushifydev"
                className="hover:underline"
                style={{ color: 'var(--lp-ink)' }}
              >
                github.com/pushifydev
              </a>
            </InfoRow>
            <InfoRow icon={<MapPin className="w-5 h-5" />} label={c.location}>
              {c.locationValue}
            </InfoRow>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-6" style={{ color: 'var(--lp-ink)' }}>{c.valuesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.values.map((v, i) => {
              const Icon = [Code2, ShieldCheck, Eye][i] ?? Code2;
              return (
                <Reveal key={v.title} delay={i * 90} className="h-full">
                  <div className="lp-card p-5 h-full">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'var(--lp-btn)', color: 'var(--lp-btn-fg)' }}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <h3 className="font-semibold" style={{ color: 'var(--lp-ink)' }}>
                        {v.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                      {v.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <div className="text-center pt-8 border-t" style={{ borderColor: 'var(--lp-border)' }}>
          <p className="text-sm inline-flex items-center gap-2" style={{ color: 'var(--lp-muted)' }}>
            {locale === 'tr' ? (
              <>
                {c.builtWith} {c.builtFor}
                <Heart className="w-4 h-4 fill-current" style={{ color: 'var(--lp-ink)' }} />
                ile yapıldı
              </>
            ) : (
              <>
                {c.builtWith}
                <Heart className="w-4 h-4 fill-current" style={{ color: 'var(--lp-ink)' }} />
                {c.builtFor}
              </>
            )}
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
