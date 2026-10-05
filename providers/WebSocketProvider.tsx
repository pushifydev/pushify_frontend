'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  // Held in state (not a ref) so consumers re-run their effects once the instance exists.
  // Child effects run before this provider's effect, so the first subscribe() calls from
  // useWebSocketEvent happen while ws is still null; when setWs() fires, `subscribe`
  // changes identity and those effects re-subscribe on the real instance.
  const [ws, setWs] = useState<PushifyWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Create and connect
    const instance = new PushifyWebSocket();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the instance is an external resource tied to auth state
    setWs(instance);

    const cleanup = instance.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    instance.connect();

    return () => {
      cleanup();
      instance.disconnect();
      setWs(null);
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  const subscribe = useCallback(
    (channel: string) => {
      ws?.subscribe(channel);
    },
    [ws]
  );

  const unsubscribe = useCallback(
    (channel: string) => {
      ws?.unsubscribe(channel);
    },
    [ws]
  );

  const value = useMemo(
    () => ({ ws, isConnected, subscribe, unsubscribe }),
    [ws, isConnected, subscribe, unsubscribe]
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
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
