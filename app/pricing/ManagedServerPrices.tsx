'use client';

import { MSection } from '@/components/landing/MarketingKit';
import { useTranslation } from '@/hooks';

/** Shape of GET /public/managed-server-prices (customer prices only). */
export interface ManagedServerPricesData {
  region: string;
  currency: 'USD';
  hoursPerMonth: number;
  updatedAt: string;
  servers: {
    size: string;
    serverType: string;
    vcpus: number;
    memoryGb: number;
    diskGb: number;
    priceHourlyUsd: number;
    priceMonthlyCents: number;
    minPlan: 'hobby' | 'pro' | 'business' | 'enterprise';
  }[];
}

const copy = {
  en: {
    eyebrow: 'Managed servers',
    title: 'What a managed server costs.',
    lead: 'Rented through Pushify, no Hetzner account needed. Billed by the hour from prepaid credits, separately from the plan.',
    server: 'Server',
    cpu: 'vCPU',
    ram: 'RAM',
    disk: 'Disk',
    hourly: 'Per hour',
    monthly: '≈ Per month',
    plan: 'Available from',
    plans: { hobby: 'Hobby', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' },
    note: (where: string, hours: number) =>
      `${where}. Monthly figures assume the server runs all month (${hours} hours). Credits are charged while the server runs; it stops when credits reach $0.`,
    fallback:
      'Managed server prices are shown in the dashboard before you create a server. They are billed by the hour from prepaid credits, separately from the plan.',
  },
  tr: {
    eyebrow: 'Yönetilen sunucular',
    title: 'Yönetilen bir sunucu ne kadar tutar.',
    lead: 'Pushify üzerinden kiralanır, Hetzner hesabı gerekmez. Plandan ayrı olarak, ön ödemeli krediden saatlik faturalanır.',
    server: 'Sunucu',
    cpu: 'vCPU',
    ram: 'RAM',
    disk: 'Disk',
    hourly: 'Saatlik',
    monthly: '≈ Aylık',
    plan: 'Hangi plandan',
    plans: { hobby: 'Hobby', pro: 'Pro', business: 'Business', enterprise: 'Enterprise' },
    note: (where: string, hours: number) =>
      `${where}. Aylık tutar sunucunun ay boyunca (${hours} saat) açık kaldığını varsayar. Kredi sunucu çalıştıkça düşer; kredi $0 olunca sunucu durur.`,
    fallback:
      'Yönetilen sunucu fiyatları, sunucu oluşturmadan önce panelde gösterilir. Plandan ayrı olarak, ön ödemeli krediden saatlik faturalanır.',
  },
};

const usd = (n: number, digits = 2) => `$${n.toFixed(digits)}`;

const REGION_NAMES: Record<string, { en: string; tr: string }> = {
  fsn1: { en: 'Falkenstein, Germany', tr: 'Falkenstein, Almanya' },
  nbg1: { en: 'Nuremberg, Germany', tr: 'Nürnberg, Almanya' },
  hel1: { en: 'Helsinki, Finland', tr: 'Helsinki, Finlandiya' },
};

export function ManagedServerPrices({ prices }: { prices?: ManagedServerPricesData }) {
  const { locale } = useTranslation();
  const c = copy[locale === 'tr' ? 'tr' : 'en'];
  const rows = prices?.servers ?? [];

  return (
    <MSection eyebrow={c.eyebrow} title={c.title} lead={c.lead}>
      {rows.length === 0 ? (
        <p className="text-[1rem]" style={{ color: 'var(--hp-body)' }}>
          {c.fallback}
        </p>
      ) : (
        <>
          <div className="relative overflow-x-auto">
            <table className="hp-table min-w-[640px]">
              <thead>
                <tr>
                  <th scope="col">{c.server}</th>
                  <th scope="col">{c.cpu}</th>
                  <th scope="col">{c.ram}</th>
                  <th scope="col">{c.disk}</th>
                  <th scope="col">{c.hourly}</th>
                  <th scope="col">{c.monthly}</th>
                  <th scope="col">{c.plan}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.serverType || s.size}>
                    <th scope="row" className="hp-mono">
                      {s.serverType}
                    </th>
                    <td>{s.vcpus}</td>
                    <td>{s.memoryGb} GB</td>
                    <td>{s.diskGb} GB</td>
                    <td className="tabular-nums">{usd(s.priceHourlyUsd, 4)}</td>
                    <td className="tabular-nums">{usd(s.priceMonthlyCents / 100)}</td>
                    <td>{c.plans[s.minPlan]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[0.9rem]" style={{ color: 'var(--hp-muted)' }}>
            {c.note(REGION_NAMES[prices!.region]?.[locale === 'tr' ? 'tr' : 'en'] ?? prices!.region, prices!.hoursPerMonth)}
          </p>
        </>
      )}
    </MSection>
  );
}
