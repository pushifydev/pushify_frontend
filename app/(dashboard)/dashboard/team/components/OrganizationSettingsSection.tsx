'use client';

import { useState, useEffect } from 'react';
import { Building2, Check } from 'lucide-react';
import { useTranslation } from '@/hooks';
import { useOrganization, useUpdateOrganization } from '@/hooks';

export function OrganizationSettingsSection() {
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
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20">
            <Building2 className="w-5 h-5 text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h3 className="font-semibold">{t('team', 'orgSettings')}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{t('team', 'orgSettingsDesc')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('team', 'orgName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('team', 'orgNamePlaceholder')}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              {t('team', 'orgSlug')}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder={t('team', 'orgSlugPlaceholder')}
              className="input w-full"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">{t('team', 'orgSlugHint')}</p>
          </div>

          {error && (
            <p className="text-sm text-[var(--accent-red)]">{error}</p>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[var(--accent-green)]">
              <Check className="w-4 h-4" />
              {t('team', 'saved')}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || updateOrg.isPending}
          className="btn btn-primary"
        >
          {updateOrg.isPending ? t('team', 'saving') : t('common', 'save')}
        </button>
      </div>
    </div>
  );
}
