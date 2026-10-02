import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Copy,
  Trash2,
  Sparkles,
  CheckCircle2,
  Plus,
} from 'lucide-react';

const SortableFieldItem = ({
  field,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(field)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isDragging
          ? 'bg-brand-50/80 border-brand-400 shadow-lg opacity-80'
          : isSelected
          ? 'bg-brand-50/40 border-brand-500 ring-2 ring-brand-100 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Drag handle & Field summary */}
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-0.5 text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 truncate">{field.label}</span>
              {field.required && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 uppercase">
                  Required
                </span>
              )}
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                {field.type}
              </span>
            </div>

            {field.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{field.description}</p>
            )}

            {/* Visual representation preview */}
            <div className="mt-2.5">
              {['short_text', 'phone', 'email', 'number'].includes(field.type) && (
                <div className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 flex items-center">
                  {field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                </div>
              )}
              {field.type === 'long_text' && (
                <div className="h-12 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-400">
                  {field.placeholder || 'Long response text...'}
                </div>
              )}
              {field.type === 'yes_no' && (
                <div className="flex gap-2 w-48">
                  <div className="flex-1 py-1 rounded-lg border border-slate-300 text-center text-xs font-semibold text-slate-600">
                    YES
                  </div>
                  <div className="flex-1 py-1 rounded-lg border border-slate-300 text-center text-xs font-semibold text-slate-600">
                    NO
                  </div>
                </div>
              )}
              {field.type === 'dropdown' && (
                <div className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>{field.placeholder || 'Select from options...'}</span>
                  <span>▼</span>
                </div>
              )}
            </div>

            {/* Conditional Logic Tag */}
            {field.conditionalLogic?.enabled && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 py-1 px-2.5 rounded-lg border border-amber-200 w-fit">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>
                  Only shown when{' '}
                  <span className="font-bold underline">{field.conditionalLogic.dependsOnFieldId}</span>{' '}
                  {field.conditionalLogic.operator} "{field.conditionalLogic.value}"
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(field);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Duplicate field"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FormCanvas = ({
  formTitle,
  formDescription,
  onTitleChange,
  onDescriptionChange,
  fields,
  selectedFieldId,
  onSelectField,
  onReorderFields,
  onDuplicateField,
  onDeleteField,
  onOpenLibrary,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(fields, oldIndex, newIndex).map((field, idx) => ({
        ...field,
        order: idx + 1,
      }));
      onReorderFields(reordered);
    }
  };

  return (
    <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
      {/* Form Title & Description Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs mb-5">
        <input
          type="text"
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Form Title (e.g. New Patient Registration)"
          className="text-xl font-bold text-slate-900 w-full border-none focus:outline-none focus:ring-0 placeholder:text-slate-300"
        />
        <input
          type="text"
          value={formDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Brief description or instructions for patients..."
          className="text-xs text-slate-500 w-full border-none focus:outline-none focus:ring-0 mt-1 placeholder:text-slate-300"
        />
      </div>

      {/* Field List Canvas */}
      <div className="flex-1 space-y-3">
        {fields.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600">Canvas is empty</p>
            <p className="text-xs mt-1 max-w-xs">Select fields from the library on the left to start building your dynamic form.</p>
            <button
              type="button"
              onClick={onOpenLibrary}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shadow-sm transition-all"
            >
              + Add Field
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field) => (
                <SortableFieldItem
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                  onSelect={onSelectField}
                  onDuplicate={onDuplicateField}
                  onDelete={onDeleteField}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
