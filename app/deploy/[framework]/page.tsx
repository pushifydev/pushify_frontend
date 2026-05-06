'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useTranslation } from '@/hooks';
import { LandingNavbar, LandingFooter } from '@/components/landing';

interface FrameworkData {
  name: string;
  slug: string;
  icon: string;
  color: string;
  buildCommand: string;
  detectMessage: string;
  en: {
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
  };
  tr: {
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
  };
}

const FRAMEWORKS: Record<string, FrameworkData> = {
  nextjs: {
    name: 'Next.js',
    slug: 'nextjs',
    icon: 'N',
    color: '#000000',
    buildCommand: 'next build',
    detectMessage: 'Detected: Next.js 15 + TypeScript',
    en: {
      title: 'Deploy Next.js Apps',
      description:
        'Deploy your Next.js 15 application to your own server in under 60 seconds. Pushify auto-detects Next.js projects, configures the build pipeline, and deploys with zero configuration. Supports App Router, Pages Router, API routes, and server components.',
      steps: [
        { title: 'Install Pushify CLI', code: 'npm install -g pushify-cli', description: 'Install the Pushify command-line tool globally.' },
        { title: 'Initialize your project', code: 'pushify init', description: 'Pushify auto-detects your Next.js project, identifies the framework version, and configures the build pipeline automatically.' },
        { title: 'Deploy to production', code: 'pushify deploy --prod', description: 'Your Next.js app is built, optimized, and deployed to your server with automatic SSL via Let\'s Encrypt.' },
      ],
      features: ['App Router & Pages Router support', 'Server Components & Server Actions', 'API Routes and middleware', 'Automatic ISR and static generation', 'Environment variables management', 'Zero-downtime deployments'],
      howToTitle: 'How to deploy Next.js with Pushify',
      whatYouGet: 'What you get with Next.js on Pushify',
      readyTitle: 'Ready to deploy your Next.js app?',
      readyDesc: 'Get started for free. No credit card required.',
      startBtn: 'Start Deploying Free',
      docsBtn: 'Read the Docs',
    },
    tr: {
      title: 'Next.js Uygulamalarını Deploy Edin',
      description:
        'Next.js 15 uygulamanızı kendi sunucunuza 60 saniyeden kısa sürede deploy edin. Pushify, Next.js projelerini otomatik algılar, build pipeline\'ını yapılandırır ve sıfır konfigürasyonla deploy eder. App Router, Pages Router, API route\'lar ve server component\'ler desteklenir.',
      steps: [
        { title: 'Pushify CLI\'ı Kurun', code: 'npm install -g pushify-cli', description: 'Pushify komut satırı aracını global olarak kurun.' },
        { title: 'Projenizi Başlatın', code: 'pushify init', description: 'Pushify, Next.js projenizi otomatik algılar, framework sürümünü belirler ve build pipeline\'ını otomatik yapılandırır.' },
        { title: 'Production\'a Deploy Edin', code: 'pushify deploy --prod', description: 'Next.js uygulamanız build edilir, optimize edilir ve Let\'s Encrypt ile otomatik SSL sertifikasıyla sunucunuza deploy edilir.' },
      ],
      features: ['App Router & Pages Router desteği', 'Server Components & Server Actions', 'API Routes ve middleware', 'Otomatik ISR ve statik üretim', 'Ortam değişkenleri yönetimi', 'Sıfır kesinti ile deployment'],
      howToTitle: 'Pushify ile Next.js nasıl deploy edilir',
      whatYouGet: 'Pushify\'da Next.js ile neler elde edersiniz',
      readyTitle: 'Next.js uygulamanızı deploy etmeye hazır mısınız?',
      readyDesc: 'Ücretsiz başlayın. Kredi kartı gerekmez.',
      startBtn: 'Ücretsiz Deploy Etmeye Başla',
      docsBtn: 'Dokümantasyonu Oku',
    },
  },
  react: {
    name: 'React', slug: 'react', icon: 'R', color: '#61DAFB', buildCommand: 'vite build', detectMessage: 'Detected: React + Vite',
    en: {
      title: 'Deploy React Apps',
      description: 'Deploy your React application — built with Vite, Create React App, or any React setup — to your own server. Pushify handles the build process, static file serving, and SSL configuration automatically.',
      steps: [
        { title: 'Install Pushify CLI', code: 'npm install -g pushify-cli', description: 'Install the Pushify command-line tool globally.' },
        { title: 'Initialize your project', code: 'pushify init', description: 'Pushify detects your React project and configures static site deployment with optimized caching headers.' },
        { title: 'Deploy to production', code: 'pushify deploy --prod', description: 'Your React app is built, assets are optimized, and everything is deployed with automatic SSL.' },
      ],
      features: ['Vite & Create React App support', 'SPA routing configuration', 'Asset optimization & caching', 'Environment variables', 'Preview deployments', 'Instant rollbacks'],
      howToTitle: 'How to deploy React with Pushify', whatYouGet: 'What you get with React on Pushify', readyTitle: 'Ready to deploy your React app?', readyDesc: 'Get started for free. No credit card required.', startBtn: 'Start Deploying Free', docsBtn: 'Read the Docs',
    },
    tr: {
      title: 'React Uygulamalarını Deploy Edin',
      description: 'Vite, Create React App veya herhangi bir React kurulumu ile oluşturduğunuz uygulamanızı kendi sunucunuza deploy edin. Pushify, build sürecini, statik dosya sunumunu ve SSL yapılandırmasını otomatik olarak yönetir.',
      steps: [
        { title: 'Pushify CLI\'ı Kurun', code: 'npm install -g pushify-cli', description: 'Pushify komut satırı aracını global olarak kurun.' },
        { title: 'Projenizi Başlatın', code: 'pushify init', description: 'Pushify, React projenizi algılar ve optimize edilmiş önbellek başlıklarıyla statik site deployment\'ını yapılandırır.' },
        { title: 'Production\'a Deploy Edin', code: 'pushify deploy --prod', description: 'React uygulamanız build edilir, asset\'ler optimize edilir ve otomatik SSL ile deploy edilir.' },
      ],
      features: ['Vite & Create React App desteği', 'SPA yönlendirme yapılandırması', 'Asset optimizasyonu & önbellekleme', 'Ortam değişkenleri', 'Önizleme deployment\'ları', 'Anlık geri alma'],
      howToTitle: 'Pushify ile React nasıl deploy edilir', whatYouGet: 'Pushify\'da React ile neler elde edersiniz', readyTitle: 'React uygulamanızı deploy etmeye hazır mısınız?', readyDesc: 'Ücretsiz başlayın. Kredi kartı gerekmez.', startBtn: 'Ücretsiz Deploy Etmeye Başla', docsBtn: 'Dokümantasyonu Oku',
    },
  },
  vue: {
    name: 'Vue.js', slug: 'vue', icon: 'V', color: '#41B883', buildCommand: 'vite build', detectMessage: 'Detected: Vue.js 3 + Vite',
    en: {
      title: 'Deploy Vue.js Apps',
      description: 'Deploy your Vue.js application to your own server with zero configuration. Pushify supports Vue 3, Nuxt, and Vite-powered Vue projects with automatic framework detection and optimized builds.',
      steps: [
        { title: 'Install Pushify CLI', code: 'npm install -g pushify-cli', description: 'Install the Pushify command-line tool globally.' },
        { title: 'Initialize your project', code: 'pushify init', description: 'Pushify detects Vue.js or Nuxt and configures the appropriate build and serve strategy.' },
        { title: 'Deploy to production', code: 'pushify deploy --prod', description: 'Your Vue app is built, deployed, and live with automatic SSL in under 60 seconds.' },
      ],
      features: ['Vue 3 Composition API', 'Nuxt 3 SSR support', 'Vite-powered builds', 'Static and SSR modes', 'Environment variables', 'Zero-downtime deployments'],
      howToTitle: 'How to deploy Vue.js with Pushify', whatYouGet: 'What you get with Vue.js on Pushify', readyTitle: 'Ready to deploy your Vue.js app?', readyDesc: 'Get started for free. No credit card required.', startBtn: 'Start Deploying Free', docsBtn: 'Read the Docs',
    },
    tr: {
      title: 'Vue.js Uygulamalarını Deploy Edin',
      description: 'Vue.js uygulamanızı sıfır konfigürasyonla kendi sunucunuza deploy edin. Pushify, Vue 3, Nuxt ve Vite destekli Vue projelerini otomatik framework algılama ve optimize edilmiş build\'ler ile destekler.',
      steps: [
        { title: 'Pushify CLI\'ı Kurun', code: 'npm install -g pushify-cli', description: 'Pushify komut satırı aracını global olarak kurun.' },
        { title: 'Projenizi Başlatın', code: 'pushify init', description: 'Pushify, Vue.js veya Nuxt\'u algılar ve uygun build ve sunma stratejisini yapılandırır.' },
        { title: 'Production\'a Deploy Edin', code: 'pushify deploy --prod', description: 'Vue uygulamanız build edilir, deploy edilir ve 60 saniyeden kısa sürede otomatik SSL ile yayına alınır.' },
      ],
      features: ['Vue 3 Composition API', 'Nuxt 3 SSR desteği', 'Vite destekli build\'ler', 'Statik ve SSR modları', 'Ortam değişkenleri', 'Sıfır kesinti ile deployment'],
      howToTitle: 'Pushify ile Vue.js nasıl deploy edilir', whatYouGet: 'Pushify\'da Vue.js ile neler elde edersiniz', readyTitle: 'Vue.js uygulamanızı deploy etmeye hazır mısınız?', readyDesc: 'Ücretsiz başlayın. Kredi kartı gerekmez.', startBtn: 'Ücretsiz Deploy Etmeye Başla', docsBtn: 'Dokümantasyonu Oku',
    },
  },
  python: {
    name: 'Python', slug: 'python', icon: 'Py', color: '#3776AB', buildCommand: 'pip install -r requirements.txt', detectMessage: 'Detected: Python + FastAPI',
    en: {
      title: 'Deploy Python Apps',
      description: 'Deploy your Python web application — Flask, Django, FastAPI, or any WSGI/ASGI app — to your own server. Pushify detects your Python framework, installs dependencies, and configures the production server automatically.',
      steps: [
        { title: 'Install Pushify CLI', code: 'npm install -g pushify-cli', description: 'Install the Pushify command-line tool globally.' },
        { title: 'Initialize your project', code: 'pushify init', description: 'Pushify detects your Python framework from requirements.txt or pyproject.toml and configures Gunicorn/Uvicorn.' },
        { title: 'Deploy to production', code: 'pushify deploy --prod', description: 'Dependencies are installed, your app is deployed with a production ASGI/WSGI server and automatic SSL.' },
      ],
      features: ['Django, Flask, FastAPI support', 'Automatic Gunicorn/Uvicorn setup', 'Virtual environment management', 'Database migrations support', 'Environment variables', 'Background workers with Celery'],
      howToTitle: 'How to deploy Python with Pushify', whatYouGet: 'What you get with Python on Pushify', readyTitle: 'Ready to deploy your Python app?', readyDesc: 'Get started for free. No credit card required.', startBtn: 'Start Deploying Free', docsBtn: 'Read the Docs',
    },
    tr: {
      title: 'Python Uygulamalarını Deploy Edin',
      description: 'Flask, Django, FastAPI veya herhangi bir WSGI/ASGI uygulamanızı kendi sunucunuza deploy edin. Pushify, Python framework\'ünüzü algılar, bağımlılıkları kurar ve production sunucusunu otomatik yapılandırır.',
      steps: [
        { title: 'Pushify CLI\'ı Kurun', code: 'npm install -g pushify-cli', description: 'Pushify komut satırı aracını global olarak kurun.' },
        { title: 'Projenizi Başlatın', code: 'pushify init', description: 'Pushify, requirements.txt veya pyproject.toml\'dan Python framework\'ünüzü algılar ve Gunicorn/Uvicorn\'u yapılandırır.' },
        { title: 'Production\'a Deploy Edin', code: 'pushify deploy --prod', description: 'Bağımlılıklar kurulur, uygulamanız production ASGI/WSGI sunucusu ve otomatik SSL ile deploy edilir.' },
      ],
      features: ['Django, Flask, FastAPI desteği', 'Otomatik Gunicorn/Uvicorn kurulumu', 'Sanal ortam yönetimi', 'Veritabanı migration desteği', 'Ortam değişkenleri', 'Celery ile arka plan işçileri'],
      howToTitle: 'Pushify ile Python nasıl deploy edilir', whatYouGet: 'Pushify\'da Python ile neler elde edersiniz', readyTitle: 'Python uygulamanızı deploy etmeye hazır mısınız?', readyDesc: 'Ücretsiz başlayın. Kredi kartı gerekmez.', startBtn: 'Ücretsiz Deploy Etmeye Başla', docsBtn: 'Dokümantasyonu Oku',
    },
  },
  nodejs: {
    name: 'Node.js', slug: 'nodejs', icon: 'JS', color: '#539E43', buildCommand: 'npm run build', detectMessage: 'Detected: Node.js + Express',
    en: {
      title: 'Deploy Node.js Apps',
      description: 'Deploy your Node.js application — Express, Fastify, Koa, NestJS, or any Node.js server — to your own VPS. Pushify handles process management, environment configuration, and SSL setup automatically.',
      steps: [
        { title: 'Install Pushify CLI', code: 'npm install -g pushify-cli', description: 'Install the Pushify command-line tool globally.' },
        { title: 'Initialize your project', code: 'pushify init', description: 'Pushify reads your package.json, detects the Node.js framework, and configures the start script.' },
        { title: 'Deploy to production', code: 'pushify deploy --prod', description: 'Your Node.js app is deployed with PM2 process management, health checks, and automatic SSL.' },
      ],
      features: ['Express, Fastify, NestJS, Koa support', 'PM2 process management', 'Automatic health checks', 'WebSocket support', 'Environment variables', 'Zero-downtime restarts'],
      howToTitle: 'How to deploy Node.js with Pushify', whatYouGet: 'What you get with Node.js on Pushify', readyTitle: 'Ready to deploy your Node.js app?', readyDesc: 'Get started for free. No credit card required.', startBtn: 'Start Deploying Free', docsBtn: 'Read the Docs',
    },
    tr: {
      title: 'Node.js Uygulamalarını Deploy Edin',
      description: 'Express, Fastify, Koa, NestJS veya herhangi bir Node.js sunucusunu kendi VPS\'inize deploy edin. Pushify, süreç yönetimini, ortam yapılandırmasını ve SSL kurulumunu otomatik olarak yönetir.',
      steps: [
        { title: 'Pushify CLI\'ı Kurun', code: 'npm install -g pushify-cli', description: 'Pushify komut satırı aracını global olarak kurun.' },
        { title: 'Projenizi Başlatın', code: 'pushify init', description: 'Pushify, package.json\'ınızı okur, Node.js framework\'ünü algılar ve başlatma script\'ini yapılandırır.' },
        { title: 'Production\'a Deploy Edin', code: 'pushify deploy --prod', description: 'Node.js uygulamanız PM2 süreç yönetimi, sağlık kontrolleri ve otomatik SSL ile deploy edilir.' },
      ],
      features: ['Express, Fastify, NestJS, Koa desteği', 'PM2 süreç yönetimi', 'Otomatik sağlık kontrolleri', 'WebSocket desteği', 'Ortam değişkenleri', 'Sıfır kesinti ile yeniden başlatma'],
      howToTitle: 'Pushify ile Node.js nasıl deploy edilir', whatYouGet: 'Pushify\'da Node.js ile neler elde edersiniz', readyTitle: 'Node.js uygulamanızı deploy etmeye hazır mısınız?', readyDesc: 'Ücretsiz başlayın. Kredi kartı gerekmez.', startBtn: 'Ücretsiz Deploy Etmeye Başla', docsBtn: 'Dokümantasyonu Oku',
    },
  },
  laravel: {
    name: 'Laravel', slug: 'laravel', icon: 'L', color: '#FF2D20', buildCommand: 'composer install --no-dev', detectMessage: 'Detected: Laravel 11 + PHP 8.3',
    en: {
      title: 'Deploy Laravel Apps',
      description: 'Deploy your Laravel application to your own server with zero configuration. Pushify sets up PHP, Composer dependencies, database migrations, queue workers, and Nginx configuration automatically.',
      steps: [
        { title: 'Install Pushify CLI', code: 'npm install -g pushify-cli', description: 'Install the Pushify command-line tool globally.' },
        { title: 'Initialize your project', code: 'pushify init', description: 'Pushify detects Laravel from composer.json, configures PHP-FPM, Nginx, and database connections.' },
        { title: 'Deploy to production', code: 'pushify deploy --prod', description: 'Composer install, migrations, asset compilation, and deployment — all automated with automatic SSL.' },
      ],
      features: ['PHP-FPM & Nginx configuration', 'Composer dependency management', 'Automatic database migrations', 'Queue worker setup (Horizon)', 'Scheduled task configuration', 'Redis & cache management'],
      howToTitle: 'How to deploy Laravel with Pushify', whatYouGet: 'What you get with Laravel on Pushify', readyTitle: 'Ready to deploy your Laravel app?', readyDesc: 'Get started for free. No credit card required.', startBtn: 'Start Deploying Free', docsBtn: 'Read the Docs',
    },
    tr: {
      title: 'Laravel Uygulamalarını Deploy Edin',
      description: 'Laravel uygulamanızı sıfır konfigürasyonla kendi sunucunuza deploy edin. Pushify, PHP, Composer bağımlılıkları, veritabanı migration\'ları, kuyruk işçileri ve Nginx yapılandırmasını otomatik olarak ayarlar.',
      steps: [
        { title: 'Pushify CLI\'ı Kurun', code: 'npm install -g pushify-cli', description: 'Pushify komut satırı aracını global olarak kurun.' },
        { title: 'Projenizi Başlatın', code: 'pushify init', description: 'Pushify, composer.json\'dan Laravel\'i algılar, PHP-FPM, Nginx ve veritabanı bağlantılarını yapılandırır.' },
        { title: 'Production\'a Deploy Edin', code: 'pushify deploy --prod', description: 'Composer install, migration\'lar, asset derleme ve deployment — hepsi otomatik SSL ile otomatize edilir.' },
      ],
      features: ['PHP-FPM & Nginx yapılandırması', 'Composer bağımlılık yönetimi', 'Otomatik veritabanı migration\'ları', 'Kuyruk işçisi kurulumu (Horizon)', 'Zamanlanmış görev yapılandırması', 'Redis & önbellek yönetimi'],
      howToTitle: 'Pushify ile Laravel nasıl deploy edilir', whatYouGet: 'Pushify\'da Laravel ile neler elde edersiniz', readyTitle: 'Laravel uygulamanızı deploy etmeye hazır mısınız?', readyDesc: 'Ücretsiz başlayın. Kredi kartı gerekmez.', startBtn: 'Ücretsiz Deploy Etmeye Başla', docsBtn: 'Dokümantasyonu Oku',
    },
  },
};

