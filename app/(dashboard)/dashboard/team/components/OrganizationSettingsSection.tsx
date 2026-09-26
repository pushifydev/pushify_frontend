'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useOrganization, useUpdateOrganization } from '@/hooks';
import { SettingsField, SettingsSection } from '@/components/dashboard/SettingsParts';

export function OrganizationSettingsSection({ id }: { id?: string }) {
  const { t } = useTranslation();
  const { data: org } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (org) {
      setName(org.name);
      setSlug(org.slug);
    }
  }, [org]);

  const handleSave = async () => {
    setError('');
    setSaved(false);

    try {
      await updateOrg.mutateAsync({ name: name.trim(), slug: slug.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
    }
  };

  const hasChanges = org && (name !== org.name || slug !== org.slug);

  return (
    <SettingsSection
      id={id}
      title={t('team', 'orgSettings')}
      description={t('team', 'orgSettingsDesc')}
      footer={
        <>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || updateOrg.isPending}
            className="btn btn-primary btn-sm"
          >
            {updateOrg.isPending ? t('team', 'saving') : t('common', 'save')}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--status-success)]" role="status">
              <Check className="w-4 h-4" />
              {t('team', 'saved')}
            </span>
          )}
          {error && (
            <span className="text-[13px] text-[var(--status-error)]" role="alert">
              {error}
            </span>
          )}
        </>
      }
    >
      <SettingsField label={t('team', 'orgName')} htmlFor="org-name">
        <input
          id="org-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('team', 'orgNamePlaceholder')}
          className="input w-full"
        />
      </SettingsField>
      <SettingsField label={t('team', 'orgSlug')} hint={t('team', 'orgSlugHint')} htmlFor="org-slug">
        <input
          id="org-slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder={t('team', 'orgSlugPlaceholder')}
          className="input w-full terminal-text"
        />
      </SettingsField>
    </SettingsSection>
  );
}
