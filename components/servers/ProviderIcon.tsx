'use client';

import { useState } from 'react';
import { Server } from 'lucide-react';

const PROVIDER_LOGOS: Record<string, string> = {
  hetzner: '/providers/hetzner.svg',
  digitalocean: '/providers/digitalocean.svg',
  aws: '/providers/aws.svg',
  gcp: '/providers/gcp.svg',
};

const SIZE = {
  sm: { box: 'w-9 h-9', img: 'w-5 h-5', icon: 'w-4 h-4' },
  md: { box: 'w-12 h-12', img: 'w-7 h-7', icon: 'w-6 h-6' },
} as const;

type ProviderIconProps = {
  provider: string;
  size?: keyof typeof SIZE;
  /** When stopped, icon and box appear muted gray */
  status?: string;
  className?: string;
};

export function ProviderIcon({ provider, size = 'md', status, className = '' }: ProviderIconProps) {
  const logoSrc = PROVIDER_LOGOS[provider];
  const [useFallback, setUseFallback] = useState(!logoSrc);
  const s = SIZE[size];
  const muted = status === 'stopped';

  return (
    <div
      className={`${s.box} rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{
        background: muted ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        border: `1px solid ${muted ? 'var(--glass-divider)' : 'var(--glass-border)'}`,
        opacity: muted ? 0.92 : 1,
      }}
      aria-hidden
    >
      {!useFallback && logoSrc ? (
        <img
          src={logoSrc}
          alt=""
          className={`${s.img} object-contain ${muted ? 'opacity-50 grayscale' : ''}`}
          onError={() => setUseFallback(true)}
        />
      ) : (
        <Server
          className={`${s.icon} shrink-0`}
          style={{ color: muted ? 'var(--text-muted)' : 'var(--text-primary)' }}
          strokeWidth={2}
        />
      )}
    </div>
  );
}
