'use client';

import { Star } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';

/**
 * NOTE: the quotes below are placeholders attributed to generic roles, not real
 * named customers. Replace `sp1/sp2/sp3` in the i18n files with genuine quotes
 * (and real names/companies, with permission) before relying on them as proof.
 */
function Quote({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <figure className="lp-card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)', fill: 'var(--accent-cyan)' }} />
        ))}
      </div>
      <blockquote className="text-sm leading-relaxed flex-1" style={{ color: 'var(--lp-body)' }}>
        “{quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ background: 'var(--lp-border)', color: 'var(--lp-ink)' }}
        >
          {author.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold truncate" style={{ color: 'var(--lp-ink)' }}>{author}</span>
          <span className="block text-xs truncate" style={{ color: 'var(--lp-muted)' }}>{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function SocialProofSection() {
  const { t } = useTranslation();

  const quotes = [
    { quote: t('homepage', 'sp1Quote'), author: t('homepage', 'sp1Author'), role: t('homepage', 'sp1Role') },
    { quote: t('homepage', 'sp2Quote'), author: t('homepage', 'sp2Author'), role: t('homepage', 'sp2Role') },
    { quote: t('homepage', 'sp3Quote'), author: t('homepage', 'sp3Author'), role: t('homepage', 'sp3Role') },
  ];

  return (
    <section id="testimonials" className="lp-section">
      <div className="lp-container">
        <LandingSectionHeader
          label={t('homepage', 'socialProofEyebrow')}
          title={t('homepage', 'socialProofHeadline')}
          description={t('homepage', 'socialProofSubtitle')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quotes.map((q) => (
            <Quote key={q.author} quote={q.quote} author={q.author} role={q.role} />
          ))}
        </div>
      </div>
    </section>
  );
}
