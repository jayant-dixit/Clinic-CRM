import React from 'react';
import { X, Trash2, Plus, Sparkles, Sliders } from 'lucide-react';

export const FieldSettingsDrawer = ({
  selectedField,
  allFields = [],
  onUpdateField,
  onClose,
  onDeleteField,
}) => {
  if (!selectedField) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full flex flex-col items-center justify-center text-center text-slate-400">
        <Sliders className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">Select a field on the canvas</p>
        <p className="text-xs text-slate-400 mt-1">Configure labels, validation & conditional rules</p>
      </div>
    );
  }

  const handleChange = (key, val) => {
    onUpdateField({ ...selectedField, [key]: val });
  };

  const handleValidationChange = (key, val) => {
    onUpdateField({
      ...selectedField,
      validation: {
        ...(selectedField.validation || {}),
        [key]: val === '' ? undefined : Number(val),
      },
    });
  };

  const handleConditionalChange = (key, val) => {
    onUpdateField({
      ...selectedField,
      conditionalLogic: {
        ...(selectedField.conditionalLogic || { enabled: false, operator: 'equals', value: 'yes', action: 'show' }),
        [key]: val,
      },
    });
  };

  const handleAddOption = () => {
    const current = selectedField.options || [];
    handleChange('options', [...current, `Option ${current.length + 1}`]);
  };

  const handleOptionChange = (idx, newText) => {
    const updated = [...(selectedField.options || [])];
    updated[idx] = newText;
    handleChange('options', updated);
  };

  const handleRemoveOption = (idx) => {
    const updated = (selectedField.options || []).filter((_, i) => i !== idx);
    handleChange('options', updated);
  };

  // Other available fields for conditional logic
  const candidateParentFields = allFields.filter((f) => f.id !== selectedField.id);

  const hasOptions = ['dropdown', 'radio', 'multi_select'].includes(selectedField.type);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Field Settings</h3>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
            Type: {selectedField.type}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteField(selectedField.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete field"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1 text-xs">
        {/* Label */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Field Label</label>
          <input
            type="text"
            value={selectedField.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          />
        </div>

        {/* Field ID */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Field Identifier (Key)</label>
          <input
            type="text"
            value={selectedField.id || ''}
            onChange={(e) => handleChange('id', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 bg-slate-50"
          />
        </div>

        {/* Placeholder */}
        {selectedField.type !== 'consent' && selectedField.type !== 'yes_no' && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">Placeholder</label>
            <input
              type="text"
              value={selectedField.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            />
          </div>
        )}

        {/* Description / Helper Note */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Helper Description</label>
          <textarea
            rows={2}
            value={selectedField.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
          />
        </div>

        {/* Required Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <p className="font-semibold text-slate-800">Required Field</p>
            <p className="text-[11px] text-slate-500">Patient cannot submit without this</p>
          </div>
          <input
            type="checkbox"
            checked={Boolean(selectedField.required)}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
          />
        </div>

        {/* Options Editor (Dropdown, Radio, Multi Select) */}
        {hasOptions && (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800">Options</label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {(selectedField.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation limits */}
        {selectedField.type === 'number' && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Min Value</label>
              <input
                type="number"
                value={selectedField.validation?.min ?? ''}
                onChange={(e) => handleValidationChange('min', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Max Value</label>
              <input
                type="number"
                value={selectedField.validation?.max ?? ''}
                onChange={(e) => handleValidationChange('max', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          </div>
        )}

        {/* VISUAL CONDITIONAL RULE BUILDER */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <label className="font-semibold text-slate-800">Conditional Logic</label>
            </div>
            <input
              type="checkbox"
              checked={Boolean(selectedField.conditionalLogic?.enabled)}
              onChange={(e) => handleConditionalChange('enabled', e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
          </div>

          {selectedField.conditionalLogic?.enabled && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 mt-2">
              <p className="text-[11px] font-semibold text-amber-900">Visual Rule:</p>

              <div>
                <label className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">IF Question:</label>
                <select
                  value={selectedField.conditionalLogic.dependsOnFieldId || ''}
                  onChange={(e) => handleConditionalChange('dependsOnFieldId', e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-medium"
                >
                  <option value="">Select question</option>
                  {candidateParentFields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label} ({f.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Operator:</label>
                  <select
                    value={selectedField.conditionalLogic.operator || 'equals'}
                    onChange={(e) => handleConditionalChange('operator', e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                  >
                    <option value="equals">IS (Equals)</option>
                    <option value="not_equals">IS NOT</option>
                    <option value="contains">CONTAINS</option>
                    <option value="is_not_empty">IS NOT EMPTY</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Value:</label>
                  <input
                    type="text"
                    placeholder="e.g. yes"
                    value={selectedField.conditionalLogic.value || ''}
                    onChange={(e) => handleConditionalChange('value', e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">THEN:</label>
                <select
                  value={selectedField.conditionalLogic.action || 'show'}
                  onChange={(e) => handleConditionalChange('action', e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-semibold text-amber-900"
                >
                  <option value="show">SHOW THIS FIELD</option>
                  <option value="hide">HIDE THIS FIELD</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
