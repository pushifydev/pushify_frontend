// Anonymous abuse reports for the /abuse page (pushify_backend/src/routes/abuse-reports.ts).
// Plain fetch on purpose: the page is public, and the dashboard client's auth handling has no
// business here.

import { ABUSE_CONTACT_EMAIL } from '@/lib/contact';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const ABUSE_REPORT_CATEGORIES = [
  'proxy-vpn',
  'phishing',
  'malware',
  'spam',
  'scanning',
  'copyright',
  'illegal',
  'other',
] as const;
export type AbuseReportCategory = (typeof ABUSE_REPORT_CATEGORIES)[number];

export interface AbuseReportInput {
  url: string;
  email: string;
  category: AbuseReportCategory;
  details: string;
  /** Honeypot — always empty from a person */
  website: string;
}

export async function submitAbuseReport(input: AbuseReportInput): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/abuse/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: false, message: body?.error?.message ?? `Request failed (${res.status})` };
  } catch {
    return { ok: false, message: `Could not reach Pushify. Email ${ABUSE_CONTACT_EMAIL} instead.` };
  }
}
