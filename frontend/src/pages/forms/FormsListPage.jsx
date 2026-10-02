import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Copy,
  Trash2,
  Eye,
  Edit3,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { PreviewModal } from '../../components/form-builder/PreviewModal';
import { useToast } from '../../context/ToastContext';

export const FormsListPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewForm, setPreviewForm] = useState(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await api.getForms();
      setForms(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDuplicate = async (id) => {
    try {
      await api.duplicateForm(id);
      showToast('Form duplicated successfully', 'success');
      fetchForms();
    } catch (err) {
      showToast(err.message || 'Duplicate failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await api.deleteForm(id);
      showToast('Form deleted', 'success');
      fetchForms();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dynamic Patient Forms</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build custom registration and medical history questionnaires for your booking pages.
          </p>
        </div>

        <Button onClick={() => navigate('/forms/builder/new')} variant="primary" icon={Plus}>
          Create New Form
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No forms created yet"
          description="Create your first custom patient intake form with drag-and-drop fields and conditional logic."
          actionLabel="Create Your First Form"
          onAction={() => navigate('/forms/builder/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => (
            <Card key={form._id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{form.title}</h3>
                  {form.isDefault && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                  {form.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>{form.fields?.length || 0} fields configured</span>
                  <span className="font-mono text-[11px]">/{form.slug}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  onClick={() => setPreviewForm(form)}
                  variant="ghost"
                  size="sm"
                  icon={Eye}
                >
                  Preview
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(form._id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Duplicate form"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(form._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button
                    onClick={() => navigate(`/forms/builder/${form._id}`)}
                    variant="secondary"
                    size="sm"
                    icon={Edit3}
                  >
                    Edit Form
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Live Preview Modal */}
      {previewForm && (
        <PreviewModal
          isOpen={!!previewForm}
          onClose={() => setPreviewForm(null)}
          formSchema={previewForm}
        />
      )}
    </div>
  );
};
