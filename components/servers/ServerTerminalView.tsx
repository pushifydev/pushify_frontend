'use client';

import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef, useCallback } from 'react';
import { getServerTerminalWsUrl, getProjectShellWsUrl } from '@/lib/server-terminal-ws';
import { useTranslation } from '@/hooks';

/** Lines written into the terminal itself (no locale keys for these yet). */
const COPY = {
  en: {
    notAuthenticated: 'Not authenticated — please sign in again.',
    terminalError: 'Terminal error',
    sessionEnded: 'Session ended.',
    wsFailed: 'WebSocket connection failed.',
    connecting: 'Connecting to server…',
  },
  tr: {
    notAuthenticated: 'Oturum bulunamadı — lütfen yeniden giriş yapın.',
    terminalError: 'Terminal hatası',
    sessionEnded: 'Oturum sona erdi.',
    wsFailed: 'WebSocket bağlantısı kurulamadı.',
    connecting: 'Sunucuya bağlanılıyor…',
  },
} as const;

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
  const { locale } = useTranslation();
  const copyRef = useRef<(typeof COPY)[keyof typeof COPY]>(COPY.en);
  useEffect(() => {
    copyRef.current = locale === 'tr' ? COPY.tr : COPY.en;
  }, [locale]);

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
        termRef.current?.writeln(`\r\n\x1b[31m${copyRef.current.notAuthenticated}\x1b[0m`);
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
              term.writeln(`\r\n\x1b[31m${msg.message ?? copyRef.current.terminalError}\x1b[0m`);
              notify('error');
              break;
            case 'exit':
              term.writeln(`\r\n\x1b[33m${copyRef.current.sessionEnded}\x1b[0m`);
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
        termRef.current?.writeln(`\r\n\x1b[31m${copyRef.current.wsFailed}\x1b[0m`);
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
        // Neutral palette: black canvas, off-white ink, green kept for ANSI green
        // (prompts), red/yellow for real errors/warnings; blue/cyan/magenta muted.
        theme: {
          background: '#000000',
          foreground: '#e7e7e4',
          cursor: '#e7e7e4',
          cursorAccent: '#000000',
          selectionBackground: 'rgba(255, 255, 255, 0.2)',
          black: '#000000',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#fbbf24',
          blue: '#c8c8c4',
          magenta: '#c8c8c4',
          cyan: '#c8c8c4',
          white: '#e7e7e4',
          brightBlack: '#8a8a86',
          brightRed: '#fca5a5',
          brightGreen: '#86efac',
          brightYellow: '#fcd34d',
          brightBlue: '#e7e7e4',
          brightMagenta: '#e7e7e4',
          brightCyan: '#e7e7e4',
          brightWhite: '#ffffff',
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

      term.writeln(`\x1b[90m${copyRef.current.connecting}\x1b[0m`);
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
      className="w-full h-full p-2"
      style={{ minHeight: 400, background: '#000000' }}
    />
  );
}
