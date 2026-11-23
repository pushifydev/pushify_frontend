'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/** The hosted service's closing date (YYYY-MM-DD), or null when it is not closing. */
export function useServiceClosingDate(): string | null {
  const { data } = useQuery({
    queryKey: ['service-status'],
    queryFn: async (): Promise<string | null> => {
      const res = await fetch(`${API_BASE}/public/service-status`);
      if (!res.ok) return null;
      const body = (await res.json()) as { data?: { closingDate?: string | null } };
      return body.data?.closingDate ?? null;
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
  return data ?? null;
}

export function formatClosingDate(date: string, locale: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
