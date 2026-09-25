'use client';

import { ArrowUpRight, Scale, Server, PackageOpen, GitPullRequest } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { MarketingPageHero } from './MarketingShell';
import { MSection, RuleGrid, RuleCell, CodePanel } from './MarketingKit';

/**
 * The repositories that exist and are public. `pushifydev/pushify` is a 404, so it is not here,
 * and there are no star or fork counts: a row with no numbers in it reads as something that failed
 * to load. "Community driven" / "powered by the community" were dropped — nothing on the page could
 * back them up.
 */
const REPOS = ['pushify_backend', 'pushify_frontend', 'pushify_cli'] as const;

const INSTALL =
  'curl -fsSL https://raw.githubusercontent.com/pushifydev/pushify_backend/master/selfhost/install.sh | bash';
const SELF_HOSTING_DOC = 'https://github.com/pushifydev/pushify_backend/blob/master/docs/SELF_HOSTING.md';

const copy = {
  en: {
    title: 'Built in the open',
    description: 'The API, dashboard and CLI are MIT-licensed on GitHub. Read it, fork it, or run it yourself.',
    selfNote: 'Clones the code, generates secrets and starts everything with Docker Compose. Run it again to update.',
    selfDoc: 'Self-hosting guide',
    reposEyebrow: 'Repositories',
    reposTitle: 'Three repositories, one platform.',
    repos: {
      pushify_backend: 'The REST API, the deploy worker and the self-host installer.',
      pushify_frontend: 'The dashboard and this website, built with Next.js.',
      pushify_cli: 'The `pushify` command: deploy, tail logs, sync env vars.',
    },
    viewRepo: 'View repository',
    allRepos: 'All repositories',
    principlesEyebrow: 'What that means',
    principlesTitle: 'Nothing held back.',
    principles: [
      { icon: Scale, title: 'MIT licensed', body: 'Use, change and ship it, commercially too. Keep the licence notice.' },
      { icon: Server, title: 'Self-hostable', body: 'Dashboard, API and worker on your server. No pushify.dev account.' },
      { icon: PackageOpen, title: 'No vendor lock-in', body: 'Your apps are plain Docker containers. Leaving means taking them with you.' },
      { icon: GitPullRequest, title: 'Open to contributions', body: 'Pull requests welcome. Each repository’s CONTRIBUTING.md covers setup.' },
    ],
  },
  tr: {
    title: 'Açık geliştiriliyor',
    description: 'API, panel ve CLI GitHub’da MIT lisansıyla. Okuyun, fork’layın ya da kendiniz çalıştırın.',
    selfNote: 'Kodu klonlar, gizli anahtarları üretir, her şeyi Docker Compose ile başlatır. Güncellemek için yeniden çalıştırın.',
    selfDoc: 'Self-host rehberi',
    reposEyebrow: 'Depolar',
    reposTitle: 'Üç depo, tek platform.',
    repos: {
      pushify_backend: 'REST API, deploy worker’ı ve self-host kurulum betiği.',
      pushify_frontend: 'Panel ve bu web sitesi; Next.js ile yazıldı.',
      pushify_cli: '`pushify` komutu: deploy, log izleme, ortam değişkeni eşitleme.',
    },
    viewRepo: 'Depoyu görüntüle',
    allRepos: 'Tüm depolar',
    principlesEyebrow: 'Bunun anlamı',
    principlesTitle: 'Saklı hiçbir şey yok.',
    principles: [
      { icon: Scale, title: 'MIT lisanslı', body: 'Kullanın, değiştirin, dağıtın; ticari olarak da. Lisans notu kalsın yeter.' },
      { icon: Server, title: 'Self-host edilebilir', body: 'Panel, API ve worker sizin sunucunuzda. pushify.dev hesabı gerekmez.' },
      { icon: PackageOpen, title: 'Satıcı bağımlılığı yok', body: 'Uygulamalarınız sıradan Docker konteynerleri. Ayrılırken yanınızda götürürsünüz.' },
      { icon: GitPullRequest, title: 'Katkıya açık', body: 'Pull request’lere açığız. Her depodaki CONTRIBUTING.md kurulumu anlatır.' },
    ],
  },
};

export function OpenSourceSection() {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];

  return (
    <>
      <MarketingPageHero label={t('landing', 'openSourceBadge')} title={c.title} description={c.description} />

      {/* The one object on this page: the command that runs the whole platform on your server. */}
      <div id="self-host" className="lp-container max-w-4xl pb-20 md:pb-28">
        <CodePanel title="Self-host · install.sh">{INSTALL}</CodePanel>
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <p className="text-[0.95rem]" style={{ color: 'var(--hp-body)' }}>
            {c.selfNote}
          </p>
          <a
            href={SELF_HOSTING_DOC}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-cta-ghost shrink-0 self-start sm:self-auto"
          >
            {c.selfDoc}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <MSection id="open-source" eyebrow={c.reposEyebrow} title={c.reposTitle}>
        <RuleGrid cols={3}>
          {REPOS.map((repo) => (
            <RuleCell
              key={repo}
              title={<span className="hp-mono break-all">pushifydev/{repo}</span>}
              href={`https://github.com/pushifydev/${repo}`}
              linkLabel={c.viewRepo}
              external
            >
              {c.repos[repo]}
            </RuleCell>
          ))}
        </RuleGrid>
        <div className="mt-8">
          <a href="https://github.com/pushifydev" target="_blank" rel="noopener noreferrer" className="lp-cta-ghost">
            {c.allRepos}
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </MSection>

      <MSection eyebrow={c.principlesEyebrow} title={c.principlesTitle}>
        <RuleGrid cols={4}>
          {c.principles.map((p) => (
            <RuleCell key={p.title} icon={p.icon} title={p.title}>
              {p.body}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>
    </>
  );
}
