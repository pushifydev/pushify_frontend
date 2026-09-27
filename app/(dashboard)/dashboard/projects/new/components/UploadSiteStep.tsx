'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks';
import { formatMessage } from '@/lib/i18n/format-message';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { createStaticSite } from '@/lib/api/services/static-sites.service';
import type { Server as ServerType } from '@/lib/api';
import { SettingsField, SettingsSection } from '@/components/dashboard/SettingsParts';
import { Select } from '@/components/ui/select';
import { SiteDropzone, pickedSiteProblem } from '@/components/sites/SiteDropzone';
import type { PickedSite } from '@/lib/site-upload';

/** "Drop a folder, get a URL": a whole new project in one step, no build settings. */
export function UploadSiteStep({
  availableServers,
  initialServerId,
}: {
  availableServers: ServerType[];
  initialServerId?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [site, setSite] = useState<PickedSite | null>(null);
  const [name, setName] = useState('');
  const [serverId, setServerId] = useState(initialServerId ?? '');
  const [progress, setProgress] = useState<number | null>(null);

  const pick = (next: PickedSite | null) => {
    setSite(next);
    // Name the site after its folder (or zip) unless one was typed.
    if (next && !name) {
      const base = next.kind === 'zip' ? next.zip.name.replace(/\.zip$/i, '') : next.folderName;
      if (base) setName(base);
    }
  };

  const problem = site ? pickedSiteProblem(site, t) : null;
  const busy = progress !== null;
  const canPublish = !!site && !problem && name.trim().length > 0 && !busy;

  const publish = async () => {
    if (!site || !canPublish) return;
    setProgress(0);
    try {
      const result = await createStaticSite(
        {
          name: name.trim(),
          serverId: serverId || undefined,
          ...(site.kind === 'zip' ? { zip: site.zip } : { files: site.files }),
        },
        setProgress,
      );
      toast.success(t('siteUpload', 'published'));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push(`/dashboard/projects/${result.project!.id}?tab=deployments`);
    } catch (err) {
      toast.error(t('errors', 'somethingWentWrong'), { description: getApiErrorMessage(err) });
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection id="np-upload" title={t('siteUpload', 'sourceTitle')} padded>
        <SiteDropzone value={site} onChange={pick} disabled={busy} />
      </SettingsSection>

      <SettingsSection id="np-upload-settings" title={t('newProject', 'configure')}>
        <SettingsField label={t('siteUpload', 'siteName')} htmlFor="np-upload-name">
          <input
            id="np-upload-name"
            className="input"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-site"
            disabled={busy}
          />
        </SettingsField>
        <SettingsField label={t('siteUpload', 'hostOn')} hint={t('siteUpload', 'hostHint')} htmlFor="np-upload-server">
          <Select
            id="np-upload-server"
            value={serverId}
            onValueChange={setServerId}
            className="w-full"
            disabled={busy}
            options={[
              { value: '', label: t('siteUpload', 'hostShared') },
              ...availableServers.map((s) => ({ value: s.id, label: `${s.name} (${s.ipv4 ?? ''})` })),
            ]}
          />
        </SettingsField>
      </SettingsSection>

      <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--border-subtle)]">
        <button type="button" onClick={publish} disabled={!canPublish} className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {formatMessage(t('siteUpload', 'uploading'), { percent: Math.round((progress ?? 0) * 100) })}
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              {t('siteUpload', 'publish')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
