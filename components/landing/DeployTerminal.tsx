'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The landing signature: a terminal that replays a real Pushify deploy — the log lines
 * mirror the platform's actual pipeline output — ending on a live URL, then looping.
 * Reduced-motion users get the full transcript rendered statically.
 */

type LogLine = {
  text: string;
  tone: 'cmd' | 'dim' | 'ok' | 'url';
  /** ms to wait before showing the NEXT line */
  pause: number;
};

const SCRIPT: LogLine[] = [
  { text: '$ git push origin main', tone: 'cmd', pause: 700 },
  { text: '→ Push received · main @ de55144', tone: 'dim', pause: 450 },
  { text: '✓ Detected: Node.js (Next.js)', tone: 'ok', pause: 350 },
  { text: '⚙ Building Docker image…', tone: 'dim', pause: 300 },
  { text: '  ▸ npm install — 412 packages', tone: 'dim', pause: 280 },
  { text: '  ▸ next build — compiled successfully', tone: 'dim', pause: 380 },
  { text: '✓ Image built in 31s (layer cache)', tone: 'ok', pause: 350 },
  { text: '⇄ Blue-green: starting new container…', tone: 'dim', pause: 420 },
  { text: '✓ Health check passed — switching traffic', tone: 'ok', pause: 420 },
  { text: '✓ SSL active · zero downtime', tone: 'ok', pause: 500 },
  { text: '● Live at https://my-app.pushify.dev — 47s', tone: 'url', pause: 4200 },
];

const TYPE_SPEED_MS = 34;

function toneStyle(tone: LogLine['tone']): React.CSSProperties {
  switch (tone) {
    case 'cmd':
      return { color: 'rgba(255,255,255,0.92)', fontWeight: 600 };
    case 'ok':
      return { color: '#4ade80' };
    case 'url':
      return { color: '#4ade80', fontWeight: 600 };
    default:
      return { color: 'rgba(255,255,255,0.55)' };
  }
}

export function DeployTerminal() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setLines(SCRIPT);
      setDone(true);
      return;
    }

    let cancelled = false;

    const schedule = (fn: () => void, ms: number) => {
      timerRef.current = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const playLine = (index: number) => {
      if (index >= SCRIPT.length) {
        // Hold on the finished state, then loop.
        schedule(() => {
          setLines([]);
          setDone(false);
          playLine(0);
        }, 1200);
        return;
      }
      const line = SCRIPT[index];

      if (line.tone === 'cmd') {
        // Type the command character by character.
        let i = 0;
        const typeChar = () => {
          i++;
          setTyped(line.text.slice(0, i));
          if (i < line.text.length) {
            schedule(typeChar, TYPE_SPEED_MS);
          } else {
            schedule(() => {
              setTyped('');
              setLines((prev) => [...prev, line]);
              playLine(index + 1);
            }, line.pause);
          }
        };
        typeChar();
      } else {
        setLines((prev) => [...prev, line]);
        if (index === SCRIPT.length - 1) setDone(true);
        schedule(() => playLine(index + 1), line.pause);
      }
    };

    schedule(() => playLine(0), 600);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Keep the newest line in view inside the fixed-height body.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, typed]);

  return (
    <div
      className="rounded-xl overflow-hidden text-left"
      style={{
        background: '#0a0a0f',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {/* Chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: '#111118', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span
          className="ml-3 text-xs"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}
        >
          pushify deploy
        </span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full transition-colors duration-500"
          style={{
            fontFamily: 'var(--font-mono)',
            color: done ? '#4ade80' : 'rgba(255,255,255,0.45)',
            background: done ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${done ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${done && !reduced ? 'animate-pulse' : ''}`}
            style={{ background: done ? '#4ade80' : 'rgba(255,255,255,0.3)' }}
          />
          {done ? 'Live' : 'Deploying'}
        </span>
      </div>

      {/* Log body */}
      <div
        ref={scrollRef}
        className="px-4 py-4 overflow-hidden"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          lineHeight: 1.9,
          height: 320,
        }}
        aria-live="off"
      >
        {lines.map((line, i) => (
          <div key={i} style={toneStyle(line.tone)} className="whitespace-pre">
            {line.text}
          </div>
        ))}
        {typed && (
          <div style={toneStyle('cmd')} className="whitespace-pre">
            {typed}
            <span className="lp-caret" />
          </div>
        )}
        {!typed && !done && lines.length > 0 && (
          <div className="whitespace-pre">
            <span className="lp-caret" />
          </div>
        )}
      </div>
    </div>
  );
}
