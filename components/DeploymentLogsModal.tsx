'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useDeploymentLogsStream, useTranslation } from '@/hooks';

interface DeploymentLogsModalProps {
  projectId: string;
  deploymentId: string;
  branch?: string | null;
  commitHash?: string | null;
  onClose: () => void;
}

export function DeploymentLogsModal({
  projectId,
  deploymentId,
  branch,
  commitHash,
  onClose,
}: DeploymentLogsModalProps) {
  const { t } = useTranslation();
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const prevLogLengthRef = useRef(0);
  const initialScrollDoneRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const SCROLL_THRESHOLD_PX = 80;

  const isNearBottom = (container: HTMLElement) =>
    container.scrollHeight - container.scrollTop - container.clientHeight < SCROLL_THRESHOLD_PX;

  const scrollLogsToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = logsContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const { logs, status, errorMessage, isComplete, isConnected, error, reconnect } =
    useDeploymentLogsStream(projectId, deploymentId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    initialScrollDoneRef.current = false;
    prevLogLengthRef.current = 0;
    setAutoScroll(true);
  }, [deploymentId]);

  useEffect(() => {
    if (!logs) {
      prevLogLengthRef.current = 0;
      initialScrollDoneRef.current = false;
    }
  }, [logs]);

  useEffect(() => {
    const container = logsContainerRef.current;
    if (!container || !autoScroll || !logs) return;

    const grew = logs.length > prevLogLengthRef.current;
    prevLogLengthRef.current = logs.length;
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

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-[var(--status-success)] shrink-0" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-[var(--status-error)] shrink-0" />;
      case 'building':
      case 'deploying':
      case 'pending':
        return <Loader2 className="w-5 h-5 text-[var(--accent-cyan)] animate-spin shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[var(--text-muted)] shrink-0" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'pending':
        return 'Queued';
      case 'building':
        return 'Building...';
      case 'deploying':
        return 'Deploying...';
      case 'running':
        return 'Deployed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'stopped':
        return 'Stopped';
      default:
        return status;
    }
  };

  const logLines = logs ? logs.split('\n') : [];

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
        aria-labelledby="deployment-logs-title"
        className="relative w-full max-w-4xl h-[100dvh] sm:h-[85vh] max-h-[100dvh] sm:max-h-[90vh] flex flex-col
                   rounded-t-2xl sm:rounded-xl overflow-hidden
                   bg-[var(--bg-primary)] border border-[var(--border-subtle)] sm:border
                   shadow-2xl animate-scale-in pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <div className="flex items-center justify-between gap-2 px-3 pt-3 sm:px-5 sm:py-4 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <FileText className="w-5 h-5 text-[var(--accent-cyan)] shrink-0 sm:hidden" />
              <div className="hidden sm:block shrink-0">{getStatusIcon()}</div>
              <div className="min-w-0">
                <h2
                  id="deployment-logs-title"
                  className="text-base sm:text-lg font-semibold truncate"
                >
                  Deployment Logs
                </h2>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs sm:text-sm text-[var(--text-muted)]">
                  <span className="sm:hidden shrink-0">{getStatusIcon()}</span>
                  <span className="terminal-text truncate max-w-[100px] sm:max-w-none">
                    {branch || 'main'}
                  </span>
                  {commitHash && (
                    <>
                      <span>/</span>
                      <span className="font-mono truncate">{commitHash.slice(0, 7)}</span>
                    </>
                  )}
                  <span>/</span>
                  <span
                    className={`font-medium truncate ${
                      status === 'failed' ? 'text-[var(--status-error)]' : ''
                    }`}
                  >
                    {getStatusLabel()}
                  </span>
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

          <div className="flex items-center gap-1 sm:gap-2 px-3 pb-3 sm:px-5 sm:pb-4 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--accent-cyan)] shrink-0 mr-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                Live
              </span>
            ) : isComplete ? (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-muted)] shrink-0 mr-1">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                Complete
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs sm:text-sm text-[var(--text-muted)] shrink-0 mr-1">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                <span className="hidden min-[380px]:inline">Disconnected</span>
              </span>
            )}

            {!isComplete && !isConnected && (
              <button
                type="button"
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
          {errorMessage && (
            <div className="mb-4 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg bg-[var(--status-error)]/10 border border-[var(--status-error)]/20">
              <p className="text-xs sm:text-sm text-[var(--status-error)] font-medium mb-1">
                Deployment Error:
              </p>
              <p className="text-xs sm:text-sm text-[var(--status-error)] break-all whitespace-pre-wrap">
                {errorMessage}
              </p>
            </div>
          )}
          {logLines.length > 0 ? (
            <div className="text-[#c9d1d9] leading-relaxed">
              {logLines.map((line, i) => {
                let lineClass = '';
                if (line.includes('[') && line.includes(']')) {
                  const afterTimestamp = line.split(']')[1] || '';
                  if (
                    afterTimestamp.includes('Error') ||
                    afterTimestamp.includes('failed') ||
                    afterTimestamp.includes('Failed') ||
                    line.includes('❌')
                  ) {
                    lineClass = 'text-[#f85149]';
                  } else if (
                    afterTimestamp.includes('Success') ||
                    afterTimestamp.includes('successful') ||
                    afterTimestamp.includes('completed') ||
                    line.includes('✅')
                  ) {
                    lineClass = 'text-[#3fb950]';
                  } else if (
                    afterTimestamp.includes('Warning') ||
                    afterTimestamp.includes('warning')
                  ) {
                    lineClass = 'text-[#d29922]';
                  } else if (line.includes('Status:') || line.includes('📦') || line.includes('🚀')) {
                    lineClass = 'text-[#58a6ff]';
                  } else if (line.includes('📥') || line.includes('🔨') || line.includes('🐳')) {
                    lineClass = 'text-[#a371f7]';
                  }
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
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <span>Waiting for logs...</span>
                </div>
              ) : (
                <span className="text-sm">No logs available</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-3 py-2.5 sm:px-5 sm:py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0">{logLines.length} lines</span>
              {!autoScroll && logLines.length > 0 && (
                <button
                  type="button"
                  onClick={handleJumpToBottom}
                  className="text-[var(--accent-cyan)] hover:underline truncate"
                >
                  Jump to bottom
                </button>
              )}
            </div>
            <span className="truncate sm:shrink-0">
              ID: <span className="font-mono">{deploymentId.slice(0, 8)}</span>
            </span>
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
