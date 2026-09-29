/** The new-project wizard, opened on "Upload files" (the try-without-a-server path). */
export const UPLOAD_SITE_PATH = '/dashboard/projects/new?source=upload';

/** Signed-in users go straight to the upload step; visitors sign up first and land there after. */
export function uploadSiteHref(signedIn: boolean): string {
  return signedIn ? UPLOAD_SITE_PATH : `/register?redirect=${encodeURIComponent(UPLOAD_SITE_PATH)}`;
}
