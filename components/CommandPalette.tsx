'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  Server,
  Database,
  Activity,
  Users,
  Receipt,
  Settings,
  BarChart3,
  Plus,
  FileText,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href: string;
  category: 'navigation' | 'action';
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'dashboard', label: 'Dashboard', description: 'Overview & metrics', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard', category: 'navigation', keywords: ['home', 'overview', 'anasayfa'] },
  { id: 'projects', label: 'Projects', description: 'Manage deployments', icon: <FolderKanban className="w-4 h-4" />, href: '/dashboard/projects', category: 'navigation', keywords: ['deploy', 'app', 'proje'] },
  { id: 'servers', label: 'Servers', description: 'VPS & infrastructure', icon: <Server className="w-4 h-4" />, href: '/dashboard/servers', category: 'navigation', keywords: ['vps', 'infra', 'sunucu'] },
  { id: 'databases', label: 'Databases', description: 'PostgreSQL, MySQL, Redis', icon: <Database className="w-4 h-4" />, href: '/dashboard/databases', category: 'navigation', keywords: ['db', 'postgres', 'mysql', 'redis', 'veritabanı'] },
  { id: 'monitoring', label: 'Monitoring', description: 'Metrics & alerts', icon: <BarChart3 className="w-4 h-4" />, href: '/dashboard/monitoring', category: 'navigation', keywords: ['metrics', 'cpu', 'memory', 'izleme'] },
  { id: 'team', label: 'Team', description: 'Members & roles', icon: <Users className="w-4 h-4" />, href: '/dashboard/team', category: 'navigation', keywords: ['members', 'invite', 'takım', 'üye'] },
  { id: 'activity', label: 'Activity', description: 'Logs & events', icon: <Activity className="w-4 h-4" />, href: '/dashboard/activity', category: 'navigation', keywords: ['logs', 'events', 'history', 'etkinlik'] },
  { id: 'billing', label: 'Billing', description: 'Plans & usage', icon: <Receipt className="w-4 h-4" />, href: '/dashboard/billing', category: 'navigation', keywords: ['payment', 'plan', 'subscription', 'fatura'] },
  { id: 'settings', label: 'Settings', description: 'Profile & preferences', icon: <Settings className="w-4 h-4" />, href: '/dashboard/settings', category: 'navigation', keywords: ['profile', 'account', 'ayarlar'] },
  { id: 'docs', label: 'Documentation', description: 'API reference', icon: <FileText className="w-4 h-4" />, href: '/docs', category: 'navigation', keywords: ['api', 'docs', 'help', 'döküman'] },
  // Actions
  { id: 'new-project', label: 'New Project', description: 'Deploy a new app', icon: <Plus className="w-4 h-4" />, href: '/dashboard/projects/new', category: 'action', keywords: ['create', 'deploy', 'yeni'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter results
  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q) ||
      cmd.keywords?.some(k => k.includes(q))
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const nav = filtered.filter(c => c.category === 'navigation');
    const act = filtered.filter(c => c.category === 'action');
    return { navigation: nav, action: act };
  }, [filtered]);

  const flatList = useMemo(() => [...grouped.action, ...grouped.navigation], [grouped]);

  const onQueryChange = useCallback((val: string) => {
    setQuery(val);
    setActiveIndex(0);
  }, []);

  // Open handler — reset state and focus
  const openPalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  // ⌘K listener
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) { setOpen(false); } else { openPalette(); }
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, openPalette]);

  // Listen for custom event from header search button
  useEffect(() => {
    const handler = () => openPalette();
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, [openPalette]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const select = useCallback((item: CommandItem) => {
    setOpen(false);
    router.push(item.href);
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % flatList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + flatList.length) % flatList.length);
    } else if (e.key === 'Enter' && flatList[activeIndex]) {
      e.preventDefault();
      select(flatList[activeIndex]);
    }
  }, [flatList, activeIndex, select]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div
        className="fixed z-[101] left-1/2 top-[20%] -translate-x-1/2 w-full max-w-[540px] rounded-xl overflow-hidden animate-slide-in"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px var(--glass-border)',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 h-12"
          style={{ borderBottom: '1px solid var(--glass-border-md)' }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, actions..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none"
            style={{
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'var(--font-display)',
            }}
          />
          <kbd
            className="flex items-center justify-center h-5 px-1.5 rounded"
            style={{
              background: 'var(--hover-overlay-md)',
              border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2 px-2">
          {flatList.length === 0 && (
            <div className="px-3 py-8 text-center" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              No results for &quot;{query}&quot;
            </div>
          )}

          {grouped.action.length > 0 && (
            <>
              <div className="px-3 pt-1 pb-1.5" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Actions
              </div>
              {grouped.action.map(item => {
                const idx = flatList.indexOf(item);
                return (
                  <button
                    key={item.id}
                    data-active={idx === activeIndex}
                    onClick={() => select(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: idx === activeIndex ? 'var(--hover-overlay-lg)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(34,211,238,0.1)',
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 text-left">
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</div>
                      {item.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)', opacity: idx === activeIndex ? 1 : 0 }} />
                  </button>
                );
              })}
            </>
          )}

          {grouped.navigation.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1.5" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Pages
              </div>
              {grouped.navigation.map(item => {
                const idx = flatList.indexOf(item);
                return (
                  <button
                    key={item.id}
                    data-active={idx === activeIndex}
                    onClick={() => select(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors"
                    style={{
                      background: idx === activeIndex ? 'var(--hover-overlay-lg)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: 'var(--hover-overlay-lg)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.icon}
                    </span>
                    <div className="flex-1 text-left">
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</div>
                      {item.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)', opacity: idx === activeIndex ? 1 : 0 }} />
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 h-9"
          style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: 11 }}
        >
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center w-4 h-4 rounded" style={{ background: 'var(--hover-overlay-md)', border: '1px solid var(--glass-border)', fontSize: 9 }}>↑</kbd>
            <kbd className="inline-flex items-center justify-center w-4 h-4 rounded" style={{ background: 'var(--hover-overlay-md)', border: '1px solid var(--glass-border)', fontSize: 9 }}>↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1 rounded" style={{ background: 'var(--hover-overlay-md)', border: '1px solid var(--glass-border)', fontSize: 9 }}>↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1 rounded" style={{ background: 'var(--hover-overlay-md)', border: '1px solid var(--glass-border)', fontSize: 9 }}>esc</kbd>
            close
          </span>
        </div>
      </div>
    </>
  );
}
