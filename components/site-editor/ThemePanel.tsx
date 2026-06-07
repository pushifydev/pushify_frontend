'use client';

import type { SiteTheme, SiteFontFamily, SiteBorderRadius, SiteMaxWidth } from '@/lib/api';

interface ThemePanelProps {
  theme: SiteTheme;
  onChange: (patch: Partial<SiteTheme>) => void;
  t: (key: string) => string;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-12 cursor-pointer rounded border border-[var(--border-subtle)] bg-transparent"
      />
    </label>
  );
}

export function ThemePanel({ theme, onChange, t }: ThemePanelProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {t('themeTitle')}
      </p>
      <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
        <ColorField label={t('primaryColor')} value={theme.primaryColor} onChange={(v) => onChange({ primaryColor: v })} />
        <ColorField label={t('accentColor')} value={theme.accentColor} onChange={(v) => onChange({ accentColor: v })} />
        <ColorField label={t('backgroundColor')} value={theme.backgroundColor} onChange={(v) => onChange({ backgroundColor: v })} />
        <ColorField label={t('surfaceColor')} value={theme.surfaceColor} onChange={(v) => onChange({ surfaceColor: v })} />
        <ColorField label={t('textColor')} value={theme.textColor} onChange={(v) => onChange({ textColor: v })} />
      </div>
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--text-secondary)]">{t('fontFamily')}</span>
        <select
          className="select w-full"
          value={theme.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value as SiteFontFamily })}
        >
          <option value="system">{t('fontSystem')}</option>
          <option value="rounded">{t('fontRounded')}</option>
          <option value="serif">{t('fontSerif')}</option>
          <option value="mono">{t('fontMono')}</option>
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--text-secondary)]">{t('borderRadius')}</span>
        <select
          className="select w-full"
          value={theme.borderRadius}
          onChange={(e) => onChange({ borderRadius: e.target.value as SiteBorderRadius })}
        >
          <option value="none">{t('radiusNone')}</option>
          <option value="sm">{t('radiusSm')}</option>
          <option value="md">{t('radiusMd')}</option>
          <option value="lg">{t('radiusLg')}</option>
        </select>
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-[var(--text-secondary)]">{t('maxWidth')}</span>
        <select
          className="select w-full"
          value={theme.maxWidth}
          onChange={(e) => onChange({ maxWidth: e.target.value as SiteMaxWidth })}
        >
          <option value="narrow">{t('widthNarrow')}</option>
          <option value="default">{t('widthDefault')}</option>
          <option value="wide">{t('widthWide')}</option>
        </select>
      </label>
    </div>
  );
}
