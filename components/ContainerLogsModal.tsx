'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, Terminal, Trash2, Pause, Play } from 'lucide-react';
import { useContainerLogsStream, useTranslation } from '@/hooks';

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
  const { t } = useTranslation();
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const prevLogCountRef = useRef(0);
  const initialScrollDoneRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const SCROLL_THRESHOLD_PX = 80;

  const isNearBottom = (container: HTMLElement) =>
    container.scrollHeight - container.scrollTop - container.clientHeight < SCROLL_THRESHOLD_PX;

  const scrollLogsToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = logsContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const { logs, isConnected, error, containerName, reconnect, clearLogs } =
    useContainerLogsStream(projectId, deploymentId, !isPaused);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    initialScrollDoneRef.current = false;
    prevLogCountRef.current = 0;
    setAutoScroll(true);
  }, [deploymentId]);

  useEffect(() => {
    if (logs.length === 0) {
      prevLogCountRef.current = 0;
      initialScrollDoneRef.current = false;
    }
  }, [logs.length]);

  useEffect(() => {
    const container = logsContainerRef.current;
    if (!container || !autoScroll || logs.length === 0) return;

    const grew = logs.length > prevLogCountRef.current;
    prevLogCountRef.current = logs.length;
    if (!grew) return;

    requestAnimationFrame(() => {
      const el = logsContainerRef.current;
      if (!el || !autoScroll) return;

      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        scrollLogsToBottom('smooth');
        return;
      }

      if (isNearBottom(el)) {
        scrollLogsToBottom('auto');
      }
    });
  }, [logs, autoScroll]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleScroll = () => {
    if (!logsContainerRef.current) return;
    setAutoScroll(isNearBottom(logsContainerRef.current));
  };

  const handleJumpToBottom = () => {
    setAutoScroll(true);
    scrollLogsToBottom('smooth');
  };

  const handleClearLogs = () => {
    clearLogs();
    prevLogCountRef.current = 0;
    initialScrollDoneRef.current = false;
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="container-logs-title"
        className="relative w-full max-w-5xl h-[100dvh] sm:h-[85vh] max-h-[100dvh] sm:max-h-[90vh] flex flex-col
                   rounded-t-2xl sm:rounded-xl overflow-hidden
                   bg-[var(--bg-primary)] border border-[var(--border-subtle)] sm:border
                   shadow-2xl animate-scale-in pb-[env(safe-area-inset-bottom)]"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <div className="flex items-center justify-between gap-2 px-3 pt-3 sm:px-5 sm:py-4 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Terminal className="w-5 h-5 text-[var(--accent-cyan)] shrink-0" />
              <div className="min-w-0">
                <h2
                  id="container-logs-title"
                  className="text-base sm:text-lg font-semibold truncate"
                >
                  Container Logs
                </h2>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs sm:text-sm text-[var(--text-muted)]">
                  <span className="terminal-text truncate max-w-[140px] sm:max-w-none">
                    {projectName}
                  </span>
                  {containerName && (
                    <>
                      <span>/</span>
                      <span className="font-mono text-[var(--accent-purple)] truncate max-w-[180px] sm:max-w-none">
                        {containerName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-colors"
              aria-label={t('common', 'close')}
            >
              <X className="w-5 h-5" strokeWidth={2.25} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2 px-3 pb-3 sm:px-5 sm:pb-4 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--status-success)] shrink-0 mr-1">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-muted)] shrink-0 mr-1">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                <span className="hidden min-[380px]:inline">Disconnected</span>
              </span>
            )}

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn btn-ghost h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1 shrink-0"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="btn btn-ghost h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1 shrink-0"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            {!isConnected && (
              <button
                onClick={reconnect}
                className="btn btn-ghost h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reconnect</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 px-3 py-2.5 sm:px-5 sm:py-3 bg-[var(--status-error)]/10 border-b border-[var(--status-error)]/20">
            <p className="text-xs sm:text-sm text-[var(--status-error)] break-words">{error}</p>
          </div>
        )}

        <div
          ref={logsContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-auto p-3 sm:p-4 bg-[#0d1117] font-mono text-xs sm:text-sm touch-pan-y"
        >
          {logs.length > 0 ? (
            <div className="text-[#c9d1d9] leading-relaxed">
              {logs.map((line, i) => {
                let lineClass = '';
                const lowerLine = line.toLowerCase();

                if (
                  lowerLine.includes('error') ||
                  lowerLine.includes('err ') ||
                  lowerLine.includes('fatal')
                ) {
                  lineClass = 'text-[#f85149]';
                } else if (lowerLine.includes('warn')) {
                  lineClass = 'text-[#d29922]';
                } else if (lowerLine.includes('info')) {
                  lineClass = 'text-[#58a6ff]';
                } else if (lowerLine.includes('debug')) {
                  lineClass = 'text-[#8b949e]';
                } else if (
                  lowerLine.includes('success') ||
                  lowerLine.includes('ready') ||
                  lowerLine.includes('listening')
                ) {
                  lineClass = 'text-[#3fb950]';
                }

                return (
                  <div
                    key={i}
                    className={`${lineClass} py-0.5 px-1 sm:px-2 -mx-1 sm:-mx-2 hover:bg-white/5 whitespace-pre-wrap break-all`}
                  >
                    {line || '\u00A0'}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[120px] text-[var(--text-muted)] text-center px-4">
              {isConnected ? (
                <div className="flex items-center gap-2 text-sm">
                  <Terminal className="w-5 h-5 animate-pulse shrink-0" />
                  <span>Waiting for logs...</span>
                </div>
              ) : isPaused ? (
                <span className="text-sm">Streaming paused</span>
              ) : (
                <span className="text-sm">Connecting to container...</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-3 py-2.5 sm:px-5 sm:py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0">{logs.length} lines</span>
              {!autoScroll && (
                <button
                  type="button"
                  onClick={handleJumpToBottom}
                  className="text-[var(--accent-cyan)] hover:underline truncate"
                >
                  Jump to bottom
                </button>
              )}
            </div>
            <span className="hidden sm:inline shrink-0">
              Press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary w-full sm:hidden h-11 text-sm font-medium"
          >
            {t('common', 'close')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
