'use client';

import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Mail, MapPin, Globe, Github, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Hakkımızda
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Pushify, geliştiricilerin uygulamalarını kendi sunucularına
            kolayca, hızlı ve güvenli bir şekilde yayınlayabilmesi için
            tasarlanmış açık kaynaklı bir bulut yayınlama platformudur.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-8">
          <h2 className="text-2xl font-bold mb-4">Misyonumuz</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Geliştiricilerin altyapı yönetiminden ziyade ürünlerini geliştirmeye
            odaklanmasını sağlamak. Tek tıkla deploy, otomatik SSL, ekip iş birliği
            ve gelişmiş izleme araçları ile DevOps karmaşıklığını ortadan kaldırıyoruz.
          </p>
        </section>

        {/* What we do */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Ne Yapıyoruz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Tek Tıkla Yayınlama',
                desc: 'GitHub reponuzu bağlayın, framework otomatik algılansın, dakikalar içinde canlı olun.',
              },
              {
                title: 'Sunucu Yönetimi',
                desc: 'Hetzner Cloud üzerinden tek tıkla VPS sağlayın veya kendi sunucularınızı bağlayın.',
              },
              {
                title: 'Veritabanı Yönetimi',
                desc: 'PostgreSQL, MySQL, Redis, MongoDB tek tıkla kurulum ve yönetim.',
              },
              {
                title: 'Marketplace',
                desc: '24+ hazır uygulama (WordPress, Supabase, Appwrite, Cal.com vb.) tek tıkla yayında.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-5"
              >
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Company info */}
        <section className="mb-12 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-8">
          <h2 className="text-2xl font-bold mb-6">Şirket Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">Web</p>
                <a
                  href="https://pushify.dev"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                >
                  pushify.dev
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">E-posta</p>
                <a
                  href="mailto:hello@pushify.dev"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                >
                  hello@pushify.dev
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Github className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">GitHub</p>
                <a
                  href="https://github.com/pushifydev"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                >
                  github.com/pushifydev
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--accent-cyan)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold mb-1">Konum</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Türkiye
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Değerlerimiz</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-5">
              <h3 className="font-semibold mb-2">Açık Kaynak</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Kodumuz MIT lisansı ile GitHub&apos;da herkese açık. Kendi sunucunuzda
                ücretsiz olarak çalıştırabilir, katkıda bulunabilirsiniz.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-5">
              <h3 className="font-semibold mb-2">Veri Sahipliği</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Veriniz sizin. Vendor lock-in yok. Kendi sunucunuzda barındırın,
                istediğiniz zaman taşıyın.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--bg-secondary)] p-5">
              <h3 className="font-semibold mb-2">Şeffaflık</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Tüm fiyatlandırmamız ve özelliklerimiz açık şekilde yayınlanır.
                Gizli ücret veya sürpriz değişiklik yok.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center mt-16 pt-8 border-t border-[var(--glass-divider)]">
          <p className="text-sm text-[var(--text-muted)] inline-flex items-center gap-2">
            Geliştiriciler için
            <Heart className="w-4 h-4 text-[var(--accent-red)] fill-current" />
            ile yapıldı
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
