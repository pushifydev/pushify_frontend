'use client';

import { useTranslation } from '@/hooks';
import { ComparisonPageView, type ComparisonRow } from '@/components/landing';

/**
 * /vs/dokploy. Every Dokploy fact below was read on 2026-09-29 from the pages in `sources`; the
 * Pushify side is checked against the code (plans.ts, remote-deployment.ts blue-green, app-sleep
 * worker, sso.service). Copy is inline, like /sites, so it stays next to its sources.
 */
const sources = [
  { label: 'Pricing', href: 'https://dokploy.com/pricing' },
  { label: 'Cloud vs self-hosted', href: 'https://docs.dokploy.com/docs/core/differences' },
  { label: 'Cloud', href: 'https://docs.dokploy.com/docs/core/cloud' },
  { label: 'License', href: 'https://github.com/Dokploy/dokploy/blob/canary/LICENSE.MD' },
  { label: 'Zero downtime', href: 'https://docs.dokploy.com/docs/core/applications/zero-downtime' },
  { label: 'Cluster', href: 'https://docs.dokploy.com/docs/core/cluster' },
  { label: 'Scale to zero (#2154)', href: 'https://github.com/Dokploy/dokploy/issues/2154' },
  { label: 'Templates', href: 'https://github.com/Dokploy/templates' },
];

type Copy = {
  subtitle: string;
  tldr: string;
  rows: string[];
  pushify: string[];
  dokploy: string[];
  tableNote: string;
  diffs: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
};

