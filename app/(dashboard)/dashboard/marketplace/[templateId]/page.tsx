'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, Book, Rocket, Cpu, Database } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceTemplate } from '@/hooks/useMarketplace';
import DeployModal from '../components/DeployModal';
import { LongDescription } from '@/components/LongDescription';
import { EmptyState } from '@/components/EmptyState';
import { MetaLabel, PageHeader, RowList } from '@/components/dashboard/PageKit';

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { t, locale } = useTranslation();
  const { data: template, isLoading } = useMarketplaceTemplate(templateId);
  const [showDeploy, setShowDeploy] = useState(false);
  const copy = {
    details: locale === 'tr' ? 'Detaylar' : 'Details',
    auto: locale === 'tr' ? 'otomatik' : 'auto',
  };

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
          label={t('marketplace', 'title')}
          title={t('marketplace', 'noTemplates')}
          action={{ label: t('marketplace', 'backToMarketplace'), href: '/dashboard/marketplace' }}
        />
      </div>
    );
  }

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in overflow-x-clip">
      <PageHeader
        back={{ href: '/dashboard/marketplace', label: t('marketplace', 'title') }}
        title={template.name}
        badge={<span className="badge badge-neutral shrink-0">{template.category}</span>}
        meta={[
          <MetaLabel key="v">v{template.appVersion}</MetaLabel>,
          <span key="mem" className="inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 shrink-0" aria-hidden />
            {template.minMemoryMb} MB
          </span>,
          template.requiresDatabase ? (
            <span key="db" className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {template.requiresDatabase.type}
            </span>
          ) : null,
        ]}
        actions={
          <>
            <a
              href={template.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary justify-center flex-1 sm:flex-none"
            >
              <Book className="w-4 h-4" />
              {t('marketplace', 'documentation')}
            </a>
            <a
              href={template.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary justify-center flex-1 sm:flex-none"
            >
              <ExternalLink className="w-4 h-4" />
              {t('marketplace', 'website')}
            </a>
            <button
              type="button"
              onClick={() => setShowDeploy(true)}
              className="btn btn-primary justify-center flex-1 sm:flex-none"
            >
              <Rocket className="w-4 h-4" />
              {t('marketplace', 'deploy')}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <section className="dash-card p-5 sm:p-6 min-w-0">
            <LongDescription text={template.longDescription || template.description} />
          </section>

          {template.envVars.length > 0 && (
            <RowList label={t('marketplace', 'configureEnvVars')}>
              {template.envVars.map((envVar) => (
                <div key={envVar.key} className="dash-row flex items-center justify-between gap-3 min-w-0">
                  <span className="terminal-text text-[13px] text-[var(--text-primary)] truncate">{envVar.key}</span>
                  {envVar.generate ? (
                    <span className="badge badge-neutral shrink-0">{copy.auto}</span>
                  ) : envVar.required ? (
                    <span className="badge badge-warning shrink-0">{t('marketplace', 'required')}</span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] shrink-0">{t('marketplace', 'optional')}</span>
                  )}
                </div>
              ))}
            </RowList>
          )}
        </div>

        <aside className="space-y-6 min-w-0">
          <section className="space-y-3">
            <h2 className="dash-section-label">{t('marketplace', 'requirements')}</h2>
            <div className="dash-card px-4 py-1.5">
              <div className="dash-kv">
                <span>{t('marketplace', 'minMemory')}</span>
                <span>{template.minMemoryMb} MB</span>
              </div>
              <div className="dash-kv">
                <span>{t('marketplace', 'minDisk')}</span>
                <span>{template.minDiskGb} GB</span>
              </div>
              {template.requiresDatabase && (
                <div className="dash-kv">
                  <span>{t('marketplace', 'requiresDatabase')}</span>
                  <span>{template.requiresDatabase.type}</span>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="dash-section-label">{copy.details}</h2>
            <div className="dash-card px-4 py-1.5">
              <div className="dash-kv">
                <span>{t('marketplace', 'dockerImage')}</span>
                <span className="break-all">{template.dockerImage}</span>
              </div>
              <div className="dash-kv">
                <span>{t('marketplace', 'version')}</span>
                <span>{template.appVersion}</span>
              </div>
              <div className="dash-kv">
                <span>Port</span>
                <span>{template.port}</span>
              </div>
            </div>
          </section>

          {template.tags.length > 0 && (
            <section className="space-y-3">
              <h2 className="dash-section-label">{t('marketplace', 'tags')}</h2>
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span key={tag} className="badge badge-neutral terminal-text">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <DeployModal isOpen={showDeploy} template={template} onClose={() => setShowDeploy(false)} />
    </div>
  );
}
