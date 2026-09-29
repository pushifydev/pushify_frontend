'use client';

import { useEffect } from 'react';
import { API_ANCHOR_PREFIXES } from '@/lib/docs-anchors';

/**
 * /docs used to be the API reference, with sections at /docs#<id>. Those links (in older pages,
 * search results and bookmarks) now land on the overview; send them to /docs/api#<id>.
 */
export function LegacyAnchorRedirect() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && API_ANCHOR_PREFIXES.some((p) => id === p || id.startsWith(`${p}-`))) {
      window.location.replace(`/docs/api#${id}`);
    }
  }, []);
  return null;
}
