import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_NAMESPACES } from './site-namespaces';

// Every source the public site renders (marketing routes and the components only they use).
const ROOTS = [
  'app/page.tsx', 'app/not-found.tsx', 'app/error.tsx', 'components/landing', 'components/legal',
  ...['features', 'pricing', 'sites', 'domains', 'open-source', 'about', 'alternatives', 'apps', 'blog',
    'changelog', 'deploy-button', 'guides', 'partners', 'privacy', 'terms', 'refund', 'status',
    'pushify-yaml', 'vs', 'deploy'].map((d) => `app/${d}`),
];

const walk = (p: string): string[] =>
  !existsSync(p) ? [] : statSync(p).isDirectory()
    ? readdirSync(p).flatMap((f) => walk(join(p, f)))
    : /\.tsx?$/.test(p) && !p.endsWith('.test.ts') ? [p] : [];

describe('SITE_NAMESPACES', () => {
  it('covers every namespace the public site translates with', () => {
    const used = new Set<string>();
    for (const file of ROOTS.flatMap(walk)) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*['"]([a-zA-Z]+)['"]/g)) used.add(m[1]);
    }
    const missing = [...used].filter((ns) => !(SITE_NAMESPACES as readonly string[]).includes(ns));
    expect(missing).toEqual([]);
  });
});
