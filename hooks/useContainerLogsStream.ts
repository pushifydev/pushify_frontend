'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, getAccessToken } from '@/lib/api/client';

interface ContainerLogMessage {
  type: 'connected' | 'log' | 'error' | 'end';
  message?: string;
  containerName?: string;
}

interface UseContainerLogsStreamResult {
  logs: string[];
  isConnected: boolean;
  error: string | null;
  containerName: string | null;
  reconnect: () => void;
  clearLogs: () => void;
}

export function useContainerLogsStream(
  projectId: string,
  deploymentId: string,
  enabled: boolean = true
): UseContainerLogsStreamResult {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerName, setContainerName] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const closeStream = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!projectId || !deploymentId || !enabled) return;

    // Get auth token
    const token = getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setError(null);

    // Create EventSource with auth
    const url = `${API_BASE_URL}/projects/${projectId}/deployments/${deploymentId}/container-logs/stream`;

    // EventSource doesn't support custom headers, so we use a workaround with fetch
    const eventSource = new EventSource(`${url}?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ContainerLogMessage = JSON.parse(event.data);

        switch (data.type) {
          case 'connected':
            setContainerName(data.containerName || null);
            break;
          case 'log':
            if (data.message) {
              setLogs((prev) => [...prev, data.message!]);
            }
            break;
          case 'error':
            setError(data.message || 'Unknown error');
            closeStream();
            break;
          case 'end':
            // Snapshot stream finished — do not auto-reconnect (avoids duplicate logs)
            closeStream();
            break;
        }
      } catch {
        // Raw log line
        setLogs((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = () => {
      // Ignore close after normal end; only surface unexpected disconnects
      if (eventSourceRef.current !== eventSource) return;
      closeStream();
    };
  }, [projectId, deploymentId, enabled, closeStream]);

  const reconnect = useCallback(() => {
    setLogs([]);
    setError(null);
    connect();
  }, [connect]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      closeStream();
    };
  }, [connect, enabled, closeStream]);

  return {
    logs,
    isConnected,
    error,
    containerName,
    reconnect,
    clearLogs,
  };
}
