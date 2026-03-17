import { getAccessToken } from '../client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiStatusResponse {
  available: boolean;
}

export const getAiStatus = async (): Promise<AiStatusResponse> => {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}/ai/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  return json.data;
};

export async function* streamAiChat(
  messages: AiChatMessage[],
  context?: string,
  signal?: AbortSignal
): AsyncGenerator<{ type: 'text' | 'done' | 'error'; content?: string }> {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, context }),
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Request failed' } }));
    yield { type: 'error', content: error.error?.message || 'Request failed' };
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    yield { type: 'error', content: 'No response stream' };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const jsonStr = line.slice(5).trim();
        if (!jsonStr) continue;
        try {
          const parsed = JSON.parse(jsonStr);
          yield parsed;
        } catch {
          // skip malformed lines
        }
      }
    }
  }
}
