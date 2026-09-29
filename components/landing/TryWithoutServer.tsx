'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useSignedIn } from '@/hooks/useSignedIn';
import { uploadSiteHref } from '@/lib/upload-site-link';

/**
 * The way to try Pushify without a server: upload a static site's files and it is served from
 * Pushify's shared host at <name>.pushify.dev over HTTPS. Works on every plan, Free included.
 * Copy is inline (like /sites) so it stays short without touching the shared locale files.
 */
const copy = {
  en: {
    question: 'No server yet?',
    link: 'Upload a static site',
    rest: 'and get a https://…pushify.dev address.',
    title: 'Try it without a server',
    body: 'Upload a static site (HTML, CSS, JS, up to 50 MB) and it goes live at https://your-site.pushify.dev. Works on every plan, Free included, and counts as one project.',
    cta: 'Upload a site',
  },
  tr: {
    question: 'Henüz sunucunuz yok mu?',
    link: 'Statik bir site yükleyin',
    rest: 've https://…pushify.dev adresi alın.',
    title: 'Sunucusuz deneyin',
    body: 'Statik bir siteyi (HTML, CSS, JS, en fazla 50 MB) yükleyin; https://siteniz.pushify.dev adresinde yayına girsin. Free dahil her planda çalışır ve bir proje sayılır.',
    cta: 'Site yükle',
  },
};

/** One line under the homepage hero buttons. */
export function TryWithoutServerLine({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  const { locale } = useTranslation();
  const signedIn = useSignedIn();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  return (
    <p className={`text-[14px] ${className}`} style={{ color: 'var(--hp-muted)', ...style }}>
      {c.question}{' '}
      <Link
        href={uploadSiteHref(signedIn)}
        className="underline underline-offset-4 decoration-[var(--hp-line-strong)] hover:decoration-[var(--hp-ink)]"
        style={{ color: 'var(--hp-ink)' }}
      >
        {c.link}
      </Link>{' '}
      {c.rest}
    </p>
  );
}

/** A wide row under the plan cards on /pricing. */
export function TryWithoutServerRow() {
  const { locale } = useTranslation();
  const signedIn = useSignedIn();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  return (
    <div className="hp-plan-wide">
      <div className="min-w-0">
        <h2 className="text-[1.25rem] font-medium" style={{ color: 'var(--hp-ink)' }}>
          {c.title}
        </h2>
        <p className="mt-1.5 text-[15px]" style={{ color: 'var(--hp-body)' }}>
          {c.body}
        </p>
      </div>
      <div className="w-full sm:w-auto shrink-0">
        <Link href={uploadSiteHref(signedIn)} className="lp-cta-ghost group w-full">
          {c.cta}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
