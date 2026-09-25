'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * A thin NProgress-style bar for page changes. The App Router has no navigation events, so it
 * starts when someone follows an internal link (or goes back/forward) and finishes when the URL
 * the app renders has changed. Like NProgress it appears the moment a link is followed, and it
 * stays on screen for a short minimum so that even an instant (prefetched) change is visible.
 */

/** Shortest time the bar is on screen, so a fast navigation still reads as a completed load. */
const MIN_VISIBLE_MS = 380;
const TRICKLE_MS = 220;
/** A link whose click is handled without a page change (a modal, a cancelled push) must not leave the bar stuck. */
const GIVE_UP_MS = 10_000;

function isInternalNavigation(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.('a');
  if (!anchor || !anchor.href) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download') || anchor.getAttribute('rel')?.includes('external')) return null;

  const next = new URL(anchor.href, window.location.href);
  const here = new URL(window.location.href);
  if (next.origin !== here.origin) return null;
  // Same page (or only the #fragment changes): nothing to wait for.
  if (next.pathname === here.pathname && next.search === here.search) return null;
  return next.pathname + next.search;
}

function Bar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams.toString()}`;

  const [progress, setProgress] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const running = useRef(false);
  const shown = useRef(false);
  const startedAt = useRef(0);
  const renderedPath = useRef('');
  const timers = useRef<{ show?: number; trickle?: number; hide?: number; giveUp?: number }>({});

  const clearTimers = () => {
    window.clearTimeout(timers.current.show);
    window.clearInterval(timers.current.trickle);
    window.clearTimeout(timers.current.hide);
    window.clearTimeout(timers.current.giveUp);
  };

  useEffect(() => {
    const start = () => {
      if (running.current) return;
      running.current = true;
      clearTimers();
      setLeaving(false);
      timers.current.giveUp = window.setTimeout(() => {
        running.current = false;
        shown.current = false;
        clearTimers();
        setProgress(null);
      }, GIVE_UP_MS);
      shown.current = true;
      startedAt.current = performance.now();
      setProgress(0.12);
      // Creep towards 90% ever more slowly, like NProgress.
      timers.current.trickle = window.setInterval(() => {
        setProgress((p) => (p === null ? p : Math.min(0.9, p + (0.9 - p) * 0.14)));
      }, TRICKLE_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) start();
    };
    // Back/forward — but a #fragment change also fires popstate, and that is no page change.
    const onPopState = () => {
      if (window.location.pathname + window.location.search !== renderedPath.current) start();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      clearTimers();
    };
  }, []);

  // The URL the app renders changed: the navigation is done.
  useEffect(() => {
    renderedPath.current = window.location.pathname + window.location.search;
    if (!running.current) return;
    running.current = false;
    clearTimers();
    if (!shown.current) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - startedAt.current));
    timers.current.show = window.setTimeout(() => {
      setProgress(1);
      timers.current.hide = window.setTimeout(() => {
        setLeaving(true);
        timers.current.hide = window.setTimeout(() => {
          shown.current = false;
          setProgress(null);
          setLeaving(false);
        }, 250);
      }, 200);
    }, wait);
  }, [url]);

  if (progress === null) return null;

  return (
    <div className="route-progress" data-leaving={leaving || undefined} aria-hidden="true">
      <div className="route-progress-bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function RouteProgress() {
  // useSearchParams needs a Suspense boundary under the App Router.
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
