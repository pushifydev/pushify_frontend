import { describe, expect, it } from 'vitest';
import {
  API_KEY_MAX_PROJECTS,
  apiKeyProjectCount,
  apiKeyProjectIdsToCreate,
  isDeleteScope,
  toggleApiKeyProject,
} from './api-key-projects';
import { en } from './i18n/locales/en';
import { tr } from './i18n/locales/tr';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

describe('toggleApiKeyProject', () => {
  it('adds a project that is not selected yet', () => {
    expect(toggleApiKeyProject(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes a project that is already selected', () => {
    expect(toggleApiKeyProject(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('stops adding at the 50-project limit', () => {
    const full = ids(API_KEY_MAX_PROJECTS);
    expect(API_KEY_MAX_PROJECTS).toBe(50);
    expect(toggleApiKeyProject(full, 'extra')).toEqual(full);
  });

  it('still removes a project at the limit', () => {
    const full = ids(API_KEY_MAX_PROJECTS);
    expect(toggleApiKeyProject(full, 'p0')).toHaveLength(API_KEY_MAX_PROJECTS - 1);
  });

  it('does not mutate the current selection', () => {
    const selected = ['a'];
    toggleApiKeyProject(selected, 'b');
    expect(selected).toEqual(['a']);
  });
});

describe('apiKeyProjectIdsToCreate', () => {
  it('sends the chosen projects when the key is limited', () => {
    expect(apiKeyProjectIdsToCreate(true, ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('sends nothing when the key is not limited, even with a leftover selection', () => {
    expect(apiKeyProjectIdsToCreate(false, ['a'])).toBeUndefined();
  });
});

describe('apiKeyProjectCount', () => {
  it('counts the projects of a limited key', () => {
    expect(apiKeyProjectCount({ projectIds: ['a', 'b', 'c'] })).toBe(3);
  });

  it('is null for a key without a project limit', () => {
    expect(apiKeyProjectCount({})).toBeNull();
    expect(apiKeyProjectCount({ projectIds: null })).toBeNull();
    expect(apiKeyProjectCount({ projectIds: [] })).toBeNull();
  });
});

describe('isDeleteScope', () => {
  it('tells delete scopes apart from write scopes', () => {
    expect(isDeleteScope('projects:delete')).toBe(true);
    expect(isDeleteScope('projects:write')).toBe(false);
    expect(isDeleteScope('*')).toBe(false);
  });
});

describe('API key project restriction copy', () => {
  const keys = [
    'restrictProjects',
    'restrictProjectsDesc',
    'projectsSelected',
    'projectsLimitReached',
    'noProjectsSelected',
    'noProjectsAvailable',
    'projectsBadge',
    'projectsBadgeOne',
    'deleteScopesHint',
    'scopeProjectsDelete',
  ] as const;

  it.each([
    ['en', en],
    ['tr', tr],
  ])('has every string in %s', (_, locale) => {
    for (const key of keys) expect(locale.apiKeys[key]).toBeTruthy();
  });

  it.each([
    ['en', en],
    ['tr', tr],
  ])('keeps the placeholders the form fills in (%s)', (_, locale) => {
    expect(locale.apiKeys.restrictProjectsDesc).toContain('{max}');
    expect(locale.apiKeys.projectsSelected).toContain('{count}');
    expect(locale.apiKeys.projectsSelected).toContain('{max}');
    expect(locale.apiKeys.projectsLimitReached).toContain('{max}');
    expect(locale.apiKeys.projectsBadge).toContain('{count}');
  });
});
