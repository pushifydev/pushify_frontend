'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, GripVertical } from 'lucide-react';
import type { SiteBlock } from '@/lib/api';
import type { SiteTheme } from '@/lib/site-editor/theme';
import { themeCssVars } from '@/lib/site-editor/theme';
import { InlineEditable } from './InlineEditable';

interface EditableSiteCanvasProps {
  blocks: SiteBlock[];
  theme: SiteTheme;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onBlockChange: (id: string, patch: Partial<SiteBlock>) => void;
  onReorder: (blocks: SiteBlock[]) => void;
  onBannerImagePick?: (blockId: string, file: File) => void;
  clickToEditHint: string;
  dragToReorderLabel: string;
  labelFor: (block: SiteBlock) => string;
}

/**
 * One sortable block on the canvas. The whole block is click-to-select, but a drag is
 * only started from the floating handle (so inline text editing and selection clicks are
 * never hijacked by the drag sensor).
 */
function SortableBlock({
  block,
  selected,
  onSelect,
  dragLabel,
  children,
}: {
  block: SiteBlock;
  selected: boolean;
  onSelect: () => void;
  dragLabel: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSelect();
      }}
      className={`group/se relative transition-shadow cursor-pointer ${
        isDragging ? 'opacity-60 z-30' : 'opacity-100'
      } ${
        selected
          ? 'ring-2 ring-[var(--se-primary)] ring-offset-2 ring-offset-[var(--se-bg)]'
          : 'hover:ring-1 hover:ring-[var(--se-primary)]/30'
      }`}
    >
      {/* Drag handle in the left gutter — visible on hover or when the block is selected. */}
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        title={dragLabel}
        aria-label={dragLabel}
        className={`absolute -left-3 top-1/2 -translate-y-1/2 z-40 hidden sm:flex items-center justify-center w-6 h-8 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] shadow-sm cursor-grab active:cursor-grabbing touch-none transition-opacity hover:text-[var(--text-primary)] ${
          selected ? 'opacity-100' : 'opacity-0 group-hover/se:opacity-100'
        }`}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {selected && (
        <span className="absolute top-1 right-1 z-20 text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--se-primary)] text-white font-semibold pointer-events-none">
          Selected
        </span>
      )}
      {children}
    </div>
  );
}

