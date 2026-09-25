'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell, MarketingPageHero, SiteBuilderMockup } from '@/components/landing';
import { MSection, Steps, Faq } from '@/components/landing/MarketingKit';

/**
 * /sites. The old "What you get" grid repeated the four steps in longer words (designs, pages,
 * publish), so it is gone; the one detail only it had — a custom domain or a plain port — is in the
 * FAQ. Copy is inline so it can stay short without touching the shared locale files.
 */
const copy = {
  en: {
    label: 'Site builder',
    title: 'A no-code website builder, hosted on your own server.',
    lead: 'Pick a design, edit it on the page, publish to your own server. No code.',
    ctaPrimary: 'Start building free',
    ctaSecondary: 'See pricing',
    howEyebrow: 'How it works',
    howTitle: 'From template to live site in four steps.',
    steps: [
      { title: 'Pick a design', body: 'Start from a responsive template or a blank page. Switch designs anytime.' },
      { title: 'Edit on the page', body: 'Click any text or block to edit it. Drag sections to reorder.' },
      { title: 'Add your pages', body: 'About, Pricing, Contact: they all share one navigation bar.' },
      { title: 'Publish', body: 'One click, to your own server, on a domain or a plain port.' },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Questions, answered.',
    faqs: [
      { q: 'Do I need to know how to code?', a: 'No. Pick a design, edit text and blocks on the page, and publish. No HTML or CSS.' },
      {
        q: 'Where is my site published?',
        a: 'To a server you own: any VPS connected over SSH, or, on a paid plan, a Hetzner server opened from the dashboard.',
      },
      {
        q: 'Do I need a domain?',
        a: 'No. Use a custom domain with automatic HTTPS, or serve the site on a plain port. You can add a domain later.',
      },
      { q: 'Can I build more than one page?', a: 'Yes, as many as you need. The builder keeps the shared navigation in sync.' },
    ],
    ctaEyebrow: 'Get started',
    ctaTitle: 'Build your site on your own server.',
    ctaBody: 'Free to start. No code, no third-party hosting.',
    allFeatures: 'All features',
  },
  tr: {
    label: 'Site kurucu',
    title: 'Kendi sunucunuzda barınan, kodsuz bir web sitesi kurucusu.',
    lead: 'Bir tasarım seçin, sayfa üzerinde düzenleyin, kendi sunucunuza yayınlayın. Kod yok.',
    ctaPrimary: 'Ücretsiz oluşturmaya başlayın',
    ctaSecondary: 'Fiyatları görün',
    howEyebrow: 'Nasıl çalışır',
    howTitle: 'Şablondan canlı siteye dört adımda.',
    steps: [
      { title: 'Bir tasarım seçin', body: 'Responsive bir şablonla ya da boş sayfayla başlayın. Tasarımı istediğiniz an değiştirin.' },
      { title: 'Sayfa üzerinde düzenleyin', body: 'Herhangi bir metne ya da bloğa tıklayıp düzenleyin. Bölümleri sürükleyip sıralayın.' },
      { title: 'Sayfalarınızı ekleyin', body: 'Hakkında, Fiyatlar, İletişim: hepsi aynı menüyü paylaşır.' },
      { title: 'Yayınlayın', body: 'Tek tıkla kendi sunucunuza; bir alan adında ya da sade bir portta.' },
    ],
    faqEyebrow: 'SSS',
    faqTitle: 'Sorular ve yanıtlar.',
    faqs: [
      {
        q: 'Kod bilmem gerekiyor mu?',
        a: 'Hayır. Bir tasarım seçin, metinleri ve blokları sayfa üzerinde düzenleyin ve yayınlayın. HTML ya da CSS yok.',
      },
      {
        q: 'Sitem nereye yayınlanıyor?',
        a: 'Sahip olduğunuz bir sunucuya: SSH ile bağladığınız herhangi bir VPS’e ya da ücretli planlarda panelden açtığınız bir Hetzner sunucusuna.',
      },
      {
        q: 'Alan adına ihtiyacım var mı?',
        a: 'Hayır. Otomatik HTTPS ile kendi alan adınızı kullanın ya da siteyi sade bir portta yayınlayın. Alan adını sonra da ekleyebilirsiniz.',
      },
      {
        q: 'Birden fazla sayfa kurabilir miyim?',
        a: 'Evet, ihtiyacınız kadar. Ortak menüyü kurucu senkron tutar.',
      },
    ],
    ctaEyebrow: 'Başlayın',
    ctaTitle: 'Sitenizi kendi sunucunuzda kurun.',
    ctaBody: 'Ücretsiz başlayın. Kod yok, üçüncü taraf barındırma yok.',
    allFeatures: 'Tüm özellikler',
  },
};

export default function SitesPage() {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.lead} />

      <div className="lp-container -mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/register" className="lp-cta group">
          {c.ctaPrimary}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </Link>
        <Link href="/pricing" className="lp-cta-ghost">
          {c.ctaSecondary}
          <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {/* The one object on this page: the editor itself. */}
      <div className="lp-container max-w-4xl pt-14 pb-20 md:pb-28">
        <SiteBuilderMockup />
      </div>

      <MSection id="how-it-works" eyebrow={c.howEyebrow} title={c.howTitle}>
        <Steps items={c.steps} />
      </MSection>

      <MSection id="faq" eyebrow={c.faqEyebrow} title={c.faqTitle} align="center">
        <Faq items={c.faqs} />
      </MSection>

      <MSection eyebrow={c.ctaEyebrow} title={c.ctaTitle} lead={c.ctaBody} align="center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="lp-cta group">
            {c.ctaPrimary}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
          <Link href="/features" className="lp-cta-ghost">
            {c.allFeatures}
          </Link>
        </div>
      </MSection>
    </MarketingShell>
  );
}
