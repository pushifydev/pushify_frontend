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
      className={`group flex items-center gap-1 rounded-lg border px-2 py-2 text-sm transition-colors ${
        selected
          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
          : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-default)]'
      }`}
    >
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing text-[var(--text-muted)] hover:text-[var(--text-secondary)] touch-none"
        aria-label="Drag"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left truncate font-medium text-[var(--text-primary)]"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        title={duplicateLabel}
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500"
        title={deleteLabel}
      >
        <Trash2 className="w-3.5 h-3.5" />
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
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
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
            <div className="flex items-center gap-2 rounded-lg border border-[var(--accent-primary)] bg-[var(--bg-secondary)] px-2 py-2 text-sm font-medium text-[var(--text-primary)] shadow-lg">
              <GripVertical className="w-4 h-4 text-[var(--accent-primary)]" />
              {labelFor(activeBlock)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
