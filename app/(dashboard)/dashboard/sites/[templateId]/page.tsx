'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Check, Loader2, CreditCard, ListChecks } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSiteStudioTemplate } from '@/hooks/useSiteStudio';
import LaunchWizard from '../components/LaunchWizard';
import { STACK_I18N } from '../lib/stacks';

export default function SiteTemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { t } = useTranslation();
  const { data: template, isLoading } = useSiteStudioTemplate(templateId);
  const [showLaunch, setShowLaunch] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--ss-muted)' }} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-32">
        <p className="ss-muted">{t('siteStudio', 'noTemplates')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-slide-in">
      <Link href="/dashboard/sites" className="ss-btn-ghost mb-10 -ml-1">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {t('siteStudio', 'backToStudio')}
      </Link>

      {/* Hero */}
      <header className="pb-10 mb-10 border-b border-[var(--ss-line)]">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="ss-tag">
            {t('siteStudio', STACK_I18N[template.stack] as 'stackWordpress')}
          </span>
        </div>
        <p className="ss-eyebrow mb-2">{template.tagline}</p>
        <h1 className="ss-display text-[2rem] sm:text-[2.25rem] leading-[1.15] mb-5">
          {template.name}
        </h1>
        <p className="ss-lead mb-8">{template.longDescription}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="ss-stat">
            <Clock className="w-4 h-4" strokeWidth={1.75} />
            ~{template.estimatedMinutes} {t('siteStudio', 'minutes')}
          </span>
          <button type="button" onClick={() => setShowLaunch(true)} className="ss-btn-primary">
            {t('siteStudio', 'launchNow')}
          </button>
        </div>
      </header>

      <div className="space-y-10">
        <section className="ss-card p-6 sm:p-8">
          <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--ss-ink)', letterSpacing: '-0.01em' }}>
            {t('siteStudio', 'includedFeatures')}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {template.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--ss-body)' }}>
                <Check
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: 'var(--ss-ink)' }}
                  strokeWidth={2}
                />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {template.paymentIntegrations && template.paymentIntegrations.length > 0 && (
          <section className="ss-card p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4" style={{ color: 'var(--ss-muted)' }} strokeWidth={1.75} />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--ss-ink)' }}>
                {t('siteStudio', 'paymentIntegrations')}
              </h2>
            </div>
            <ul className="space-y-4">
              {template.paymentIntegrations.map((p, i) => (
                <li
                  key={p.id}
                  style={{
                    borderTop: i > 0 ? '1px solid var(--ss-line)' : undefined,
                    paddingTop: i > 0 ? '1rem' : undefined,
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--ss-ink)' }}>
                      {p.name}
                    </span>
                    <span className="ss-tag">
                      {p.region === 'tr'
                        ? t('siteStudio', 'paymentRegionRegional')
                        : t('siteStudio', 'paymentRegionGlobal')}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--ss-muted)' }}>
                    {p.setupNote}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="ss-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <ListChecks className="w-4 h-4" style={{ color: 'var(--ss-muted)' }} strokeWidth={1.75} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--ss-ink)' }}>
              {t('siteStudio', 'setupGuide')}
            </h2>
          </div>
          <ol className="space-y-6">
            {template.setupGuide.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{
                    color: 'var(--ss-btn-fg)',
                    background: 'var(--ss-btn)',
                    fontFamily: 'var(--ss-font)',
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--ss-ink)' }}>
                    {step.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ss-muted)' }}>
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {showLaunch && (
        <LaunchWizard isOpen={showLaunch} template={template} onClose={() => setShowLaunch(false)} />
      )}
    </div>
  );
}
