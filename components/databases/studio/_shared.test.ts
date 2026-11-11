import { describe, expect, it } from 'vitest';
import { rowKey, selectedVisibleRows } from './_shared';

const PK = ['id'];
const page2 = [{ id: 51, name: 'a' }, { id: 52, name: 'b' }, { id: 53, name: 'c' }];

describe('selectedVisibleRows', () => {
  it('returns only the selected rows the grid is showing', () => {
    const selected = new Set([rowKey(page2[0], PK), rowKey(page2[2], PK)]);
    expect(selectedVisibleRows(page2, PK, selected)).toEqual([page2[0], page2[2]]);
  });

  it('ignores keys left over from another page', () => {
    // two rows picked on page 1, one on this page
    const selected = new Set(['1', '2', rowKey(page2[1], PK)]);
    expect(selectedVisibleRows(page2, PK, selected)).toEqual([page2[1]]);
  });

  it('is empty when none of the selected keys are visible', () => {
    expect(selectedVisibleRows(page2, PK, new Set(['1', '2', '3']))).toEqual([]);
    expect(selectedVisibleRows([], PK, new Set(['1']))).toEqual([]);
  });

  it('is empty for an empty selection', () => {
    expect(selectedVisibleRows(page2, PK, new Set())).toEqual([]);
  });

  it('does not treat a stale selection as "all selected" on a different page', () => {
    const page1Keys = new Set(['1', '2', '3']);
    expect(selectedVisibleRows(page2, PK, page1Keys).length).not.toBe(page2.length);
  });

  it('matches composite primary keys on every column', () => {
    const pk = ['tenant', 'id'];
    const rows = [
      { tenant: 'a', id: 1 },
      { tenant: 'b', id: 1 },
    ];
    const selected = new Set([rowKey(rows[1], pk)]);
    expect(selectedVisibleRows(rows, pk, selected)).toEqual([rows[1]]);
  });
});
