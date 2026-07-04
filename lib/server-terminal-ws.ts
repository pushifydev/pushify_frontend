import { getAccessToken } from '@/lib/api/client';

export function getServerTerminalWsUrl(
  serverId: string,
  cols: number,
  rows: number,
): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const wsBase = apiUrl.replace(/^http/, 'ws');
  const params = new URLSearchParams({
    token,
    cols: String(cols),
    rows: String(rows),
  });

  return `${wsBase}/ws/servers/${serverId}/terminal?${params.toString()}`;
}

export function getProjectShellWsUrl(
  projectId: string,
  cols: number,
  rows: number,
): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const wsBase = apiUrl.replace(/^http/, 'ws');
  const params = new URLSearchParams({
    token,
    cols: String(cols),
    rows: String(rows),
  });

  return `${wsBase}/ws/projects/${projectId}/shell?${params.toString()}`;
}
