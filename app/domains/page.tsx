'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Loader2, Search, X } from 'lucide-react';
import { MarketingShell, MarketingPageHero } from '@/components/landing';
import { MSection, RuleGrid, RuleCell, Steps } from '@/components/landing/MarketingKit';
import { usePublicDomainSearch, useTranslation } from '@/hooks';
import { getAccessToken } from '@/lib/api/client';
import { buildAuthPath } from '@/lib/auth-redirect';

/** What one keyword search covers — mirrors SEARCH_TLDS in the backend's registrar service. */
const SEARCH_TLDS = ['com', 'net', 'org', 'dev', 'app', 'io', 'co', 'me', 'xyz', 'ai'];

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const copy = {
  en: {
    label: 'Domains',
    lead: 'Search, register and point a domain at your app. DNS and HTTPS are handled.',
    searchLabel: 'Search for a domain',
    searching: 'Searching',
    howEyebrow: 'How it works',
    howTitle: 'Register it, point it, keep it.',
    steps: [
      { title: 'Register for up to five years', body: 'One payment for the term. WHOIS privacy on; auto-renew is your call.' },
      { title: 'Point it at a project', body: 'Records are written and the certificate requested in the same step.' },
      { title: 'Keep editing the DNS', body: 'A, AAAA, CNAME, MX, TXT, SRV and NS records, in the dashboard.' },
    ],
    detailsEyebrow: 'Good to know',
    detailsTitle: 'Your domain, on your terms.',
    details: [
      { title: 'Already own one?', body: 'Add it to a project and point one record. HTTPS is issued and renewed.' },
      { title: 'Bringing one in', body: 'A transfer includes a year of renewal, so nothing lapses mid-move.' },
      { title: 'You can leave', body: 'Unlock the domain and the auth code is shown to you. No ticket.' },
    ],
  },
  tr: {
    label: 'Alan adları',
    lead: 'Alan adını arayın, kaydedin ve uygulamanıza bağlayın. DNS ve HTTPS bizden.',
    searchLabel: 'Alan adı ara',
    searching: 'Aranıyor',
    howEyebrow: 'Nasıl işler',
    howTitle: 'Kaydedin, yönlendirin, yönetin.',
    steps: [
      { title: 'Beş yıla kadar kaydedin', body: 'Tüm dönem için tek ödeme. WHOIS gizliliği açık; otomatik yenileme sizin seçiminiz.' },
      { title: 'Bir projeye yönlendirin', body: 'Kayıtlar yazılır, sertifika da aynı adımda istenir.' },
      { title: 'DNS’i düzenlemeye devam edin', body: 'A, AAAA, CNAME, MX, TXT, SRV ve NS kayıtları, panelden.' },
    ],
    detailsEyebrow: 'Bilmeniz gerekenler',
    detailsTitle: 'Alan adınız, sizin koşullarınızla.',
    details: [
      { title: 'Alan adınız zaten var mı?', body: 'Bir projeye ekleyin, tek kaydı yönlendirin. HTTPS verilir ve yenilenir.' },
      { title: 'Transferle getirmek', body: 'Transfer bir yıllık yenilemeyi içerir; taşınırken süresi dolmaz.' },
      { title: 'Ayrılabilirsiniz', body: 'Kilidi açın, transfer kodu size gösterilir. Destek talebi gerekmez.' },
    ],
  },
};

/** Where the buy CTA ultimately lands: dashboard search pre-filled with the domain. */
function purchasePath(domainName: string): string {
  return `/dashboard/domains?domain=${encodeURIComponent(domainName)}`;
}

