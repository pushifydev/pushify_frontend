'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { SiteStudioTemplate } from '@/lib/api';
import { useTranslation } from '@/hooks';
import { STACK_I18N } from '../lib/stacks';

interface SiteTemplateCardProps {
  template: SiteStudioTemplate;
  index?: number;
  launchLabel: string;
  categoryLabel: string;
}

/** Accent-tinted mini mock of a web page — gives each template a distinct visual feel. */
function TemplateThumb({ accent }: { accent: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg mb-5"
      style={{
        height: 128,
        background: `linear-gradient(135deg, ${accent}14, ${accent}05)`,
        border: '1px solid var(--ss-line)',
      }}
      aria-hidden
    >
      <div
        className="absolute inset-x-0 top-0 h-5 flex items-center gap-1 px-2.5"
        style={{ background: `${accent}1a` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        <span className="ml-auto w-8 h-1.5 rounded-full" style={{ background: `${accent}66` }} />
        <span className="w-5 h-1.5 rounded-full" style={{ background: `${accent}40` }} />
      </div>
      <div className="absolute inset-x-0 top-8 flex flex-col items-center gap-1.5 px-6">
        <span className="w-3/5 h-2.5 rounded-full" style={{ background: `${accent}cc` }} />
        <span className="w-2/5 h-1.5 rounded-full" style={{ background: `${accent}55` }} />
        <span className="mt-1 w-12 h-3.5 rounded-full" style={{ background: accent }} />
      </div>
      <div className="absolute inset-x-0 bottom-2.5 flex gap-1.5 px-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="flex-1 h-7 rounded"
            style={{ background: `${accent}1f`, border: `1px solid ${accent}33` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SiteTemplateCard({
  template,
  launchLabel,
  categoryLabel,
}: SiteTemplateCardProps) {
  const { t } = useTranslation();
  const stackLabel = t('siteStudio', STACK_I18N[template.stack] as 'stackWordpress');

  return (
    <Link href={`/dashboard/sites/${template.id}`} className="group block h-full">
      <article className="ss-card h-full p-6 flex flex-col">
        <TemplateThumb accent={template.accent} />
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="ss-tag">{stackLabel}</span>
              <span className="ss-tag">{categoryLabel}</span>
              {template.featured && (
                <span className="ss-tag" style={{ color: 'var(--ss-ink)', borderColor: 'var(--ss-ink)' }}>
                  Featured
                </span>
              )}
            </div>
            <h3
              className="text-[1.0625rem] font-semibold leading-snug mb-1.5 group-hover:underline decoration-1 underline-offset-4"
              style={{ color: 'var(--ss-ink)', letterSpacing: '-0.02em' }}
            >
              {template.name}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ss-muted)' }}>
              {template.tagline}
            </p>
          </div>
          <ArrowUpRight
            className="w-4 h-4 shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--ss-ink)' }}
            strokeWidth={1.75}
          />
        </div>

        <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: 'var(--ss-body)' }}>
          {template.description}
        </p>

        <footer
          className="flex items-center justify-between pt-4 text-sm"
          style={{ borderTop: '1px solid var(--ss-line)' }}
        >
          <span className="flex items-center gap-1.5" style={{ color: 'var(--ss-muted)' }}>
            <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
            ~{template.estimatedMinutes} min
          </span>
          <span
            className="font-medium flex items-center gap-0.5"
            style={{ color: 'var(--ss-ink)' }}
          >
            {launchLabel}
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
          </span>
        </footer>
      </article>
    </Link>
  );
}
