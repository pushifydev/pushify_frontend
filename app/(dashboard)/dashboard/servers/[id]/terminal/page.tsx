'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Terminal as TerminalIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks';
import { api } from '@/lib/api/client';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export default function ServerTerminalPage() {
  const { t } = useTranslation();
  const { id: serverId } = useParams<{ id: string }>();
  const router = useRouter();

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'Pushify Web Terminal — Connected', timestamp: Date.now() },
    { type: 'system', content: 'Type a command and press Enter. Type "clear" to clear the terminal.', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState('~');

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    // Handle clear
    if (command.trim() === 'clear') {
      setLines([{ type: 'system', content: 'Terminal cleared.', timestamp: Date.now() }]);
      return;
    }

    // Handle exit
    if (command.trim() === 'exit') {
      router.push(`/dashboard/servers/${serverId}`);
      return;
    }

    setHistory((prev) => [command, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setIsExecuting(true);

    try {
      const fullCommand = cwd !== '~' ? `cd ${cwd} && ${command}` : command;
      const response = await api.post(`/servers/${serverId}/terminal`, { command: fullCommand });
      const data = response.data.data;

      const newLines: TerminalLine[] = [
        { type: 'input', content: command, timestamp: Date.now() },
      ];
      if (data.stdout) {
        newLines.push({ type: 'output', content: data.stdout, timestamp: Date.now() });
      }
      if (data.stderr) {
        newLines.push({ type: 'error', content: data.stderr, timestamp: Date.now() });
      }
      setLines((prev) => [...prev, ...newLines]);

      // Track cd commands
      if (command.trim().startsWith('cd ')) {
        const pwdResponse = await api.post(`/servers/${serverId}/terminal`, { command: `cd ${cwd !== '~' ? cwd : '~'} && ${command} && pwd` });
        const newCwd = pwdResponse.data.data.stdout?.trim();
        if (newCwd) setCwd(newCwd);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute command';
      setLines((prev) => [
        ...prev,
        { type: 'input', content: command, timestamp: Date.now() },
        { type: 'error', content: errorMessage, timestamp: Date.now() },
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/servers/${serverId}`}
            className="flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              Web Terminal
            </h1>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#0a0a0f',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Terminal header bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5"
          style={{
            background: '#111118',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span
            className="text-xs ml-2"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}
          >
            root@server — {cwd}
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="p-4 overflow-y-auto cursor-text"
          style={{ height: 'calc(100vh - 250px)', minHeight: 400 }}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div key={i} className="mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '1.6' }}>
              {line.type === 'input' && (
                <div>
                  <span style={{ color: '#22d3ee' }}>root</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>@</span>
                  <span style={{ color: '#a78bfa' }}>server</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>:</span>
                  <span style={{ color: '#60a5fa' }}>{cwd}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}> $ </span>
                  <span style={{ color: '#e4e4e7' }}>{line.content}</span>
                </div>
              )}
              {line.type === 'output' && (
                <pre className="whitespace-pre-wrap" style={{ color: '#d4d4d8', margin: 0 }}>
                  {line.content}
                </pre>
              )}
              {line.type === 'error' && (
                <pre className="whitespace-pre-wrap" style={{ color: '#f87171', margin: 0 }}>
                  {line.content}
                </pre>
              )}
              {line.type === 'system' && (
                <div style={{ color: '#fbbf24', fontSize: 12 }}>
                  {line.content}
                </div>
              )}
            </div>
          ))}

          {/* Input line */}
          <div className="flex items-center" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <span style={{ color: '#22d3ee' }}>root</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>@</span>
            <span style={{ color: '#a78bfa' }}>server</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>:</span>
            <span style={{ color: '#60a5fa' }}>{cwd}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}> $ </span>
            <input
              ref={inputRef}
              type="text"
              value={isExecuting ? '' : input}
              onChange={(e) => !isExecuting && setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder={isExecuting ? '...' : ''}
              className="flex-1 bg-transparent border-none [outline:none_!important] [box-shadow:none_!important] focus:outline-none focus-visible:[outline:none]! placeholder:text-[rgba(255,255,255,0.2)]"
              style={{ color: '#e4e4e7', fontFamily: 'var(--font-mono)', fontSize: 13, caretColor: '#22d3ee' }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
