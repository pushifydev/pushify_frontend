'use client';

import { useTranslation } from '@/hooks';
import { ComparisonPageView, type ComparisonRow } from '@/components/landing';

export default function VsVercelPage() {
  const { t } = useTranslation();

  const rows: ComparisonRow[] = [
    { label: t('homepage', 'rowOpenSource'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSelfHost'), pushify: true, competitor: false },
    { label: t('homepage', 'rowOwnServers'), pushify: true, competitor: false },
    { label: t('homepage', 'rowFreeTier'), pushify: true, competitor: true },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, competitor: true },
    { label: t('vsVercel', 'rowEdgeNetwork'), pushify: false, competitor: true },
    { label: t('vsVercel', 'rowServerless'), pushify: false, competitor: true },
    { label: t('vsVercel', 'rowPredictablePricing'), pushify: true, competitor: false },
    { label: t('vsVercel', 'rowNoLockIn'), pushify: true, competitor: false },
    { label: t('homepage', 'rowMarketplace'), pushify: true, competitor: false },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSiteBuilder'), pushify: true, competitor: false },
  ];

  return (
    <ComparisonPageView
      eyebrow={t('vsVercel', 'eyebrow')}
      h1={t('vsVercel', 'h1')}
      subtitle={t('vsVercel', 'subtitle')}
      ctaPrimary={t('vsVercel', 'ctaPrimary')}
      ctaSecondary={t('vsVercel', 'ctaSecondary')}
      tldrTitle={t('vsVercel', 'tldrTitle')}
      tldrBody={t('vsVercel', 'tldrBody')}
      choosePushifyTitle={t('vsVercel', 'choosePushifyTitle')}
      pushifyReasons={[
        t('vsVercel', 'choosePushify1'),
        t('vsVercel', 'choosePushify2'),
        t('vsVercel', 'choosePushify3'),
        t('vsVercel', 'choosePushify4'),
      ]}
      chooseCompetitorTitle={t('vsVercel', 'chooseVercelTitle')}
      competitorReasons={[
        t('vsVercel', 'chooseVercel1'),
        t('vsVercel', 'chooseVercel2'),
        t('vsVercel', 'chooseVercel3'),
      ]}
      tableTitle={t('vsVercel', 'tableTitle')}
      tableNote={t('vsVercel', 'tableNote')}
      colFeature={t('homepage', 'comparisonColumnFeature')}
      colPushify={t('homepage', 'colPushify')}
      colCompetitor={t('vsVercel', 'colVercel')}
      rows={rows}
      diffTitle={t('vsVercel', 'diffTitle')}
      diffs={[
        { title: t('vsVercel', 'diff1Title'), body: t('vsVercel', 'diff1Body') },
        { title: t('vsVercel', 'diff2Title'), body: t('vsVercel', 'diff2Body') },
        { title: t('vsVercel', 'diff3Title'), body: t('vsVercel', 'diff3Body') },
      ]}
      faqTitle={t('vsVercel', 'faqTitle')}
      faqs={[
        { q: t('vsVercel', 'faq1Q'), a: t('vsVercel', 'faq1A') },
        { q: t('vsVercel', 'faq2Q'), a: t('vsVercel', 'faq2A') },
        { q: t('vsVercel', 'faq3Q'), a: t('vsVercel', 'faq3A') },
        { q: t('vsVercel', 'faq4Q'), a: t('vsVercel', 'faq4A') },
      ]}
      relatedTitle={t('landing', 'exploreMore')}
      relatedLinks={[
        { href: '/vs/coolify', label: t('vsCoolify', 'h1') },
        { href: '/deploy/nextjs', label: 'Deploy Next.js' },
        { href: '/pricing', label: t('landing', 'pricing') },
        { href: '/open-source', label: t('landing', 'openSource') },
      ]}
      ctaTitle={t('vsVercel', 'ctaTitle')}
      ctaBody={t('vsVercel', 'ctaBody')}
      ctaButton={t('vsVercel', 'ctaButton')}
    />
  );
}
