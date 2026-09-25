'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ExternalLink, Book, Cpu, HardDrive, Database,
  Tag, Loader2, PackageOpen, Rocket,
  FileText, Zap, Activity, Pen, Layers,
  GitBranch, Container, BarChart3, Package,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useMarketplaceTemplate } from '@/hooks/useMarketplace';
import DeployModal from '../components/DeployModal';
import { LongDescription } from '@/components/LongDescription';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText, Zap, Activity, Pen, Layers,
  HardDrive, GitBranch, Container, BarChart3,
  Database, Package,
};

export default function TemplateDetailPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { t } = useTranslation();
  const { data: template, isLoading } = useMarketplaceTemplate(templateId);
  const [showDeploy, setShowDeploy] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-32">
        <PackageOpen className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-muted)' }}>{t('marketplace', 'noTemplates')}</p>
      </div>
    );
  }

  const IconComponent = ICON_MAP[template.icon] || Package;

  return (
    <div className="dash-page max-w-4xl space-y-8 animate-slide-in min-w-0 overflow-x-hidden pb-8">
      {/* Back */}
      <Link
        href="/dashboard/marketplace"
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t('marketplace', 'backToMarketplace')}
      </Link>

      {/* Hero */}
      <div
        className="rounded-xl p-5 sm:p-8"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="relative flex flex-col sm:flex-row items-start gap-5 min-w-0">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <IconComponent className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h1
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
              >
                {template.name}
              </h1>
              <span
                className="text-[11px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border border-[var(--border-default)]"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-label)' }}
              >
                {template.category}
              </span>
            </div>

            <div className="mb-5">
              <LongDescription text={template.longDescription || template.description} />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setShowDeploy(true)}
                className="btn btn-primary px-5 py-2.5"
              >
                <Rocket className="w-4 h-4" />
                {t('marketplace', 'deploy')}
              </button>

              <a
                href={template.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('marketplace', 'website')}
              </a>

              <a
                href={template.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <Book className="w-3.5 h-3.5" />
                {t('marketplace', 'documentation')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requirements */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {t('marketplace', 'requirements')}
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
              <span className="flex items-center gap-2 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                <Cpu className="w-3.5 h-3.5" />
                {t('marketplace', 'minMemory')}
              </span>
              <span className="sm:text-right" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {template.minMemoryMb} MB
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
              <span className="flex items-center gap-2 shrink-0" style={{ color: 'var(--text-secondary)' }}>
                <HardDrive className="w-3.5 h-3.5" />
                {t('marketplace', 'minDisk')}
              </span>
              <span className="sm:text-right" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {template.minDiskGb} GB
              </span>
            </div>
            {template.requiresDatabase && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
                <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Database className="w-3.5 h-3.5" />
                  {t('marketplace', 'requiresDatabase')}
                </span>
                <span style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  {template.requiresDatabase.type}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Details
          </h3>
          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between text-sm gap-y-1">
              <span className="shrink-0" style={{ color: 'var(--text-secondary)' }}>{t('marketplace', 'dockerImage')}</span>
              <span className="break-all sm:text-right sm:max-w-[60%]" style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                {template.dockerImage}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>{t('marketplace', 'version')}</span>
              <span className="sm:text-right" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {template.appVersion}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Port</span>
              <span className="sm:text-right" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                {template.port}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            <Tag className="w-3 h-3" />
            {t('marketplace', 'tags')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{
                  background: 'var(--hover-overlay-md)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Environment Variables Preview */}
      {template.envVars.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {t('marketplace', 'configureEnvVars')}
          </h3>
          <div className="space-y-2">
            {template.envVars.map((envVar) => (
              <div
                key={envVar.key}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2 px-3 rounded-lg min-w-0"
                style={{ background: 'var(--hover-overlay)' }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {envVar.key}
                </span>
                <div className="flex items-center gap-2">
                  {envVar.generate && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                      background: 'var(--dash-accent-bg)', color: 'var(--accent-cyan)',
                    }}>auto</span>
                  )}
                  {envVar.required && !envVar.generate && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                      background: 'rgba(239,68,68,0.1)', color: '#f87171',
                    }}>{t('marketplace', 'required')}</span>
                  )}
                  {!envVar.required && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {t('marketplace', 'optional')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      <DeployModal isOpen={showDeploy} template={template} onClose={() => setShowDeploy(false)} />
    </div>
  );
}