const copy: Record<'en' | 'tr', Copy> = {
  en: {
    subtitle: 'Two open-source ways to deploy apps on servers you own: where each one fits.',
    tldr:
      'Both deploy Docker apps to servers you connect over SSH, and both are free to self-host. Dokploy is older and far larger: about 37,500 GitHub stars, 500+ templates, Docker Swarm clusters. Its hosted control plane costs $4.50 per server a month after a 7-day trial. Pushify’s hosted control plane has a free plan, it can rent Hetzner servers from the dashboard, and it scales apps on CPU and puts idle apps to sleep, which Dokploy does not do today.',
    rows: [
      'Open source, free to self-host',
      'Hosted control plane with a free plan',
      'Deploy to your own servers over SSH',
      'Servers from the dashboard, no provider account',
      'Docker Compose',
      'Databases with scheduled backups',
      'Preview deployments for pull requests',
      'Multi-node clusters (Docker Swarm)',
      'CPU-based autoscaling',
      'Idle apps sleep and wake on request',
      'Zero-downtime deploys without extra setup',
      'Single sign-on (OIDC) on every plan',
      '500+ one-click templates',
      'Large, established community',
    ],
    pushify: [
      'You want a hosted control plane you can start on for free.',
      'You want a server from the dashboard, billed by the hour, without a Hetzner account.',
      'You want apps to add containers under CPU load, or sleep when nobody uses them.',
      'You want zero-downtime deploys and SSO without extra setup or an enterprise plan.',
    ],
    dokploy: [
      'You want the larger, more proven project, with a big community.',
      'You need a multi-server Docker Swarm cluster.',
      'You want 500+ templates, more notification channels or MariaDB.',
    ],
    tableNote:
      'Last checked September 29, 2026. Dokploy is Apache-2.0 except its enterprise features (SSO, custom roles, audit logs, white-labeling), which are source-available under the DSAL since January 2026. On Pushify, managed servers and preview deployments need Hobby or higher, autoscaling Pro or higher. Spot something out of date? Email support@pushify.dev.',
    diffs: [
      {
        title: 'Hosted control plane',
        body: 'Pushify’s has a free plan. Dokploy Cloud is $4.50 per server a month, after a 7-day trial, and you still bring the servers.',
      },
      {
        title: 'Scaling',
        body: 'Pushify adds and removes containers on CPU and can sleep idle apps. Dokploy sets replicas by hand; scale to zero is an open request.',
      },
      {
        title: 'Maturity',
        body: 'Dokploy has about 37,500 stars and 370+ contributors, Swarm clusters and 500+ templates. Pushify is newer and smaller.',
      },
    ],
    faqs: [
      {
        q: 'Is Dokploy open source?',
        a: 'Mostly. The code is Apache-2.0, except a /proprietary folder (SSO, custom roles, audit logs, white-labeling) under the Dokploy Source Available License since January 2026; using those in production needs a commercial agreement. Pushify is MIT throughout.',
      },
      {
        q: 'Does Dokploy Cloud include servers?',
        a: 'No. Dokploy Cloud hosts the control plane only; you connect your own servers. Pushify can also rent a Hetzner server for you from the dashboard, billed hourly from a prepaid balance.',
      },
      {
        q: 'Does Dokploy have zero-downtime deploys?',
        a: 'Yes, once you add a health check in the app’s Swarm settings. By default it stops the old container and then starts the new one. Pushify health-checks the new container before switching traffic on every deploy.',
      },
      {
        q: 'Can I move from Dokploy to Pushify?',
        a: 'There is no importer. Both run standard Docker workloads from a Git repo, so you connect the same server, point a project at the same repository, set its environment variables and deploy.',
      },
    ],
    ctaTitle: 'Try it on your own server',
    ctaBody: 'Start free, connect a server over SSH, and deploy from Git.',
  },
  tr: {
    subtitle: 'Uygulamaları kendi sunucularınızda çalıştırmanın iki açık kaynak yolu: hangisi nerede uygun.',
    tldr:
      'İkisi de SSH ile bağladığınız sunuculara Docker uygulamaları deploy eder ve ikisi de self-host için ücretsizdir. Dokploy daha eski ve çok daha büyük: yaklaşık 37.500 GitHub yıldızı, 500+ şablon, Docker Swarm kümeleri. Barındırılan kontrol paneli 7 günlük denemeden sonra sunucu başına ayda $4,50. Pushify’ın barındırılan kontrol panelinin ücretsiz bir planı var, panelden Hetzner sunucusu kiralayabilir, uygulamaları CPU’ya göre ölçekler ve boştaki uygulamaları uyutur; Dokploy bunları bugün yapmıyor.',
    rows: [
      'Açık kaynak, self-host ücretsiz',
      'Ücretsiz planı olan barındırılan kontrol paneli',
      'Kendi sunucularınıza SSH ile deploy',
      'Panelden sunucu, sağlayıcı hesabı olmadan',
      'Docker Compose',
      'Zamanlanmış yedekli veritabanları',
      'Pull request için önizleme deploy’ları',
      'Çok düğümlü küme (Docker Swarm)',
      'CPU’ya göre otomatik ölçekleme',
      'Boştaki uygulama uyur, istekle uyanır',
      'Ek ayar gerektirmeyen kesintisiz deploy',
      'Her planda tek oturum açma (OIDC)',
      '500+ tek tık şablon',
      'Büyük, oturmuş topluluk',
    ],
    pushify: [
      'Ücretsiz başlayabileceğiniz barındırılan bir kontrol paneli istiyorsanız.',
      'Hetzner hesabı açmadan, saatlik faturalanan bir sunucuyu panelden almak istiyorsanız.',
      'Uygulamaların CPU yükünde container eklemesini ya da kullanılmadığında uyumasını istiyorsanız.',
      'Ek ayar ya da kurumsal plan olmadan kesintisiz deploy ve SSO istiyorsanız.',
    ],
    dokploy: [
      'Daha büyük, daha çok denenmiş ve geniş topluluklu projeyi istiyorsanız.',
      'Çok sunuculu bir Docker Swarm kümesine ihtiyacınız varsa.',
      '500+ şablon, daha fazla bildirim kanalı ya da MariaDB istiyorsanız.',
    ],
    tableNote:
      'Son kontrol: 29 Eylül 2026. Dokploy Apache-2.0 lisanslıdır; kurumsal özellikleri (SSO, özel roller, denetim kayıtları, white-label) Ocak 2026’dan beri DSAL altında kaynağı açık ama ticari lisanslıdır. Pushify’da yönetilen sunucular ve önizleme deploy’ları Hobby, otomatik ölçekleme Pro ve üstü planlarda. Güncel olmayan bir şey mi gördünüz? support@pushify.dev adresine yazın.',
    diffs: [
      {
        title: 'Barındırılan kontrol paneli',
        body: 'Pushify’ın ücretsiz planı var. Dokploy Cloud 7 günlük denemeden sonra sunucu başına ayda $4,50 ve sunucuları yine siz getirirsiniz.',
      },
      {
        title: 'Ölçekleme',
        body: 'Pushify CPU’ya göre container ekleyip çıkarır ve boştaki uygulamayı uyutabilir. Dokploy’da replika sayısı elle ayarlanır; sıfıra ölçekleme açık bir istek.',
      },
      {
        title: 'Olgunluk',
        body: 'Dokploy’un yaklaşık 37.500 yıldızı, 370+ katkıcısı, Swarm kümeleri ve 500+ şablonu var. Pushify daha yeni ve daha küçük.',
      },
    ],
    faqs: [
      {
        q: 'Dokploy açık kaynak mı?',
        a: 'Büyük ölçüde. Kod Apache-2.0; yalnızca /proprietary klasörü (SSO, özel roller, denetim kayıtları, white-label) Ocak 2026’dan beri Dokploy Source Available License altında ve bunları üretimde kullanmak ticari anlaşma gerektiriyor. Pushify baştan sona MIT.',
      },
      {
        q: 'Dokploy Cloud sunucu içeriyor mu?',
        a: 'Hayır. Dokploy Cloud yalnızca kontrol panelini barındırır; sunucuları siz bağlarsınız. Pushify ayrıca panelden sizin için Hetzner sunucusu kiralayabilir ve bunu ön ödemeli bakiyeden saatlik faturalar.',
      },
      {
        q: 'Dokploy’da kesintisiz deploy var mı?',
        a: 'Evet, uygulamanın Swarm ayarlarına bir sağlık kontrolü eklediğinizde. Varsayılan olarak eski container’ı durdurup yenisini başlatır. Pushify her deploy’da trafiği çevirmeden önce yeni container’ı sağlık kontrolünden geçirir.',
      },
      {
        q: 'Dokploy’dan Pushify’a geçebilir miyim?',
        a: 'Otomatik bir aktarıcı yok. İkisi de Git deposundan standart Docker iş yükleri çalıştırır: aynı sunucuyu bağlar, projeyi aynı depoya yönlendirir, ortam değişkenlerini girer ve deploy edersiniz.',
      },
    ],
    ctaTitle: 'Kendi sunucunuzda deneyin',
    ctaBody: 'Ücretsiz başlayın, bir sunucuyu SSH ile bağlayın ve Git’ten deploy edin.',
  },
};

