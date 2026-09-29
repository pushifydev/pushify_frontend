import { describe, it, expect } from 'vitest';
import { pendingDeletionFromError, pendingDeletionFromHash } from './pending-deletion';

describe('pendingDeletionFromError', () => {
  it('reads the restore token from an ACCOUNT_PENDING_DELETION error', () => {
    expect(
      pendingDeletionFromError({
        code: 'ACCOUNT_PENDING_DELETION',
        details: { scheduledFor: '2026-10-31T12:00:00.000Z', restoreToken: 'tok' },
      }),
    ).toEqual({ scheduledFor: '2026-10-31T12:00:00.000Z', restoreToken: 'tok' });
  });

  it('ignores other errors and malformed details', () => {
    expect(pendingDeletionFromError({ code: 'UNAUTHORIZED' })).toBeNull();
    expect(pendingDeletionFromError({ code: 'ACCOUNT_PENDING_DELETION', details: [{ field: 'x', message: 'y' }] })).toBeNull();
    expect(pendingDeletionFromError(null)).toBeNull();
  });
});

describe('pendingDeletionFromHash', () => {
  it('reads the SSO redirect fragment', () => {
    expect(pendingDeletionFromHash('#restoreToken=a.b.c&scheduledFor=2026-10-31T12%3A00%3A00.000Z')).toEqual({
      restoreToken: 'a.b.c',
      scheduledFor: '2026-10-31T12:00:00.000Z',
    });
    expect(pendingDeletionFromHash('#other=1')).toBeNull();
  });
});
