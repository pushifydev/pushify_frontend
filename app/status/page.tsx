import { DOCS_API_BASE_URL } from '@/lib/api/public-url';
import { StatusBoard, type FullHealth } from './StatusBoard';

/** Re-read the health probe at most every 30 seconds; the browser keeps polling after load. */
export const revalidate = 30;

async function readHealth(): Promise<FullHealth | null> {
  try {
    const res = await fetch(`${DOCS_API_BASE_URL}/health/full`, {
      next: { revalidate },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return (await res.json()) as FullHealth;
  } catch {
    // Unreachable at build time or during an outage: the client probe takes over.
    return null;
  }
}

export default async function StatusPage() {
  const health = await readHealth();
  return <StatusBoard initialHealth={health} initialCheckedAt={health ? new Date().toISOString() : null} />;
}
