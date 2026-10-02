import React, { useState } from 'react';
import { Monitor, Smartphone, X, Sparkles } from 'lucide-react';
import { DynamicFormRenderer } from '../form-renderer/DynamicFormRenderer';

export const PreviewModal = ({ isOpen, onClose, formSchema }) => {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs" />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-slate-100 text-left shadow-2xl transition-all w-full max-w-4xl border border-slate-300 flex flex-col max-h-[92vh]">
          {/* Header & Device Switcher */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-sm font-bold text-slate-800">Form Preview</span>
              <span className="text-xs text-slate-400">({formSchema?.title})</span>
            </div>

            {/* Desktop / Mobile Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  device === 'desktop' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  device === 'mobile' ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-100">
            {device === 'mobile' ? (
              /* Mobile Mockup Frame */
              <div className="w-[375px] max-w-full bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-800 overflow-hidden flex flex-col my-4">
                {/* Speaker notch */}
                <div className="h-6 bg-slate-800 flex items-center justify-center">
                  <div className="w-16 h-3 bg-slate-900 rounded-full" />
                </div>
                {/* Content */}
                <div className="p-5 overflow-y-auto max-h-[640px]">
                  <div className="mb-4 pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-full">
                      Patient Form
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{formSchema?.title}</h3>
                    {formSchema?.description && (
                      <p className="text-xs text-slate-500 mt-1">{formSchema.description}</p>
                    )}
                  </div>

                  <DynamicFormRenderer
                    formSchema={formSchema}
                    onSubmit={(data) => alert('Form preview validated successfully! Data: ' + JSON.stringify(data, null, 2))}
                    submitLabel="Test Submit Form"
                  />
                </div>
              </div>
            ) : (
              /* Desktop Mockup Frame */
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8 my-2">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-2.5 py-1 rounded-full">
                    Patient Registration
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{formSchema?.title}</h3>
                  {formSchema?.description && (
                    <p className="text-sm text-slate-500 mt-1">{formSchema.description}</p>
                  )}
                </div>

                <DynamicFormRenderer
                  formSchema={formSchema}
                  onSubmit={(data) => alert('Form preview validated successfully! Data: ' + JSON.stringify(data, null, 2))}
                  submitLabel="Test Submit Form"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
