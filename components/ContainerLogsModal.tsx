'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, Terminal, Trash2, Pause, Play } from 'lucide-react';
import { useContainerLogsStream } from '@/hooks';

interface ContainerLogsModalProps {
  projectId: string;
  deploymentId: string;
  projectName: string;
  onClose: () => void;
}

export function ContainerLogsModal({
  projectId,
  deploymentId,
  projectName,
  onClose,
}: ContainerLogsModalProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const { logs, isConnected, error, containerName, reconnect, clearLogs } =
    useContainerLogsStream(projectId, deploymentId, !isPaused);

  // Wait for client-side mount for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current && logsContainerRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Detect scroll position to enable/disable auto-scroll
  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    const container = logsContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  // Don't render until mounted (for portal)
  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-xl overflow-hidden
                   bg-[var(--bg-primary)] border border-[var(--border-subtle)]
                   shadow-2xl animate-scale-in"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[var(--accent-cyan)]" />
            <div>
              <h2 className="text-lg font-semibold">Container Logs</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="terminal-text">{projectName}</span>
                {containerName && (
                  <>
                    <span>/</span>
                    <span className="font-mono text-[var(--accent-purple)]">{containerName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status */}
            {isConnected ? (
              <span className="flex items-center gap-1 text-sm text-[var(--status-success)]">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                Disconnected
              </span>
            )}

            {/* Pause/Resume */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn btn-ghost h-8 px-3 text-sm flex items-center gap-1"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            {/* Clear logs */}
            <button
              onClick={clearLogs}
              className="btn btn-ghost h-8 px-3 text-sm flex items-center gap-1"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>

            {/* Reconnect */}
            {!isConnected && (
              <button
                onClick={reconnect}
                className="btn btn-ghost h-8 px-3 text-sm flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="btn btn-ghost h-8 w-8 p-0 flex items-center justify-center hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex-shrink-0 px-5 py-3 bg-[var(--status-error)]/10 border-b border-[var(--status-error)]/20">
            <p className="text-sm text-[var(--status-error)]">{error}</p>
          </div>
        )}

        {/* Logs Container */}
        <div
          ref={logsContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-auto p-4 bg-[#0d1117] font-mono text-sm"
        >
          {logs.length > 0 ? (
            <div className="text-[#c9d1d9] leading-relaxed">
              {logs.map((line, i) => {
                // Color different types of log lines
                let lineClass = '';
                const lowerLine = line.toLowerCase();

                if (lowerLine.includes('error') || lowerLine.includes('err ') || lowerLine.includes('fatal')) {
                  lineClass = 'text-[#f85149]';
                } else if (lowerLine.includes('warn')) {
                  lineClass = 'text-[#d29922]';
                } else if (lowerLine.includes('info')) {
                  lineClass = 'text-[#58a6ff]';
                } else if (lowerLine.includes('debug')) {
                  lineClass = 'text-[#8b949e]';
                } else if (lowerLine.includes('success') || lowerLine.includes('ready') || lowerLine.includes('listening')) {
                  lineClass = 'text-[#3fb950]';
                }

                return (
                  <div
                    key={i}
                    className={`${lineClass} py-0.5 px-2 -mx-2 hover:bg-white/5 whitespace-pre-wrap break-all`}
                  >
                    {line || '\u00A0'}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 animate-pulse" />
                  <span>Waiting for logs...</span>
                </div>
              ) : isPaused ? (
                <span>Streaming paused</span>
              ) : (
                <span>Connecting to container...</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span>{logs.length} lines</span>
              {!autoScroll && (
                <button
                  onClick={() => {
                    setAutoScroll(true);
                    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[var(--accent-cyan)] hover:underline"
                >
                  Jump to bottom
                </button>
              )}
            </div>
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
