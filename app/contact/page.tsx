'use client';

import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

/** Every way to reach us, as plain text so it survives email obfuscation and no-JS readers. */
export default function ContactPage() {
  const { locale } = useTranslation();
  return locale === 'tr' ? <ContactTR /> : <ContactEN />;
}

const ISSUES = 'https://github.com/pushifydev/pushify_backend/issues';

function ContactEN() {
  return (
    <LegalPageLayout title="Contact" lastUpdated="September 29, 2026">
      <h2>Support</h2>
      <p>
        Email <a href="mailto:support@pushify.dev">support@pushify.dev</a> for help with your account, billing,
        deployments or refunds.
      </p>

      <h2>Sales</h2>
      <p>
        Email <a href="mailto:sales@pushify.dev">sales@pushify.dev</a> for Enterprise plans, agencies and partnerships.
      </p>

      <h2>Bugs and feature requests</h2>
      <p>
        Open an issue on <a href={ISSUES}>GitHub</a>. Pushify is open source, so reports there are public.
      </p>

      <h2>Security</h2>
      <p>
        Do not open a public issue for vulnerabilities. See our <a href="/security">security page</a> for how to
        report one privately.
      </p>

      <h2>Company</h2>
      <p>
        Pushify LLC
        <br />
        30 N Gould St Ste N, Sheridan, WY 82801, USA
      </p>
    </LegalPageLayout>
  );
}

function ContactTR() {
  return (
    <LegalPageLayout title="İletişim" lastUpdated="29 Eylül 2026">
      <h2>Destek</h2>
      <p>
        Hesap, faturalandırma, deploy veya iade konularında yardım için{' '}
        <a href="mailto:support@pushify.dev">support@pushify.dev</a> adresine yazın.
      </p>

      <h2>Satış</h2>
      <p>
        Enterprise planlar, ajanslar ve iş ortaklıkları için <a href="mailto:sales@pushify.dev">sales@pushify.dev</a>{' '}
        adresine yazın.
      </p>

      <h2>Hata ve özellik istekleri</h2>
      <p>
        <a href={ISSUES}>GitHub</a> üzerinde issue açın. Pushify açık kaynak olduğu için oradaki bildirimler herkese
        açıktır.
      </p>

      <h2>Güvenlik</h2>
      <p>
        Güvenlik açıkları için herkese açık issue açmayın. Gizli bildirim için <a href="/security">güvenlik sayfasına</a>{' '}
        bakın.
      </p>

      <h2>Şirket</h2>
      <p>
        Pushify LLC
        <br />
        30 N Gould St Ste N, Sheridan, WY 82801, ABD
      </p>
    </LegalPageLayout>
  );
}
