'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useDeploymentLogsStream } from '@/hooks';

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
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const { logs, status, errorMessage, isComplete, isConnected, error, reconnect } =
    useDeploymentLogsStream(projectId, deploymentId);

  // Wait for client-side mount for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current && logsContainerRef.current) {
      const container = logsContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [logs]);

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

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-[var(--status-error)]" />;
      case 'building':
      case 'deploying':
      case 'pending':
        return <Loader2 className="w-5 h-5 text-[var(--accent-cyan)] animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[var(--text-muted)]" />;
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
        className="relative w-full max-w-4xl h-[80vh] flex flex-col rounded-xl overflow-hidden
                   bg-[var(--bg-primary)] border border-[var(--border-subtle)]
                   shadow-2xl animate-scale-in"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-lg font-semibold">Deployment Logs</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="terminal-text">{branch || 'main'}</span>
                {commitHash && (
                  <>
                    <span>/</span>
                    <span className="font-mono">{commitHash.slice(0, 7)}</span>
                  </>
                )}
                <span>/</span>
                <span className={`font-medium ${status === 'failed' ? 'text-[var(--status-error)]' : ''}`}>
                  {getStatusLabel()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isComplete && !isConnected && (
              <button
                onClick={reconnect}
                className="btn btn-ghost h-8 px-3 text-sm flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect
              </button>
            )}
            {isConnected && (
              <span className="flex items-center gap-1 text-sm text-[var(--accent-cyan)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                Live
              </span>
            )}
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

        {/* Deployment Error */}
        {errorMessage && (
          <div className="flex-shrink-0 px-5 py-3 bg-[var(--status-error)]/10 border-b border-[var(--status-error)]/20">
            <p className="text-sm text-[var(--status-error)] font-medium">Deployment Error:</p>
            <p className="text-sm text-[var(--status-error)] break-all">{errorMessage}</p>
          </div>
        )}

        {/* Logs Container */}
        <div
          ref={logsContainerRef}
          className="flex-1 min-h-0 overflow-auto p-4 bg-[#0d1117]"
        >
          {logLines.length > 0 ? (
            <div className="font-mono text-sm text-[#c9d1d9] leading-relaxed">
              {logLines.map((line, i) => {
                // Color different types of log lines
                let lineClass = '';
                if (line.includes('[') && line.includes(']')) {
                  const afterTimestamp = line.split(']')[1] || '';
                  if (afterTimestamp.includes('Error') || afterTimestamp.includes('failed') || afterTimestamp.includes('Failed') || line.includes('❌')) {
                    lineClass = 'text-[#f85149]';
                  } else if (afterTimestamp.includes('Success') || afterTimestamp.includes('successful') || afterTimestamp.includes('completed') || line.includes('✅')) {
                    lineClass = 'text-[#3fb950]';
                  } else if (afterTimestamp.includes('Warning') || afterTimestamp.includes('warning')) {
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
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Waiting for logs...</span>
                </div>
              ) : (
                <span>No logs available</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>
              {logLines.length} lines
            </span>
            <span>
              Deployment ID: <span className="font-mono">{deploymentId.slice(0, 8)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
