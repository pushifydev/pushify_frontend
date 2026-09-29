import { describe, it, expect } from 'vitest';
import { largestPerPlan, type ManagedServerPricesData } from './managed-server-prices';

const row = (serverType: string, vcpus: number, memoryGb: number, minPlan: ManagedServerPricesData['servers'][number]['minPlan']) => ({
  size: 'xs', serverType, vcpus, memoryGb, diskGb: 40, priceHourlyUsd: 0.01, priceMonthlyCents: 700, minPlan,
});

describe('largestPerPlan', () => {
  it('matches what each plan can create (fsn1, 2026-09-29 catalogue)', () => {
    const out = largestPerPlan([
      row('cx23', 2, 4, 'hobby'),
      row('cpx32', 4, 8, 'business'),
      row('cpx42', 8, 16, 'business'),
      row('cpx62', 16, 32, 'enterprise'),
    ]);
    expect(out.hobby?.serverType).toBe('cx23');
    expect(out.pro?.serverType).toBe('cx23'); // Pro's cost cap rules out cpx32
    expect(out.business?.serverType).toBe('cpx42');
  });

  it('reports no server when nothing fits the plan', () => {
    const out = largestPerPlan([row('cpx22', 2, 4, 'pro')]);
    expect(out.hobby).toBeUndefined();
    expect(out.pro?.serverType).toBe('cpx22');
  });
});
