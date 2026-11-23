'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { formatClosingDate, useServiceClosingDate } from '@/hooks/useServiceStatus';

/** One line across the top while the hosted service is winding down; nothing otherwise. */
export function ClosingNotice({ pinned = false }: { /** Fixed to the bottom of the viewport (pages with a fixed top bar) */ pinned?: boolean }) {
  const { locale } = useTranslation();
  const date = useServiceClosingDate();
  if (!date) return null;
  const when = formatClosingDate(date, locale);
  return (
    <div
      role="status"
      className={`${pinned ? 'fixed bottom-0 inset-x-0' : 'relative'} z-[60] w-full px-4 py-2 text-center text-[13px]`}
      style={{ background: '#7f1d1d', color: '#fff' }}
    >
      {locale === 'tr'
        ? `Pushify'ın barındırma hizmeti ${when} tarihinde kapanıyor. `
        : `Pushify's hosted service is closing on ${when}. `}
      <Link href="/closing" className="underline underline-offset-2">
        {locale === 'tr' ? 'Ne yapmanız gerekiyor' : 'What you need to do'}
      </Link>
    </div>
  );
}
