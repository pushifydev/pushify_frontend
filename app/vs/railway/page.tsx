'use client';

import { useTranslation } from '@/hooks';
import { ComparisonPageView, type ComparisonRow } from '@/components/landing';

export default function VsRailwayPage() {
  const { t } = useTranslation();

  const rows: ComparisonRow[] = [
    { label: t('homepage', 'rowOpenSource'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSelfHost'), pushify: true, competitor: false },
    { label: t('homepage', 'rowOwnServers'), pushify: true, competitor: false },
    { label: t('homepage', 'rowFreeTier'), pushify: true, competitor: false },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, competitor: true },
    { label: t('vsRailway', 'rowFlatPricing'), pushify: true, competitor: false },
    { label: t('vsRailway', 'rowUsageBilling'), pushify: false, competitor: true },
    { label: t('vsRailway', 'rowZeroOps'), pushify: false, competitor: true },
    { label: t('vsRailway', 'rowPreviewEnvs'), pushify: true, competitor: true },
    { label: t('homepage', 'rowMarketplace'), pushify: true, competitor: true },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSiteBuilder'), pushify: true, competitor: false },
  ];

  return (
    <ComparisonPageView
      eyebrow={t('vsRailway', 'eyebrow')}
      h1={t('vsRailway', 'h1')}
      subtitle={t('vsRailway', 'subtitle')}
      ctaPrimary={t('vsRailway', 'ctaPrimary')}
      ctaSecondary={t('vsRailway', 'ctaSecondary')}
      tldrTitle={t('vsRailway', 'tldrTitle')}
      tldrBody={t('vsRailway', 'tldrBody')}
      choosePushifyTitle={t('vsRailway', 'choosePushifyTitle')}
      pushifyReasons={[
        t('vsRailway', 'choosePushify1'),
        t('vsRailway', 'choosePushify2'),
        t('vsRailway', 'choosePushify3'),
        t('vsRailway', 'choosePushify4'),
      ]}
      chooseCompetitorTitle={t('vsRailway', 'chooseRailwayTitle')}
      competitorReasons={[
        t('vsRailway', 'chooseRailway1'),
        t('vsRailway', 'chooseRailway2'),
        t('vsRailway', 'chooseRailway3'),
      ]}
      tableTitle={t('vsRailway', 'tableTitle')}
      tableNote={t('vsRailway', 'tableNote')}
      colFeature={t('homepage', 'comparisonColumnFeature')}
      colPushify={t('homepage', 'colPushify')}
      colCompetitor={t('vsRailway', 'colRailway')}
      rows={rows}
      diffTitle={t('vsRailway', 'diffTitle')}
      diffs={[
        { title: t('vsRailway', 'diff1Title'), body: t('vsRailway', 'diff1Body') },
        { title: t('vsRailway', 'diff2Title'), body: t('vsRailway', 'diff2Body') },
        { title: t('vsRailway', 'diff3Title'), body: t('vsRailway', 'diff3Body') },
      ]}
      faqTitle={t('vsRailway', 'faqTitle')}
      faqs={[
        { q: t('vsRailway', 'faq1Q'), a: t('vsRailway', 'faq1A') },
        { q: t('vsRailway', 'faq2Q'), a: t('vsRailway', 'faq2A') },
        { q: t('vsRailway', 'faq3Q'), a: t('vsRailway', 'faq3A') },
        { q: t('vsRailway', 'faq4Q'), a: t('vsRailway', 'faq4A') },
      ]}
      relatedTitle={t('landing', 'exploreMore')}
      relatedLinks={[
        { href: '/alternatives', label: t('alternatives', 'h1') },
        { href: '/vs/render', label: t('vsRender', 'h1') },
        { href: '/vs/heroku', label: t('vsHeroku', 'h1') },
        { href: '/pricing', label: t('landing', 'pricing') },
      ]}
      ctaTitle={t('vsRailway', 'ctaTitle')}
      ctaBody={t('vsRailway', 'ctaBody')}
      ctaButton={t('vsRailway', 'ctaButton')}
    />
  );
}
