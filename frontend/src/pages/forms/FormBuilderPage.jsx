import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { FieldLibrary } from '../../components/form-builder/FieldLibrary';
import { FormCanvas } from '../../components/form-builder/FormCanvas';
import { FieldSettingsDrawer } from '../../components/form-builder/FieldSettingsDrawer';
import { PreviewModal } from '../../components/form-builder/PreviewModal';
import { useToast } from '../../context/ToastContext';

export const FormBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const isEditing = id && id !== 'new';

  const [formTitle, setFormTitle] = useState('New Patient Registration');
  const [formDescription, setFormDescription] = useState('Please fill in your details to book your appointment.');
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api
        .getForm(id)
        .then((res) => {
          if (res.data) {
            setFormTitle(res.data.title);
            setFormDescription(res.data.description || '');
            setFields(res.data.fields || []);
            setIsDefault(Boolean(res.data.isDefault));
            if (res.data.fields?.length > 0) {
              setSelectedFieldId(res.data.fields[0].id);
            }
          }
        })
        .catch((err) => {
          showToast(err.message || 'Failed to load form schema', 'error');
        })
        .finally(() => setLoading(false));
    } else {
      // Default initial fields for new form
      setFields([
        {
          id: 'full_name',
          type: 'short_text',
          label: 'Full Name',
          placeholder: 'e.g. Rahul Sharma',
          description: 'Legal patient name',
          required: true,
          order: 1,
        },
        {
          id: 'phone_number',
          type: 'phone',
          label: 'Phone Number',
          placeholder: 'e.g. 9876543210',
          description: 'For WhatsApp / SMS appointment reminders',
          required: true,
          order: 2,
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          placeholder: 'e.g. 30',
          required: true,
          order: 3,
        },
      ]);
      setSelectedFieldId('full_name');
    }
  }, [id, isEditing]);

  const handleAddField = (fieldDef) => {
    const randomKey = Math.random().toString(36).substring(2, 7);
    const newId = `${fieldDef.type}_${randomKey}`;

    const newField = {
      id: newId,
      type: fieldDef.type,
      label: fieldDef.defaultLabel || 'New Field',
      placeholder: fieldDef.placeholder || '',
      description: fieldDef.description || '',
      required: false,
      defaultValue: fieldDef.defaultValue || '',
      options: fieldDef.options ? [...fieldDef.options] : [],
      order: fields.length + 1,
      conditionalLogic: {
        enabled: false,
        dependsOnFieldId: '',
        operator: 'equals',
        value: 'yes',
        action: 'show',
      },
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
    showToast(`Added ${fieldDef.label} to form canvas`, 'info', 2000);
  };

  const handleUpdateField = (updated) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleDuplicateField = (field) => {
    const randomKey = Math.random().toString(36).substring(2, 7);
    const duplicate = {
      ...JSON.parse(JSON.stringify(field)),
      id: `${field.id}_copy_${randomKey}`,
      label: `${field.label} (Copy)`,
      order: fields.length + 1,
    };
    setFields((prev) => [...prev, duplicate]);
    setSelectedFieldId(duplicate.id);
    showToast('Field duplicated', 'success', 2000);
  };

  const handleDeleteField = (fieldId) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    showToast('Field removed from canvas', 'info', 2000);
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      showToast('Please provide a title for this form', 'error');
      return;
    }
    if (fields.length === 0) {
      showToast('Please add at least one field to the form canvas', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formTitle,
        description: formDescription,
        fields,
        isDefault,
      };

      if (isEditing) {
        await api.updateForm(id, payload);
        showToast('Form schema updated successfully', 'success');
      } else {
        const res = await api.createForm(payload);
        showToast('Form created successfully', 'success');
        navigate(`/forms/builder/${res.data._id}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to save form schema', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">Loading form builder canvas...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col space-y-3">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 bg-white p-3 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/forms')}
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
          >
            Back to Forms
          </Button>
          <div className="h-5 w-px bg-slate-200" />
          <span className="text-xs font-semibold text-slate-600">
            {isEditing ? 'Editing Form' : 'New Form Builder'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Default form checkbox */}
          <label className="flex items-center gap-2 mr-3 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <span>Set as Default Form</span>
          </label>

          {/* Preview Trigger */}
          <Button
            onClick={() => setPreviewOpen(true)}
            variant="secondary"
            size="sm"
            icon={Eye}
          >
            Live Preview
          </Button>

          {/* Save Button */}
          <Button
            onClick={handleSaveForm}
            loading={saving}
            variant="primary"
            size="sm"
            icon={Save}
          >
            Save Form Schema
          </Button>
        </div>
      </div>

      {/* 3-Column Layout: Left (Library), Center (Canvas), Right (Settings) */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* LEFT COLUMN: Field Library (w-64 ~ 3 cols) */}
        <div className="col-span-12 md:col-span-3 min-h-0">
          <FieldLibrary onAddField={handleAddField} />
        </div>

        {/* CENTER COLUMN: Form Canvas (6 cols) */}
        <div className="col-span-12 md:col-span-5 min-h-0">
          <FormCanvas
            formTitle={formTitle}
            formDescription={formDescription}
            onTitleChange={setFormTitle}
            onDescriptionChange={setFormDescription}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={(f) => setSelectedFieldId(f.id)}
            onReorderFields={setFields}
            onDuplicateField={handleDuplicateField}
            onDeleteField={handleDeleteField}
            onOpenLibrary={() => {}}
          />
        </div>

        {/* RIGHT COLUMN: Field Settings Drawer (4 cols) */}
        <div className="col-span-12 md:col-span-4 min-h-0">
          <FieldSettingsDrawer
            selectedField={selectedField}
            allFields={fields}
            onUpdateField={handleUpdateField}
            onClose={() => setSelectedFieldId(null)}
            onDeleteField={handleDeleteField}
          />
        </div>
      </div>

      {/* Full Live Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        formSchema={{
          title: formTitle,
          description: formDescription,
          fields,
        }}
      />
    </div>
  );
};
