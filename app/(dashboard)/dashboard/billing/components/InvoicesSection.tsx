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
    <section className="dash-panel p-5 sm:p-6">
      <div className="dash-panel-header">
        <div className="dash-panel-title min-w-0">
          <Receipt className="w-4 h-4 shrink-0 text-[var(--text-secondary)]" />
          <span className="truncate">{t('billing', 'invoicesTitle')}</span>
        </div>
      </div>

      <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto_auto] items-center gap-x-4 gap-y-1 py-2.5"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span
              className="text-sm truncate tabular-nums"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            >
              {inv.number ?? inv.id.slice(0, 12)}
            </span>
            <span className="text-xs tabular-nums sm:order-none order-3 col-span-2 sm:col-span-1 text-[var(--text-muted)]">
              {new Date(inv.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span
              className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full w-fit justify-self-start"
              style={statusStyle(inv.status)}
            >
              {inv.status ?? '—'}
            </span>
            <span
              className="text-sm font-medium tabular-nums text-right justify-self-end"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            >
              {formatAmount(inv.amountPaidCents || inv.amountDueCents, inv.currency)}
            </span>
            <span className="flex items-center gap-0.5 col-span-2 sm:col-span-1 justify-self-start sm:justify-self-end">
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
          </li>
        ))}
      </ul>
    </section>
  );
}
