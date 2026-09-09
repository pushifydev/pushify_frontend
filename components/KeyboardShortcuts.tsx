'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, X } from 'lucide-react';

/**
 * Linear-style keyboard navigation for the dashboard.
 *   ?         open this cheat sheet
 *   ⌘K        command palette (handled in CommandPalette)
 *   g then …  go to: h home · p projects · s servers · d databases · m monitoring ·
 *             t team · a activity · b billing · , settings
 *   n         new project
 * Ignored while typing in inputs, textareas, selects or contenteditable.
 */

const GO: Record<string, { href: string; label: string }> = {
  h: { href: '/dashboard', label: 'Home' },
  p: { href: '/dashboard/projects', label: 'Projects' },
  s: { href: '/dashboard/servers', label: 'Servers' },
  d: { href: '/dashboard/databases', label: 'Databases' },
  m: { href: '/dashboard/monitoring', label: 'Monitoring' },
  t: { href: '/dashboard/team', label: 'Team' },
  a: { href: '/dashboard/activity', label: 'Activity' },
  b: { href: '/dashboard/billing', label: 'Billing' },
  ',': { href: '/dashboard/settings', label: 'Settings' },
};

const SEQUENCE_WINDOW_MS = 1200;

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);
  const pendingTimer = useRef<number | null>(null);

  useEffect(() => {
    function clearPending() {
      setPendingG(false);
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      // Leave modals/palettes alone: anything with a dialog open owns the keyboard.
      if (document.querySelector('[role="dialog"], [data-command-palette]')) {
        if (e.key === 'Escape') setOpen(false);
        return;
      }

      if (e.key === '?' ) {
        e.preventDefault();
        setOpen((v) => !v);
        clearPending();
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        clearPending();
        return;
      }
      if (open) return;

      if (pendingG) {
        const target = GO[e.key];
        clearPending();
        if (target) {
          e.preventDefault();
          router.push(target.href);
        }
        return;
      }

      if (e.key === 'g') {
        setPendingG(true);
        pendingTimer.current = window.setTimeout(clearPending, SEQUENCE_WINDOW_MS);
        return;
      }
      if (e.key === 'n') {
        e.preventDefault();
        router.push('/dashboard/projects/new');
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
    };
  }, [open, pendingG, router]);

  const kbd = (k: string) => (
    <kbd
      className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded text-[11px]"
      style={{ background: 'var(--hover-overlay-md)', border: '1px solid var(--glass-border)', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
    >
      {k}
    </kbd>
  );

  return (
    <>
      {pendingG && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          aria-live="polite"
        >
          {kbd('g')} then {Object.keys(GO).map((k) => <span key={k}>{kbd(k)}</span>)}
        </div>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)} />
          <div
            className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl overflow-hidden animate-slide-in"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            role="dialog"
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-center justify-between px-4 h-12" style={{ borderBottom: '1px solid var(--glass-border-md)' }}>
              <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                <Keyboard className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                Keyboard shortcuts
              </span>
              <button type="button" onClick={() => setOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--hover-overlay-md)]" style={{ color: 'var(--text-muted)' }} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 py-3 space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)' }}>General</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center justify-between"><span>Command palette — search &amp; actions</span><span className="flex gap-1">{kbd('⌘')}{kbd('K')}</span></li>
                  <li className="flex items-center justify-between"><span>New project</span>{kbd('n')}</li>
                  <li className="flex items-center justify-between"><span>This sheet</span>{kbd('?')}</li>
                </ul>
              </section>
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)' }}>Go to — press {kbd('g')} then</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {Object.entries(GO).map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between"><span>{v.label}</span>{kbd(k)}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
