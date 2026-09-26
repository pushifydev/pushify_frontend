'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRightLeft, CreditCard, Loader2, Search, Settings2 } from 'lucide-react';
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
import { EmptyState } from '@/components/EmptyState';
import { ListSkeleton } from '@/components/Skeletons';
import { MetaLabel, PageHeader, RowList } from '@/components/dashboard/PageKit';
import { SettingsSwitch } from '@/components/dashboard/SettingsParts';
import { Select } from '@/components/ui/select';

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

  const statusLabel = (d: (typeof purchased)[number]) =>
    d.status === 'expired'
      ? t('domainSales', 'expired')
      : d.status === 'transfer_pending'
        ? t('domainSales', 'transferPendingChip')
        : d.status === 'transfer_failed'
          ? t('domainSales', 'transferFailedChip')
          : `${t('domainSales', 'expires')} ${dateFmt(d.expiresAt)}`;
  const statusDot = (status: string) =>
    status === 'active'
      ? 'is-success'
      : status === 'transfer_pending'
        ? 'is-warning'
        : status === 'expired' || status === 'transfer_failed'
          ? 'is-error'
          : '';

  const salesOff = !configLoading && config && !config.enabled;

  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <PageHeader
        title={t('domainSales', 'title')}
        description={t('domainSales', 'subtitle')}
        meta={
          purchased.length > 0
            ? [
                <MetaLabel key="count">
                  {purchased.length} {t('domainSales', 'purchasedTitle')}
                </MetaLabel>,
              ]
            : undefined
        }
        actions={
          salesOff ? undefined : (
            <button type="button" onClick={() => setTransferOpen(true)} className="btn btn-secondary justify-center">
              <ArrowRightLeft className="w-4 h-4" />
              {t('domainSales', 'transferBtn')}
            </button>
          )
        }
      />

      {salesOff ? (
        <EmptyState
          label={t('domainSales', 'title')}
          title={t('domainSales', 'notEnabled')}
          description={t('domainSales', 'notEnabledDesc')}
        />
      ) : (
        <>
          {/* Search */}
          <section className="dash-rows" aria-label={t('domainSales', 'searchButton')}>
            <form onSubmit={submitSearch} className="dash-toolbar py-2.5! border-b-0!">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                  aria-hidden
                />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('domainSales', 'searchPlaceholder')}
                  aria-label={t('domainSales', 'searchPlaceholder')}
                  className="input pl-9! terminal-text"
                />
              </div>
              <button
                type="submit"
                disabled={input.trim().length < 2 || search.isFetching}
                className="btn btn-primary shrink-0"
              >
                {search.isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('domainSales', 'searchButton')
                )}
              </button>
            </form>

            {query && search.isFetching && (
              <div className="dash-row flex items-center gap-2 text-sm text-[var(--text-secondary)]" role="status">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                {t('domainSales', 'searching')}
              </div>
            )}
            {query && search.error && !search.isFetching && (
              <div className="dash-row text-sm text-[var(--status-error)]" role="alert">
                {search.error.message}
              </div>
            )}
            {query &&
              !search.isFetching &&
              (search.data ?? []).map((r) => (
                <div key={r.domainName} className="dash-row flex items-center gap-3 min-w-0">
                  <span className={`dash-status-dot ${r.available ? 'is-success' : ''}`} aria-hidden />
                  <span className="terminal-text text-sm font-medium truncate text-[var(--text-primary)]">
                    {r.domainName}
                  </span>
                  <span className={`badge shrink-0 ${r.available ? 'badge-success' : 'badge-neutral'}`}>
                    {r.premium
                      ? t('domainSales', 'premium')
                      : r.available
                        ? t('domainSales', 'available')
                        : t('domainSales', 'unavailable')}
                  </span>
                  {r.available && r.priceCents !== null && (
                    <>
                      <span className="ml-auto terminal-text text-sm shrink-0 text-[var(--text-primary)]">
                        {formatUsd(r.priceCents)}
                        <span className="text-xs text-[var(--text-muted)]">{t('domainSales', 'perYear')}</span>
                      </span>
                      {r.renewalPriceCents !== null && r.renewalPriceCents !== r.priceCents && (
                        <span className="hidden sm:inline text-xs text-[var(--text-muted)] shrink-0">
                          {t('domainSales', 'renewsAt')} {formatUsd(r.renewalPriceCents)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setBuyTarget(r);
                          setSelectedProject('');
                          setYears(1);
                        }}
                        className="btn btn-primary btn-sm shrink-0"
                      >
                        {t('domainSales', 'buy')}
                      </button>
                    </>
                  )}
                </div>
              ))}
          </section>
          <p className="text-xs text-[var(--text-muted)] -mt-3">{t('domainSales', 'walletNote')}</p>

          {/* Purchased domains */}
          {purchasedLoading ? (
            <ListSkeleton rows={2} height={52} />
          ) : purchased.length === 0 ? (
            <EmptyState label={t('domainSales', 'purchasedTitle')} title={t('domainSales', 'purchasedEmpty')} />
          ) : (
            <RowList label={t('domainSales', 'purchasedTitle')}>
              {purchased.map((d) => {
                const project = projects.find((p) => p.id === d.projectId);
                const switchId = `autorenew-${d.id}`;
                return (
                  <div key={d.id} className="dash-row flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`dash-status-dot ${statusDot(d.status)}`} aria-hidden />
                      <div className="min-w-0">
                        {d.status === 'active' ? (
                          <Link
                            href={`/dashboard/domains/${encodeURIComponent(d.domainName)}`}
                            className="terminal-text text-sm font-medium truncate block text-[var(--text-primary)] hover:underline underline-offset-4"
                          >
                            {d.domainName}
                          </Link>
                        ) : (
                          <span className="terminal-text text-sm font-medium truncate block">{d.domainName}</span>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-[var(--text-muted)]">
                          <span>{statusLabel(d)}</span>
                          {project && (
                            <span>
                              {t('domainSales', 'attachedProject')}: {project.name}
                            </span>
                          )}
                          {d.lastRenewalError && (
                            <span className="text-[var(--status-warning)]">{t('domainSales', 'renewalIssue')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 pl-[1.125rem] sm:pl-0">
                      <label htmlFor={switchId} className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                        {t('domainSales', 'autoRenew')}
                      </label>
                      <SettingsSwitch
                        id={switchId}
                        checked={d.autoRenew}
                        disabled={autoRenewMutation.isPending || d.status === 'expired'}
                        onChange={(enabled) =>
                          autoRenewMutation.mutate({ domainName: d.domainName, enabled })
                        }
                        label={`${t('domainSales', 'autoRenew')} · ${d.domainName}`}
                      />
                      {d.status === 'active' && (
                        <Link
                          href={`/dashboard/domains/${encodeURIComponent(d.domainName)}`}
                          className="btn btn-secondary btn-sm"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          {t('domainSales', 'manage')}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </RowList>
          )}
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
            <label htmlFor="transfer-domain" className="dash-section-label block mb-1.5">
              {t('domainSales', 'transferDomainLabel')}
            </label>
            <div className="flex gap-2 mb-4">
              <input
                value={transferDomain}
                onChange={(e) => setTransferDomain(e.target.value)}
                placeholder="mydomain.com"
                id="transfer-domain"
                className="input flex-1 min-w-0 terminal-text"
              />
              <button
                onClick={requestTransferQuote}
                disabled={transferQuoteMutation.isPending || transferDomain.trim().length < 4}
                className="btn btn-secondary shrink-0"
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
                <div className="dash-kv mb-4">
                  <span>
                    {t('domainSales', 'transferPriceLabel')} · {transferQuote.domainName}
                  </span>
                  <span>{formatUsd(transferQuote.retailCents)}</span>
                </div>

                <label htmlFor="transfer-auth" className="dash-section-label block mb-1.5">
                  {t('domainSales', 'transferAuthLabel')}
                </label>
                <input
                  id="transfer-auth"
                  value={transferAuth}
                  onChange={(e) => setTransferAuth(e.target.value)}
                  className="input terminal-text mb-3"
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
                className="btn btn-ghost"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={startTransfer}
                disabled={
                  startTransferMutation.isPending || !transferQuote || !transferAuth.trim()
                }
                className="btn btn-primary"
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
            <p className="terminal-text text-sm mb-4 font-medium">{buyTarget.domainName}</p>

            <span id="domain-term-label" className="dash-section-label block mb-1.5">
              {t('domainSales', 'termLabel')}
            </span>
            <div className="dash-segmented mb-4" role="group" aria-labelledby="domain-term-label">
              {TERM_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setYears(n)}
                  aria-pressed={years === n}
                >
                  {yearsLabel(n)}
                </button>
              ))}
            </div>

            <label htmlFor="domain-attach" className="dash-section-label block mb-1.5">
              {t('domainSales', 'confirmAttach')}
            </label>
            <Select
              id="domain-attach"
              value={selectedProject}
              onValueChange={setSelectedProject}
              className="w-full mb-4"
              options={[
                { value: '', label: t('domainSales', 'confirmNoProject') },
                ...projects.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />

            <div className="dash-kv mb-1">
              <span>
                {t('domainSales', 'totalLabel')} · {yearsLabel(years)}
              </span>
              <span className="text-sm!">{formatUsd(totalCents)}</span>
            </div>

            <ModalActions>
              <button
                onClick={() => setBuyTarget(null)}
                disabled={purchaseMutation.isPending || checkoutMutation.isPending}
                className="btn btn-ghost"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={payWithCard}
                disabled={purchaseMutation.isPending || checkoutMutation.isPending}
                className="btn btn-secondary"
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
                className="btn btn-primary"
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
