/** The most projects one API key can be limited to; the backend rejects more. */
export const API_KEY_MAX_PROJECTS = 50;

/**
 * Selects or deselects a project for a key's project restriction. Deselecting always works;
 * selecting is ignored once API_KEY_MAX_PROJECTS projects are chosen.
 */
export function toggleApiKeyProject(selected: readonly string[], projectId: string): string[] {
  if (selected.includes(projectId)) return selected.filter((id) => id !== projectId);
  if (selected.length >= API_KEY_MAX_PROJECTS) return [...selected];
  return [...selected, projectId];
}

/**
 * The projectIds to send when creating a key: the chosen ids when the key is limited to
 * projects, otherwise undefined so the key works on every project the creator can reach.
 */
export function apiKeyProjectIdsToCreate(
  restrict: boolean,
  selected: readonly string[]
): string[] | undefined {
  return restrict ? [...selected] : undefined;
}

/** How many projects a key is limited to, or null when it is not limited. */
export function apiKeyProjectCount(key: { projectIds?: readonly string[] | null }): number | null {
  return key.projectIds && key.projectIds.length > 0 ? key.projectIds.length : null;
}

/** A delete scope (`projects:delete`), granted separately from the matching `:write` scope. */
export function isDeleteScope(scope: string): boolean {
  return scope.endsWith(':delete');
}
