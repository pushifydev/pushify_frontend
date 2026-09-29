import { describe, it, expect } from 'vitest';
import { largestPerPlan, includedServerFor, type ManagedServerPricesData } from './managed-server-prices';

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

describe('includedServerFor', () => {
  const cx23 = row('cx23', 2, 4, 'hobby');
  it('names the server the credit covers', () => {
    expect(includedServerFor('hobby', [{ ...cx23, priceMonthlyCents: 765 }], 900)?.serverType).toBe('cx23');
  });
  it('says nothing when the entry server costs more than the credit', () => {
    expect(includedServerFor('hobby', [{ ...cx23, priceMonthlyCents: 950 }], 900)).toBeUndefined();
  });
  it('says nothing when the plan has no server in stock', () => {
    expect(includedServerFor('hobby', [row('cpx22', 2, 4, 'pro')], 900)).toBeUndefined();
  });
});
