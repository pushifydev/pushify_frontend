'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Check,
  CreditCard,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDomainSalesConfig,
  useDomainSearch,
  useDomainPurchaseCheckout,
  useConfirmDomainPurchase,
  usePurchaseDomain,
  useTransferQuote,
  useStartTransfer,
  usePurchasedDomains,
  useProjects,
  useSetDomainAutoRenew,
  useTranslation,
  registrarDomainKeys,
} from '@/hooks';
import type { DomainSearchResult } from '@/lib/api';
import { Modal, ModalActions } from '@/components/Modal';
import { toast } from 'sonner';

const TERM_OPTIONS = [1, 2, 3, 5];

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DomainsPage() {
  const { t, locale } = useTranslation();
  const { data: config, isLoading: configLoading } = useDomainSalesConfig();
  const { data: purchased = [], isLoading: purchasedLoading } = usePurchasedDomains();
  const { data: projects = [] } = useProjects();
  const purchaseMutation = usePurchaseDomain();
  const checkoutMutation = useDomainPurchaseCheckout();
  const confirmMutation = useConfirmDomainPurchase();
  const autoRenewMutation = useSetDomainAutoRenew();
  const queryClient = useQueryClient();

  const transferQuoteMutation = useTransferQuote();
  const startTransferMutation = useStartTransfer();

  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [buyTarget, setBuyTarget] = useState<DomainSearchResult | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [years, setYears] = useState(1);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferDomain, setTransferDomain] = useState('');
  const [transferAuth, setTransferAuth] = useState('');
  const transferQuote = transferQuoteMutation.data;

  const requestTransferQuote = async () => {
    transferQuoteMutation.reset();
    await transferQuoteMutation.mutateAsync(transferDomain.trim()).catch((err: Error) => {
      toast.error(err.message);
    });
  };

  const startTransfer = async () => {
    await startTransferMutation.mutateAsync({
      domainName: transferDomain.trim(),
      authCode: transferAuth.trim(),
    });
    toast.success(t('domainSales', 'transferStartedToast'));
    setTransferOpen(false);
    setTransferDomain('');
    setTransferAuth('');
    transferQuoteMutation.reset();
  };

  const search = useDomainSearch(query);

  // Arriving from the public /domains page (or a post-auth redirect) with
  // ?domain= — pre-fill and run the search so the user lands mid-purchase.
  // The param stays in the URL on purpose: the auth shell can remount this page
  // right after login (state resets), and keeping it makes the search re-apply
  // on every mount — it also gives the page a shareable deep link.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain')?.trim().toLowerCase();
    if (!domain) return;
    setInput(domain);
    setQuery(domain);
  }, []);

  // Returning from Stripe Checkout: confirm the session directly (works without
  // webhook forwarding in local/dev; idempotent with the webhook in production).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('domain_purchase') !== 'success') return;
    const sessionId = params.get('session_id');
    window.history.replaceState({}, '', window.location.pathname);

    if (!sessionId) {
      toast.success(t('domainSales', 'checkoutSuccess'));
      setTimeout(() => queryClient.invalidateQueries({ queryKey: registrarDomainKeys.list() }), 2500);
      return;
    }

    toast.info(t('domainSales', 'checkoutSuccess'));
    confirmMutation
      .mutateAsync(sessionId)
      .then((result) => {
        if (result.fulfilled || result.alreadyProcessed) {
          toast.success(t('domainSales', 'purchaseSuccess'));
        } else {
          toast.warning(t('domainSales', 'checkoutFailedCredited'));
        }
      })
      .catch((err: Error) => toast.error(err.message))
      .finally(() =>
        queryClient.invalidateQueries({ queryKey: registrarDomainKeys.list() })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCents = buyTarget?.priceCents
    ? buyTarget.priceCents + (years - 1) * (buyTarget.renewalPriceCents ?? buyTarget.priceCents)
    : 0;

  const yearsLabel = (n: number) =>
    `${n} ${n === 1 ? t('domainSales', 'yearWord') : t('domainSales', 'yearsWord')}`;

  const payWithCard = async () => {
    if (!buyTarget) return;
    const result = await checkoutMutation.mutateAsync({
      domainName: buyTarget.domainName,
      projectId: selectedProject || undefined,
      years,
    });
    window.location.href = result.url;
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input.trim());
  };

  const confirmPurchase = async () => {
    if (!buyTarget?.priceCents) return;
    const result = await purchaseMutation.mutateAsync({
      domainName: buyTarget.domainName,
      projectId: selectedProject || undefined,
      years,
    });
    toast.success(
      result.attached
        ? t('domainSales', 'purchaseSuccessAttached')
        : t('domainSales', 'purchaseSuccess'),
      { description: `${t('domainSales', 'balanceAfter')}: ${formatUsd(result.balanceAfterCents)}` }
    );
    setBuyTarget(null);
    setSelectedProject('');
  };

  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Globe className="w-6 h-6" style={{ color: 'var(--accent-cyan)' }} />
          {t('domainSales', 'title')}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{t('domainSales', 'subtitle')}</p>
      </div>

      {!configLoading && config && !config.enabled ? (
        <div className="p-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
          <Globe className="w-8 h-8 mx-auto mb-3 text-[var(--text-muted)]" />
          <h2 className="font-semibold mb-1">{t('domainSales', 'notEnabled')}</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            {t('domainSales', 'notEnabledDesc')}
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <form onSubmit={submitSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('domainSales', 'searchPlaceholder')}
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--accent-cyan)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <button
              type="submit"
              disabled={input.trim().length < 2 || search.isFetching}
              className="btn btn-primary h-11 px-5 disabled:opacity-50"
            >
              {search.isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('domainSales', 'searchButton')
              )}
            </button>
          </form>
          <p className="text-xs text-[var(--text-muted)] -mt-6">{t('domainSales', 'walletNote')}</p>

          {/* Results */}
          {query && (
            <div className="space-y-2">
              {search.isFetching && (
                <div className="p-4 text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('domainSales', 'searching')}
                </div>
              )}
              {search.error && !search.isFetching && (
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-sm text-red-400">
                  {search.error.message}
                </div>
              )}
              {!search.isFetching &&
                (search.data ?? []).map((r) => (
                  <div
                    key={r.domainName}
                    className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                  >
                    {r.available ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                    )}
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {r.domainName}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full shrink-0"
                      style={
                        r.available
                          ? {
                              color: '#10b981',
                              background: 'rgba(16,185,129,0.10)',
                              border: '1px solid rgba(16,185,129,0.25)',
                            }
                          : {
                              color: 'var(--text-muted)',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-subtle)',
                            }
                      }
                    >
                      {r.premium
                        ? t('domainSales', 'premium')
                        : r.available
                          ? t('domainSales', 'available')
                          : t('domainSales', 'unavailable')}
                    </span>
                    {r.available && r.priceCents !== null && (
                      <>
                        <span className="ml-auto text-sm font-semibold shrink-0">
                          {formatUsd(r.priceCents)}
                          <span className="text-xs text-[var(--text-muted)] font-normal">
                            {t('domainSales', 'perYear')}
                          </span>
                        </span>
                        {r.renewalPriceCents !== null && r.renewalPriceCents !== r.priceCents && (
                          <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] shrink-0">
                            {t('domainSales', 'renewsAt')} {formatUsd(r.renewalPriceCents)}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setBuyTarget(r);
                            setSelectedProject('');
                            setYears(1);
                          }}
                          className="btn btn-primary h-8 text-xs shrink-0"
                        >
                          {t('domainSales', 'buy')}
                        </button>
                      </>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Purchased domains */}
          <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('domainSales', 'purchasedTitle')}</h2>
              <button
                onClick={() => setTransferOpen(true)}
                className="btn btn-ghost h-8 text-xs"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {t('domainSales', 'transferBtn')}
              </button>
            </div>
            {purchasedLoading ? (
              <div className="text-sm text-[var(--text-secondary)]">…</div>
            ) : purchased.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t('domainSales', 'purchasedEmpty')}</p>
            ) : (
              <div className="space-y-2">
                {purchased.map((d) => {
                  const project = projects.find((p) => p.id === d.projectId);
                  return (
                    <div
                      key={d.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {d.domainName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {d.status === 'expired'
                          ? t('domainSales', 'expired')
                          : d.status === 'transfer_pending'
                            ? t('domainSales', 'transferPendingChip')
                            : d.status === 'transfer_failed'
                              ? t('domainSales', 'transferFailedChip')
                              : `${t('domainSales', 'expires')}: ${dateFmt(d.expiresAt)}`}
                      </span>
                      {d.status === 'active' && (
                        <Link
                          href={`/dashboard/domains/${encodeURIComponent(d.domainName)}`}
                          className="btn btn-ghost h-7 text-xs"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          {t('domainSales', 'manage')}
                        </Link>
                      )}
                      {project && (
                        <span className="text-xs text-[var(--text-muted)]">
                          {t('domainSales', 'attachedProject')}: {project.name}
                        </span>
                      )}
                      {d.lastRenewalError && (
                        <span className="text-[11px] text-amber-500">
                          {t('domainSales', 'renewalIssue')}
                        </span>
                      )}
                      <label className="sm:ml-auto flex items-center gap-2 text-xs cursor-pointer select-none">
                        <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        {t('domainSales', 'autoRenew')}
                        <input
                          type="checkbox"
                          checked={d.autoRenew}
                          disabled={autoRenewMutation.isPending || d.status === 'expired'}
                          onChange={(e) =>
                            autoRenewMutation.mutate({
                              domainName: d.domainName,
                              enabled: e.target.checked,
                            })
                          }
                          className="accent-[var(--accent-cyan)]"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Transfer-in */}
      {transferOpen && (
        <Modal
          isOpen={transferOpen}
          onClose={() => !startTransferMutation.isPending && setTransferOpen(false)}
          title={t('domainSales', 'transferTitle')}
          description={t('domainSales', 'transferDesc')}
        >
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">
              {t('domainSales', 'transferDomainLabel')}
            </label>
            <div className="flex gap-2 mb-4">
              <input
                value={transferDomain}
                onChange={(e) => setTransferDomain(e.target.value)}
                placeholder="mydomain.com"
                className="flex-1 h-10 px-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--accent-cyan)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <button
                onClick={requestTransferQuote}
                disabled={transferQuoteMutation.isPending || transferDomain.trim().length < 4}
                className="btn btn-ghost h-10 text-xs disabled:opacity-50"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                {transferQuoteMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  t('domainSales', 'transferGetQuote')
                )}
              </button>
            </div>

            {transferQuote && (
              <>
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    {t('domainSales', 'transferPriceLabel')} · {transferQuote.domainName}
                  </span>
                  <span className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatUsd(transferQuote.retailCents)}
                  </span>
                </div>

                <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                  {t('domainSales', 'transferAuthLabel')}
                </label>
                <input
                  value={transferAuth}
                  onChange={(e) => setTransferAuth(e.target.value)}
                  className="w-full h-10 px-3 mb-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm outline-none focus:border-[var(--accent-cyan)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </>
            )}

            <p className="text-[11px] text-[var(--text-muted)] mb-4">
              {t('domainSales', 'transferNote')}
            </p>

            <ModalActions>
              <button
                onClick={() => setTransferOpen(false)}
                disabled={startTransferMutation.isPending}
                className="btn btn-ghost h-10"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={startTransfer}
                disabled={
                  startTransferMutation.isPending || !transferQuote || !transferAuth.trim()
                }
                className="btn btn-primary h-10 disabled:opacity-60"
              >
                {startTransferMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-4 h-4" />
                )}
                {t('domainSales', 'transferStartBtn')}
              </button>
            </ModalActions>
        </Modal>
      )}

      {/* Purchase confirmation */}
      {buyTarget && (
        <Modal
          isOpen={!!buyTarget}
          onClose={() => !purchaseMutation.isPending && setBuyTarget(null)}
          title={t('domainSales', 'confirmTitle')}
          description={t('domainSales', 'confirmBody')}
        >
            <p className="text-sm mb-4 font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>
              {buyTarget.domainName}
            </p>

            <label className="block text-xs text-[var(--text-muted)] mb-1.5">
              {t('domainSales', 'termLabel')}
            </label>
            <div className="flex gap-2 mb-4">
              {TERM_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setYears(n)}
                  className="flex-1 h-9 rounded-lg text-xs font-medium transition-colors"
                  style={
                    years === n
                      ? {
                          background: 'var(--accent-cyan)',
                          color: '#fff',
                          border: '1px solid var(--accent-cyan)',
                        }
                      : {
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }
                  }
                >
                  {yearsLabel(n)}
                </button>
              ))}
            </div>

            <label className="block text-xs text-[var(--text-muted)] mb-1.5">
              {t('domainSales', 'confirmAttach')}
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full h-10 px-3 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm outline-none"
            >
              <option value="">{t('domainSales', 'confirmNoProject')}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between mb-5 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-muted)]">
                {t('domainSales', 'totalLabel')} · {yearsLabel(years)}
              </span>
              <span className="text-base font-bold" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatUsd(totalCents)}
              </span>
            </div>

            <ModalActions>
              <button
                onClick={() => setBuyTarget(null)}
                disabled={purchaseMutation.isPending || checkoutMutation.isPending}
                className="btn btn-ghost h-10"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={payWithCard}
                disabled={purchaseMutation.isPending || checkoutMutation.isPending}
                className="btn btn-ghost h-10 disabled:opacity-60"
                style={{ border: '1px solid var(--border-subtle)' }}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {t('domainSales', 'payWithCard')}
              </button>
              <button
                onClick={confirmPurchase}
                disabled={purchaseMutation.isPending || checkoutMutation.isPending}
                className="btn btn-primary h-10 disabled:opacity-60"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('domainSales', 'buying')}
                  </>
                ) : (
                  `${t('domainSales', 'confirmPay')} ${formatUsd(totalCents)}`
                )}
              </button>
            </ModalActions>
        </Modal>
      )}
    </div>
  );
}
