'use client';

import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';

/*
 * English only, as approved on 2026-10-10. Section numbers are cited in suspension emails
 * (pushify_backend/src/services/abuse.service.ts, AUP_CLAUSES): keep §1, §2.1 and §2.2 stable.
 */
export default function AcceptableUsePage() {
  const { locale } = useTranslation();
  return (
    <LegalPageLayout title="Acceptable Use Policy" lastUpdated={locale === 'tr' ? '10 Ekim 2026' : 'October 10, 2026'}>
      <p>
        This policy applies to the hosted Pushify service at pushify.dev. If you run the open-source
        Pushify software on your own infrastructure, you set your own rules.
      </p>

      <h2 id="prohibited-everywhere">1. Prohibited everywhere</h2>
      <p>Pushify may not be used for:</p>
      <ul>
        <li>Hosting or distributing illegal content</li>
        <li>Spam or malware distribution</li>
        <li>Sharing copyright-infringing material</li>
        <li>DDoS attacks, malicious software, or cryptocurrency mining</li>
        <li>Unauthorized access attempts to third-party systems</li>
      </ul>

      <h2 id="pushify-infrastructure">2. On Pushify infrastructure</h2>
      <p>
        These apply to apps on managed servers, on Pushify&apos;s shared infrastructure, or reachable at a
        *.pushify.dev address.
      </p>
      <p id="proxy-vpn">
        <strong>2.1 Proxy, VPN, tunnel and relay services:</strong> Xray, V2Ray, sing-box, Trojan,
        Shadowsocks, Hysteria, Telegram MTProxy, open HTTP/SOCKS proxies, Tor relays or exits, or any
        service whose main purpose is forwarding other people&apos;s traffic.
      </p>
      <p id="scanning">
        <strong>2.2 Network and port scanning</strong> of systems you are not authorized to test.
      </p>
      <p>
        On your own server with your own domain, §2 does not apply as long as what you run is legal; you
        are responsible for it.
      </p>

      <h2 id="enforcement">3. How we enforce it</h2>
      <p>
        We check deployed code, build output, traffic volumes and connection counts. We never read the
        contents of your traffic or the values of your environment variables. A person reviews every case
        before a project is suspended. A suspended project is stopped, its address shows a
        &quot;suspended&quot; page, and the owner receives an email with the reason, the section of this
        policy, the duration and how to appeal. Clearly illegal activity may be suspended immediately, and
        accounts may be terminated under the <Link href="/terms#prohibited-use">Terms</Link>.
      </p>

      <h2 id="reporting">4. Reporting abuse</h2>
      <p>
        Use <Link href="/abuse">pushify.dev/abuse</Link> or email{' '}
        <a href="mailto:abuse@pushify.dev">abuse@pushify.dev</a>.
      </p>

      <h2 id="appeals">5. Appeals</h2>
      <p>
        Email <a href="mailto:abuse@pushify.dev">abuse@pushify.dev</a> with the project name. A person
        reviews every appeal.
      </p>

      <h2 id="changes">6. Changes</h2>
      <p>We will update this page and its date when this policy changes.</p>
    </LegalPageLayout>
  );
}