export default function PublicDomainsPage() {
  const { t, locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  // Session check after mount (localStorage isn't available during SSR)
  const [hasSession, setHasSession] = useState(false);
  const search = usePublicDomainSearch(query);
  const results = search.data ?? [];

  useEffect(() => {
    setHasSession(!!getAccessToken());
  }, []);

  return (
    <MarketingShell noPad>
      <MarketingPageHero
        label={c.label}
        title={t('domainSales', 'publicHeroTitle')}
        description={c.lead}
      />

      <div className="lp-container max-w-2xl pb-20 md:pb-28">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(input.trim());
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1 min-w-0">
            <Search
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--hp-muted)' }}
              aria-hidden="true"
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('domainSales', 'searchPlaceholder')}
              aria-label={c.searchLabel}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full h-12 pl-11 pr-4 rounded-full text-sm border transition-colors hover:border-[var(--hp-muted)] focus:border-[var(--hp-ink)]"
              style={{
                background: 'var(--hp-card)',
                borderColor: 'var(--hp-line-strong)',
                color: 'var(--hp-ink)',
                fontFamily: 'var(--font-label)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={input.trim().length < 2 || search.isFetching}
            className="lp-cta h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {search.isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-label={c.searching} />
            ) : (
              t('domainSales', 'searchButton')
            )}
          </button>
        </form>

        <div aria-live="polite">
          {query && !search.isFetching && search.error && (
            <p className="mt-6 text-sm" style={{ color: 'var(--hp-body)' }}>
              {search.error.message}
            </p>
          )}

          {query && results.length > 0 && (
            <ul
              className="mt-6 rounded-[14px] border overflow-hidden"
              style={{ borderColor: 'var(--hp-line)', background: 'var(--hp-card)' }}
            >
              {results.map((r, i) => (
                <li
                  key={r.domainName}
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 ${i > 0 ? 'border-t' : ''}`}
                  style={{ borderColor: 'var(--hp-line)' }}
                >
                  {r.available ? (
                    <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--hp-live)' }} aria-hidden="true" />
                  ) : (
                    <X className="w-4 h-4 shrink-0" style={{ color: 'var(--hp-muted)' }} aria-hidden="true" />
                  )}
                  <span
                    className="text-sm truncate min-w-0 flex-1"
                    style={{ fontFamily: 'var(--font-label)', color: 'var(--hp-ink)' }}
                  >
                    {r.domainName}
                  </span>
                  {r.available && r.priceCents !== null ? (
                    <span className="flex items-center gap-3 ml-auto shrink-0">
                      <span className="text-sm font-medium" style={{ color: 'var(--hp-ink)' }}>
                        {formatUsd(r.priceCents)}
                        <span className="text-xs font-normal" style={{ color: 'var(--hp-muted)' }}>
                          {t('domainSales', 'perYear')}
                        </span>
                      </span>
                      <Link
                        href={
                          hasSession
                            ? purchasePath(r.domainName)
                            : buildAuthPath('register', purchasePath(r.domainName))
                        }
                        className="lp-cta min-h-8 h-8 px-3.5 text-xs"
                      >
                        {hasSession ? t('domainSales', 'buy') : t('domainSales', 'publicBuyCta')}
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </span>
                  ) : (
                    <span
                      className="ml-auto text-[0.7rem] uppercase tracking-widest shrink-0"
                      style={{ color: 'var(--hp-muted)', fontFamily: 'var(--font-label)' }}
                    >
                      {r.premium ? t('domainSales', 'premium') : t('domainSales', 'unavailable')}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10">
          <p className="hp-eyebrow">{t('domainSales', 'publicTldsLabel')}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {SEARCH_TLDS.map((tld) => (
              <li
                key={tld}
                className="px-3 py-1.5 rounded-full text-xs border"
                style={{ fontFamily: 'var(--font-label)', color: 'var(--hp-ink)', borderColor: 'var(--hp-line-strong)' }}
              >
                .{tld}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm" style={{ color: 'var(--hp-muted)' }}>
            {t('domainSales', 'publicTldsNote')}
          </p>
        </div>
      </div>

      {/* Below the search the page used to stop, leaving a nav-level page at a hero and a text
          field. Everything here is what the registrar integration actually does. */}
      <MSection id="how-it-works" eyebrow={c.howEyebrow} title={c.howTitle}>
        <Steps items={c.steps} />
      </MSection>

      <MSection id="details" eyebrow={c.detailsEyebrow} title={c.detailsTitle}>
        <RuleGrid cols={3}>
          {c.details.map((d) => (
            <RuleCell key={d.title} title={d.title}>
              {d.body}
            </RuleCell>
          ))}
        </RuleGrid>
      </MSection>
    </MarketingShell>
  );
}
