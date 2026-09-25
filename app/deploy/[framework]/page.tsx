'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell, Steps, CodePanel } from '@/components/landing/MarketingKit';

/*
 * Six framework landing pages, one template. The steps follow what pushify-cli really does:
 * `pushify init` logs in and creates (or links) a project from the directory's git remote;
 * framework detection and the build happen on the server when the deploy runs.
 */

interface FrameworkCopy {
  title: string;
  description: string;
  steps: { title: string; code?: string; description: string }[];
  features: string[];
  howToTitle: string;
  whatYouGet: string;
  readyTitle: string;
  readyDesc: string;
  startBtn: string;
  docsBtn: string;
}

interface FrameworkData {
  name: string;
  slug: string;
  en: FrameworkCopy;
  tr: FrameworkCopy;
}

const INSTALL_EN = { title: 'Install the Pushify CLI', code: 'npm install -g pushify-cli', description: 'One global install. Everything it does also works from the dashboard.' };
const INSTALL_TR = { title: "Pushify CLI'ı kurun", code: 'npm install -g pushify-cli', description: 'Tek bir global kurulum. Yaptığı her şey panelden de yapılabilir.' };
const INIT_EN = { title: 'Create the project', code: 'pushify init', description: 'Signs you in with an API key and creates or links a project from this git remote.' };
const INIT_TR = { title: 'Projeyi oluşturun', code: 'pushify init', description: 'API anahtarınızla giriş yapar; bu git remote’undan proje oluşturur ya da var olana bağlar.' };
const DEPLOY_CODE = 'pushify deploy --prod --wait';

const SHARED_EN = {
  readyDesc: 'Free on one server you bring. Paid plans add managed servers and more projects.',
  startBtn: 'Start for free',
  docsBtn: 'Read the docs',
};
const SHARED_TR = {
  readyDesc: 'Getirdiğiniz tek sunucuda ücretsiz. Ücretli planlar yönetilen sunucu ve daha fazla proje ekler.',
  startBtn: 'Ücretsiz başlayın',
  docsBtn: 'Dokümantasyonu okuyun',
};

