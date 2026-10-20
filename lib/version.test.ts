import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { version } from '../package.json';

// Every PR raises package.json's version and adds a CHANGELOG.md section for it
// (CONTRIBUTING.md → Versioning). Same heading format the /changelog page parses.
const RELEASE_HEADING = /^## \[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

const releases = readFileSync('CHANGELOG.md', 'utf8')
  .split('\n')
  .map((line) => line.match(RELEASE_HEADING)?.[1])
  .filter((v): v is string => Boolean(v));

describe('package.json version', () => {
  it('is a semantic version', () => {
    expect(version).toMatch(SEMVER);
  });

  it('is the newest CHANGELOG.md section', () => {
    expect(releases[0]).toBe(version);
  });

  it('has exactly one CHANGELOG.md section', () => {
    expect(releases.filter((v) => v === version)).toHaveLength(1);
  });
});
