import type { SiteUploadFile } from '@/lib/api/services/static-sites.service';

/**
 * Turning what a person drops or picks into site files with their paths. A dropped folder is
 * walked recursively (DataTransfer entries); a folder picked with `webkitdirectory` carries
 * `webkitRelativePath`. Hidden files and OS junk are left out here as well as on the server.
 */

export const SITE_UPLOAD_LIMITS = { maxFiles: 2000, maxTotalBytes: 50 * 1024 * 1024 } as const;

const JUNK = new Set(['__MACOSX', 'Thumbs.db', 'desktop.ini', 'node_modules']);
const skipped = (path: string) => path.split('/').some((s) => s.startsWith('.') || JUNK.has(s));

export type PickedSite = { kind: 'files'; files: SiteUploadFile[]; folderName: string | null } | { kind: 'zip'; zip: File };

function readEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
}

async function walk(entry: FileSystemEntry, prefix: string, out: SiteUploadFile[]): Promise<void> {
  const path = prefix ? `${prefix}/${entry.name}` : entry.name;
  if (skipped(path)) return;
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject));
    out.push({ path, file });
    return;
  }
  const reader = (entry as FileSystemDirectoryEntry).createReader();
  // readEntries returns at most ~100 entries per call.
  for (let batch = await readEntries(reader); batch.length > 0; batch = await readEntries(reader)) {
    for (const child of batch) await walk(child, path, out);
  }
}

/** What was dropped: a single zip, or files and folders (walked into a flat list). */
export async function fromDrop(dt: DataTransfer): Promise<PickedSite | null> {
  const entries = [...dt.items]
    .map((item) => (item.kind === 'file' ? item.webkitGetAsEntry?.() : null))
    .filter((e): e is FileSystemEntry => !!e);
  if (entries.length === 1 && entries[0].isFile && /\.zip$/i.test(entries[0].name)) {
    const zip = dt.files[0];
    return zip ? { kind: 'zip', zip } : null;
  }
  const files: SiteUploadFile[] = [];
  for (const e of entries) await walk(e, '', files);
  if (files.length === 0) return null;
  const folderName = entries.length === 1 && entries[0].isDirectory ? entries[0].name : null;
  return { kind: 'files', files, folderName };
}

/** What was picked in a file input (a folder with `webkitdirectory`, or a zip / loose files). */
export function fromInput(list: FileList | null): PickedSite | null {
  const all = [...(list ?? [])];
  if (all.length === 0) return null;
  if (all.length === 1 && /\.zip$/i.test(all[0].name)) return { kind: 'zip', zip: all[0] };
  const files = all
    .map((file) => ({ path: file.webkitRelativePath || file.name, file }))
    .filter((f) => !skipped(f.path));
  const tops = new Set(files.map((f) => f.path.split('/')[0]));
  const folderName = files.every((f) => f.path.includes('/')) && tops.size === 1 ? [...tops][0] : null;
  return files.length ? { kind: 'files', files, folderName } : null;
}

export function pickedSummary(site: PickedSite): { count: number; bytes: number; hasIndex: boolean | null } {
  if (site.kind === 'zip') return { count: 1, bytes: site.zip.size, hasIndex: null };
  const paths = site.files.map((f) => f.path);
  const root = site.folderName ? `${site.folderName}/index.html` : 'index.html';
  return {
    count: site.files.length,
    bytes: site.files.reduce((sum, f) => sum + f.file.size, 0),
    hasIndex: paths.includes(root) || paths.includes('index.html'),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