const FRAMEWORKS: Record<string, FrameworkData> = {
  nextjs: {
    name: 'Next.js',
    slug: 'nextjs',
    en: {
      title: 'Deploy Next.js apps',
      description:
        'Git push to your own server. Pushify detects Next.js, builds a Docker image and switches traffic with zero downtime.',
      steps: [
        INSTALL_EN,
        INIT_EN,
        { title: 'Deploy to production', code: DEPLOY_CODE, description: 'The server detects Next.js, runs next build and serves the new container over HTTPS.' },
      ],
      features: ['App Router and Pages Router', 'Server Components and Server Actions', 'API routes and middleware', '.next/cache kept between builds', 'Environment variables per project', 'Zero-downtime deploys'],
      howToTitle: 'How to deploy Next.js with Pushify',
      whatYouGet: 'What you get with Next.js on Pushify',
      readyTitle: 'Ready to deploy your Next.js app?',
      ...SHARED_EN,
    },
    tr: {
      title: 'Next.js uygulamalarını deploy edin',
      description:
        'Kendi sunucunuza git push. Pushify Next.js’i algılar, Docker imajı derler ve trafiği kesintisiz geçirir.',
      steps: [
        INSTALL_TR,
        INIT_TR,
        { title: "Production'a deploy edin", code: DEPLOY_CODE, description: 'Sunucu Next.js’i algılar, next build’i çalıştırır ve yeni container’ı HTTPS üzerinden sunar.' },
      ],
      features: ['App Router ve Pages Router', 'Server Components ve Server Actions', 'API route’lar ve middleware', 'Build’ler arasında korunan .next/cache', 'Proje bazında ortam değişkenleri', 'Kesintisiz deploy'],
      howToTitle: 'Pushify ile Next.js nasıl deploy edilir',
      whatYouGet: "Pushify'da Next.js ile neler elde edersiniz",
      readyTitle: 'Next.js uygulamanızı deploy etmeye hazır mısınız?',
      ...SHARED_TR,
    },
  },
  react: {
    name: 'React',
    slug: 'react',
    en: {
      title: 'Deploy React apps',
      description:
        'Pushify builds your React app and serves it with nginx on your own server: SPA routing, asset caching and HTTPS included.',
      steps: [
        INSTALL_EN,
        INIT_EN,
        { title: 'Deploy to production', code: DEPLOY_CODE, description: 'The server builds the app and serves dist (by default) from nginx over HTTPS.' },
      ],
      features: ['Vite out of the box', 'Create React App with output: build in pushify.yaml', 'SPA routing falls back to index.html', 'Long-lived cache headers for hashed assets', 'Preview deployments on paid plans', 'Rollbacks to previous deployments'],
      howToTitle: 'How to deploy React with Pushify',
      whatYouGet: 'What you get with React on Pushify',
      readyTitle: 'Ready to deploy your React app?',
      ...SHARED_EN,
    },
    tr: {
      title: 'React uygulamalarını deploy edin',
      description:
        'Pushify React uygulamanızı derler ve kendi sunucunuzda nginx ile sunar: SPA yönlendirmesi, önbellek ve HTTPS dahil.',
      steps: [
        INSTALL_TR,
        INIT_TR,
        { title: "Production'a deploy edin", code: DEPLOY_CODE, description: 'Sunucu uygulamayı derler ve dist dizinini (varsayılan) nginx ile HTTPS üzerinden sunar.' },
      ],
      features: ['Vite hazır desteklenir', 'Create React App için pushify.yaml’da output: build', 'SPA yönlendirmesi index.html’e düşer', 'Hash’li dosyalar için uzun süreli önbellek başlıkları', 'Ücretli planlarda önizleme deploy’ları', 'Önceki deploy’lara geri dönüş'],
      howToTitle: 'Pushify ile React nasıl deploy edilir',
      whatYouGet: "Pushify'da React ile neler elde edersiniz",
      readyTitle: 'React uygulamanızı deploy etmeye hazır mısınız?',
      ...SHARED_TR,
    },
  },
  vue: {
    name: 'Vue.js',
    slug: 'vue',
    en: {
      title: 'Deploy Vue.js apps',
      description:
        'Pushify detects Vue and Nuxt: a Vite build is served as static files, a Nuxt app runs as a Node server.',
      steps: [
        INSTALL_EN,
        INIT_EN,
        { title: 'Deploy to production', code: DEPLOY_CODE, description: 'The server detects Vue or Nuxt, picks static or Node serving and goes live over HTTPS.' },
      ],
      features: ['Vue 3 with Vite', 'Nuxt 3 server-side rendering', 'Static and SSR modes', 'SPA routing for static builds', 'Environment variables per project', 'Zero-downtime deploys'],
      howToTitle: 'How to deploy Vue.js with Pushify',
      whatYouGet: 'What you get with Vue.js on Pushify',
      readyTitle: 'Ready to deploy your Vue.js app?',
      ...SHARED_EN,
    },
    tr: {
      title: 'Vue.js uygulamalarını deploy edin',
      description:
        'Pushify Vue ve Nuxt’u algılar: Vite build’i statik dosya olarak sunulur, Nuxt uygulaması Node sunucusu olarak çalışır.',
      steps: [
        INSTALL_TR,
        INIT_TR,
        { title: "Production'a deploy edin", code: DEPLOY_CODE, description: 'Sunucu Vue’yu ya da Nuxt’u algılar, statik ya da Node sunumu seçer ve HTTPS ile yayına alır.' },
      ],
      features: ['Vite ile Vue 3', 'Nuxt 3 sunucu taraflı render', 'Statik ve SSR modları', 'Statik build’lerde SPA yönlendirmesi', 'Proje bazında ortam değişkenleri', 'Kesintisiz deploy'],
      howToTitle: 'Pushify ile Vue.js nasıl deploy edilir',
      whatYouGet: "Pushify'da Vue.js ile neler elde edersiniz",
      readyTitle: 'Vue.js uygulamanızı deploy etmeye hazır mısınız?',
      ...SHARED_TR,
    },
  },
  python: {
    name: 'Python',
    slug: 'python',
    en: {
      title: 'Deploy Python apps',
      description:
        'Django, Flask or FastAPI on your own server. Pushify installs dependencies and runs Gunicorn or Uvicorn for you.',
      steps: [
        INSTALL_EN,
        INIT_EN,
        { title: 'Deploy to production', code: DEPLOY_CODE, description: 'Reads requirements.txt or pyproject.toml, installs dependencies, starts Gunicorn or Uvicorn behind HTTPS.' },
      ],
      features: ['Django, Flask and FastAPI', 'Gunicorn or Uvicorn set up for you', 'A fresh Docker image per deploy', 'Cron jobs via pushify.yaml', 'Environment variables per project', 'Background workers via pushify.yaml'],
      howToTitle: 'How to deploy Python with Pushify',
      whatYouGet: 'What you get with Python on Pushify',
      readyTitle: 'Ready to deploy your Python app?',
      ...SHARED_EN,
    },
    tr: {
      title: 'Python uygulamalarını deploy edin',
      description:
        'Kendi sunucunuzda Django, Flask ya da FastAPI. Pushify bağımlılıkları kurar, Gunicorn ya da Uvicorn’u sizin için çalıştırır.',
      steps: [
        INSTALL_TR,
        INIT_TR,
        { title: "Production'a deploy edin", code: DEPLOY_CODE, description: 'requirements.txt ya da pyproject.toml’u okur, bağımlılıkları kurar, Gunicorn ya da Uvicorn’u HTTPS arkasında başlatır.' },
      ],
      features: ['Django, Flask ve FastAPI', 'Gunicorn ya da Uvicorn sizin için ayarlanır', 'Her deploy için yeni bir Docker imajı', 'pushify.yaml ile cron görevleri', 'Proje bazında ortam değişkenleri', 'pushify.yaml ile arka plan worker’ları'],
      howToTitle: 'Pushify ile Python nasıl deploy edilir',
      whatYouGet: "Pushify'da Python ile neler elde edersiniz",
      readyTitle: 'Python uygulamanızı deploy etmeye hazır mısınız?',
      ...SHARED_TR,
    },
  },
  nodejs: {
    name: 'Node.js',
    slug: 'nodejs',
    en: {
      title: 'Deploy Node.js apps',
      description:
        'Express, Fastify, NestJS or any Node.js server on your own VPS: containerised, restarted on crash, behind HTTPS.',
      steps: [
        INSTALL_EN,
        INIT_EN,
        { title: 'Deploy to production', code: DEPLOY_CODE, description: 'Builds from package.json, runs your start script and switches traffic once healthy.' },
      ],
      features: ['Express, Fastify, NestJS and Koa', 'Container restarts after a crash', 'Health check before traffic switches', 'WebSockets through the proxy', 'Environment variables per project', 'Zero-downtime deploys'],
      howToTitle: 'How to deploy Node.js with Pushify',
      whatYouGet: 'What you get with Node.js on Pushify',
      readyTitle: 'Ready to deploy your Node.js app?',
      ...SHARED_EN,
    },
    tr: {
      title: 'Node.js uygulamalarını deploy edin',
      description:
        'Kendi VPS’inizde Express, Fastify, NestJS ya da herhangi bir Node.js sunucusu: container’da, çökünce yeniden başlar, HTTPS arkasında.',
      steps: [
        INSTALL_TR,
        INIT_TR,
        { title: "Production'a deploy edin", code: DEPLOY_CODE, description: 'package.json’dan derler, start script’inizi çalıştırır, sağlıklı olunca trafiği geçirir.' },
      ],
      features: ['Express, Fastify, NestJS ve Koa', 'Çökmeden sonra container yeniden başlar', 'Trafik geçmeden önce sağlık kontrolü', 'Proxy üzerinden WebSocket', 'Proje bazında ortam değişkenleri', 'Kesintisiz deploy'],
      howToTitle: 'Pushify ile Node.js nasıl deploy edilir',
      whatYouGet: "Pushify'da Node.js ile neler elde edersiniz",
      readyTitle: 'Node.js uygulamanızı deploy etmeye hazır mısınız?',
      ...SHARED_TR,
    },
  },
  laravel: {
    name: 'Laravel',
    slug: 'laravel',
    en: {
      title: 'Deploy Laravel apps',
      description:
        'A PHP 8.3 image with PHP-FPM, opcache and nginx on your own server. Composer, config and route caches included.',
      steps: [
        INSTALL_EN,
        INIT_EN,
        { title: 'Deploy to production', code: DEPLOY_CODE, description: 'Detects Laravel from composer.json, runs composer install and caches, serves over HTTPS.' },
      ],
      features: ['PHP-FPM and nginx in one image', 'Composer dependencies installed at build', 'PHP 8.3 with opcache', 'Queue workers and cron via pushify.yaml', 'Custom domains with automatic SSL', 'Rollbacks to previous deployments'],
      howToTitle: 'How to deploy Laravel with Pushify',
      whatYouGet: 'What you get with Laravel on Pushify',
      readyTitle: 'Ready to deploy your Laravel app?',
      ...SHARED_EN,
    },
    tr: {
      title: 'Laravel uygulamalarını deploy edin',
      description:
        'Kendi sunucunuzda PHP-FPM, opcache ve nginx içeren bir PHP 8.3 imajı. Composer, config ve route önbellekleri dahil.',
      steps: [
        INSTALL_TR,
        INIT_TR,
        { title: "Production'a deploy edin", code: DEPLOY_CODE, description: 'composer.json’dan Laravel’i algılar, composer install ve önbellekleri çalıştırır, HTTPS ile sunar.' },
      ],
      features: ['Tek imajda PHP-FPM ve nginx', 'Composer bağımlılıkları build sırasında kurulur', 'Opcache’li PHP 8.3', 'pushify.yaml ile kuyruk worker’ları ve cron', 'Otomatik SSL ile özel alan adları', 'Önceki deploy’lara geri dönüş'],
      howToTitle: 'Pushify ile Laravel nasıl deploy edilir',
      whatYouGet: "Pushify'da Laravel ile neler elde edersiniz",
      readyTitle: 'Laravel uygulamanızı deploy etmeye hazır mısınız?',
      ...SHARED_TR,
    },
  },
};

