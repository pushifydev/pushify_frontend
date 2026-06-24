'use client';

import { useTranslation } from '@/hooks';
import { ComparisonPageView, type ComparisonRow } from '@/components/landing';

export default function VsCoolifyPage() {
  const { t } = useTranslation();

  const rows: ComparisonRow[] = [
    { label: t('homepage', 'rowOpenSource'), pushify: true, competitor: true },
    { label: t('homepage', 'rowSelfHost'), pushify: true, competitor: true },
    { label: t('homepage', 'rowFreeTier'), pushify: true, competitor: true },
    { label: t('homepage', 'rowOwnServers'), pushify: true, competitor: true },
    { label: t('homepage', 'rowDatabaseMgmt'), pushify: true, competitor: true },
    { label: t('homepage', 'rowMarketplace'), pushify: true, competitor: true },
    { label: t('vsCoolify', 'rowManagedCloud'), pushify: true, competitor: true },
    { label: t('vsCoolify', 'rowProvisioning'), pushify: true, competitor: false },
    { label: t('vsCoolify', 'rowOneClickInstall'), pushify: false, competitor: true },
    { label: t('vsCoolify', 'rowCommunity'), pushify: false, competitor: true },
    { label: t('homepage', 'rowAIAssistant'), pushify: true, competitor: false },
    { label: t('homepage', 'rowSiteBuilder'), pushify: true, competitor: false },
    { label: t('vsCoolify', 'rowBilling'), pushify: true, competitor: false },
  ];

  return (
    <ComparisonPageView
      eyebrow={t('vsCoolify', 'eyebrow')}
      h1={t('vsCoolify', 'h1')}
      subtitle={t('vsCoolify', 'subtitle')}
      ctaPrimary={t('vsCoolify', 'ctaPrimary')}
      ctaSecondary={t('vsCoolify', 'ctaSecondary')}
      tldrTitle={t('vsCoolify', 'tldrTitle')}
      tldrBody={t('vsCoolify', 'tldrBody')}
      choosePushifyTitle={t('vsCoolify', 'choosePushifyTitle')}
      pushifyReasons={[
        t('vsCoolify', 'choosePushify1'),
        t('vsCoolify', 'choosePushify2'),
        t('vsCoolify', 'choosePushify3'),
        t('vsCoolify', 'choosePushify4'),
      ]}
      chooseCompetitorTitle={t('vsCoolify', 'chooseCoolifyTitle')}
      competitorReasons={[
        t('vsCoolify', 'chooseCoolify1'),
        t('vsCoolify', 'chooseCoolify2'),
        t('vsCoolify', 'chooseCoolify3'),
      ]}
      tableTitle={t('vsCoolify', 'tableTitle')}
      tableNote={t('vsCoolify', 'tableNote')}
      colFeature={t('homepage', 'comparisonColumnFeature')}
      colPushify={t('homepage', 'colPushify')}
      colCompetitor={t('vsCoolify', 'colCoolify')}
      rows={rows}
      diffTitle={t('vsCoolify', 'diffTitle')}
      diffs={[
        { title: t('vsCoolify', 'diff1Title'), body: t('vsCoolify', 'diff1Body') },
        { title: t('vsCoolify', 'diff2Title'), body: t('vsCoolify', 'diff2Body') },
        { title: t('vsCoolify', 'diff3Title'), body: t('vsCoolify', 'diff3Body') },
      ]}
      faqTitle={t('vsCoolify', 'faqTitle')}
      faqs={[
        { q: t('vsCoolify', 'faq1Q'), a: t('vsCoolify', 'faq1A') },
        { q: t('vsCoolify', 'faq2Q'), a: t('vsCoolify', 'faq2A') },
        { q: t('vsCoolify', 'faq3Q'), a: t('vsCoolify', 'faq3A') },
        { q: t('vsCoolify', 'faq4Q'), a: t('vsCoolify', 'faq4A') },
      ]}
      relatedTitle={t('landing', 'exploreMore')}
      relatedLinks={[
        { href: '/vs/vercel', label: t('vsVercel', 'h1') },
        { href: '/deploy/nextjs', label: 'Deploy Next.js' },
        { href: '/pricing', label: t('landing', 'pricing') },
        { href: '/features', label: t('landing', 'features') },
      ]}
      ctaTitle={t('vsCoolify', 'ctaTitle')}
      ctaBody={t('vsCoolify', 'ctaBody')}
      ctaButton={t('vsCoolify', 'ctaButton')}
    />
  );
}