export default function DeployFrameworkPage() {
  const params = useParams();
  const framework = params.framework as string;
  const fw = FRAMEWORKS[framework];
  const { locale } = useTranslation();

  if (!fw) notFound();

  const content = fw[locale] || fw.en;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-bold mb-6 border border-[var(--glass-border)]"
            style={{ backgroundColor: `${fw.color}15`, color: fw.color }}
          >
            {fw.icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            {content.title}{' '}
            <span className="gradient-text">
              {locale === 'tr' ? '60 Saniyeden Kısa Sürede' : 'in Under 60 Seconds'}
            </span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-10 text-center">{content.howToTitle}</h2>
        <div className="space-y-8">
          {content.steps.map((step, i) => (
            <div key={i} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 flex items-center justify-center text-[var(--accent-cyan)] font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                {step.code && (
                  <div className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] px-4 py-3 mb-3 font-mono text-sm text-[var(--accent-cyan)]">
                    $ {step.code}
                  </div>
                )}
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Terminal Preview */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--glass-border)]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">pushify-cli</span>
          </div>
          <div className="p-5 font-mono text-sm leading-7">
            <div className="text-[var(--text-primary)]">$ pushify init</div>
            <div className="text-[var(--accent-purple)]">◆ {fw.detectMessage}</div>
            <div className="text-[var(--accent-cyan)]">▸ Configuring build pipeline...</div>
            <div className="text-[var(--text-primary)] mt-2">$ pushify deploy --prod</div>
            <div className="text-[var(--accent-cyan)]">▸ Running: {fw.buildCommand}</div>
            <div className="text-[var(--accent-cyan)]">▸ Deploying to your server...</div>
            <div className="text-[var(--status-success)]">✓ Live at https://app.pushify.dev</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">{content.whatYouGet}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--glass-border)]">
              <div className="w-5 h-5 rounded bg-[var(--status-success)]/10 flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--status-success)]">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-32 text-center">
        <h2 className="text-3xl font-bold mb-4">{content.readyTitle}</h2>
        <p className="text-[var(--text-secondary)] mb-8">{content.readyDesc}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="btn btn-primary h-12 px-8 text-[15px] font-semibold">
            {content.startBtn}
          </Link>
          <Link href="/docs" className="btn btn-secondary h-12 px-8 text-[15px] font-semibold">
            {content.docsBtn}
          </Link>
        </div>
      </section>

      <LandingFooter />

      {/* JSON-LD HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: `How to deploy a ${fw.name} app with Pushify`,
            description: fw.en.description,
            totalTime: 'PT1M',
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
    </div>
  );
}
