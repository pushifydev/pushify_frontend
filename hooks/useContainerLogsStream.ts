'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, getAccessToken } from '@/lib/api/client';
import { containerLogsReconnectPlan } from '@/lib/log-stream-reconnect';

interface ContainerLogMessage {
  type: 'connected' | 'log' | 'error' | 'end' | 'ping';
  message?: string;
  containerName?: string;
  live?: boolean;
  remote?: boolean;
}

interface UseContainerLogsStreamResult {
  logs: string[];
  isConnected: boolean;
  isLive: boolean;
  error: string | null;
  containerName: string | null;
  reconnect: () => void;
  clearLogs: () => void;
}

function parseSseMessages(
  buffer: string,
  onData: (data: ContainerLogMessage) => void
): string {
  const parts = buffer.split('\n\n');
  const remainder = parts.pop() ?? '';

  for (const part of parts) {
    const line = part
      .split('\n')
      .find((l) => l.startsWith('data: '));
    if (!line) continue;
    try {
      onData(JSON.parse(line.slice(6)) as ContainerLogMessage);
    } catch {
      // ignore malformed frames
    }
  }

  return remainder;
}

export function useContainerLogsStream(
  projectId: string,
  deploymentId: string,
  enabled: boolean = true
): UseContainerLogsStreamResult {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerName, setContainerName] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const endedGracefullyRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const streamStartedAtRef = useRef<string | null>(null);
  const lastEventAtRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const maxReconnectAttempts = 3;

  const closeStream = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(
    (options?: { since?: string; append?: boolean }) => {
      if (!projectId || !deploymentId || !enabled || !mountedRef.current) return;

      closeStream();
      endedGracefullyRef.current = false;

      // A fresh connect (open, resume, new deployment) gets the full tail again — start
      // from an empty screen so those lines are not shown twice.
      if (!options?.append) {
        setLogs([]);
        streamStartedAtRef.current = null;
        lastEventAtRef.current = null;
      }

      const token = getAccessToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const params = new URLSearchParams({ token });
      if (options?.since) {
        params.set('since', options.since);
      }

      const url = `${API_BASE_URL}/projects/${projectId}/deployments/${deploymentId}/container-logs/stream?${params.toString()}`;

      const controller = new AbortController();
      abortRef.current = controller;

      const fetchStream = async () => {
        try {
          setError(null);
          if (!options?.append) {
            setIsLive(false);
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });

          if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(
              (body as { error?: string }).error || `HTTP ${response.status}`
            );
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          setIsConnected(true);
          if (!streamStartedAtRef.current) {
            streamStartedAtRef.current = new Date().toISOString();
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            buffer = parseSseMessages(buffer, (data) => {
              switch (data.type) {
                case 'connected':
                  setContainerName(data.containerName ?? null);
                  setIsLive(data.live ?? true);
                  reconnectAttemptsRef.current = 0;
                  break;
                case 'log':
                  if (data.message !== undefined) {
                    lastEventAtRef.current = new Date().toISOString();
                    setLogs((prev) => [...prev, data.message!]);
                  }
                  break;
                case 'error':
                  setError(data.message || 'Unknown error');
                  closeStream();
                  break;
                case 'end':
                  endedGracefullyRef.current = true;
                  setIsLive(false);
                  closeStream();
                  break;
                case 'ping':
                  break;
              }
            });
          }

          if (!endedGracefullyRef.current && !controller.signal.aborted) {
            throw new Error('Connection closed unexpectedly');
          }
        } catch (err) {
          // Closed on purpose (unmount, pause, or a newer connect took over) — no retry.
          if ((err instanceof Error && err.name === 'AbortError') || controller.signal.aborted) {
            return;
          }

          closeStream();
          setIsLive(false);

          if (!endedGracefullyRef.current) {
            setError(err instanceof Error ? err.message : 'Connection failed');

            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
              reconnectAttemptsRef.current += 1;
              reconnectTimerRef.current = setTimeout(() => {
                reconnectTimerRef.current = null;
                connect(
                  containerLogsReconnectPlan({
                    lastEventAt: lastEventAtRef.current,
                    streamStartedAt: streamStartedAtRef.current,
                  })
                );
              }, 2000 * reconnectAttemptsRef.current);
            }
          }
        }
      };

      void fetchStream();
    },
    [projectId, deploymentId, enabled, closeStream]
  );

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    endedGracefullyRef.current = false;
    setError(null);
    connect(); // a fresh connect clears the logs and the stream timestamps
  }, [connect]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Declared before the connect effect so it is set by the time that effect runs.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      closeStream();
    }

    return () => {
      closeStream();
    };
  }, [connect, enabled, closeStream]);

  return {
    logs,
    isConnected,
    isLive,
    error,
    containerName,
    reconnect,
    clearLogs,
  };
}
