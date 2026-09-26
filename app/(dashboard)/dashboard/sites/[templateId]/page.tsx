'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Check, Rocket } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSiteStudioTemplate } from '@/hooks/useSiteStudio';
import LaunchWizard from '../components/LaunchWizard';
import { STACK_I18N } from '../lib/stacks';
import { EmptyState } from '@/components/EmptyState';
import { MetaLabel, PageHeader, RowList } from '@/components/dashboard/PageKit';

export default function SiteTemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { t } = useTranslation();
  const { data: template, isLoading } = useSiteStudioTemplate(templateId);
  const [showLaunch, setShowLaunch] = useState(false);

  if (isLoading) {
    return (
      <div className="dash-page max-w-7xl space-y-6" role="status" aria-label={t('common', 'loading')}>
        <div className="dash-skeleton h-4 w-40 rounded" />
        <div className="dash-skeleton h-9 w-64 rounded" />
        <div className="dash-skeleton h-16 max-w-2xl rounded" />
        <div className="dash-skeleton h-48 rounded-[14px]" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="dash-page max-w-7xl">
        <EmptyState
          label={t('siteStudio', 'badge')}
          title={t('siteStudio', 'noTemplates')}
          action={{ label: t('siteStudio', 'backToStudio'), href: '/dashboard/sites' }}
        />
      </div>
    );
  }

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-clip">
      <PageHeader
        back={{ href: '/dashboard/sites', label: t('siteStudio', 'badge') }}
        title={template.name}
        badge={
          <span className="badge badge-neutral shrink-0">
            {t('siteStudio', STACK_I18N[template.stack] as 'stackWordpress')}
          </span>
        }
        description={template.tagline}
        meta={[
          <span key="time" className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />~{template.estimatedMinutes} {t('siteStudio', 'minutes')}
          </span>,
          <MetaLabel key="features">
            {template.features.length} {t('siteStudio', 'includedFeatures')}
          </MetaLabel>,
        ]}
        actions={
          <button
            type="button"
            onClick={() => setShowLaunch(true)}
            className="btn btn-primary justify-center flex-1 sm:flex-none"
          >
            <Rocket className="w-4 h-4" />
            {t('siteStudio', 'launchNow')}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {template.longDescription && (
            <section className="dash-card p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{template.longDescription}</p>
            </section>
          )}

          <RowList label={t('siteStudio', 'setupGuide')}>
            {template.setupGuide.map((step, i) => (
              <div key={i} className="dash-row flex gap-3.5 min-w-0">
                <span className="terminal-text text-xs text-[var(--text-muted)] tabular-nums w-5 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{step.title}</p>
                  <p className="text-[13px] mt-1 leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </div>
            ))}
          </RowList>
        </div>

        <aside className="space-y-6 min-w-0">
          <RowList label={t('siteStudio', 'includedFeatures')}>
            {template.features.map((f) => (
              <div key={f} className="dash-row flex items-start gap-2.5 py-2.5! text-[13px] text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--text-primary)]" aria-hidden />
                <span className="min-w-0">{f}</span>
              </div>
            ))}
          </RowList>

          {template.paymentIntegrations && template.paymentIntegrations.length > 0 && (
            <RowList label={t('siteStudio', 'paymentIntegrations')}>
              {template.paymentIntegrations.map((p) => (
                <div key={p.id} className="dash-row min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{p.name}</span>
                    <span className="badge badge-neutral">
                      {p.region === 'tr'
                        ? t('siteStudio', 'paymentRegionRegional')
                        : t('siteStudio', 'paymentRegionGlobal')}
                    </span>
                  </div>
                  <p className="text-[13px] mt-1 text-[var(--text-secondary)]">{p.setupNote}</p>
                </div>
              ))}
            </RowList>
          )}
        </aside>
      </div>

      {showLaunch && (
        <LaunchWizard isOpen={showLaunch} template={template} onClose={() => setShowLaunch(false)} />
      )}
    </div>
  );
}
