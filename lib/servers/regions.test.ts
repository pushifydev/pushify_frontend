import { describe, it, expect } from 'vitest';
import { usableRegions, defaultRegion } from './regions';

const r = (id: string, available: boolean, availableForPlan?: boolean) => ({
  id, name: id, country: 'DE', city: id, available, availableForPlan,
});

describe('create-server regions', () => {
  it('hides regions the plan cannot use and defaults to the first usable one', () => {
    const regions = [r('nbg1', true, false), r('hel1', false, false), r('fsn1', true, true)];
    expect(usableRegions(regions).map((x) => x.id)).toEqual(['fsn1']);
    expect(defaultRegion(usableRegions(regions))?.id).toBe('fsn1');
  });

  it('keeps out-of-stock regions listed (disabled) but never selects them', () => {
    const regions = [r('hel1', false, false), r('nbg1', true, true)];
    expect(usableRegions([r('ash', false), r('fsn1', true)]).map((x) => x.id)).toEqual(['ash', 'fsn1']);
    expect(defaultRegion(regions)?.id).toBe('nbg1');
  });

  it('keeps the full list when the plan can use no region (Free)', () => {
    const regions = [r('nbg1', true, false), r('fsn1', true, false)];
    expect(usableRegions(regions)).toHaveLength(2);
  });

  it('works with an API that does not send availableForPlan', () => {
    const regions = [r('nbg1', false), r('fsn1', true)];
    expect(usableRegions(regions)).toHaveLength(2);
    expect(defaultRegion(regions)?.id).toBe('fsn1');
  });
});
