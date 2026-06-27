"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DraggableAttributes,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: { id: string; displayOrder: number }[]) => void;
  renderItem: (item: T, dragHandleProps: DragHandleProps) => React.ReactNode;
  /** Accessible label describing the reorderable list for assistive tech. */
  ariaLabel?: string;
}

export interface DragHandleProps {
  ref: (element: HTMLElement | null) => void;
  listeners: Record<string, Function> | undefined;
  attributes: DraggableAttributes;
}

function SortableItem<T extends { id: string }>({
  item,
  renderItem,
}: {
  item: T;
  renderItem: (item: T, dragHandleProps: DragHandleProps) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandleProps: DragHandleProps = {
    ref: setActivatorNodeRef,
    listeners,
    attributes,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="listitem"
      className={cn(
        "relative rounded-lg border border-border bg-background transition-shadow",
        isDragging && "z-50 shadow-lg opacity-50"
      )}
    >
      {renderItem(item, dragHandleProps)}
    </div>
  );
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  ariaLabel,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeItem = activeId ? items.find((item) => item.id === activeId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedItems = arrayMove(items, oldIndex, newIndex);
    const newOrder = reorderedItems.map((item, index) => ({
      id: item.id,
      displayOrder: index,
    }));

    onReorder(newOrder);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2" role="list" aria-label={ariaLabel}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div className="rounded-lg border border-border bg-background shadow-xl opacity-90">
            {renderItem(activeItem, {
              ref: () => {},
              listeners: undefined,
              attributes: {
                role: "button",
                tabIndex: 0,
                "aria-disabled": false,
                "aria-pressed": undefined,
                "aria-roledescription": "sortable",
                "aria-describedby": "",
              },
            })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * A ready-made drag handle button component.
 * Use this inside your `renderItem` callback for a consistent drag handle UI.
 */
export function DragHandle({ dragHandleProps }: { dragHandleProps: DragHandleProps }) {
  return (
    <button
      type="button"
      ref={dragHandleProps.ref}
      className={cn(
        "flex cursor-grab touch-none items-center justify-center rounded p-1",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label="Drag to reorder"
      aria-roledescription={dragHandleProps.attributes["aria-roledescription"]}
      aria-describedby={dragHandleProps.attributes["aria-describedby"]}
      tabIndex={dragHandleProps.attributes.tabIndex}
      {...dragHandleProps.listeners}
    >
      <GripVertical className="size-4" aria-hidden="true" />
    </button>
  );
}

export type { SortableListProps };
