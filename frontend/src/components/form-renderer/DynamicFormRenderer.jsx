import React, { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, Info } from 'lucide-react';

export const evaluateCondition = (field, formData) => {
  if (!field.conditionalLogic || !field.conditionalLogic.enabled) {
    return true; // Visible by default
  }

  const { dependsOnFieldId, operator, value, action } = field.conditionalLogic;
  if (!dependsOnFieldId) return true;

  const currentVal = formData[dependsOnFieldId];
  let conditionMet = false;

  const strCurrent = currentVal !== undefined && currentVal !== null ? String(currentVal).toLowerCase().trim() : '';
  const strTarget = value !== undefined && value !== null ? String(value).toLowerCase().trim() : '';

  switch (operator) {
    case 'equals':
      conditionMet = strCurrent === strTarget;
      break;
    case 'not_equals':
      conditionMet = strCurrent !== strTarget;
      break;
    case 'contains':
      conditionMet = strCurrent.includes(strTarget);
      break;
    case 'is_not_empty':
      conditionMet = strCurrent.length > 0;
      break;
    default:
      conditionMet = strCurrent === strTarget;
  }

  return action === 'show' ? conditionMet : !conditionMet;
};

export const DynamicFormRenderer = ({
  formSchema,
  initialValues = {},
  onSubmit,
  submitLabel = 'Continue to Schedule',
  readOnly = false,
  onChange,
}) => {
  const [formData, setFormData] = useState(() => {
    const defaults = {};
    if (formSchema && Array.isArray(formSchema.fields)) {
      formSchema.fields.forEach((f) => {
        defaults[f.id] = initialValues[f.id] !== undefined ? initialValues[f.id] : (f.defaultValue || '');
      });
    }
    return { ...defaults, ...initialValues };
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleChange = (fieldId, val) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formSchema?.fields) return true;

    formSchema.fields.forEach((field) => {
      const isVisible = evaluateCondition(field, formData);
      if (!isVisible) return; // Skip validation for hidden conditional fields

      const val = formData[field.id];

      // Required check
      if (field.required) {
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
          return;
        }
        if (field.type === 'consent' && val !== true) {
          newErrors[field.id] = 'You must agree to the terms to proceed';
          return;
        }
      }

      // Min/max numbers
      if (field.type === 'number' && val !== '' && val !== undefined) {
        const num = Number(val);
        if (field.validation?.min !== undefined && num < field.validation.min) {
          newErrors[field.id] = `Minimum value is ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          newErrors[field.id] = `Maximum value is ${field.validation.max}`;
        }
      }

      // Length validations
      if (typeof val === 'string' && val.length > 0) {
        if (field.validation?.minLength && val.length < field.validation.minLength) {
          newErrors[field.id] = `Must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation?.maxLength && val.length > field.validation.maxLength) {
          newErrors[field.id] = `Cannot exceed ${field.validation.maxLength} characters`;
        }
      }

      // Email format
      if (field.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }

      // Phone format
      if (field.type === 'phone' && val) {
        if (val.replace(/\D/g, '').length < 8) {
          newErrors[field.id] = 'Please enter a valid phone number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (validate()) {
      if (onSubmit) onSubmit(formData);
    }
  };

  if (!formSchema || !Array.isArray(formSchema.fields)) {
    return (
      <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No form fields configured.
      </div>
    );
  }

  // Sort fields by order
  const sortedFields = [...formSchema.fields].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sortedFields.map((field) => {
        const isVisible = evaluateCondition(field, formData);
        if (!isVisible) return null;

        const error = errors[field.id];
        const val = formData[field.id] !== undefined ? formData[field.id] : '';

        return (
          <div key={field.id} className="transition-all duration-200">
            {/* Field Header */}
            {field.type !== 'consent' && (
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                {field.label}
                {field.required && <span className="text-rose-500 ml-1 font-bold">*</span>}
              </label>
            )}

            {/* Description note */}
            {field.description && field.type !== 'consent' && (
              <p className="text-xs text-slate-500 mb-2">{field.description}</p>
            )}

            {/* Field Renderers by Type */}
            {(() => {
              switch (field.type) {
                case 'short_text':
                case 'phone':
                case 'email':
                  return (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      disabled={readOnly}
                      value={val}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 bg-white ${
                        error
                          ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                          : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100 text-slate-900'
                      }`}
                    />
                  );

                case 'number':
                  return (
                    <input
                      type="number"
                      disabled={readOnly}
                      value={val}
                      min={field.validation?.min}
                      max={field.validation?.max}
                      placeholder={field.placeholder || '0'}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 text-slate-900"
                    />
                  );

                case 'long_text':
                case 'address':
                  return (
                    <textarea
                      rows={3}
                      disabled={readOnly}
                      value={val}
                      placeholder={field.placeholder || 'Type here...'}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 text-slate-900"
                    />
                  );

                case 'date':
                case 'date_of_birth':
                  return (
                    <input
                      type="date"
                      disabled={readOnly}
                      value={val}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 text-slate-900"
                    />
                  );

                case 'time':
                  return (
                    <input
                      type="time"
                      disabled={readOnly}
                      value={val}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 text-slate-900"
                    />
                  );

                case 'dropdown':
                  return (
                    <select
                      disabled={readOnly}
                      value={val}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white text-slate-900"
                    >
                      <option value="">{field.placeholder || 'Select an option'}</option>
                      {(field.options || []).map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  );

                case 'radio':
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {(field.options || []).map((opt, idx) => {
                        const isSelected = val === opt;
                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={readOnly}
                            onClick={() => handleChange(field.id, opt)}
                            className={`flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  );

                case 'yes_no':
                  return (
                    <div className="flex gap-3">
                      {['yes', 'no'].map((opt) => {
                        const isSelected = String(val).toLowerCase() === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={readOnly}
                            onClick={() => handleChange(field.id, opt)}
                            className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
                              isSelected
                                ? opt === 'yes'
                                  ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                                  : 'bg-slate-700 border-slate-800 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  );

                case 'checkbox':
                  return (
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={Boolean(val)}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                      />
                      <span className="text-sm text-slate-700 leading-snug">{field.placeholder || field.label}</span>
                    </label>
                  );

                case 'multi_select':
                  const selectedArr = Array.isArray(val) ? val : [];
                  return (
                    <div className="space-y-2">
                      {(field.options || []).map((opt, idx) => {
                        const isChecked = selectedArr.includes(opt);
                        return (
                          <label
                            key={idx}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-brand-50 border-brand-300 text-brand-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={readOnly}
                              checked={isChecked}
                              onChange={() => {
                                const next = isChecked
                                  ? selectedArr.filter((item) => item !== opt)
                                  : [...selectedArr, opt];
                                handleChange(field.id, next);
                              }}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  );

                case 'consent':
                  return (
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        error ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={readOnly}
                          checked={Boolean(val)}
                          onChange={(e) => handleChange(field.id, e.target.checked)}
                          className="w-4 h-4 mt-1 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                          {field.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{field.description}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  );

                case 'file_upload':
                case 'image_upload':
                  return (
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center hover:bg-slate-50 cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-medium text-slate-700">Click to upload file or photo</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                      {val && (
                        <p className="mt-2 text-xs font-semibold text-brand-600 bg-brand-50 py-1 px-2.5 rounded-lg inline-block">
                          File attached: {val.name || 'document_uploaded.pdf'}
                        </p>
                      )}
                    </div>
                  );

                case 'signature':
                  return (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="h-24 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                        {val ? `Signed: ${val}` : 'Draw or Type Signature Here'}
                      </div>
                      <input
                        type="text"
                        disabled={readOnly}
                        placeholder="Type full legal name as digital signature"
                        value={val}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  );

                default:
                  return (
                    <input
                      type="text"
                      disabled={readOnly}
                      value={val}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  );
              }
            })()}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-rose-600 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        );
      })}

      {!readOnly && onSubmit && (
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] transition-all shadow-md shadow-brand-500/20 text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <span>{submitLabel}</span>
          </button>
        </div>
      )}
    </form>
  );
};
