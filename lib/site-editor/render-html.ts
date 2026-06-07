import type { SiteBlock, SiteSeo } from '@/lib/api';
import { normalizeSiteTheme, type SiteTheme } from './theme';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function themeToCss(theme: SiteTheme): string {
  const fonts: Record<SiteTheme['fontFamily'], string> = {
    system: 'system-ui,-apple-system,sans-serif',
    serif: 'Georgia,serif',
    rounded: '"Nunito",system-ui,sans-serif',
    mono: 'ui-monospace,monospace',
  };
  const radius: Record<SiteTheme['borderRadius'], string> = {
    none: '0',
    sm: '.375rem',
    md: '.75rem',
    lg: '1.25rem',
  };
  const width: Record<SiteTheme['maxWidth'], string> = {
    narrow: '720px',
    default: '960px',
    wide: '1140px',
  };
  return `:root{--primary:${theme.primaryColor};--accent:${theme.accentColor};--bg:${theme.backgroundColor};--surface:${theme.surfaceColor};--text:${theme.textColor};--muted:${theme.mutedColor};--radius:${radius[theme.borderRadius]};--max:${width[theme.maxWidth]}}body{font-family:${fonts[theme.fontFamily]};color:var(--text);background:var(--bg)}`;
}

function renderBlock(block: SiteBlock): string {
  switch (block.type) {
    case 'hero':
      return `<section class="hero"><h1>${escapeHtml(block.headline)}</h1><p class="sub">${escapeHtml(block.subheadline)}</p><a class="btn" href="${escapeHtml(block.ctaUrl)}">${escapeHtml(block.ctaText)}</a></section>`;
    case 'banner':
      return `<section class="banner" style="--overlay:${block.overlayOpacity}"><div class="banner-bg" style="background-image:url('${escapeHtml(block.imageUrl)}')"></div><div class="banner-content"><h2>${escapeHtml(block.headline)}</h2><p>${escapeHtml(block.subheadline)}</p></div></section>`;
    case 'features':
      return `<section class="features"><h2>${escapeHtml(block.title)}</h2><div class="grid">${block.items.map((f) => `<article><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.description)}</p></article>`).join('')}</div></section>`;
    case 'stats':
      return `<section class="stats"><div class="stats-grid">${block.items.map((s) => `<div class="stat"><span class="stat-value">${escapeHtml(s.value)}</span><span class="stat-label">${escapeHtml(s.label)}</span></div>`).join('')}</div></section>`;
    case 'text':
      return `<section class="text"><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.body).replace(/\n/g, '<br/>')}</p></section>`;
    case 'pricing':
      return `<section class="pricing"><h2>${escapeHtml(block.title)}</h2><div class="pricing-grid">${block.plans.map((p) => `<article class="plan${p.highlighted ? ' plan-highlight' : ''}"><h3>${escapeHtml(p.name)}</h3><p class="plan-price"><span>${escapeHtml(p.price)}</span><small>${escapeHtml(p.period)}</small></p><ul>${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul><a class="btn${p.highlighted ? '' : ' btn-outline'}" href="${escapeHtml(p.ctaUrl)}">${escapeHtml(p.ctaText)}</a></article>`).join('')}</div></section>`;
    case 'faq':
      return `<section class="faq"><h2>${escapeHtml(block.title)}</h2><div class="faq-list">${block.items.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}</div></section>`;
    case 'cta':
      return `<section class="cta"><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.description)}</p><a class="btn" href="${escapeHtml(block.buttonUrl)}">${escapeHtml(block.buttonText)}</a></section>`;
    case 'footer':
      return `<footer><p>${escapeHtml(block.copyright)}</p><nav>${block.links.map((l) => `<a href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a>`).join('')}</nav></footer>`;
    default:
      return '';
  }
}

const BASE_STYLES = `*{box-sizing:border-box;margin:0;padding:0}.wrap{max-width:var(--max);margin:0 auto;padding:2rem 1.25rem}.hero{padding:4rem 0;text-align:center}.hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;margin-bottom:1rem}.hero .sub{font-size:1.125rem;color:var(--muted);max-width:36rem;margin:0 auto 1.5rem}.btn{display:inline-block;background:var(--primary);color:#fff;padding:.75rem 1.5rem;border-radius:var(--radius);text-decoration:none;font-weight:600}.btn-outline{background:transparent;color:var(--primary);border:2px solid var(--primary)}section{padding:2.5rem 0}h2{font-size:1.5rem;margin-bottom:1rem}.grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.features article{background:var(--surface);border:1px solid #e4e4e7;border-radius:var(--radius);padding:1.25rem}.banner{position:relative;border-radius:var(--radius);overflow:hidden;margin:1rem 0;min-height:220px;display:flex;align-items:center;justify-content:center}.banner-bg{position:absolute;inset:0;background-size:cover;background-position:center}.banner:after{content:'';position:absolute;inset:0;background:#000;opacity:var(--overlay,.4)}.banner-content{position:relative;z-index:1;text-align:center;color:#fff;padding:2rem}.stats-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));text-align:center}.stat{padding:1.25rem;background:var(--surface);border-radius:var(--radius)}.stat-value{display:block;font-size:1.5rem;font-weight:800;color:var(--primary)}.stat-label{font-size:.8rem;color:var(--muted)}.pricing-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.plan{background:var(--surface);border:1px solid #e4e4e7;border-radius:var(--radius);padding:1.25rem}.plan-highlight{border-color:var(--primary)}.plan ul{list-style:none;margin:0 0 1rem;padding:0}.plan li:before{content:'✓ ';color:var(--primary)}.faq details{background:var(--surface);border:1px solid #e4e4e7;border-radius:var(--radius);padding:.75rem 1rem;margin-bottom:.5rem}.cta{text-align:center;background:color-mix(in srgb,var(--primary) 12%,var(--bg));border-radius:var(--radius);padding:2rem 1.25rem}footer{margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e4e4e7;text-align:center;color:var(--muted);font-size:.875rem}footer nav{display:flex;gap:1rem;justify-content:center;margin-top:.5rem;flex-wrap:wrap}footer a{color:var(--primary)}`;

export function renderSiteHtmlClient(
  seo: SiteSeo,
  blocks: SiteBlock[],
  siteName: string,
  themeInput?: Partial<SiteTheme> | null,
): string {
  const theme = normalizeSiteTheme(themeInput);
  const title = seo.title || siteName;
  const googleFont =
    theme.fontFamily === 'rounded'
      ? '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"/>'
      : '';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(title)}</title>${googleFont}<style>${themeToCss(theme)}${BASE_STYLES}</style></head><body><main class="wrap">${blocks.map(renderBlock).join('')}</main></body></html>`;
}
