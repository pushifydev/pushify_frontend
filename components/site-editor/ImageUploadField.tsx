'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, ImageIcon } from 'lucide-react';
import { uploadSiteImage } from '@/lib/api';

interface ImageUploadFieldProps {
  projectId: string;
  value: string;
  onChange: (url: string) => void;
  label: string;
  uploadLabel: string;
  uploadingLabel: string;
}

export function ImageUploadField({
  projectId,
  value,
  onChange,
  label,
  uploadLabel,
  uploadingLabel,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadSiteImage(projectId, file);
      if (result.error) throw new Error(result.error.message);
      const url = result.data?.imageUrl ?? result.data?.url ?? result.data?.dataUrl;
      if (!url) throw new Error('Upload failed');
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      {value && (
        <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] aspect-video max-h-32 bg-[var(--bg-tertiary)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? uploadingLabel : uploadLabel}
        </button>
        {!value && (
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" />
            JPEG, PNG, WebP · max 5MB
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <input
        className="input w-full text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
