'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { useTranslation } from '@/hooks';
import { Mail, MapPin, Globe, Github, Heart } from 'lucide-react';

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
    locationValue: 'Türkiye',
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
    locationValue: 'Türkiye',
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

export default function AboutPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{c.title}</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">{c.intro}</p>
        </div>

        <section className="mb-12 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-8">
          <h2 className="text-2xl font-bold mb-4">{c.missionTitle}</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">{c.mission}</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{c.whatWeDoTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {c.items.map((item) => (
              <div key={item.title} className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-5">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-8">
          <h2 className="text-2xl font-bold mb-6">{c.companyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">{c.web}</p>
                <a href="https://pushify.dev" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]">
                  pushify.dev
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">{c.email}</p>
                <a href="mailto:support@pushify.dev" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]">
                  support@pushify.dev
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Github className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">GitHub</p>
                <a href="https://github.com/pushifydev" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]">
                  github.com/pushifydev
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">{c.location}</p>
                <p className="text-sm text-[var(--text-secondary)]">{c.locationValue}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{c.valuesTitle}</h2>
          <div className="space-y-4">
            {c.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-5">
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center mt-16 pt-8 border-t border-[var(--glass-divider)]">
          <p className="text-sm text-[var(--text-muted)] inline-flex items-center gap-2">
            {locale === 'tr' ? (
              <>
                {c.builtWith} {c.builtFor}
                <Heart className="w-4 h-4 text-[var(--accent-red)] fill-current" />
                ile yapıldı
              </>
            ) : (
              <>
                {c.builtWith}
                <Heart className="w-4 h-4 text-[var(--accent-red)] fill-current" />
                {c.builtFor}
              </>
            )}
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
