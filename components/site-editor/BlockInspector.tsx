'use client';

import type { SiteBlock } from '@/lib/api';
import { ImageUploadField } from './ImageUploadField';

function Field({
  label,
  value,
  onChange,
  multiline,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      {multiline ? (
        <textarea
          className="textarea w-full text-sm"
          rows={3}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input w-full text-sm"
          type={type}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

interface BlockInspectorProps {
  projectId: string;
  block: SiteBlock | undefined;
  onChange: (patch: Partial<SiteBlock>) => void;
  t: (key: string) => string;
  emptyLabel: string;
}

export function BlockInspector({ projectId, block, onChange, t, emptyLabel }: BlockInspectorProps) {
  if (!block) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {t('inspectorTitle')} · {block.type}
      </p>

      {block.type === 'hero' && (
        <>
          <Field label={t('headline')} value={block.headline} onChange={(v) => onChange({ headline: v })} />
          <Field label={t('subheadline')} value={block.subheadline} onChange={(v) => onChange({ subheadline: v })} multiline />
          <Field label={t('ctaText')} value={block.ctaText} onChange={(v) => onChange({ ctaText: v })} />
          <Field label={t('ctaUrl')} value={block.ctaUrl} onChange={(v) => onChange({ ctaUrl: v })} />
        </>
      )}

      {block.type === 'banner' && (
        <>
          <ImageUploadField
            projectId={projectId}
            value={block.imageUrl}
            onChange={(v) => onChange({ imageUrl: v })}
            label={t('imageUrl')}
            uploadLabel={t('uploadImage')}
            uploadingLabel={t('uploading')}
          />
          <Field label={t('headline')} value={block.headline} onChange={(v) => onChange({ headline: v })} />
          <Field label={t('subheadline')} value={block.subheadline} onChange={(v) => onChange({ subheadline: v })} multiline />
          <Field
            label={t('overlayOpacity')}
            value={block.overlayOpacity}
            type="number"
            onChange={(v) => onChange({ overlayOpacity: Math.min(1, Math.max(0, parseFloat(v) || 0)) })}
          />
        </>
      )}

      {block.type === 'features' && (
        <>
          <Field label={t('sectionTitle')} value={block.title} onChange={(v) => onChange({ title: v })} />
          {block.items.map((item, idx) => (
            <div key={idx} className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
              <Field
                label={`${t('feature')} ${idx + 1}`}
                value={item.title}
                onChange={(v) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], title: v };
                  onChange({ items });
                }}
              />
              <Field
                label={t('featureDesc')}
                value={item.description}
                onChange={(v) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], description: v };
                  onChange({ items });
                }}
                multiline
              />
            </div>
          ))}
        </>
      )}

      {block.type === 'stats' && (
        <>
          {block.items.map((item, idx) => (
            <div key={idx} className="border-t border-[var(--border-subtle)] pt-3 space-y-2 first:border-0 first:pt-0">
              <Field
                label={`${t('statValue')} ${idx + 1}`}
                value={item.value}
                onChange={(v) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], value: v };
                  onChange({ items });
                }}
              />
              <Field
                label={t('statLabel')}
                value={item.label}
                onChange={(v) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], label: v };
                  onChange({ items });
                }}
              />
            </div>
          ))}
        </>
      )}

      {block.type === 'text' && (
        <>
          <Field label={t('sectionTitle')} value={block.title} onChange={(v) => onChange({ title: v })} />
          <Field label={t('body')} value={block.body} onChange={(v) => onChange({ body: v })} multiline />
        </>
      )}

      {block.type === 'pricing' && (
        <>
          <Field label={t('sectionTitle')} value={block.title} onChange={(v) => onChange({ title: v })} />
          {block.plans.map((plan, idx) => (
            <div key={idx} className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
              <p className="text-xs font-medium text-[var(--text-muted)]">{t('plan')} {idx + 1}</p>
              <Field
                label={t('planName')}
                value={plan.name}
                onChange={(v) => {
                  const plans = [...block.plans];
                  plans[idx] = { ...plans[idx], name: v };
                  onChange({ plans });
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <Field
                  label={t('planPrice')}
                  value={plan.price}
                  onChange={(v) => {
                    const plans = [...block.plans];
                    plans[idx] = { ...plans[idx], price: v };
                    onChange({ plans });
                  }}
                />
                <Field
                  label={t('planPeriod')}
                  value={plan.period}
                  onChange={(v) => {
                    const plans = [...block.plans];
                    plans[idx] = { ...plans[idx], period: v };
                    onChange({ plans });
                  }}
                />
              </div>
              <Field
                label={t('planFeatures')}
                value={plan.features.join('\n')}
                onChange={(v) => {
                  const plans = [...block.plans];
                  plans[idx] = { ...plans[idx], features: v.split('\n').filter(Boolean) };
                  onChange({ plans });
                }}
                multiline
              />
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={plan.highlighted}
                  onChange={(e) => {
                    const plans = block.plans.map((p, i) => ({
                      ...p,
                      highlighted: i === idx ? e.target.checked : false,
                    }));
                    onChange({ plans });
                  }}
                />
                {t('planHighlight')}
              </label>
            </div>
          ))}
        </>
      )}

      {block.type === 'faq' && (
        <>
          <Field label={t('sectionTitle')} value={block.title} onChange={(v) => onChange({ title: v })} />
          {block.items.map((item, idx) => (
            <div key={idx} className="border-t border-[var(--border-subtle)] pt-3 space-y-2">
              <Field
                label={`${t('question')} ${idx + 1}`}
                value={item.question}
                onChange={(v) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], question: v };
                  onChange({ items });
                }}
              />
              <Field
                label={t('answer')}
                value={item.answer}
                onChange={(v) => {
                  const items = [...block.items];
                  items[idx] = { ...items[idx], answer: v };
                  onChange({ items });
                }}
                multiline
              />
            </div>
          ))}
        </>
      )}

      {block.type === 'cta' && (
        <>
          <Field label={t('sectionTitle')} value={block.title} onChange={(v) => onChange({ title: v })} />
          <Field label={t('description')} value={block.description} onChange={(v) => onChange({ description: v })} multiline />
          <Field label={t('buttonText')} value={block.buttonText} onChange={(v) => onChange({ buttonText: v })} />
          <Field label={t('buttonUrl')} value={block.buttonUrl} onChange={(v) => onChange({ buttonUrl: v })} />
        </>
      )}

      {block.type === 'footer' && (
        <>
          <Field label={t('copyright')} value={block.copyright} onChange={(v) => onChange({ copyright: v })} />
          {block.links.map((link, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2">
              <Field
                label={t('linkLabel')}
                value={link.label}
                onChange={(v) => {
                  const links = [...block.links];
                  links[idx] = { ...links[idx], label: v };
                  onChange({ links });
                }}
              />
              <Field
                label={t('linkUrl')}
                value={link.url}
                onChange={(v) => {
                  const links = [...block.links];
                  links[idx] = { ...links[idx], url: v };
                  onChange({ links });
                }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
