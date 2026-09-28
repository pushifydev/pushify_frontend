import { afterEach, describe, expect, it, vi } from 'vitest';
import { FUNNEL_EVENTS, trackEvent } from './analytics';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('trackEvent', () => {
  it('is a no-op on the server', () => {
    expect(() => trackEvent(FUNNEL_EVENTS.repoSelected)).not.toThrow();
  });

  it('is a no-op when gtag is not loaded', () => {
    vi.stubGlobal('window', {});
    expect(() => trackEvent(FUNNEL_EVENTS.repoSelected)).not.toThrow();
  });

  it('forwards the event and params to gtag', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    trackEvent(FUNNEL_EVENTS.serverSelected, { server_kind: 'byos' });
    expect(gtag).toHaveBeenCalledWith('event', 'project_create_server_selected', { server_kind: 'byos' });
  });

  it('swallows errors thrown by gtag', () => {
    vi.stubGlobal('window', {
      gtag: () => {
        throw new Error('blocked');
      },
    });
    expect(() => trackEvent(FUNNEL_EVENTS.githubConnectStarted)).not.toThrow();
  });

  it('uses distinct event names for each sub-step', () => {
    const names = Object.values(FUNNEL_EVENTS);
    expect(new Set(names).size).toBe(names.length);
  });
});
