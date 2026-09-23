'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, Search, X } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { Reveal } from '@/components/landing/Reveal';
import { usePublicDomainSearch, useTranslation } from '@/hooks';
import { getAccessToken } from '@/lib/api/client';
import { buildAuthPath } from '@/lib/auth-redirect';

/** What one keyword search covers — mirrors SEARCH_TLDS in the backend's registrar service. */
const SEARCH_TLDS = ['com', 'net', 'org', 'dev', 'app', 'io', 'co', 'me', 'xyz', 'ai'];

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Where the buy CTA ultimately lands: dashboard search pre-filled with the domain. */
function purchasePath(domainName: string): string {
  return `/dashboard/domains?domain=${encodeURIComponent(domainName)}`;
}

export default function PublicDomainsPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  // Session check after mount (localStorage isn't available during SSR)
  const [hasSession, setHasSession] = useState(false);
  const search = usePublicDomainSearch(query);

  useEffect(() => {
    setHasSession(!!getAccessToken());
  }, []);

  return (
    <MarketingShell>
      <MarketingPageHero
        label="Domains"
        title={t('domainSales', 'publicHeroTitle')}
        description={t('domainSales', 'publicHeroDesc')}
      />

      <div className="lp-container max-w-2xl pb-10 md:pb-14">
        <Reveal>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(input.trim());
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--lp-muted)' }}
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('domainSales', 'searchPlaceholder')}
                className="w-full h-12 pl-11 pr-4 rounded-full text-sm outline-none"
                style={{
                  background: 'var(--lp-surface)',
                  border: '1px solid var(--lp-border)',
                  color: 'var(--lp-ink)',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={input.trim().length < 2 || search.isFetching}
              className="lp-cta h-12 disabled:opacity-50"
            >
              {search.isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('domainSales', 'searchButton')
              )}
            </button>
          </form>
        </Reveal>

        {query && !search.isFetching && search.error && (
          <p className="mt-6 text-sm" style={{ color: 'var(--lp-muted)' }}>
            {search.error.message}
          </p>
        )}

        {query && (
          <div className="mt-6 space-y-2">
            {(search.data ?? []).map((r, i) => (
              <Reveal key={r.domainName} delay={i * 40}>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)' }}
                >
                  {r.available ? (
                    <Check className="w-4 h-4 shrink-0 text-[#22c55e]" />
                  ) : (
                    <X className="w-4 h-4 shrink-0" style={{ color: 'var(--lp-muted)' }} />
                  )}
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-ink)' }}
                  >
                    {r.domainName}
                  </span>
                  {r.available && r.priceCents !== null ? (
                    <>
                      <span
                        className="ml-auto text-sm font-semibold shrink-0"
                        style={{ color: 'var(--lp-ink)' }}
                      >
                        {formatUsd(r.priceCents)}
                        <span className="text-xs font-normal" style={{ color: 'var(--lp-muted)' }}>
                          {t('domainSales', 'perYear')}
                        </span>
                      </span>
                      <Link
                        href={
                          hasSession
                            ? purchasePath(r.domainName)
                            : buildAuthPath('register', purchasePath(r.domainName))
                        }
                        className="lp-cta h-8 px-3 text-xs shrink-0"
                      >
                        {hasSession ? t('domainSales', 'buy') : t('domainSales', 'publicBuyCta')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  ) : (
                    <span className="ml-auto text-xs shrink-0" style={{ color: 'var(--lp-muted)' }}>
                      {r.premium ? t('domainSales', 'premium') : t('domainSales', 'unavailable')}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Below the search the page used to stop, leaving a nav-level page at a hero and a text
          field. Everything here is what the registrar integration actually does. */}
      <div className="lp-container pb-24 md:pb-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="lp-label mb-3">{t('domainSales', 'publicTldsLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {SEARCH_TLDS.map((tld) => (
                <span
                  key={tld}
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--lp-ink)',
                    background: 'var(--lp-surface)',
                    border: '1px solid var(--lp-border)',
                  }}
                >
                  .{tld}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--lp-muted)' }}>
              {t('domainSales', 'publicTldsNote')}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
          {[
            { title: t('domainSales', 'publicStep1Title'), text: t('domainSales', 'publicStep1Text') },
            { title: t('domainSales', 'publicStep2Title'), text: t('domainSales', 'publicStep2Text') },
            { title: t('domainSales', 'publicStep3Title'), text: t('domainSales', 'publicStep3Text') },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 90} className="h-full">
              <div className="lp-card h-full p-5">
                <span
                  className="text-xs font-semibold"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--lp-muted)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="text-sm font-semibold mt-3 mb-2" style={{ color: 'var(--lp-ink)' }}>
                  {card.title}
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
                  {card.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            { title: t('domainSales', 'publicDnsTitle'), text: t('domainSales', 'publicDnsText') },
            { title: t('domainSales', 'publicTransferTitle'), text: t('domainSales', 'publicTransferText') },
            { title: t('domainSales', 'publicLeaveTitle'), text: t('domainSales', 'publicLeaveText') },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 90} className="h-full">
              <div className="lp-card h-full p-5">
                <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--lp-ink)' }}>
                  {card.title}
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--lp-muted)' }}>
                  {card.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
