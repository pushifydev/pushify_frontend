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

// Only hex, rgb/rgba/hsl/hsla() with a digit/percent/comma charset, or a plain
// named color. Anything else (e.g. "#fff}</style><script>...") is rejected so a
// theme value cannot break out of the generated <style> block — see CR-4.
const SAFE_COLOR = /^#[0-9a-fA-F]{3,8}$|^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s/]+\)$|^[a-zA-Z]+$/;

function sanitizeColor(value: unknown, fallback: string): string {
  const v = typeof value === 'string' ? value.trim() : '';
  return SAFE_COLOR.test(v) ? v : fallback;
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function normalizeSiteTheme(theme?: Partial<SiteTheme> | null): SiteTheme {
  const merged = { ...DEFAULT_SITE_THEME, ...theme };
  return {
    primaryColor: sanitizeColor(merged.primaryColor, DEFAULT_SITE_THEME.primaryColor),
    accentColor: sanitizeColor(merged.accentColor, DEFAULT_SITE_THEME.accentColor),
    backgroundColor: sanitizeColor(merged.backgroundColor, DEFAULT_SITE_THEME.backgroundColor),
    surfaceColor: sanitizeColor(merged.surfaceColor, DEFAULT_SITE_THEME.surfaceColor),
    textColor: sanitizeColor(merged.textColor, DEFAULT_SITE_THEME.textColor),
    mutedColor: sanitizeColor(merged.mutedColor, DEFAULT_SITE_THEME.mutedColor),
    fontFamily: pickEnum(merged.fontFamily, ['system', 'serif', 'rounded', 'mono'], DEFAULT_SITE_THEME.fontFamily),
    borderRadius: pickEnum(merged.borderRadius, ['none', 'sm', 'md', 'lg'], DEFAULT_SITE_THEME.borderRadius),
    maxWidth: pickEnum(merged.maxWidth, ['narrow', 'default', 'wide'], DEFAULT_SITE_THEME.maxWidth),
  };
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
