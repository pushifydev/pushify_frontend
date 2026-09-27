'use client';

import { useRef, useState } from 'react';
import { FileArchive, FolderUp, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { formatMessage } from '@/lib/i18n/format-message';
import {
  SITE_UPLOAD_LIMITS,
  formatBytes,
  fromDrop,
  fromInput,
  pickedSummary,
  type PickedSite,
} from '@/lib/site-upload';

/** Problems worth stopping for before anything is sent (the server checks again). */
export function pickedSiteProblem(site: PickedSite, t: ReturnType<typeof useTranslation>['t']): string | null {
  const s = pickedSummary(site);
  if (s.bytes > SITE_UPLOAD_LIMITS.maxTotalBytes) return t('siteUpload', 'tooLarge');
  if (site.kind === 'files' && s.count > SITE_UPLOAD_LIMITS.maxFiles) return t('siteUpload', 'tooMany');
  if (s.hasIndex === false) return t('siteUpload', 'noIndex');
  return null;
}

/**
 * Drop a site folder or a .zip, or pick one. Shows what was picked and anything that would
 * stop it from publishing.
 */
export function SiteDropzone({
  value,
  onChange,
  disabled,
}: {
  value: PickedSite | null;
  onChange: (site: PickedSite | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const folderInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const summary = value ? pickedSummary(value) : null;
  const problem = value ? pickedSiteProblem(value, t) : null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setOver(false);
        if (disabled) return;
        const site = await fromDrop(e.dataTransfer);
        if (site) onChange(site);
      }}
      className="rounded-xl border border-dashed px-5 py-8 text-center transition-colors"
      style={{
        borderColor: over ? 'var(--text-secondary)' : 'var(--glass-border-strong)',
        background: over ? 'var(--hover-overlay)' : 'transparent',
      }}
    >
      {value && summary ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-primary)]">
            {value.kind === 'zip' ? <FileArchive className="w-4 h-4" /> : <FolderUp className="w-4 h-4" />}
            <span className="font-medium truncate max-w-[16rem]">
              {value.kind === 'zip' ? value.zip.name : value.folderName ?? t('siteUpload', 'sourceTitle')}
            </span>
          </div>
          <p className="terminal-text text-[12px] text-[var(--text-muted)] tabular-nums">
            {value.kind === 'zip'
              ? formatBytes(summary.bytes)
              : formatMessage(t('siteUpload', 'filesSummary'), { count: summary.count, size: formatBytes(summary.bytes) })}
          </p>
          {problem && (
            <p className="inline-flex items-start gap-1.5 text-[13px] text-[var(--status-warning)] text-left">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
              {problem}
            </p>
          )}
          <div>
            <button type="button" className="btn btn-ghost btn-sm" disabled={disabled} onClick={() => onChange(null)}>
              {t('siteUpload', 'change')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <FolderUp className="w-5 h-5 mx-auto text-[var(--text-muted)]" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('siteUpload', 'dropTitle')}</p>
            <p className="text-[12px] text-[var(--text-muted)]">{t('siteUpload', 'dropHint')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" className="btn btn-secondary btn-sm" disabled={disabled} onClick={() => folderInput.current?.click()}>
              <FolderUp className="w-3.5 h-3.5" />
              {t('siteUpload', 'chooseFolder')}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" disabled={disabled} onClick={() => zipInput.current?.click()}>
              <FileArchive className="w-3.5 h-3.5" />
              {t('siteUpload', 'chooseZip')}
            </button>
          </div>
        </div>
      )}

      <input
        ref={folderInput}
        type="file"
        multiple
        className="hidden"
        // Not in React's input typings; lets the picker select a whole folder.
        {...{ webkitdirectory: '', directory: '' }}
        onChange={(e) => {
          const site = fromInput(e.target.files);
          if (site) onChange(site);
          e.target.value = '';
        }}
      />
      <input
        ref={zipInput}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(e) => {
          const site = fromInput(e.target.files);
          if (site) onChange(site);
          e.target.value = '';
        }}
      />
    </div>
  );
}
