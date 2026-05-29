import { API_BASE_URL } from '@/lib/api/client';

/** Matches backend GET /projects/:id/webhook URL shape */
export function buildGitWebhookUrl(
  projectId: string,
  gitProvider?: string | null,
  gitRepoUrl?: string | null
): string {
  const provider =
    gitProvider === 'gitlab' || gitRepoUrl?.includes('gitlab')
      ? 'gitlab'
      : 'github';
  return `${API_BASE_URL}/webhooks/${provider}/${projectId}`;
}
