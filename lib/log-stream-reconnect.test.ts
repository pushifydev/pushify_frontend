import { describe, it, expect } from 'vitest';
import { containerLogsReconnectPlan } from './log-stream-reconnect';

const STARTED = '2026-10-30T10:00:00.000Z';
const LAST_LINE = '2026-10-30T10:05:12.345Z';

describe('containerLogsReconnectPlan', () => {
  it('resumes after the last received line and keeps the lines on screen', () => {
    expect(containerLogsReconnectPlan({ lastEventAt: LAST_LINE, streamStartedAt: STARTED })).toEqual({
      since: LAST_LINE,
      append: true,
    });
  });

  it('never resumes from the stream start once a line has arrived (no replay of old lines)', () => {
    const plan = containerLogsReconnectPlan({ lastEventAt: LAST_LINE, streamStartedAt: STARTED });
    expect(plan.since).not.toBe(STARTED);
  });

  it('falls back to the stream start when the stream opened but sent no line yet', () => {
    expect(containerLogsReconnectPlan({ lastEventAt: null, streamStartedAt: STARTED })).toEqual({
      since: STARTED,
      append: true,
    });
  });

  it('starts over (clear + normal tail) when the stream never opened', () => {
    expect(containerLogsReconnectPlan({ lastEventAt: null, streamStartedAt: null })).toEqual({
      append: false,
    });
  });
});
