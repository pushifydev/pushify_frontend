'use client';

import { ArrowUpRight, FileText } from 'lucide-react';
import { useInvoices, useTranslation } from '@/hooks';
import { SettingsSection } from '@/components/dashboard/SettingsParts';

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusBadge(status: string | null): string {
  switch (status) {
    case 'paid':
      return 'badge-success';
    case 'open':
      return 'badge-warning';
    case 'uncollectible':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
}

const STATUS_LABEL = {
  paid: 'invoiceStatusPaid',
  open: 'invoiceStatusOpen',
  void: 'invoiceStatusVoid',
  uncollectible: 'invoiceStatusUncollectible',
  draft: 'invoiceStatusDraft',
} as const;

export function InvoicesSection({ id }: { id?: string }) {
  const { t, locale } = useTranslation();
  const { data: invoices = [], isLoading } = useInvoices();

  if (isLoading || invoices.length === 0) return null;

  return (
    <SettingsSection id={id} title={t('billing', 'invoicesTitle')}>
      <ul className="-mx-5">
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="dash-row flex flex-wrap items-center gap-x-4 gap-y-1.5"
          >
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="terminal-text text-[13px] text-[var(--text-primary)] truncate tabular-nums">
                {inv.number ?? inv.id.slice(0, 12)}
              </span>
              <span className="terminal-text text-[11px] text-[var(--text-muted)] tabular-nums">
                {new Date(inv.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className={`badge ${statusBadge(inv.status)}`}>
                {inv.status && inv.status in STATUS_LABEL
                  ? t('billing', STATUS_LABEL[inv.status as keyof typeof STATUS_LABEL])
                  : (inv.status ?? '—')}
              </span>
            </div>
            <span className="terminal-text text-[13px] font-medium text-[var(--text-primary)] tabular-nums shrink-0">
              {formatAmount(inv.amountPaidCents || inv.amountDueCents, inv.currency)}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {inv.hostedInvoiceUrl && inv.status === 'open' && inv.payable !== false ? (
                // An unpaid invoice is money owed: paying it on Stripe's page lifts the past-due block.
                <a href={inv.hostedInvoiceUrl} className="btn btn-primary btn-sm">
                  {t('billing', 'invoicePay')}
                </a>
              ) : inv.hostedInvoiceUrl ? (
                <a
                  href={inv.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {t('billing', 'invoiceView')}
                </a>
              ) : null}
              {inv.invoicePdf && (
                <a href={inv.invoicePdf} className="btn btn-ghost btn-sm">
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </SettingsSection>
  );
}
