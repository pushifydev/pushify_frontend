import { describe, expect, it } from 'vitest';
import { estimate } from './pricing-estimate';

describe('estimate', () => {
  it('matches the published list-price formulas', () => {
    const e = estimate({ projects: 3, seats: 2, serverCost: 5, cpu: 0.5, ram: 0.5 });
    expect(e.vercel).toBe(40); // 2 × $20 seats
    expect(e.railway).toBe(45); // $20 base + (usage 3 × ($10 + $5) = $45, minus the $20 included) = $45
    expect(e.pushifyPlan.name).toBe('Hobby');
    expect(e.pushify).toBe(20); // $15 + $5 server
  });

  it('never charges Railway less than its base, and moves to Pro past the Hobby limits', () => {
    expect(estimate({ projects: 1, seats: 1, serverCost: 0, cpu: 0.1, ram: 0.1 }).railway).toBe(20);
    expect(estimate({ projects: 6, seats: 1, serverCost: 0, cpu: 0.5, ram: 0.5 }).pushifyPlan.name).toBe('Pro');
    expect(estimate({ projects: 1, seats: 3, serverCost: 0, cpu: 0.5, ram: 0.5 }).pushify).toBe(29);
  });
});
