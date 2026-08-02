'use client';

import { useTranslation } from '@/hooks';
import { ComparisonPageView, type ComparisonRow } from '@/components/landing';

export default function VsRenderPage() {
  const { t } = useTranslation();

  const rows: ComparisonRow[] = [
    { label: t('homepage', 'rowOpenSource'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSelfHost'), pushify: true, competitor: false },
    { label: t('homepage', 'rowOwnServers'), pushify: true, competitor: false },
    { label: t('homepage', 'rowFreeTier'), pushify: true, competitor: true },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, competitor: true },
    { label: t('vsRender', 'rowZeroOps'), pushify: false, competitor: true },
    { label: t('vsRender', 'rowUnlimitedApps'), pushify: true, competitor: false },
    { label: t('vsRender', 'rowCron'), pushify: true, competitor: true },
    { label: t('vsRender', 'rowAutoscale'), pushify: false, competitor: true },
    { label: t('homepage', 'rowMarketplace'), pushify: true, competitor: false },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSiteBuilder'), pushify: true, competitor: false },
  ];

  return (
    <ComparisonPageView
      eyebrow={t('vsRender', 'eyebrow')}
      h1={t('vsRender', 'h1')}
      subtitle={t('vsRender', 'subtitle')}
      ctaPrimary={t('vsRender', 'ctaPrimary')}
      ctaSecondary={t('vsRender', 'ctaSecondary')}
      tldrTitle={t('vsRender', 'tldrTitle')}
      tldrBody={t('vsRender', 'tldrBody')}
      choosePushifyTitle={t('vsRender', 'choosePushifyTitle')}
      pushifyReasons={[
        t('vsRender', 'choosePushify1'),
        t('vsRender', 'choosePushify2'),
        t('vsRender', 'choosePushify3'),
        t('vsRender', 'choosePushify4'),
      ]}
      chooseCompetitorTitle={t('vsRender', 'chooseRenderTitle')}
      competitorReasons={[
        t('vsRender', 'chooseRender1'),
        t('vsRender', 'chooseRender2'),
        t('vsRender', 'chooseRender3'),
      ]}
      tableTitle={t('vsRender', 'tableTitle')}
      tableNote={t('vsRender', 'tableNote')}
      colFeature={t('homepage', 'comparisonColumnFeature')}
      colPushify={t('homepage', 'colPushify')}
      colCompetitor={t('vsRender', 'colRender')}
      rows={rows}
      diffTitle={t('vsRender', 'diffTitle')}
      diffs={[
        { title: t('vsRender', 'diff1Title'), body: t('vsRender', 'diff1Body') },
        { title: t('vsRender', 'diff2Title'), body: t('vsRender', 'diff2Body') },
        { title: t('vsRender', 'diff3Title'), body: t('vsRender', 'diff3Body') },
      ]}
      faqTitle={t('vsRender', 'faqTitle')}
      faqs={[
        { q: t('vsRender', 'faq1Q'), a: t('vsRender', 'faq1A') },
        { q: t('vsRender', 'faq2Q'), a: t('vsRender', 'faq2A') },
        { q: t('vsRender', 'faq3Q'), a: t('vsRender', 'faq3A') },
        { q: t('vsRender', 'faq4Q'), a: t('vsRender', 'faq4A') },
      ]}
      relatedTitle={t('landing', 'exploreMore')}
      relatedLinks={[
        { href: '/alternatives', label: t('alternatives', 'h1') },
        { href: '/vs/railway', label: t('vsRailway', 'h1') },
        { href: '/vs/coolify', label: t('vsCoolify', 'h1') },
        { href: '/pricing', label: t('landing', 'pricing') },
      ]}
      ctaTitle={t('vsRender', 'ctaTitle')}
      ctaBody={t('vsRender', 'ctaBody')}
      ctaButton={t('vsRender', 'ctaButton')}
    />
  );
}
