import { describe, it, expect } from 'vitest';
import { uploadSiteHref, UPLOAD_SITE_PATH } from './upload-site-link';
import { sanitizeRedirectPath } from './auth-redirect';

describe('uploadSiteHref', () => {
  it('opens the upload step directly when signed in', () => {
    expect(uploadSiteHref(true)).toBe('/dashboard/projects/new?source=upload');
  });

  it('sends visitors through sign-up and back to the upload step', () => {
    const href = uploadSiteHref(false);
    const redirect = new URL(href, 'https://pushify.dev').searchParams.get('redirect');
    expect(href.startsWith('/register?redirect=')).toBe(true);
    // The auth pages only honour paths that pass this check.
    expect(sanitizeRedirectPath(redirect)).toBe(UPLOAD_SITE_PATH);
  });
});
