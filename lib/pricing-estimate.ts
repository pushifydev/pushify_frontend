/**
 * Honest side-by-side monthly estimate: Vercel, Railway and Pushify from their published list
 * prices. One source of truth for the pricing page's calculator and the homepage's — a number
 * shown in two places must not be able to drift apart.
 *
 * List prices checked 2026-09-10; links in ESTIMATE_SOURCES. The usage assumptions are the
 * visitor's inputs, never hidden.
 */

export const LIST_PRICES = {
  checkedAt: '2026-09-10',
  vercelProSeat: 20, // $/seat/month
  railwayProBase: 20, // $/workspace/month, includes $20 of usage
  railwayIncludedUsage: 20,
  railwayVcpuMonth: 20, // $/vCPU/month
  railwayGbMonth: 10, // $/GB RAM/month
  pushifyHobby: 15,
  pushifyPro: 29,
  // Hobby covers up to this many projects and members; beyond it the estimate uses Pro.
  hobbyMaxProjects: 5,
  hobbyMaxSeats: 2,
} as const;

export const ESTIMATE_SOURCES = [
  { name: 'Vercel', href: 'https://vercel.com/pricing' },
  { name: 'Railway', href: 'https://railway.com/pricing' },
] as const;

export interface EstimateInput {
  projects: number;
  seats: number;
  /** What the visitor pays their VPS provider per month (Pushify runs on their server). */
  serverCost: number;
  cpu: number; // vCPU per project
  ram: number; // GB RAM per project
}

export interface Estimate {
  vercel: number;
  railway: number;
  pushify: number;
  pushifyPlan: { name: 'Hobby' | 'Pro'; price: number };
}

export function estimate(i: EstimateInput): Estimate {
  const p = LIST_PRICES;
  const vercel = i.seats * p.vercelProSeat;
  const usage = i.projects * (i.cpu * p.railwayVcpuMonth + i.ram * p.railwayGbMonth);
  const railway = Math.round(p.railwayProBase + Math.max(0, usage - p.railwayIncludedUsage));
  const pushifyPlan =
    i.projects <= p.hobbyMaxProjects && i.seats <= p.hobbyMaxSeats
      ? ({ name: 'Hobby', price: p.pushifyHobby } as const)
      : ({ name: 'Pro', price: p.pushifyPro } as const);
  return { vercel, railway, pushify: pushifyPlan.price + i.serverCost, pushifyPlan };
}

/** What each total is made of, in the visitor's language. */
export const estimateNotes = {
  en: {
    vercel: (seats: number) => `${seats} × $${LIST_PRICES.vercelProSeat} Pro seats. Bandwidth beyond 1 TB and function usage billed extra.`,
    railway: (projects: number, cpu: number, ram: number) =>
      `$${LIST_PRICES.railwayProBase} Pro (incl. $${LIST_PRICES.railwayIncludedUsage} usage) + ${projects} × (${cpu} vCPU × $${LIST_PRICES.railwayVcpuMonth} + ${ram} GB × $${LIST_PRICES.railwayGbMonth}). Egress extra.`,
    pushify: (plan: string, server: number) =>
      `${plan} plan + $${server} to your server provider. No per-seat fee within the plan’s member limit, no per-GB metering.`,
    disclaimer: `List prices checked ${LIST_PRICES.checkedAt}. Usage-based bills vary; this is an estimate, not a quote.`,
  },
  tr: {
    vercel: (seats: number) => `${seats} × $${LIST_PRICES.vercelProSeat} Pro koltuğu. 1 TB üstü bant genişliği ve fonksiyon kullanımı ayrıca faturalanır.`,
    railway: (projects: number, cpu: number, ram: number) =>
      `$${LIST_PRICES.railwayProBase} Pro ($${LIST_PRICES.railwayIncludedUsage} kullanım dahil) + ${projects} × (${cpu} vCPU × $${LIST_PRICES.railwayVcpuMonth} + ${ram} GB × $${LIST_PRICES.railwayGbMonth}). Çıkış trafiği ayrı.`,
    pushify: (plan: string, server: number) =>
      `${plan} planı + sunucu sağlayıcınıza $${server}. Plan üye limiti dahilinde koltuk ücreti yok, GB başına ölçüm yok.`,
    disclaimer: `Liste fiyatları ${LIST_PRICES.checkedAt} tarihinde kontrol edildi. Kullanıma dayalı faturalar değişir; bu bir tahmindir, teklif değildir.`,
  },
} as const;
