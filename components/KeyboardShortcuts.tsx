'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

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

  const kbd = (k: string) => <kbd className="dash-kbd">{k}</kbd>;

  return (
    <>
      {pendingG && (
        <div
          className="dash-menu fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2 text-xs text-[var(--text-secondary)]"
          style={{ padding: '6px 10px' }}
          aria-live="polite"
        >
          {kbd('g')} then {Object.keys(GO).map((k) => <span key={k}>{kbd(k)}</span>)}
        </div>
      )}

      {open && (
        <>
          <div className="dash-modal-overlay z-[100]" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="dash-modal is-centered z-[101] max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kbd-shortcuts-title"
          >
            <div className="dash-modal-header">
              <div className="min-w-0">
                <span className="dash-eyebrow">Shortcuts</span>
                <h2 id="kbd-shortcuts-title" className="dash-modal-title">Keyboard shortcuts</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="dash-modal-close" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-5 text-sm text-[var(--text-secondary)]">
              <section>
                <p className="dash-section-label mb-2.5">General</p>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between gap-3"><span>Command palette — search &amp; actions</span><span className="flex gap-1">{kbd('⌘')}{kbd('K')}</span></li>
                  <li className="flex items-center justify-between gap-3"><span>New project</span>{kbd('n')}</li>
                  <li className="flex items-center justify-between gap-3"><span>This sheet</span>{kbd('?')}</li>
                </ul>
              </section>
              <section className="pt-5 border-t border-[var(--border-subtle)]">
                <p className="dash-section-label mb-2.5 flex items-center gap-1.5">Go to — press {kbd('g')} then</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {Object.entries(GO).map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between gap-3"><span>{v.label}</span>{kbd(k)}</li>
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
