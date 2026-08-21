/**
 * Query history for the SQL console. Kept in localStorage per database — it is a convenience
 * log for the person at the keyboard, not something the server needs to know about.
 */

export interface StudioHistoryEntry {
  id: string;
  sql: string;
  at: number;
  durationMs: number | null;
  rowCount: number | null;
  ok: boolean;
  error?: string;
  writeMode: boolean;
}

const MAX_ENTRIES = 50;
const MAX_SQL_LENGTH = 5_000;

const storageKey = (databaseId: string) => `pushify.studio.history.${databaseId}`;

function readStorage(databaseId: string): StudioHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(databaseId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StudioHistoryEntry[]) : [];
  } catch {
    // Private mode, quota errors or a corrupted entry — history is never worth failing over.
    return [];
  }
}

function writeStorage(databaseId: string, entries: StudioHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(databaseId), JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

export function readHistory(databaseId: string): StudioHistoryEntry[] {
  return readStorage(databaseId);
}

export function pushHistory(
  databaseId: string,
  entry: Omit<StudioHistoryEntry, 'id' | 'at'>
): StudioHistoryEntry[] {
  const record: StudioHistoryEntry = {
    ...entry,
    sql: entry.sql.slice(0, MAX_SQL_LENGTH),
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };

  const next = [record, ...readStorage(databaseId)].slice(0, MAX_ENTRIES);
  writeStorage(databaseId, next);
  return next;
}

export function clearHistory(databaseId: string): StudioHistoryEntry[] {
  writeStorage(databaseId, []);
  return [];
}
