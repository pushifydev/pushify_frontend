'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { deploymentKeys, useTranslation } from '@/hooks';
import { formatMessage } from '@/lib/i18n/format-message';
import { getApiErrorMessage } from '@/lib/api/get-error-message';
import { uploadStaticSiteVersion } from '@/lib/api/services/static-sites.service';
import { SettingsSection } from '@/components/dashboard/SettingsParts';
import { SiteDropzone, pickedSiteProblem } from '@/components/sites/SiteDropzone';
import type { PickedSite } from '@/lib/site-upload';

/** For a project made from uploaded files: publish new files as the next version. */
export function UploadVersionSection({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [site, setSite] = useState<PickedSite | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const problem = site ? pickedSiteProblem(site, t) : null;
  const busy = progress !== null;

  const upload = async () => {
    if (!site || problem) return;
    setProgress(0);
    try {
      await uploadStaticSiteVersion(projectId, site.kind === 'zip' ? { zip: site.zip } : { files: site.files }, setProgress);
      toast.success(t('siteUpload', 'versionPublished'));
      setSite(null);
      queryClient.invalidateQueries({ queryKey: deploymentKeys.all });
    } catch (err) {
      toast.error(t('errors', 'somethingWentWrong'), { description: getApiErrorMessage(err) });
    } finally {
      setProgress(null);
    }
  };

  return (
    <SettingsSection
      id="upload-version"
      title={t('siteUpload', 'newVersion')}
      description={t('siteUpload', 'newVersionDesc')}
      padded
    >
      <div className="space-y-4">
        <SiteDropzone value={site} onChange={setSite} disabled={busy} />
        {site && (
          <div className="flex justify-end">
            <button type="button" className="btn btn-primary" onClick={upload} disabled={busy || !!problem}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {busy
                ? formatMessage(t('siteUpload', 'uploading'), { percent: Math.round((progress ?? 0) * 100) })
                : t('siteUpload', 'newVersion')}
            </button>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
