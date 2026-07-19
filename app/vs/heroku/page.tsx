'use client';

import { useTranslation } from '@/hooks';
import { ComparisonPageView, type ComparisonRow } from '@/components/landing';

export default function VsHerokuPage() {
  const { t } = useTranslation();

  const rows: ComparisonRow[] = [
    { label: t('homepage', 'rowOpenSource'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSelfHost'), pushify: true, competitor: false },
    { label: t('homepage', 'rowFreeTier'), pushify: true, competitor: false },
    { label: t('vsHeroku', 'rowGitPush'), pushify: true, competitor: true },
    { label: t('homepage', 'rowOwnServers'), pushify: true, competitor: false },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, competitor: true },
    { label: t('vsHeroku', 'rowFlatPricing'), pushify: true, competitor: false },
    { label: t('vsHeroku', 'rowZeroOps'), pushify: false, competitor: true },
    { label: t('vsHeroku', 'rowAddonEco'), pushify: false, competitor: true },
    { label: t('homepage', 'rowMarketplace'), pushify: true, competitor: true },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSiteBuilder'), pushify: true, competitor: false },
  ];

  return (
    <ComparisonPageView
      eyebrow={t('vsHeroku', 'eyebrow')}
      h1={t('vsHeroku', 'h1')}
      subtitle={t('vsHeroku', 'subtitle')}
      ctaPrimary={t('vsHeroku', 'ctaPrimary')}
      ctaSecondary={t('vsHeroku', 'ctaSecondary')}
      tldrTitle={t('vsHeroku', 'tldrTitle')}
      tldrBody={t('vsHeroku', 'tldrBody')}
      choosePushifyTitle={t('vsHeroku', 'choosePushifyTitle')}
      pushifyReasons={[
        t('vsHeroku', 'choosePushify1'),
        t('vsHeroku', 'choosePushify2'),
        t('vsHeroku', 'choosePushify3'),
        t('vsHeroku', 'choosePushify4'),
      ]}
      chooseCompetitorTitle={t('vsHeroku', 'chooseHerokuTitle')}
      competitorReasons={[
        t('vsHeroku', 'chooseHeroku1'),
        t('vsHeroku', 'chooseHeroku2'),
        t('vsHeroku', 'chooseHeroku3'),
      ]}
      tableTitle={t('vsHeroku', 'tableTitle')}
      tableNote={t('vsHeroku', 'tableNote')}
      colFeature={t('homepage', 'comparisonColumnFeature')}
      colPushify={t('homepage', 'colPushify')}
      colCompetitor={t('vsHeroku', 'colHeroku')}
      rows={rows}
      diffTitle={t('vsHeroku', 'diffTitle')}
      diffs={[
        { title: t('vsHeroku', 'diff1Title'), body: t('vsHeroku', 'diff1Body') },
        { title: t('vsHeroku', 'diff2Title'), body: t('vsHeroku', 'diff2Body') },
        { title: t('vsHeroku', 'diff3Title'), body: t('vsHeroku', 'diff3Body') },
      ]}
      faqTitle={t('vsHeroku', 'faqTitle')}
      faqs={[
        { q: t('vsHeroku', 'faq1Q'), a: t('vsHeroku', 'faq1A') },
        { q: t('vsHeroku', 'faq2Q'), a: t('vsHeroku', 'faq2A') },
        { q: t('vsHeroku', 'faq3Q'), a: t('vsHeroku', 'faq3A') },
        { q: t('vsHeroku', 'faq4Q'), a: t('vsHeroku', 'faq4A') },
      ]}
      relatedTitle={t('landing', 'exploreMore')}
      relatedLinks={[
        { href: '/alternatives', label: t('alternatives', 'h1') },
        { href: '/vs/coolify', label: t('vsCoolify', 'h1') },
        { href: '/vs/vercel', label: t('vsVercel', 'h1') },
        { href: '/pricing', label: t('landing', 'pricing') },
      ]}
      ctaTitle={t('vsHeroku', 'ctaTitle')}
      ctaBody={t('vsHeroku', 'ctaBody')}
      ctaButton={t('vsHeroku', 'ctaButton')}
    />
  );
}
