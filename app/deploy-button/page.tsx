'use client';

import { useState } from 'react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell, Steps } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';
import { Check, Copy } from 'lucide-react';

const BADGE_URL = 'https://pushify.dev/badges/deploy.svg';
const EXAMPLE_REPO = 'https://github.com/your-org/your-app';

const content = {
  en: {
    label: 'Deploy button',
    title: 'One-click deploys from your README',
    intro: 'Add a Deploy to Pushify button to any repository. Visitors deploy it to their own server, not ours.',
    builderTitle: 'Build your button',
    previewLabel: 'Preview',
    repoLabel: 'Repository URL',
    branchLabel: 'Branch (optional)',
    markdownLabel: 'Markdown',
    htmlLabel: 'HTML',
    paramsEyebrow: 'Reference',
    paramsTitle: 'Parameters',
    params: [
      { name: 'repo', req: 'required', desc: 'HTTPS URL of a public GitHub, GitLab or Bitbucket repository, or any https URL ending in .git.' },
      { name: 'branch', req: 'optional', desc: 'Branch to deploy. Defaults to the repository’s default branch.' },
    ],
    howEyebrow: 'On click',
    howTitle: 'What happens when someone clicks it',
    how: [
      { title: 'Sign in', body: 'The visitor signs in or creates a free account. The link survives the redirect.' },
      { title: 'Wizard, prefilled', body: 'Repository and branch are filled in; framework and commands are auto-detected.' },
      { title: 'Deploy', body: 'They pick one of their servers and deploy, with HTTPS and a zero-downtime switch.' },
    ],
    tipsEyebrow: 'Good to know',
    tipsTitle: 'Details worth knowing',
    tips: [
      { title: 'Private repositories', body: 'The link clones a public URL. Import private repos from a connected GitHub account.' },
      {
        title: 'Pin the setup',
        body: 'A pushify.yaml in the repo pins build settings, cron jobs, volumes and workers.',
        href: '/pushify-yaml',
        link: 'pushify.yaml reference',
      },
      { title: 'A static badge', body: 'The badge is a static SVG. Hotlink it or copy it into your repo.' },
    ],
    copy: 'Copy',
    copied: 'Copied',
  },
  tr: {
    label: 'Deploy butonu',
    title: "README'den tek tıkla deploy",
    intro: 'Herhangi bir repoya Deploy to Pushify butonu ekleyin. Tıklayan kişi bizim değil, kendi sunucusuna deploy eder.',
    builderTitle: 'Butonunuzu oluşturun',
    previewLabel: 'Önizleme',
    repoLabel: 'Repo adresi',
    branchLabel: 'Branch (isteğe bağlı)',
    markdownLabel: 'Markdown',
    htmlLabel: 'HTML',
    paramsEyebrow: 'Referans',
    paramsTitle: 'Parametreler',
    params: [
      { name: 'repo', req: 'zorunlu', desc: 'Herkese açık bir GitHub, GitLab ya da Bitbucket reposunun HTTPS adresi ya da .git ile biten bir https adresi.' },
      { name: 'branch', req: 'isteğe bağlı', desc: 'Deploy edilecek branch. Varsayılan: reponun varsayılan branch’i.' },
    ],
    howEyebrow: 'Tıklayınca',
    howTitle: 'Biri butona tıkladığında ne olur',
    how: [
      { title: 'Giriş', body: 'Ziyaretçi giriş yapar ya da ücretsiz hesap açar. Link yönlendirmeden sonra da korunur.' },
      { title: 'Dolu gelen sihirbaz', body: 'Repo ve branch doldurulmuş gelir; framework ve komutlar otomatik algılanır.' },
      { title: 'Deploy', body: 'Kendi sunucularından birini seçip deploy eder; HTTPS ve kesintisiz geçiş dahil.' },
    ],
    tipsEyebrow: 'Bilmekte fayda var',
    tipsTitle: 'Akılda tutulacak ayrıntılar',
    tips: [
      { title: 'Özel repolar', body: 'Link herkese açık bir adresi klonlar. Özel repoları bağlı bir GitHub hesabından içe aktarın.' },
      {
        title: 'Kurulumu sabitleyin',
        body: 'Repodaki bir pushify.yaml build ayarlarını, cron, volume ve worker’ları sabitler.',
        href: '/pushify-yaml',
        link: 'pushify.yaml referansı',
      },
      { title: 'Statik bir rozet', body: 'Rozet statik bir SVG. Doğrudan linkleyin ya da reponuza kopyalayın.' },
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

/** A CodePanel-style block (same .hp-code styles) with a copy button in its title bar. */
function CopyPanel({ title, code, copyLabel, copiedLabel }: { title: string; code: string; copyLabel: string; copiedLabel: string }) {
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
    <div className="hp-code">
      <div className="hp-code-title flex items-center justify-between gap-3">
        <span>{title}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border transition-colors"
          style={{ borderColor: 'var(--hp-line-strong)', color: copied ? 'var(--hp-live)' : 'var(--hp-ink)' }}
          aria-label={`${copyLabel} ${title}`}
        >
          {copied ? <Check className="w-3 h-3" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
          <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <pre>
        <code className="whitespace-pre-wrap break-all">{code}</code>
      </pre>
    </div>
  );
}

const inputClass = 'h-11 w-full min-w-0 px-4 rounded-full border text-sm';
const inputStyle = {
  borderColor: 'var(--hp-line-strong)',
  background: 'var(--hp-card)',
  color: 'var(--hp-ink)',
  fontFamily: 'var(--font-mono)',
} as const;

export default function DeployButtonPage() {
  const { locale } = useTranslation();
  const c = content[locale === 'tr' ? 'tr' : 'en'];
  const [repo, setRepo] = useState(EXAMPLE_REPO);
  const [branch, setBranch] = useState('');

  const deployUrl = buildDeployUrl(repo || EXAMPLE_REPO, branch || undefined);
  const markdown = `[![Deploy to Pushify](${BADGE_URL})](${deployUrl})`;
  const html = `<a href="${deployUrl}"><img src="${BADGE_URL}" alt="Deploy to Pushify" height="32"></a>`;

  return (
    <MarketingShell noPad>
      <MarketingPageHero label={c.label} title={c.title} description={c.intro} />

      {/* The builder is the page's object: a live preview, two fields, and the snippets they produce. */}
      <section className="pb-20 md:pb-24">
        <div className="lp-container max-w-3xl">
          <div className="hp-code">
            <div className="hp-code-title">{c.builderTitle}</div>
            <div className="p-8 md:p-10 flex flex-col items-center gap-5">
              <p className="hp-eyebrow">{c.previewLabel}</p>
              <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/badges/deploy.svg" alt="Deploy to Pushify" height={32} width={168} />
              </a>
            </div>
            <div
              className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_10rem] gap-4 border-t"
              style={{ borderColor: 'var(--hp-line)' }}
            >
              <label className="block min-w-0">
                <span className="hp-eyebrow block mb-2">{c.repoLabel}</span>
                <input
                  type="url"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder={EXAMPLE_REPO}
                  className={inputClass}
                  style={inputStyle}
                />
              </label>
              <label className="block min-w-0">
                <span className="hp-eyebrow block mb-2">{c.branchLabel}</span>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className={inputClass}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <CopyPanel title={c.markdownLabel} code={markdown} copyLabel={c.copy} copiedLabel={c.copied} />
            <CopyPanel title={c.htmlLabel} code={html} copyLabel={c.copy} copiedLabel={c.copied} />
          </div>
        </div>
      </section>

      <MSection eyebrow={c.paramsEyebrow} title={c.paramsTitle} width="narrow">
        <dl className="border-t" style={{ borderColor: 'var(--hp-line)' }}>
          {c.params.map((p) => (
            <div
              key={p.name}
              className="grid grid-cols-1 sm:grid-cols-[11rem_minmax(0,1fr)] gap-x-6 gap-y-2 py-6 border-b"
              style={{ borderColor: 'var(--hp-line)' }}
            >
              <dt>
                <code className="text-[15px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--hp-ink)' }}>
                  {p.name}
                </code>
                <span className="hp-eyebrow block mt-1">{p.req}</span>
              </dt>
              <dd className="text-[15px] leading-relaxed" style={{ color: 'var(--hp-body)' }}>
                {p.desc}
              </dd>
            </div>
          ))}
        </dl>
      </MSection>

      <MSection eyebrow={c.howEyebrow} title={c.howTitle}>
        <Steps items={c.how.map((s) => ({ title: s.title, body: s.body }))} />
      </MSection>

      <MSection eyebrow={c.tipsEyebrow} title={c.tipsTitle}>
        <RuleGrid cols={3}>
          {c.tips.map((tip) => (
            <RuleCell
              key={tip.title}
              title={tip.title}
              href={'href' in tip ? tip.href : undefined}
              linkLabel={'link' in tip ? tip.link : undefined}
            >
              {tip.body}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>
    </MarketingShell>
  );
}
