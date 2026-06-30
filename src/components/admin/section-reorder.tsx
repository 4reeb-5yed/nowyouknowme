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
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  Edit3,
  Check,
  Save,
  Loader2,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PageSection {
  id: string;
  key: string;
  title: string;
  description: string;
  isVisible: boolean;
  preview?: React.ReactNode;
  editForm?: React.ReactNode;
}

interface SectionReorderProps {
  sections: PageSection[];
  onReorder: (sectionIds: string[]) => void;
  onToggleVisibility: (sectionId: string, isVisible: boolean) => void;
  onSave?: () => void;
  isSaving?: boolean;
  previewMode?: boolean;
  onPreviewModeChange?: (enabled: boolean) => void;
}

export function SectionReorder({
  sections,
  onReorder,
  onToggleVisibility,
  onSave,
  isSaving = false,
  previewMode = false,
  onPreviewModeChange,
}: SectionReorderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [localSections, setLocalSections] = useState(sections);

  // Sync local state when sections prop changes
  if (JSON.stringify(localSections.map(s => s.id)) !== JSON.stringify(sections.map(s => s.id))) {
    setLocalSections(sections);
  }

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

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localSections.findIndex((s) => s.id === active.id);
    const newIndex = localSections.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(localSections, oldIndex, newIndex);
    setLocalSections(reordered);
    onReorder(reordered.map((s) => s.id));
  }

  const activeSection = activeId ? localSections.find((s) => s.id === activeId) : null;

  return (
    <div className="space-y-4">
      {/* Header with Preview Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-lg font-medium">Page Sections</h3>
          <Badge variant="secondary" className="ml-2">
            {localSections.length} sections
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Preview Mode Toggle */}
          {onPreviewModeChange && (
            <Button
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => onPreviewModeChange(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
              {previewMode ? "Exit Preview" : "Preview"}
            </Button>
          )}
          {/* Save Button */}
          {onSave && (
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                  Save Order
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Preview Mode Banner */}
      {previewMode && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium">Preview Mode</span>
          </div>
          <p className="mt-1 text-blue-700 dark:text-blue-300">
            You&apos;re seeing how your sections will appear. Drag to reorder, then save.
          </p>
        </div>
      )}

      {/* Draggable Sections List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2" role="list" aria-label="Reorderable sections">
            {localSections.map((section, index) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                index={index}
                isEditing={editingSection === section.id}
                onEdit={() => setEditingSection(section.id)}
                onEditClose={() => setEditingSection(null)}
                onToggleVisibility={onToggleVisibility}
                previewMode={previewMode}
                isActive={activeId === section.id}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeSection && (
            <div className="rounded-lg border-2 border-primary bg-background shadow-xl">
              <div className="flex items-center gap-3 p-4">
                <GripVertical className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">{activeSection.title}</p>
                  <p className="text-sm text-muted-foreground">{activeSection.description}</p>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {localSections.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Layout className="mx-auto h-10 w-10 text-muted-foreground mb-3" aria-hidden="true" />
          <p className="text-muted-foreground">No sections configured</p>
          <p className="text-sm text-muted-foreground mt-1">
            Sections will appear here as you add content
          </p>
        </div>
      )}
    </div>
  );
}

interface SortableSectionItemProps {
  section: PageSection;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onEditClose: () => void;
  onToggleVisibility: (sectionId: string, isVisible: boolean) => void;
  previewMode: boolean;
  isActive: boolean;
}

function SortableSectionItem({
  section,
  index,
  isEditing,
  onEdit,
  onEditClose,
  onToggleVisibility,
  previewMode,
  isActive,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-background transition-all",
        isDragging && "z-50 shadow-lg opacity-50",
        previewMode && "border-primary/50"
      )}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag Handle */}
        <button
          type="button"
          className={cn(
            "flex cursor-grab touch-none items-center justify-center rounded p-1",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "transition-colors"
          )}
          aria-label={`Drag to reorder ${section.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Order Number */}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {index + 1}
        </div>

        {/* Section Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{section.title}</p>
            {!section.isVisible && (
              <Badge variant="outline" className="text-xs">
                Hidden
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {section.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Edit Button */}
          <button
            type="button"
            onClick={onEdit}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
              isEditing
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            title="Edit section"
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Done
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit
              </>
            )}
          </button>

          {/* Visibility Toggle */}
          <button
            type="button"
            onClick={() => onToggleVisibility(section.id, !section.isVisible)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
              section.isVisible
                ? "hover:bg-muted text-muted-foreground"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
            )}
            title={section.isVisible ? "Hide section" : "Show section"}
          >
            <Eye className={cn("h-4 w-4", !section.isVisible && "stroke-[2.5]")} aria-hidden="true" />
            {section.isVisible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Expanded Edit Panel */}
      {isEditing && section.editForm && (
        <div className="border-t border-border p-4 bg-muted/30">
          {section.editForm}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={onEditClose}>
              <Check className="h-4 w-4 mr-1" aria-hidden="true" />
              Done Editing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
