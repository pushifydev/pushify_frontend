import { describe, it, expect } from 'vitest';
import snapshot from '@/content/apps/templates.json';
import { APPS, CATEGORY_LABELS, CATEGORY_ORDER, appsByCategory } from './apps-catalog';

// The public /apps index lists the catalogue through appsByCategory(), which only walks
// CATEGORY_ORDER. A template whose category is missing there would silently drop off the page
// (even under "All") and CATEGORY_LABELS[category] would be undefined, so a refreshed snapshot
// (backend `npm run marketplace:export`) with a new category must fail here instead.
describe('apps catalog', () => {
  const snapshotIds = (snapshot as { templates: { id: string }[] }).templates.map((t) => t.id);

  it('knows every category used in the snapshot', () => {
    for (const app of APPS) {
      expect(CATEGORY_ORDER, app.id).toContain(app.category);
      expect(CATEGORY_LABELS[app.category], app.id).toBeDefined();
    }
  });

  it('lists every snapshot template on the /apps index exactly once', () => {
    const listed = appsByCategory().flatMap((g) => g.apps.map((a) => a.id));
    expect(listed).toHaveLength(snapshotIds.length);
    expect([...listed].sort()).toEqual([...snapshotIds].sort());
  });
});
