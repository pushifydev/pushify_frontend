import { api } from '../client';

/** A file of a site, with its path inside the site (`css/site.css`). */
export interface SiteUploadFile {
  path: string;
  file: File;
}

export interface StaticSiteUploadResult {
  project?: { id: string; name: string; slug: string };
  deployment: { id: string; status: string };
  fileCount: number;
  sizeBytes: number;
}

/** A dropped folder goes as many files named by their path; a zip goes as one `file`. */
function toFormData(upload: { files?: SiteUploadFile[]; zip?: File }, extra: Record<string, string | undefined> = {}) {
  const form = new FormData();
  for (const [k, v] of Object.entries(extra)) if (v) form.append(k, v);
  if (upload.zip) form.append('file', upload.zip, upload.zip.name);
  for (const f of upload.files ?? []) form.append('files', f.file, f.path);
  return form;
}

const multipart = (onProgress?: (fraction: number) => void) => ({
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 10 * 60 * 1000,
  onUploadProgress: (e: { loaded: number; total?: number }) => {
    if (onProgress && e.total) onProgress(e.loaded / e.total);
  },
});

/** New project from uploaded files. Without `serverId` it goes to Pushify's shared hosting. */
export async function createStaticSite(
  input: { name: string; serverId?: string; files?: SiteUploadFile[]; zip?: File },
  onProgress?: (fraction: number) => void,
): Promise<StaticSiteUploadResult> {
  const res = await api.post<{ data: StaticSiteUploadResult }>(
    '/static-sites',
    toFormData(input, { name: input.name, serverId: input.serverId }),
    multipart(onProgress),
  );
  return res.data.data;
}

/** Publish new files to an uploaded site (a new version, shown under Deployments). */
export async function uploadStaticSiteVersion(
  projectId: string,
  input: { files?: SiteUploadFile[]; zip?: File },
  onProgress?: (fraction: number) => void,
): Promise<StaticSiteUploadResult> {
  const res = await api.post<{ data: StaticSiteUploadResult }>(
    `/static-sites/${projectId}/versions`,
    toFormData(input),
    multipart(onProgress),
  );
  return res.data.data;
}
