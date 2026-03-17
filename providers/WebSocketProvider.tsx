'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { PushifyWebSocket, type WSEventType } from '@/lib/ws';
import { useAuthStore } from '@/stores/auth';

// ============ Context ============

interface WebSocketContextValue {
  ws: PushifyWebSocket | null;
  isConnected: boolean;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  ws: null,
  isConnected: false,
  subscribe: () => {},
  unsubscribe: () => {},
});

// ============ Provider ============

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<PushifyWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if user logs out
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create and connect
    const ws = new PushifyWebSocket();
    wsRef.current = ws;

    const cleanup = ws.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    ws.connect();

    return () => {
      cleanup();
      ws.disconnect();
      wsRef.current = null;
    };
  }, [isAuthenticated]);

  const subscribe = useCallback((channel: string) => {
    wsRef.current?.subscribe(channel);
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    wsRef.current?.unsubscribe(channel);
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, isConnected, subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ============ Hooks ============

export function useWebSocket() {
  return useContext(WebSocketContext);
}

/**
 * Subscribe to a specific WS event type. Optionally auto-subscribe to a channel.
 */
export function useWebSocketEvent<T = Record<string, unknown>>(
  eventType: WSEventType,
  callback: (data: T, channel: string) => void,
  options?: { channel?: string }
) {
  const { ws, subscribe, unsubscribe } = useWebSocket();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // Auto-subscribe to channel
  useEffect(() => {
    if (!options?.channel) return;
    subscribe(options.channel);
    return () => {
      unsubscribe(options.channel!);
    };
  }, [options?.channel, subscribe, unsubscribe]);

  // Listen for events
  useEffect(() => {
    if (!ws) return;
    return ws.on(eventType, (data, channel) => {
      callbackRef.current(data as T, channel);
    });
  }, [ws, eventType]);
}
