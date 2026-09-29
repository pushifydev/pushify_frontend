import type { AvailablePlans } from '@/lib/api';
import { PricingPageView } from './PricingPageView';
import type { ManagedServerPricesData } from './ManagedServerPrices';

// Prices must exist in the server-rendered HTML: AI crawlers and non-JS fetchers
// never see client-fetched data, and /pricing is the page most quoted for cost
// questions. Plans are fetched here (ISR, 1h) and seed the client query cache.
export const revalidate = 3600;

async function fetchPlans(): Promise<AvailablePlans | undefined> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${base}/billing/plans`, { next: { revalidate: 3600 } });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { data?: AvailablePlans };
    return json.data;
  } catch {
    return undefined;
  }
}

// Managed-server prices come from the same ISR pass. When the endpoint is unreachable the
// section falls back to a sentence pointing at the dashboard.
async function fetchServerPrices(): Promise<ManagedServerPricesData | undefined> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  try {
    const res = await fetch(`${base}/public/managed-server-prices?region=fsn1`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as { data?: ManagedServerPricesData };
    return json.data;
  } catch {
    return undefined;
  }
}

export default async function PricingPage() {
  const [plans, serverPrices] = await Promise.all([fetchPlans(), fetchServerPrices()]);
  return <PricingPageView initialPlans={plans} serverPrices={serverPrices} />;
}
