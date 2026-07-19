import type { AvailablePlans } from '@/lib/api';
import { PricingPageView } from './PricingPageView';

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

export default async function PricingPage() {
  const plans = await fetchPlans();
  return <PricingPageView initialPlans={plans} />;
}
