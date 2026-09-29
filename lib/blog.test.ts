import { describe, it, expect } from 'vitest';
import { parseBlocks } from './blog';

describe('parseBlocks tables', () => {
  it('reads a pipe table and keeps the paragraph before it separate', () => {
    const blocks = parseBlocks(['Limits per plan:', '| Plan | Projects |', '| --- | ---: |', '| Free | 2 |', '| Hobby | 10 |', '', 'After.'].join('\n'));
    expect(blocks).toEqual([
      { type: 'p', text: 'Limits per plan:' },
      { type: 'table', header: ['Plan', 'Projects'], rows: [['Free', '2'], ['Hobby', '10']] },
      { type: 'p', text: 'After.' },
    ]);
  });

  it('leaves a lone pipe line without a separator as text', () => {
    expect(parseBlocks('| not a table')).toEqual([{ type: 'p', text: '| not a table' }]);
  });
});