export function EditableSiteCanvas({
  blocks,
  theme,
  selectedBlockId,
  onSelectBlock,
  onBlockChange,
  onReorder,
  onBannerImagePick,
  clickToEditHint,
  dragToReorderLabel,
  labelFor,
}: EditableSiteCanvasProps) {
  const vars = themeCssVars(theme);
  const patch = (id: string, p: Partial<SiteBlock>) => onBlockChange(id, p);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  };

  const renderBlockBody = (block: SiteBlock, selected: boolean): React.ReactNode => {
    switch (block.type) {
      case 'hero':
        return (
          <section className="se-hero">
            <h1>
              <InlineEditable
                value={block.headline}
                onChange={(v) => patch(block.id, { headline: v })}
                className="block"
              />
            </h1>
            <p className="se-sub">
              <InlineEditable
                value={block.subheadline}
                onChange={(v) => patch(block.id, { subheadline: v })}
                multiline
              />
            </p>
            <span className="se-btn">
              <InlineEditable
                value={block.ctaText}
                onChange={(v) => patch(block.id, { ctaText: v })}
              />
            </span>
          </section>
        );

      case 'banner':
        return (
          <section className="se-banner">
            <div
              className="se-banner-bg"
              style={{ backgroundImage: `url('${block.imageUrl}')` }}
            />
            <div className="se-banner-overlay" style={{ opacity: block.overlayOpacity }} />
            {selected && onBannerImagePick && (
              <label className="absolute top-2 left-2 z-20 btn btn-secondary btn-sm cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onBannerImagePick(block.id, f);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            <div className="se-banner-content">
              <h2 className="text-xl font-bold mb-2">
                <InlineEditable
                  value={block.headline}
                  onChange={(v) => patch(block.id, { headline: v })}
                />
              </h2>
              <p>
                <InlineEditable
                  value={block.subheadline}
                  onChange={(v) => patch(block.id, { subheadline: v })}
                  multiline
                />
              </p>
            </div>
          </section>
        );

      case 'features':
        return (
          <section className="se-section">
            <h2 className="se-h2">
              <InlineEditable value={block.title} onChange={(v) => patch(block.id, { title: v })} />
            </h2>
            <div className="se-grid">
              {block.items.map((item, idx) => (
                <article key={idx} className="se-card">
                  <h3 className="font-semibold text-sm mb-1">
                    <InlineEditable
                      value={item.title}
                      onChange={(v) => {
                        const items = [...block.items];
                        items[idx] = { ...items[idx], title: v };
                        patch(block.id, { items });
                      }}
                    />
                  </h3>
                  <p className="text-sm text-[var(--se-muted)]">
                    <InlineEditable
                      value={item.description}
                      onChange={(v) => {
                        const items = [...block.items];
                        items[idx] = { ...items[idx], description: v };
                        patch(block.id, { items });
                      }}
                      multiline
                    />
                  </p>
                </article>
              ))}
            </div>
          </section>
        );

      case 'stats':
        return (
          <section className="se-section">
            <div className="se-stats">
              {block.items.map((item, idx) => (
                <div key={idx} className="se-stat">
                  <span className="se-stat-val">
                    <InlineEditable
                      value={item.value}
                      onChange={(v) => {
                        const items = [...block.items];
                        items[idx] = { ...items[idx], value: v };
                        patch(block.id, { items });
                      }}
                    />
                  </span>
                  <span className="text-xs text-[var(--se-muted)]">
                    <InlineEditable
                      value={item.label}
                      onChange={(v) => {
                        const items = [...block.items];
                        items[idx] = { ...items[idx], label: v };
                        patch(block.id, { items });
                      }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'text':
        return (
          <section className="se-section">
            <h2 className="se-h2">
              <InlineEditable value={block.title} onChange={(v) => patch(block.id, { title: v })} />
            </h2>
            <p className="text-[var(--se-muted)] leading-relaxed">
              <InlineEditable
                value={block.body}
                onChange={(v) => patch(block.id, { body: v })}
                multiline
              />
            </p>
          </section>
        );

      case 'pricing':
        return (
          <section className="se-section">
            <h2 className="se-h2">
              <InlineEditable value={block.title} onChange={(v) => patch(block.id, { title: v })} />
            </h2>
            <div className="se-grid">
              {block.plans.map((plan, idx) => (
                <article
                  key={idx}
                  className={`se-card ${plan.highlighted ? 'ring-2 ring-[var(--se-primary)]' : ''}`}
                >
                  <h3 className="font-semibold">
                    <InlineEditable
                      value={plan.name}
                      onChange={(v) => {
                        const plans = [...block.plans];
                        plans[idx] = { ...plans[idx], name: v };
                        patch(block.id, { plans });
                      }}
                    />
                  </h3>
                  <p className="text-2xl font-bold text-[var(--se-primary)] my-2">
                    <InlineEditable
                      value={plan.price}
                      onChange={(v) => {
                        const plans = [...block.plans];
                        plans[idx] = { ...plans[idx], price: v };
                        patch(block.id, { plans });
                      }}
                    />
                    <InlineEditable
                      value={plan.period}
                      onChange={(v) => {
                        const plans = [...block.plans];
                        plans[idx] = { ...plans[idx], period: v };
                        patch(block.id, { plans });
                      }}
                      className="text-sm font-normal text-[var(--se-muted)]"
                    />
                  </p>
                </article>
              ))}
            </div>
          </section>
        );

      case 'faq':
        return (
          <section className="se-section">
            <h2 className="se-h2">
              <InlineEditable value={block.title} onChange={(v) => patch(block.id, { title: v })} />
            </h2>
            <div className="space-y-2">
              {block.items.map((item, idx) => (
                <div key={idx} className="se-card">
                  <p className="font-semibold text-sm">
                    <InlineEditable
                      value={item.question}
                      onChange={(v) => {
                        const items = [...block.items];
                        items[idx] = { ...items[idx], question: v };
                        patch(block.id, { items });
                      }}
                    />
                  </p>
                  <p className="text-sm text-[var(--se-muted)] mt-1">
                    <InlineEditable
                      value={item.answer}
                      onChange={(v) => {
                        const items = [...block.items];
                        items[idx] = { ...items[idx], answer: v };
                        patch(block.id, { items });
                      }}
                      multiline
                    />
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section className="se-cta">
            <h2 className="se-h2">
              <InlineEditable value={block.title} onChange={(v) => patch(block.id, { title: v })} />
            </h2>
            <p className="text-[var(--se-muted)] mb-4">
              <InlineEditable
                value={block.description}
                onChange={(v) => patch(block.id, { description: v })}
                multiline
              />
            </p>
            <span className="se-btn">
              <InlineEditable
                value={block.buttonText}
                onChange={(v) => patch(block.id, { buttonText: v })}
              />
            </span>
          </section>
        );

      case 'footer':
        return (
          <footer className="se-footer">
            <InlineEditable
              value={block.copyright}
              onChange={(v) => patch(block.id, { copyright: v })}
            />
          </footer>
        );

      default:
        return null;
    }
  };

  return (
    <div style={vars} className="min-h-full text-[var(--se-text)] bg-[var(--se-bg)]">
      <style>{`
        .se-wrap { max-width: var(--se-max); margin: 0 auto; padding: 2rem 1.25rem; }
        .se-hero { padding: 3rem 0; text-align: center; }
        .se-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; margin-bottom: 0.75rem; }
        .se-sub { font-size: 1.05rem; color: var(--se-muted); max-width: 32rem; margin: 0 auto 1.25rem; }
        .se-btn { display: inline-block; background: var(--se-primary); color: #fff; padding: 0.65rem 1.25rem; border-radius: var(--se-radius); font-weight: 600; }
        .se-section { padding: 2rem 0; }
        .se-h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.75rem; }
        .se-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .se-card { background: var(--se-surface); border: 1px solid color-mix(in srgb, var(--se-muted) 22%, transparent); border-radius: var(--se-radius); padding: 1rem; }
        .se-banner { position: relative; min-height: 200px; border-radius: var(--se-radius); overflow: hidden; display: flex; align-items: center; justify-content: center; margin: 0.5rem 0; }
        .se-banner-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .se-banner-overlay { position: absolute; inset: 0; background: #000; }
        .se-banner-content { position: relative; z-index: 1; text-align: center; color: #fff; padding: 1.5rem; max-width: 90%; }
        .se-stats { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); text-align: center; }
        .se-stat { padding: 1rem; background: var(--se-surface); border-radius: var(--se-radius); }
        .se-stat-val { display: block; font-size: 1.5rem; font-weight: 800; color: var(--se-primary); }
        .se-cta { text-align: center; background: color-mix(in srgb, var(--se-primary) 12%, var(--se-bg)); border-radius: var(--se-radius); padding: 2rem 1rem; }
        .se-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid color-mix(in srgb, var(--se-muted) 25%, transparent); text-align: center; color: var(--se-muted); font-size: 0.85rem; }
      `}</style>

      <p className="text-center text-[10px] text-[var(--text-muted)] py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        {clickToEditHint}
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <main className="se-wrap" onClick={() => onSelectBlock(null)}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                selected={block.id === selectedBlockId}
                onSelect={() => onSelectBlock(block.id)}
                dragLabel={dragToReorderLabel}
              >
                {renderBlockBody(block, block.id === selectedBlockId)}
              </SortableBlock>
            ))}
          </main>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeBlock ? (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--se-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] shadow-lg">
              <GripVertical className="w-4 h-4 text-[var(--se-primary)]" />
              {labelFor(activeBlock)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
