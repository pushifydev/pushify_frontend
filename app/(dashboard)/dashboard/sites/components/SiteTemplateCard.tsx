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
