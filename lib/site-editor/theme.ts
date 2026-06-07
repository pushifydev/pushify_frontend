export type SiteFontFamily = 'system' | 'serif' | 'rounded' | 'mono';
export type SiteBorderRadius = 'none' | 'sm' | 'md' | 'lg';
export type SiteMaxWidth = 'narrow' | 'default' | 'wide';

export interface SiteTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: SiteFontFamily;
  borderRadius: SiteBorderRadius;
  maxWidth: SiteMaxWidth;
}

export const DEFAULT_SITE_THEME: SiteTheme = {
  primaryColor: '#6366f1',
  accentColor: '#818cf8',
  backgroundColor: '#fafafa',
  surfaceColor: '#ffffff',
  textColor: '#18181b',
  mutedColor: '#71717a',
  fontFamily: 'system',
  borderRadius: 'md',
  maxWidth: 'default',
};

export function normalizeSiteTheme(theme?: Partial<SiteTheme> | null): SiteTheme {
  return { ...DEFAULT_SITE_THEME, ...theme };
}

export function themeCssVars(theme: SiteTheme): Record<string, string> {
  const radius: Record<SiteBorderRadius, string> = {
    none: '0',
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1.25rem',
  };
  const width: Record<SiteMaxWidth, string> = {
    narrow: '720px',
    default: '960px',
    wide: '1140px',
  };
  const fonts: Record<SiteFontFamily, string> = {
    system: 'system-ui,-apple-system,sans-serif',
    serif: 'Georgia,serif',
    rounded: '"Nunito",system-ui,sans-serif',
    mono: 'ui-monospace,monospace',
  };

  return {
    ['--se-primary' as string]: theme.primaryColor,
    ['--se-accent' as string]: theme.accentColor,
    ['--se-bg' as string]: theme.backgroundColor,
    ['--se-surface' as string]: theme.surfaceColor,
    ['--se-text' as string]: theme.textColor,
    ['--se-muted' as string]: theme.mutedColor,
    ['--se-radius' as string]: radius[theme.borderRadius],
    ['--se-max' as string]: width[theme.maxWidth],
    fontFamily: fonts[theme.fontFamily],
    color: theme.textColor,
    background: theme.backgroundColor,
  };
}
