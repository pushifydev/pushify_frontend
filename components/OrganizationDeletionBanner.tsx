'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useTranslation, useOrganization } from '@/hooks';

const copy = {
  en: {
    title: (date: string) => `This organization will be deleted on ${date}.`,
    owner: 'It is read-only until then.',
    member: 'It is read-only until then. Only the owner can restore it.',
    restore: 'Restore',
  },
  tr: {
    title: (date: string) => `Bu organizasyon ${date} tarihinde silinecek.`,
    owner: 'O zamana kadar salt okunur.',
    member: 'O zamana kadar salt okunur. Yalnızca sahibi geri alabilir.',
    restore: 'Geri al',
  },
};

/** On every dashboard page while the organization waits to be deleted. */
export function OrganizationDeletionBanner() {
  const { locale } = useTranslation();
  const { data: org } = useOrganization();
  if (!org?.deletionScheduledFor) return null;
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const date = new Date(org.deletionScheduledFor).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const isOwner = org.role === 'owner';

  return (
    <div
      role="status"
      className="mx-4 md:mx-6 my-4 rounded-lg border px-4 py-3 flex items-center gap-3"
      style={{ borderColor: 'color-mix(in srgb, var(--status-error) 30%, transparent)', background: 'color-mix(in srgb, var(--status-error) 6%, transparent)' }}
    >
      <Trash2 className="w-4 h-4 shrink-0" style={{ color: 'var(--status-error)' }} aria-hidden />
      <p className="flex-1 min-w-0 text-sm text-[var(--text-primary)]">
        <span className="font-medium">{c.title(date)}</span>{' '}
        <span className="text-[var(--text-secondary)]">{isOwner ? c.owner : c.member}</span>
      </p>
      {isOwner && (
        <Link href="/dashboard/settings?tab=deletion" className="btn btn-secondary btn-sm shrink-0">
          {c.restore}
        </Link>
      )}
    </div>
  );
}
