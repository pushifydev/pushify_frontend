import { getAccessToken } from './api/client';

// ============ Types (mirror backend WS types) ============

export type WSEventType =
  | 'deployment:status'
  | 'deployment:created'
  | 'metrics:update'
  | 'server:status'
  | 'server:setup'
  | 'healthcheck:result'
  | 'notification:new'
  | 'backup:status';

export interface WSEvent {
  type: WSEventType;
  data: Record<string, unknown>;
}

export type WSServerMessage =
  | { type: 'event'; event: WSEvent; channel: string }
  | { type: 'subscribed'; channel: string }
  | { type: 'unsubscribed'; channel: string }
  | { type: 'error'; message: string }
  | { type: 'pong' }
  | { type: 'connected'; clientId: string };

// ============ Constants ============

const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const MAX_RECONNECT_ATTEMPTS = 10;
const HEARTBEAT_INTERVAL = 25000;

// ============ WS Client ============

type EventHandler = (data: Record<string, unknown>, channel: string) => void;
type AnyEventHandler = (event: WSEvent, channel: string) => void;
type ConnectionChangeHandler = (connected: boolean) => void;

export class PushifyWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private anyHandlers = new Set<AnyEventHandler>();
  private connectionHandlers = new Set<ConnectionChangeHandler>();
  private subscriptions = new Set<string>();
  private _isConnected = false;
  private intentionalClose = false;

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    // Convert http(s) to ws(s)
    this.url = apiUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '') + '/api/v1/ws';
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  // ============ Connection ============

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.warn('[WS] No access token, skipping connection');
      return;
    }

    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(`${this.url}?token=${token}`);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this._isConnected = true;
        this.notifyConnectionChange(true);
        this.startHeartbeat();

        // Resubscribe to all channels
        for (const channel of this.subscriptions) {
          this.sendMessage({ action: 'subscribe', channel });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSServerMessage = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch {
          // Ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this._isConnected = false;
        this.notifyConnectionChange(false);
        this.stopHeartbeat();

        if (!this.intentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        // onclose will fire after onerror
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    this.reconnectAttempts = 0;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this._isConnected = false;
    this.notifyConnectionChange(false);
  }

  // ============ Subscriptions ============

  subscribe(channel: string): void {
    this.subscriptions.add(channel);
    if (this._isConnected) {
      this.sendMessage({ action: 'subscribe', channel });
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
    if (this._isConnected) {
      this.sendMessage({ action: 'unsubscribe', channel });
    }
  }

  // ============ Event Listeners ============

  on(eventType: WSEventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);

    // Return cleanup function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  onAny(handler: AnyEventHandler): () => void {
    this.anyHandlers.add(handler);
    return () => {
      this.anyHandlers.delete(handler);
    };
  }

  onConnectionChange(handler: ConnectionChangeHandler): () => void {
    this.connectionHandlers.add(handler);
    // Immediately notify current state
    handler(this._isConnected);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  // ============ Private ============

  private handleMessage(msg: WSServerMessage): void {
    switch (msg.type) {
      case 'event': {
        const { event, channel } = msg;

        // Notify specific handlers
        const handlers = this.eventHandlers.get(event.type);
        if (handlers) {
          for (const handler of handlers) {
            try {
              handler(event.data, channel);
            } catch {
              // Don't let handler errors crash the WS
            }
          }
        }

        // Notify any-event handlers
        for (const handler of this.anyHandlers) {
          try {
            handler(event, channel);
          } catch {
            // Don't let handler errors crash the WS
          }
        }
        break;
      }
      case 'pong':
        // Server heartbeat response, connection is alive
        break;
      case 'connected':
        // Connection confirmed
        break;
      case 'error':
        console.warn('[WS] Server error:', msg.message);
        break;
    }
  }

  private sendMessage(msg: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({ action: 'ping' });
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WS] Max reconnect attempts reached');
      return;
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private notifyConnectionChange(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      try {
        handler(connected);
      } catch {
        // Ignore handler errors
      }
    }
  }
}