// Pushify, Dokploy — same order as `rows` above.
const marks: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [true, true],
  [true, false],
  [true, true],
  [true, true],
  [true, true],
  [false, true],
  [true, false],
  [true, false],
  [true, false],
  [true, false],
  [false, true],
  [false, true],
];

export default function VsDokployPage() {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const tr = locale === 'tr';

  const rows: ComparisonRow[] = c.rows.map((label, i) => ({ label, pushify: marks[i][0], competitor: marks[i][1] }));

  return (
    <ComparisonPageView
      eyebrow={tr ? 'Karşılaştırma' : 'Comparison'}
      h1="Pushify vs Dokploy"
      subtitle={c.subtitle}
      ctaPrimary={tr ? 'Ücretsiz başla' : 'Start free'}
      ctaSecondary={tr ? 'Fiyatları gör' : 'See pricing'}
      tldrTitle={tr ? 'Kısaca' : 'The short version'}
      tldrBody={c.tldr}
      choosePushifyTitle={tr ? 'Pushify’ı seçin, eğer…' : 'Choose Pushify if…'}
      pushifyReasons={c.pushify}
      chooseCompetitorTitle={tr ? 'Dokploy’u seçin, eğer…' : 'Choose Dokploy if…'}
      competitorReasons={c.dokploy}
      tableTitle={tr ? 'Özellik karşılaştırması' : 'Feature comparison'}
      tableNote={c.tableNote}
      sources={sources}
      colFeature={t('homepage', 'comparisonColumnFeature')}
      colPushify={t('homepage', 'colPushify')}
      colCompetitor="Dokploy"
      rows={rows}
      diffTitle={tr ? 'Temel farklar' : 'Key differences'}
      diffs={c.diffs}
      faqTitle={tr ? 'Sık sorulan sorular' : 'Frequently asked questions'}
      faqs={c.faqs}
      relatedTitle={t('landing', 'exploreMore')}
      relatedLinks={[
        { href: '/vs/coolify', label: 'Pushify vs Coolify' },
        { href: '/alternatives', label: tr ? 'Alternatifler' : 'Alternatives' },
        { href: '/pricing', label: t('landing', 'pricing') },
        { href: '/features', label: t('landing', 'features') },
      ]}
      ctaTitle={c.ctaTitle}
      ctaBody={c.ctaBody}
      ctaButton={tr ? 'Ücretsiz başla' : 'Start free'}
    />
  );
}
