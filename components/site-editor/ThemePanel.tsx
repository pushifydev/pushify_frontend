'use client';

import type { SiteTheme, SiteFontFamily, SiteBorderRadius, SiteMaxWidth } from '@/lib/api';
import { Select } from '@/components/ui/select';

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
    <label className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 cursor-pointer rounded-md border border-[var(--border-subtle)] bg-transparent"
      />
    </label>
  );
}

export function ThemePanel({ theme, onChange, t }: ThemePanelProps) {
  return (
    <div className="space-y-4">
      <p className="dash-section-label">
        {t('themeTitle')}
      </p>
      <div className="rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 divide-y divide-[var(--border-subtle)]">
        <ColorField label={t('primaryColor')} value={theme.primaryColor} onChange={(v) => onChange({ primaryColor: v })} />
        <ColorField label={t('accentColor')} value={theme.accentColor} onChange={(v) => onChange({ accentColor: v })} />
        <ColorField label={t('backgroundColor')} value={theme.backgroundColor} onChange={(v) => onChange({ backgroundColor: v })} />
        <ColorField label={t('surfaceColor')} value={theme.surfaceColor} onChange={(v) => onChange({ surfaceColor: v })} />
        <ColorField label={t('textColor')} value={theme.textColor} onChange={(v) => onChange({ textColor: v })} />
      </div>
      <div className="block space-y-1 text-sm">
        <span className="text-[var(--text-secondary)]">{t('fontFamily')}</span>
        <Select
          className="w-full"
          value={theme.fontFamily}
          onValueChange={(v) => onChange({ fontFamily: v as SiteFontFamily })}
          aria-label={t('fontFamily')}
          options={[
            { value: 'system', label: t('fontSystem') },
            { value: 'rounded', label: t('fontRounded') },
            { value: 'serif', label: t('fontSerif') },
            { value: 'mono', label: t('fontMono') },
          ]}
        />
      </div>
      <div className="block space-y-1 text-sm">
        <span className="text-[var(--text-secondary)]">{t('borderRadius')}</span>
        <Select
          className="w-full"
          value={theme.borderRadius}
          onValueChange={(v) => onChange({ borderRadius: v as SiteBorderRadius })}
          aria-label={t('borderRadius')}
          options={[
            { value: 'none', label: t('radiusNone') },
            { value: 'sm', label: t('radiusSm') },
            { value: 'md', label: t('radiusMd') },
            { value: 'lg', label: t('radiusLg') },
          ]}
        />
      </div>
      <div className="block space-y-1 text-sm">
        <span className="text-[var(--text-secondary)]">{t('maxWidth')}</span>
        <Select
          className="w-full"
          value={theme.maxWidth}
          onValueChange={(v) => onChange({ maxWidth: v as SiteMaxWidth })}
          aria-label={t('maxWidth')}
          options={[
            { value: 'narrow', label: t('widthNarrow') },
            { value: 'default', label: t('widthDefault') },
            { value: 'wide', label: t('widthWide') },
          ]}
        />
      </div>
    </div>
  );
}
