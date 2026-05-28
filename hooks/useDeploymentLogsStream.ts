'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, getAccessToken } from '@/lib/api/client';

interface StreamData {
  status: string;
  logs: string;
  errorMessage?: string | null;
  isComplete: boolean;
}

interface UseDeploymentLogsStreamResult {
  logs: string;
  status: string;
  errorMessage: string | null;
  isComplete: boolean;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export function useDeploymentLogsStream(
  projectId: string | null,
  deploymentId: string | null
): UseDeploymentLogsStreamResult {
  const [logs, setLogs] = useState<string>('');
  const [status, setStatus] = useState<string>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const isCompleteRef = useRef(false);
  const maxReconnectAttempts = 3;

  const closeStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!projectId || !deploymentId) return;

    closeStream();

    const token = getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    // Create URL with auth token as query param (SSE doesn't support headers)
    const url = `${API_BASE_URL}/projects/${projectId}/deployments/${deploymentId}/logs/stream?token=${encodeURIComponent(token)}`;

    // Use fetch with SSE parsing since EventSource doesn't support custom headers
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchStream = async () => {
      try {
        setIsConnected(true);
        setError(null);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if it's a JSON response (non-streaming for completed deployments)
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          if (data.data) {
            setLogs(data.data.logs || '');
            setStatus(data.data.status);
            setErrorMessage(data.data.errorMessage || null);
            isCompleteRef.current = !!data.data.isComplete;
            setIsComplete(!!data.data.isComplete);
          }
          closeStream();
          return;
        }

        // Handle SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            closeStream();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep incomplete message in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const data: StreamData = JSON.parse(jsonStr);

                if (data.logs) {
                  setLogs((prev) => prev + data.logs);
                }
                if (data.status) {
                  setStatus(data.status);
                }
                if (data.errorMessage !== undefined) {
                  setErrorMessage(data.errorMessage);
                }
                if (data.isComplete) {
                  isCompleteRef.current = true;
                  setIsComplete(true);
                  closeStream();
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Normal abort, not an error
        }

        setError(err instanceof Error ? err.message : 'Connection failed');
        closeStream();

        if (!isCompleteRef.current && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(() => {
            connect();
          }, 2000 * reconnectAttempts.current);
        }
      }
    };

    fetchStream();
  }, [projectId, deploymentId, closeStream]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    isCompleteRef.current = false;
    setLogs('');
    setIsComplete(false);
    setError(null);
    connect();
  }, [connect]);

  useEffect(() => {
    isCompleteRef.current = false;
    connect();

    return () => {
      closeStream();
    };
  }, [connect, closeStream]);

  return {
    logs,
    status,
    errorMessage,
    isComplete,
    isConnected,
    error,
    reconnect,
  };
}
