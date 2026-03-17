'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Sparkles,
  Trash2,
  Square,
  Server,
  FolderKanban,
  Database,
  Settings,
  Rocket,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAiAssistant, type ChatEntry } from '@/hooks/useAiAssistant';
import { useTranslation } from '@/hooks';

const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
  deploy: <Rocket className="w-3.5 h-3.5" />,
  server: <Server className="w-3.5 h-3.5" />,
  database: <Database className="w-3.5 h-3.5" />,
  env: <FolderKanban className="w-3.5 h-3.5" />,
  domain: <ShieldCheck className="w-3.5 h-3.5" />,
  health: <Settings className="w-3.5 h-3.5" />,
};

const SUGGESTION_KEYS: { key: 'suggestDeploy' | 'suggestServer' | 'suggestDatabase' | 'suggestEnv' | 'suggestDomain' | 'suggestHealth'; icon: string }[] = [
  { key: 'suggestDeploy', icon: 'deploy' },
  { key: 'suggestServer', icon: 'server' },
  { key: 'suggestDatabase', icon: 'database' },
  { key: 'suggestEnv', icon: 'env' },
  { key: 'suggestDomain', icon: 'domain' },
  { key: 'suggestHealth', icon: 'health' },
];

function MessageBubble({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser ? '' : ''
        }`}
        style={
          isUser
            ? {
                background: 'rgba(34,211,238,0.12)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(34,211,238,0.2)',
              }
            : {
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
              }
        }
      >
        {/* Simple markdown-like rendering */}
        {entry.content.split('\n').map((line, i) => {
          // Bold
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className={i > 0 ? 'mt-1.5' : ''} style={{ minHeight: line ? undefined : '0.75em' }}>
              {parts.map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                // Inline code
                const codeParts = part.split(/(`[^`]+`)/g);
                return codeParts.map((cp, k) => {
                  if (cp.startsWith('`') && cp.endsWith('`')) {
                    return (
                      <code
                        key={`${j}-${k}`}
                        className="rounded px-1 py-0.5"
                        style={{
                          background: 'var(--hover-overlay-lg)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85em',
                        }}
                      >
                        {cp.slice(1, -1)}
                      </code>
                    );
                  }
                  return <span key={`${j}-${k}`}>{cp}</span>;
                });
              })}
            </p>
          );
        })}
        {entry.isStreaming && (
          <span
            className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse"
            style={{ background: 'var(--accent-cyan)', verticalAlign: 'text-bottom' }}
          />
        )}
      </div>
    </div>
  );
}

export function AiAssistantSheet() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, stopStreaming, clearMessages } = useAiAssistant();
  const { t } = useTranslation();

  // Listen for custom event from header
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-ai-assistant', handler);
    return () => window.removeEventListener('open-ai-assistant', handler);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleSuggestion = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[70] transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[71] flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: '420px',
          maxWidth: '100vw',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.2)' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-14 shrink-0"
          style={{ borderBottom: '1px solid var(--glass-border-md)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(167,139,250,0.12)' }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('ai', 'title')}
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('ai', 'poweredBy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
                title={t('ai', 'clearConversation')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            // Empty state with suggestions
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center pb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.15)' }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                </div>
                <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('ai', 'howCanIHelp')}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
                  {t('ai', 'description')}
                </p>
              </div>

              <div className="space-y-1.5 pb-2">
                <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, paddingLeft: 2 }}>
                  {t('ai', 'suggested')}
                </p>
                {SUGGESTION_KEYS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleSuggestion(t('ai', s.key))}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-colors text-left"
                    style={{
                      background: 'var(--hover-overlay)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay-lg)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border-md)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--hover-overlay)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{SUGGESTION_ICONS[s.icon]}</span>
                    {t('ai', s.key)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat messages
            <>
              {messages.map((entry) => (
                <MessageBubble key={entry.id} entry={entry} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div
          className="shrink-0 px-4 pb-4 pt-2"
          style={{ borderTop: '1px solid var(--glass-border)' }}
        >
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border-md)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai', 'placeholder')}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none"
              style={{
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                lineHeight: '1.5',
                maxHeight: 120,
                minHeight: 24,
              }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
              }}
            />
            {isLoading ? (
              <button
                onClick={stopStreaming}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{ background: 'var(--hover-overlay-lg)', color: 'var(--text-secondary)' }}
                title={t('ai', 'stopGenerating')}
              >
                <Square className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: input.trim() ? 'var(--accent-cyan)' : 'var(--hover-overlay-md)',
                  color: input.trim() ? '#050508' : 'var(--text-muted)',
                  opacity: input.trim() ? 1 : 0.5,
                }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p
            className="text-center mt-2"
            style={{ fontSize: 10, color: 'var(--text-muted)' }}
          >
            {t('ai', 'disclaimer')}
          </p>
        </div>
      </div>
    </>,
    document.body
  );
}
