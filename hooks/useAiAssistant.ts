'use client';

import { useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { streamAiChat, type AiChatMessage } from '@/lib/api/services/ai.service';

export interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function getPageContext(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard Overview';
  if (pathname.includes('/projects/new')) return 'New Project Creation';
  if (pathname.includes('/projects/')) return 'Project Detail';
  if (pathname.includes('/projects')) return 'Projects List';
  if (pathname.includes('/servers/')) return 'Server Detail';
  if (pathname.includes('/servers')) return 'Servers List';
  if (pathname.includes('/databases/')) return 'Database Detail';
  if (pathname.includes('/databases')) return 'Databases List';
  if (pathname.includes('/monitoring')) return 'Monitoring';
  if (pathname.includes('/team')) return 'Team Management';
  if (pathname.includes('/activity')) return 'Activity Logs';
  if (pathname.includes('/billing')) return 'Billing';
  if (pathname.includes('/settings')) return 'Settings';
  return 'Dashboard';
}

export function useAiAssistant() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const pathname = usePathname();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: ChatEntry = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: ChatEntry = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    // Build message history for API
    const apiMessages: AiChatMessage[] = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: content.trim() },
    ];

    const context = getPageContext(pathname);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const event of streamAiChat(apiMessages, context, controller.signal)) {
        if (event.type === 'text' && event.content) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + event.content }
                : m
            )
          );
        } else if (event.type === 'error') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: event.content || 'An error occurred', isStreaming: false }
                : m
            )
          );
        } else if (event.type === 'done') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'Connection error. Please try again.', isStreaming: false }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, isLoading, pathname]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
