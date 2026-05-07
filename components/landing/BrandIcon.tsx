'use client';

import {
  siSupabase, siAppwrite, siPocketbase, siHasura, siDirectus,
  siMeilisearch, siWordpress, siGhost, siStrapi, siNextcloud,
  siCaldotcom, siVaultwarden, siN8n, siUptimekuma, siGitea,
  siPortainer, siMinio, siUmami, siPlausibleanalytics,
  siPostgresql, siRedis,
} from 'simple-icons';
import type { SVGProps } from 'react';

type Brand = {
  title: string;
  path: string;
  hex: string;
};

const BRANDS: Record<string, Brand> = {
  supabase: siSupabase,
  appwrite: siAppwrite,
  pocketbase: siPocketbase,
  hasura: siHasura,
  directus: siDirectus,
  meilisearch: siMeilisearch,
  wordpress: siWordpress,
  ghost: siGhost,
  strapi: siStrapi,
  nextcloud: siNextcloud,
  calcom: siCaldotcom,
  vaultwarden: siVaultwarden,
  n8n: siN8n,
  'uptime-kuma': siUptimekuma,
  gitea: siGitea,
  portainer: siPortainer,
  minio: siMinio,
  umami: siUmami,
  plausible: siPlausibleanalytics,
  postgresql: siPostgresql,
  redis: siRedis,
};

interface BrandIconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'fill'> {
  slug: string;
  /** Color override. Defaults to the brand's official hex. */
  color?: string;
  /** Title for accessibility. Defaults to brand title. */
  title?: string;
}

export function BrandIcon({ slug, color, title, className, ...rest }: BrandIconProps) {
  const brand = BRANDS[slug];
  if (!brand) return null;
  const fill = color ?? `#${brand.hex}`;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      className={className}
      {...rest}
    >
      <title>{title ?? brand.title}</title>
      <path d={brand.path} />
    </svg>
  );
}

export function hasBrandIcon(slug: string): boolean {
  return slug in BRANDS;
}
