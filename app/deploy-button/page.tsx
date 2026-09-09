'use client';

import { useState } from 'react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';
import { Check, Copy } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const BADGE_URL = 'https://pushify.dev/badges/deploy.svg';
const EXAMPLE_REPO = 'https://github.com/your-org/your-app';

const content = {
  en: {
    label: 'Deploy button',
    title: 'One-click deploys from your README',
    intro:
      'Add a "Deploy to Pushify" button to any repository. Whoever clicks it lands in the new-project wizard with your repo and branch already filled in — and deploys to their own server, not ours.',
    previewTitle: 'What it looks like',
    snippetTitle: 'Add it to your README',
    markdownLabel: 'Markdown',
    htmlLabel: 'HTML',
    paramsTitle: 'Parameters',
    params: [
      { name: 'repo', req: 'required', desc: 'HTTPS URL of a public repository on GitHub, GitLab or Bitbucket — or any https URL ending in .git.' },
      { name: 'branch', req: 'optional', desc: 'Branch to deploy. Defaults to the repository default branch.' },
    ],
    howTitle: 'What happens on click',
    how: [
      'The visitor signs in or creates a free account — the link survives the redirect.',
      'The wizard opens with your repository and branch prefilled; framework, build and start commands are auto-detected.',
      'They pick one of their servers (or connect a VPS over SSH) and deploy. HTTPS and zero-downtime cutover are handled.',
    ],
    tipTitle: 'Good to know',
    tips: [
      'Private repositories work too — the visitor connects their own GitHub account in the wizard.',
      'Ship a pushify.yaml in the repo to pin build settings, cron jobs, volumes and workers for everyone who deploys it — see the reference at pushify.dev/pushify-yaml.',
      'The badge is a static SVG; hotlink it or copy it into your repo.',
    ],
    copy: 'Copy',
    copied: 'Copied',
  },
  tr: {
    label: 'Deploy butonu',
    title: "README'den tek tıkla deploy",
    intro:
      'Herhangi bir repoya "Deploy to Pushify" butonu ekleyin. Tıklayan kişi, repo ve branch önceden doldurulmuş şekilde yeni proje sihirbazına düşer — ve bizim değil, kendi sunucusuna deploy eder.',
    previewTitle: 'Nasıl görünüyor',
    snippetTitle: "README'nize ekleyin",
    markdownLabel: 'Markdown',
    htmlLabel: 'HTML',
    paramsTitle: 'Parametreler',
    params: [
      { name: 'repo', req: 'zorunlu', desc: "GitHub, GitLab veya Bitbucket'taki herkese açık bir reponun HTTPS adresi — ya da .git ile biten herhangi bir https URL." },
      { name: 'branch', req: 'isteğe bağlı', desc: 'Deploy edilecek branch. Varsayılan: reponun varsayılan branch’i.' },
    ],
    howTitle: 'Tıklayınca ne olur',
    how: [
      'Ziyaretçi giriş yapar ya da ücretsiz hesap açar — link yönlendirmeden sağ çıkar.',
      'Sihirbaz repo ve branch dolu açılır; framework, build ve start komutları otomatik algılanır.',
      'Kendi sunucularından birini seçer (ya da SSH ile bir VPS bağlar) ve deploy eder. HTTPS ve kesintisiz geçiş otomatiktir.',
    ],
    tipTitle: 'Bilmekte fayda var',
    tips: [
      'Özel repolar da çalışır — ziyaretçi sihirbazda kendi GitHub hesabını bağlar.',
      'Repoya bir pushify.yaml koyarsanız build ayarları, cron, volume ve worker’lar herkes için sabitlenir — referans: pushify.dev/pushify-yaml.',
      'Rozet statik bir SVG; doğrudan linkleyebilir ya da reponuza kopyalayabilirsiniz.',
    ],
    copy: 'Kopyala',
    copied: 'Kopyalandı',
  },
} as const;

function buildDeployUrl(repo: string, branch?: string): string {
  const qs = new URLSearchParams({ repo });
  if (branch) qs.set('branch', branch);
  return `https://pushify.dev/new?${qs.toString()}`;
}

function CodeBlock({ code, copyLabel, copiedLabel }: { code: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — user can still select the text */
    }
  };
  return (
    <div className="relative rounded-xl border overflow-hidden" style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium border transition-colors"
        style={{ borderColor: 'var(--lp-border)', color: copied ? '#16a34a' : 'var(--lp-muted)', background: 'var(--bg-secondary)' }}
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? copiedLabel : copyLabel}
      </button>
      <pre className="p-4 pr-24 overflow-x-auto text-[12.5px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DeployButtonPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];
  const [repo, setRepo] = useState(EXAMPLE_REPO);
  const [branch, setBranch] = useState('');

  const deployUrl = buildDeployUrl(repo || EXAMPLE_REPO, branch || undefined);
  const markdown = `[![Deploy to Pushify](${BADGE_URL})](${deployUrl})`;
  const html = `<a href="${deployUrl}"><img src="${BADGE_URL}" alt="Deploy to Pushify" height="32"></a>`;

  return (
    <MarketingShell>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      <div className="lp-container max-w-3xl pb-24 space-y-14">
        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>
              {c.previewTitle}
            </h2>
            <div
              className="rounded-xl border p-8 flex items-center justify-center"
              style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)' }}
            >
              <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/badges/deploy.svg" alt="Deploy to Pushify" height={32} width={168} />
              </a>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--lp-ink)' }}>
              {c.snippetTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <input
                type="url"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder={EXAMPLE_REPO}
                className="h-10 px-3 rounded-lg border text-sm outline-none focus:ring-2"
                style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)', color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}
                aria-label="Repository URL"
              />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="h-10 px-3 rounded-lg border text-sm outline-none focus:ring-2 sm:w-36"
                style={{ borderColor: 'var(--lp-border)', background: 'var(--bg-secondary)', color: 'var(--lp-ink)', fontFamily: 'var(--font-mono)' }}
                aria-label="Branch (optional)"
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--lp-muted)' }}>{c.markdownLabel}</p>
              <CodeBlock code={markdown} copyLabel={c.copy} copiedLabel={c.copied} />
              <p className="text-xs font-semibold uppercase tracking-[0.08em] pt-2" style={{ color: 'var(--lp-muted)' }}>{c.htmlLabel}</p>
              <CodeBlock code={html} copyLabel={c.copy} copiedLabel={c.copied} />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>
              {c.paramsTitle}
            </h2>
            <div className="divide-y rounded-xl border" style={{ borderColor: 'var(--lp-border)' }}>
              {c.params.map((p) => (
                <div key={p.name} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-4" style={{ borderColor: 'var(--lp-border)' }}>
                  <code className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}>{p.name}</code>
                  <span className="text-xs uppercase tracking-wide self-center" style={{ color: 'var(--lp-muted)' }}>{p.req}</span>
                  <p className="col-span-2 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.howTitle}</h2>
              <ol className="space-y-3 list-decimal pl-5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                {c.how.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: 'var(--lp-ink)' }}>{c.tipTitle}</h2>
              <ul className="space-y-3 list-disc pl-5 text-sm leading-relaxed" style={{ color: 'var(--lp-body)' }}>
                {c.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          </section>
        </Reveal>
      </div>
    </MarketingShell>
  );
}
