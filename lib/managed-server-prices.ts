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

const PLAN_RANK = { hobby: 0, pro: 1, business: 2, enterprise: 3 } as const;
type SelfServePlan = 'hobby' | 'pro' | 'business';

/**
 * The biggest server each plan can actually create, from the same rows as the table: a
 * server is open to its `minPlan` and every plan above it. Deriving it here (instead of
 * writing plan limits into copy) keeps the stated limit equal to what the backend allows.
 */
export function largestPerPlan(servers: ManagedServerPricesData['servers']) {
  const out = {} as Record<SelfServePlan, ManagedServerPricesData['servers'][number] | undefined>;
  for (const plan of ['hobby', 'pro', 'business'] as const) {
    out[plan] = servers
      .filter((s) => PLAN_RANK[s.minPlan] <= PLAN_RANK[plan])
      .sort((a, b) => b.vcpus - a.vcpus || b.memoryGb - a.memoryGb)[0];
  }
  return out;
}
