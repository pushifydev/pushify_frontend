import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ token: 'test-token' }));
vi.mock('./api/client', () => ({ getAccessToken: () => auth.token }));

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

  /** Simulate the server/network dropping the connection. */
  drop() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
}

vi.stubGlobal('WebSocket', FakeWebSocket);
// Unit tests run in the node environment; provide the browser event targets ws.ts listens on.
const fakeWindow = new EventTarget();
const fakeDocument = Object.assign(new EventTarget(), { visibilityState: 'visible' });
vi.stubGlobal('window', fakeWindow);
vi.stubGlobal('document', fakeDocument);

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

describe('PushifyWebSocket reconnection', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    auth.token = 'test-token';
    fakeDocument.visibilityState = 'visible';
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function exhaustReconnects() {
    // Initial drop + every scheduled retry also failing until the backoff gives up.
    FakeWebSocket.instances.at(-1)!.drop();
    for (let i = 0; i < 20; i++) {
      vi.runOnlyPendingTimers();
      const last = FakeWebSocket.instances.at(-1)!;
      if (last.readyState === FakeWebSocket.CLOSED) break;
      last.drop();
    }
  }

  it('reconnects on the online event after max reconnect attempts were exhausted', () => {
    const ws = new PushifyWebSocket();
    ws.connect();
    FakeWebSocket.instances[0].open();

    exhaustReconnects();
    const countAfterGivingUp = FakeWebSocket.instances.length;
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(FakeWebSocket.instances.length).toBe(countAfterGivingUp);

    window.dispatchEvent(new Event('online'));
    expect(FakeWebSocket.instances.length).toBe(countAfterGivingUp + 1);

    FakeWebSocket.instances.at(-1)!.open();
    expect(ws.isConnected).toBe(true);
    ws.disconnect();
  });

  it('reconnects when the page becomes visible but not while hidden', () => {
    const ws = new PushifyWebSocket();
    ws.connect();
    FakeWebSocket.instances[0].open();
    exhaustReconnects();
    const count = FakeWebSocket.instances.length;

    fakeDocument.visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(FakeWebSocket.instances.length).toBe(count);

    fakeDocument.visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
    expect(FakeWebSocket.instances.length).toBe(count + 1);
    ws.disconnect();
  });

  it('does not reconnect on online after an intentional disconnect', () => {
    const ws = new PushifyWebSocket();
    ws.connect();
    FakeWebSocket.instances[0].open();
    ws.disconnect();

    window.dispatchEvent(new Event('online'));
    expect(FakeWebSocket.instances.length).toBe(1);
  });

  it('uses the new access token after reconnect()', () => {
    const ws = new PushifyWebSocket();
    ws.connect();
    const first = FakeWebSocket.instances[0];
    first.open();
    expect(first.url).toContain('token=test-token');

    auth.token = 'org-b-token';
    ws.reconnect();

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances[1].url).toContain('token=org-b-token');
    expect(first.readyState).toBe(FakeWebSocket.CLOSED);

    // A late onclose from the replaced socket must not schedule a stray reconnect.
    first.onclose?.();
    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    ws.disconnect();
  });

  it('resubscribes existing channels after reconnect()', () => {
    const ws = new PushifyWebSocket();
    ws.subscribe('project:abc');
    ws.subscribe('server:xyz');
    ws.connect();
    FakeWebSocket.instances[0].open();

    ws.reconnect();
    const second = FakeWebSocket.instances[1];
    expect(second.sent).toEqual([]);
    second.open();

    expect(second.sent).toContainEqual({ action: 'subscribe', channel: 'project:abc' });
    expect(second.sent).toContainEqual({ action: 'subscribe', channel: 'server:xyz' });
    expect(ws.isConnected).toBe(true);
    ws.disconnect();
  });
});
