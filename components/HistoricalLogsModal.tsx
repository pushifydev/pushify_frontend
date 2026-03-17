'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Terminal, ChevronDown, ChevronUp, Loader2, RefreshCw, History } from 'lucide-react';
import { getHistoricalContainerLogs } from '@/lib/api/services/deployments.service';

interface HistoricalLogsModalProps {
  projectId: string;
  deploymentId: string;
  projectName: string;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  logContent: string;
  logType: 'stdout' | 'stderr';
  lineCount: number;
  startTimestamp: string | null;
  endTimestamp: string | null;
  chunkIndex: number;
  createdAt: string;
}

export function HistoricalLogsModal({
  projectId,
  deploymentId,
  projectName,
  onClose,
}: HistoricalLogsModalProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  // Wait for client-side mount for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch logs
  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);

      const result = await getHistoricalContainerLogs(projectId, deploymentId);

      if (result.error) {
        setError(result.error.message);
      } else if (result.data) {
        setLogs(result.data.logs);
        setTotalChunks(result.data.totalChunks);
        setTotalLines(result.data.totalLines);
        // Expand all chunks by default
        setExpandedChunks(new Set(result.data.logs.map((l) => l.id)));
      }

      setIsLoading(false);
    }

    fetchLogs();
  }, [projectId, deploymentId]);

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

  const toggleChunk = (id: string) => {
    setExpandedChunks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return null;
    return new Date(ts).toLocaleString();
  };

  const refreshLogs = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getHistoricalContainerLogs(projectId, deploymentId);

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setLogs(result.data.logs);
      setTotalChunks(result.data.totalChunks);
      setTotalLines(result.data.totalLines);
    }

    setIsLoading(false);
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
            <History className="w-5 h-5 text-[var(--accent-purple)]" />
            <div>
              <h2 className="text-lg font-semibold">Historical Container Logs</h2>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="terminal-text">{projectName}</span>
                <span>/</span>
                <span className="font-mono">{deploymentId.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={refreshLogs}
              disabled={isLoading}
              className="btn btn-ghost h-8 px-3 text-sm flex items-center gap-1"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

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
          className="flex-1 min-h-0 overflow-auto p-4 bg-[#0d1117]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading historical logs...</span>
              </div>
            </div>
          ) : logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((chunk) => (
                <div key={chunk.id} className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                  {/* Chunk header */}
                  <button
                    onClick={() => toggleChunk(chunk.id)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Terminal className={`w-4 h-4 ${chunk.logType === 'stderr' ? 'text-[var(--status-error)]' : 'text-[var(--accent-cyan)]'}`} />
                      <span className={`text-xs font-medium uppercase ${chunk.logType === 'stderr' ? 'text-[var(--status-error)]' : 'text-[var(--accent-cyan)]'}`}>
                        {chunk.logType}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {chunk.lineCount} lines
                      </span>
                      {chunk.startTimestamp && (
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatTimestamp(chunk.startTimestamp)}
                        </span>
                      )}
                    </div>
                    {expandedChunks.has(chunk.id) ? (
                      <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>

                  {/* Chunk content */}
                  {expandedChunks.has(chunk.id) && (
                    <div className="p-4 font-mono text-sm bg-[#0d1117]">
                      <div className="text-[#c9d1d9] leading-relaxed">
                        {chunk.logContent.split('\n').map((line, i) => {
                          // Color different types of log lines
                          let lineClass = '';
                          const lowerLine = line.toLowerCase();

                          if (chunk.logType === 'stderr' || lowerLine.includes('error') || lowerLine.includes('err ') || lowerLine.includes('fatal')) {
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              <div className="text-center">
                <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No historical logs available for this deployment</p>
                <p className="text-sm mt-1">Logs are collected while the container is running</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span>{totalChunks} chunks / {totalLines} lines</span>
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