const ui = {
  en: {
    label: 'Deploy guide',
    where: 'to your own server',
    howEyebrow: 'Steps',
    howLead: 'Connect a server first: your own VPS over SSH, or a managed Hetzner server.',
    terminalTitle: 'terminal',
    featuresEyebrow: 'Included',
    ctaEyebrow: 'Get started',
    related: 'Compare',
  },
  tr: {
    label: 'Deploy rehberi',
    where: 'kendi sunucunuzda',
    howEyebrow: 'Adımlar',
    howLead: 'Önce bir sunucu bağlayın: SSH ile kendi VPS’iniz ya da yönetilen bir Hetzner sunucusu.',
    terminalTitle: 'terminal',
    featuresEyebrow: 'Neler dahil',
    ctaEyebrow: 'Başlayın',
    related: 'Karşılaştırın',
  },
} as const;

export default function DeployFrameworkPage() {
  const params = useParams();
  const framework = params.framework as string;
  const fw = FRAMEWORKS[framework];
  const { locale } = useTranslation();

  if (!fw) notFound();

  const lang = locale === 'tr' ? 'tr' : 'en';
  const content = fw[lang];
  const u = ui[lang];

  return (
    <MarketingShell noPad>
      <MarketingPageHero
        label={u.label}
        title={
          <>
            {content.title}
            <br />
            <span style={{ color: 'var(--hp-muted)' }}>{u.where}</span>
          </>
        }
        description={content.description}
      />

      {/* The whole flow in one terminal, directly under the hero. */}
      <section className="pb-20 md:pb-24">
        <div className="lp-container max-w-3xl">
          <CodePanel title={`${u.terminalTitle} · ${fw.name}`}>
            <span>$ {INSTALL_EN.code}</span>
            {'\n\n'}
            <span>$ pushify init</span>
            {'\n'}
            <span style={{ color: 'var(--hp-muted)' }}>✔ Created my-app (my-app){'\n'}  Repository: https://github.com/you/my-app @ main</span>
            {'\n\n'}
            <span>$ {DEPLOY_CODE}</span>
            {'\n'}
            <span style={{ color: 'var(--hp-muted)' }}>✔ Deployment triggered!{'\n'}  Branch: main (production){'\n'}✔ Deployment successful!</span>
            {'\n'}
            <span style={{ color: 'var(--hp-live)' }}>  ✓ Your application is now live</span>
          </CodePanel>
        </div>
      </section>

      <MSection id="how" eyebrow={u.howEyebrow} title={content.howToTitle} lead={u.howLead}>
        <Steps
          items={content.steps.map((step) => ({
            title: step.title,
            body: (
              <>
                {step.code && (
                  <code className="hp-mono block mb-2 text-[13px] break-all" style={{ color: 'var(--hp-ink)' }}>
                    $ {step.code}
                  </code>
                )}
                {step.description}
              </>
            ),
          }))}
        />
      </MSection>

      <MSection id="features" eyebrow={u.featuresEyebrow} title={content.whatYouGet}>
        <RuleGrid cols={3}>
          {content.features.map((feature) => (
            <RuleCell key={feature} title={feature} />
          ))}
        </RuleGrid>
      </MSection>

      <MSection eyebrow={u.ctaEyebrow} title={content.readyTitle} lead={content.readyDesc} align="center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="lp-cta w-full sm:w-auto">
            {content.startBtn}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link href="/docs" className="lp-cta-ghost w-full sm:w-auto">
            {content.docsBtn}
          </Link>
        </div>
        <nav aria-label={u.related} className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {[
            { href: '/vs/coolify', label: 'Pushify vs Coolify' },
            { href: '/vs/vercel', label: 'Pushify vs Vercel' },
            { href: '/features', label: lang === 'tr' ? 'Özellikler' : 'Features' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hp-mono text-[12px] uppercase tracking-[0.1em] hover:underline underline-offset-4"
              style={{ color: 'var(--hp-body)' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </MSection>

      {/* JSON-LD HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: `How to deploy a ${fw.name} app with Pushify`,
            description: fw.en.description,
            tool: { '@type': 'HowToTool', name: 'pushify-cli' },
            step: fw.en.steps.map((step, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: step.title,
              text: step.description,
              ...(step.code && { itemListElement: { '@type': 'HowToDirection', text: step.code } }),
            })),
          }),
        }}
      />
    </MarketingShell>
  );
}
