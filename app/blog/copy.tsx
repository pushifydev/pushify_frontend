'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MarketingPageHero } from '@/components/landing';
import { useTranslation } from '@/hooks';

/**
 * The blog's page chrome in the reader's language. The posts themselves are written in English;
 * the Turkish copy says so rather than pretending otherwise.
 */
const copy = {
  en: {
    label: 'Blog',
    title: 'Engineering notes',
    description: 'Self-hosting, zero-downtime deploys and running a PaaS on your own servers — written as we build Pushify.',
    latest: 'Latest post',
    minRead: (n: number) => `${n} min read`,
    readPost: 'Read the post',
    back: 'All posts',
    feedbackBefore: 'Questions or feedback? Open an issue on',
    feedbackAfter: '.',
    cta: 'Deploy your first app',
  },
  tr: {
    label: 'Blog',
    title: 'Mühendislik notları',
    description:
      'Kendi sunucunda barındırma, kesintisiz deploy ve kendi PaaS’ını çalıştırmak üzerine — Pushify’ı geliştirirken yazıyoruz. Yazılar şimdilik İngilizce.',
    latest: 'Son yazı',
    minRead: (n: number) => `${n} dk okuma`,
    readPost: 'Yazıyı oku',
    back: 'Tüm yazılar',
    feedbackBefore: 'Sorunuz ya da geri bildiriminiz mi var? GitHub’da',
    feedbackAfter: ' bir issue açın.',
    cta: 'İlk uygulamanı deploy et',
  },
};

function useCopy() {
  const { locale } = useTranslation();
  const tr = locale === 'tr';
  return { c: tr ? copy.tr : copy.en, dateLocale: tr ? 'tr-TR' : 'en-US' };
}

export function BlogIndexHero() {
  const { c } = useCopy();
  return <MarketingPageHero label={c.label} title={c.title} description={c.description} />;
}

/** "Sep 3, 2026 · 6 min read", in the reader's language. */
export function PostMeta({ date, minutes, long = false }: { date: string; minutes: number; long?: boolean }) {
  const { c, dateLocale } = useCopy();
  const formatted = new Date(`${date}T00:00:00Z`).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: long ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <p className="blog-meta">
      <time dateTime={date}>{formatted}</time>
      <span aria-hidden="true"> · </span>
      {c.minRead(minutes)}
    </p>
  );
}

/** The newest post as a framed card at the top of the index. */
export function FeaturedPost({
  href,
  title,
  description,
  date,
  minutes,
}: {
  href: string;
  title: string;
  description: string;
  date: string;
  minutes: number;
}) {
  const { c } = useCopy();
  return (
    <article
      className="relative rounded-2xl border p-7 md:p-10 transition-colors hover:border-(--hp-muted)"
      style={{ borderColor: 'var(--hp-line-strong)', background: 'var(--hp-card)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="blog-meta">{c.latest}</p>
        <PostMeta date={date} minutes={minutes} />
      </div>
      <h2 className="hp-h2 mt-8 max-w-[40rem]" lang="en">
        {/* The whole card is the link target; the title carries the accessible name. */}
        <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl">
          {title}
        </Link>
      </h2>
      <p className="hp-lead mt-5 max-w-[40rem]" lang="en">
        {description}
      </p>
      <p className="blog-read-link mt-8">
        {c.readPost}
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </p>
    </article>
  );
}

export function ReadPostLink({ href }: { href: string }) {
  const { c } = useCopy();
  return (
    <Link href={href} className="blog-read-link">
      {c.readPost}
      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
    </Link>
  );
}

export function BackToBlog() {
  const { c } = useCopy();
  return (
    <Link href="/blog" className="blog-read-link blog-back-link">
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
      {c.back}
    </Link>
  );
}

export function PostFooter() {
  const { c } = useCopy();
  return (
    <footer className="blog-post-footer">
      <p>
        {c.feedbackBefore}{' '}
        <a href="https://github.com/pushifydev" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        {c.feedbackAfter}
      </p>
      <Link href="/register" className="lp-cta shrink-0">
        {c.cta}
      </Link>
    </footer>
  );
}
