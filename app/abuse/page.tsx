'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { useTranslation } from '@/hooks';
import {
  ABUSE_REPORT_CATEGORIES,
  submitAbuseReport,
  type AbuseReportCategory,
} from '@/lib/api/services/abuse-report.service';

/* English only, as approved on 2026-10-10. */

const CATEGORY_LABELS: Record<AbuseReportCategory, string> = {
  'proxy-vpn': 'Proxy or VPN relay',
  phishing: 'Phishing',
  malware: 'Malware',
  spam: 'Spam',
  scanning: 'Network or port scanning',
  copyright: 'Copyright infringement',
  illegal: 'Other illegal content',
  other: 'Other',
};

const field: CSSProperties = {
  background: 'var(--hp-card)',
  borderColor: 'var(--hp-line-strong)',
  color: 'var(--hp-ink)',
};
const fieldClass =
  'w-full rounded-xl px-4 py-3 text-sm border transition-colors hover:border-[var(--hp-muted)] focus:border-[var(--hp-ink)] outline-none';

export default function AbusePage() {
  const { locale } = useTranslation();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<AbuseReportCategory>('proxy-vpn');
  const [details, setDetails] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState('sending');
    const res = await submitAbuseReport({ url: url.trim(), email: email.trim(), category, details: details.trim(), website });
    if (res.ok) {
      setState('sent');
    } else {
      setState('idle');
      setError(res.message);
    }
  };

  return (
    <LegalPageLayout title="Report abuse" lastUpdated={locale === 'tr' ? '10 Ekim 2026' : 'October 10, 2026'}>
      <p>
        Tell us about an app hosted on Pushify that breaks the{' '}
        <Link href="/acceptable-use">Acceptable Use Policy</Link>: phishing, malware, spam, proxy or VPN
        relays, scanning or copyright infringement. Include the full URL. We review every report but may
        not tell you the outcome.
      </p>

      {state === 'sent' ? (
        <p role="status">
          <strong>Thank you — your report has been received.</strong>
        </p>
      ) : (
        <form onSubmit={submit} className="not-prose mt-8 space-y-4" noValidate={false}>
          <label className="block space-y-1.5">
            <span className="text-sm" style={{ color: 'var(--hp-body)' }}>URL</span>
            <input
              type="url"
              required
              maxLength={500}
              placeholder="https://example.pushify.dev/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={fieldClass}
              style={field}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm" style={{ color: 'var(--hp-body)' }}>Your email</span>
            <input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              style={field}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm" style={{ color: 'var(--hp-body)' }}>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AbuseReportCategory)}
              className={fieldClass}
              style={field}
            >
              {ABUSE_REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm" style={{ color: 'var(--hp-body)' }}>Details</span>
            <textarea
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={fieldClass}
              style={field}
            />
          </label>
          {/* Honeypot: hidden from people, filled in by bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
          />
          {error && (
            <p role="alert" className="text-sm" style={{ color: 'var(--status-error, #ef4444)' }}>
              {error}
            </p>
          )}
          <button type="submit" className="hp-btn" disabled={state === 'sending'}>
            {state === 'sending' ? 'Sending…' : 'Send report'}
          </button>
        </form>
      )}

      <p className="mt-8">
        Or email <a href="mailto:abuse@pushify.dev"><strong>abuse@pushify.dev</strong></a>.
      </p>
    </LegalPageLayout>
  );
}
