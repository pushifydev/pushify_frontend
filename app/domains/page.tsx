'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, Search, X } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { Reveal } from '@/components/landing/Reveal';
import { usePublicDomainSearch, useTranslation } from '@/hooks';

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PublicDomainsPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const search = usePublicDomainSearch(query);

  return (
    <MarketingShell>
      <MarketingPageHero
        label="Domains"
        title={t('domainSales', 'publicHeroTitle')}
        description={t('domainSales', 'publicHeroDesc')}
      />

      <div className="lp-container max-w-2xl pb-20 md:pb-28">
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
                        href={`/register?domain=${encodeURIComponent(r.domainName)}`}
                        className="lp-cta h-8 px-3 text-xs shrink-0"
                      >
                        {t('domainSales', 'publicBuyCta')}
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
    </MarketingShell>
  );
}
