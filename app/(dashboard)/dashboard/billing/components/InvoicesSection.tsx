'use client';

import { ArrowUpRight, FileText, Receipt } from 'lucide-react';
import { useInvoices, useTranslation } from '@/hooks';

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusStyle(status: string | null): React.CSSProperties {
  switch (status) {
    case 'paid':
      return { color: '#16a34a', background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' };
    case 'open':
      return { color: '#a16207', background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.3)' };
    default:
      return {
        color: 'var(--text-muted)',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
      };
  }
}

export function InvoicesSection() {
  const { t, locale } = useTranslation();
  const { data: invoices = [], isLoading } = useInvoices();

  if (isLoading || invoices.length === 0) return null;

  return (
    <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
        <Receipt className="w-4 h-4" />
        {t('billing', 'invoicesTitle')}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">{t('billing', 'invoicesDesc')}</p>

      <div className="space-y-2">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
          >
            <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
              {inv.number ?? inv.id.slice(0, 12)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {new Date(inv.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full w-fit"
              style={statusStyle(inv.status)}
            >
              {inv.status ?? '—'}
            </span>
            <span className="sm:ml-auto text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
              {formatAmount(inv.amountPaidCents || inv.amountDueCents, inv.currency)}
            </span>
            <span className="flex items-center gap-1">
              {inv.hostedInvoiceUrl && (
                <a
                  href={inv.hostedInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost h-8 text-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {t('billing', 'invoiceView')}
                </a>
              )}
              {inv.invoicePdf && (
                <a href={inv.invoicePdf} className="btn btn-ghost h-8 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </a>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
