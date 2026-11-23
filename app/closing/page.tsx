'use client';

import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';
import { formatClosingDate, useServiceClosingDate } from '@/hooks/useServiceStatus';

/* English only. The date comes from the API (SERVICE_CLOSING_DATE); without one the page says so. */
export default function ClosingPage() {
  const { locale } = useTranslation();
  const date = useServiceClosingDate();
  const when = date ? formatClosingDate(date, 'en') : null;

  return (
    <LegalPageLayout title="Pushify is closing" lastUpdated={locale === 'tr' ? '23 Kasım 2026' : 'November 23, 2026'}>
      {when ? (
        <p>
          The hosted Pushify service at pushify.dev closes on <strong>{when}</strong>. This page says what
          happens and what to do before then.
        </p>
      ) : (
        <p>No closing date is set at the moment.</p>
      )}

      <h2>1. What happens</h2>
      <ul>
        <li>Your projects keep running until the closing date.</li>
        <li>New sign-ups, subscriptions, balance top-ups and managed servers are closed.</li>
        <li>
          On the closing date, apps on Pushify&apos;s servers and at *.pushify.dev addresses go offline, and
          managed servers are deleted.
        </li>
      </ul>

      <h2>2. Your money</h2>
      <ul>
        <li>Subscriptions are cancelled; you will not be charged again.</li>
        <li>Any prepaid balance is refunded in full to the original payment method.</li>
      </ul>

      <h2>3. Moving your apps</h2>
      <ol>
        <li>Create a server with a provider of your choice (Hetzner, for example).</li>
        <li>
          In the dashboard, add it under <strong>Servers → New server → Existing server</strong>. This stays
          open until the closing date.
        </li>
        <li>Assign your project to that server in the project&apos;s settings and deploy.</li>
        <li>Point your own domain at the new server. *.pushify.dev addresses stop working on the closing date.</li>
        <li>
          Download your database backups from <strong>Databases → Backups</strong> and restore them on the
          new server.
        </li>
      </ol>
      <p>
        After the closing date the dashboard is gone too. To keep deploying the same way, run the open-source
        Pushify yourself, or use plain Docker on your server: your apps are ordinary containers.
      </p>

      <h2>4. Your data</h2>
      <p>
        After the closing date we delete the remaining servers, databases, backups and accounts. Billing
        records are kept for as long as the law requires, as the <Link href="/privacy">Privacy Policy</Link>{' '}
        describes.
      </p>

      <h2>5. Notice period</h2>
      <p>
        We committed to 90 days&apos; notice before a shutdown, and this notice is shorter. If you need more
        time or help moving, write to <a href="mailto:support@pushify.dev">support@pushify.dev</a> and we will
        work it out with you.
      </p>
    </LegalPageLayout>
  );
}
