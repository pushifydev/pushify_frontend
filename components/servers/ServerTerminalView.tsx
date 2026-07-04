'use client';

import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef, useCallback } from 'react';
import { getServerTerminalWsUrl, getProjectShellWsUrl } from '@/lib/server-terminal-ws';

interface ServerTerminalViewProps {
  /** SSH terminal into a server (exactly one of serverId/projectId must be set) */
  serverId?: string;
  /** Shell into a project's app container */
  projectId?: string;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

export function ServerTerminalView({ serverId, projectId, onStatusChange }: ServerTerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<import('@xterm/xterm').Terminal | null>(null);
  const fitRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notify = useCallback(
    (status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
      onStatusChange?.(status);
    },
    [onStatusChange],
  );

  const sendResize = useCallback(() => {
    const term = termRef.current;
    const ws = wsRef.current;
    if (!term || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
  }, []);

  const connectSocket = useCallback(
    (cols: number, rows: number) => {
      const url = projectId
        ? getProjectShellWsUrl(projectId, cols, rows)
        : serverId
          ? getServerTerminalWsUrl(serverId, cols, rows)
          : null;
      if (!url) {
        termRef.current?.writeln('\r\n\x1b[31mNot authenticated — please sign in again.\x1b[0m');
        notify('error');
        return;
      }

      notify('connecting');
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25_000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            data?: string;
            message?: string;
          };

          const term = termRef.current;
          if (!term) return;

          switch (msg.type) {
            case 'ready':
              notify('connected');
              sendResize();
              break;
            case 'output':
              if (msg.data) term.write(msg.data);
              break;
            case 'error':
              term.writeln(`\r\n\x1b[31m${msg.message ?? 'Terminal error'}\x1b[0m`);
              notify('error');
              break;
            case 'exit':
              term.writeln('\r\n\x1b[33mSession ended.\x1b[0m');
              notify('disconnected');
              break;
            case 'pong':
              break;
            default:
              break;
          }
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => {
        termRef.current?.writeln('\r\n\x1b[31mWebSocket connection failed.\x1b[0m');
        notify('error');
      };

      ws.onclose = () => {
        if (pingRef.current) {
          clearInterval(pingRef.current);
          pingRef.current = null;
        }
        notify('disconnected');
      };
    },
    [serverId, projectId, notify, sendResize],
  );

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    const init = async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      if (disposed || !containerRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        theme: {
          background: '#0a0a0f',
          foreground: '#e4e4e7',
          cursor: '#6366f1',
          selectionBackground: 'rgba(99, 102, 241, 0.35)',
        },
      });

      term.onData((data) => {
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'input', data }));
        }
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);
      fitAddon.fit();

      termRef.current = term;
      fitRef.current = fitAddon;

      term.writeln('\x1b[36mConnecting to server…\x1b[0m');
      connectSocket(term.cols, term.rows);

      resizeObserver = new ResizeObserver(() => {
        if (disposed) return;
        fitAddon.fit();
        sendResize();
      });
      resizeObserver.observe(containerRef.current);
    };

    void init();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
      wsRef.current = null;
      termRef.current?.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [serverId, projectId, connectSocket, sendResize]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-1"
      style={{ minHeight: 400, background: '#0a0a0f' }}
    />
  );
}
