'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks';
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
import { GripVertical, Copy, Trash2 } from 'lucide-react';
import type { SiteBlock } from '@/lib/api';

interface BlockLayersProps {
  blocks: SiteBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (blocks: SiteBlock[]) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  labelFor: (block: SiteBlock) => string;
  layersTitle: string;
  duplicateLabel: string;
  deleteLabel: string;
}

function SortableLayer({
  block,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  label,
  duplicateLabel,
  deleteLabel,
}: {
  block: SiteBlock;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  label: string;
  duplicateLabel: string;
  deleteLabel: string;
}) {
  const { locale } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 rounded-[10px] border px-2 py-2 text-sm transition-colors ${
        selected
          ? 'border-[var(--border-strong)] bg-[var(--hover-overlay-md)]'
          : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-default)]'
      }`}
    >
      <button
        type="button"
        className="p-1 rounded-md cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-primary)] touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
        aria-label={locale === 'tr' ? 'Sürükleyerek sırala' : 'Drag to reorder'}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex-1 text-left truncate font-medium text-[var(--text-primary)] rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
        title={duplicateLabel}
        aria-label={duplicateLabel}
      >
        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-[var(--text-muted)] hover:text-[var(--status-error)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--text-primary)]"
        title={deleteLabel}
        aria-label={deleteLabel}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function BlockLayers({
  blocks,
  selectedId,
  onSelect,
  onReorder,
  onDuplicate,
  onDelete,
  labelFor,
  layersTitle,
  duplicateLabel,
  deleteLabel,
}: BlockLayersProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
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

  return (
    <div className="space-y-2">
      <p className="dash-section-label">
        {layersTitle}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {blocks.map((block) => (
              <SortableLayer
                key={block.id}
                block={block}
                selected={block.id === selectedId}
                onSelect={() => onSelect(block.id)}
                onDuplicate={() => onDuplicate(block.id)}
                onDelete={() => onDelete(block.id)}
                label={labelFor(block)}
                duplicateLabel={duplicateLabel}
                deleteLabel={deleteLabel}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBlock ? (
            <div className="flex items-center gap-2 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-2 py-2 text-sm font-medium text-[var(--text-primary)] shadow-lg">
              <GripVertical className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
              {labelFor(activeBlock)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
