import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api/client', () => ({ getAccessToken: () => 'test-token' }));

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  sent: Record<string, unknown>[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(JSON.parse(data));
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
}

vi.stubGlobal('WebSocket', FakeWebSocket);

const { PushifyWebSocket } = await import('./ws');

describe('PushifyWebSocket subscriptions', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
  });

  it('sends a subscribe made before the connection opens once it opens', () => {
    const ws = new PushifyWebSocket();
    ws.subscribe('project:abc');
    ws.connect();

    const socket = FakeWebSocket.instances[0];
    expect(socket.sent).toEqual([]);

    socket.open();
    expect(socket.sent).toContainEqual({ action: 'subscribe', channel: 'project:abc' });
    ws.disconnect();
  });

  it('sends a subscribe made while connecting once the connection opens', () => {
    const ws = new PushifyWebSocket();
    ws.connect();
    ws.subscribe('project:abc');

    const socket = FakeWebSocket.instances[0];
    expect(socket.sent).toEqual([]);

    socket.open();
    expect(socket.sent).toContainEqual({ action: 'subscribe', channel: 'project:abc' });
    ws.disconnect();
  });

  it('does not resubscribe a channel that was unsubscribed before open', () => {
    const ws = new PushifyWebSocket();
    ws.connect();
    ws.subscribe('project:abc');
    ws.unsubscribe('project:abc');

    const socket = FakeWebSocket.instances[0];
    socket.open();
    expect(socket.sent).not.toContainEqual({ action: 'subscribe', channel: 'project:abc' });
    ws.disconnect();
  });
});
