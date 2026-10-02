import React from 'react';
import {
  Type,
  AlignLeft,
  Hash,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronDown,
  CircleDot,
  CheckSquare,
  ListChecks,
  ToggleLeft,
  Upload,
  Image,
  PenTool,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const FIELD_DEFINITIONS = [
  { type: 'short_text', label: 'Short Text', icon: Type, defaultLabel: 'Text Input', placeholder: 'Enter text...' },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft, defaultLabel: 'Notes / Remarks', placeholder: 'Enter details...' },
  { type: 'number', label: 'Number', icon: Hash, defaultLabel: 'Age / Number', placeholder: '0' },
  { type: 'phone', label: 'Phone', icon: Phone, defaultLabel: 'Phone Number', placeholder: 'e.g. 9876543210' },
  { type: 'email', label: 'Email', icon: Mail, defaultLabel: 'Email Address', placeholder: 'name@example.com' },
  { type: 'date', label: 'Date', icon: Calendar, defaultLabel: 'Preferred Date' },
  { type: 'time', label: 'Time', icon: Clock, defaultLabel: 'Time of Day' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, defaultLabel: 'Select Category', options: ['Option 1', 'Option 2', 'Option 3'] },
  { type: 'radio', label: 'Radio Button', icon: CircleDot, defaultLabel: 'Choose One', options: ['Option A', 'Option B'] },
  { type: 'checkbox', label: 'Single Checkbox', icon: CheckSquare, defaultLabel: 'Check this box' },
  { type: 'multi_select', label: 'Multi Select', icon: ListChecks, defaultLabel: 'Select Multiple', options: ['Item 1', 'Item 2', 'Item 3'] },
  { type: 'yes_no', label: 'Yes / No', icon: ToggleLeft, defaultLabel: 'Medical Questionnaire Item', defaultValue: 'no' },
  { type: 'file_upload', label: 'File Upload', icon: Upload, defaultLabel: 'Upload Lab Report / PDF' },
  { type: 'image_upload', label: 'Image Upload', icon: Image, defaultLabel: 'Upload X-Ray / Photo' },
  { type: 'signature', label: 'Signature', icon: PenTool, defaultLabel: 'Digital Signature' },
  { type: 'address', label: 'Address', icon: MapPin, defaultLabel: 'Home Address', placeholder: 'Street, City, Postal Code' },
  { type: 'date_of_birth', label: 'Date of Birth', icon: CalendarDays, defaultLabel: 'Date of Birth' },
  { type: 'consent', label: 'Consent Checkbox', icon: ShieldCheck, defaultLabel: 'Patient Terms & Consent', description: 'I confirm and agree to clinic diagnosis and treatment policies.' },
];

export const FieldLibrary = ({ onAddField }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 h-full flex flex-col shadow-xs">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Field Library</h3>
        <p className="text-xs text-slate-500 mt-0.5">Click or drag a field to add to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 space-y-1.5 pr-1">
        {FIELD_DEFINITIONS.map((def) => {
          const Icon = def.icon;
          return (
            <button
              key={def.type}
              type="button"
              onClick={() => onAddField(def)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-brand-50/60 hover:border-brand-200 hover:text-brand-700 transition-all text-left text-xs font-medium text-slate-700 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 group-hover:border-brand-200 group-hover:text-brand-600 flex items-center justify-center text-slate-500 shadow-2xs transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span>{def.label}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
