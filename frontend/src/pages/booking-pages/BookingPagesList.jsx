import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  QrCode,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const BookingPagesList = () => {
  const { clinic } = useAuth();
  const { showToast } = useToast();
  const [pages, setPages] = useState([]);
  const [forms, setForms] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Modal
  const [qrModalData, setQrModalData] = useState(null);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.getBookingPages();
      setPages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [fRes, sRes, dRes] = await Promise.all([
        api.getForms(),
        api.getServices(),
        api.getDoctors(),
      ]);
      setForms(fRes.data || []);
      setServices(sRes.data || []);
      setDoctors(dRes.data || []);
      if (fRes.data?.length > 0) {
        setSelectedFormId(fRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPages();
    fetchMeta();
  }, []);

  const handleOpenCreate = () => {
    setEditingPageId(null);
    setTitle('');
    setDescription('');
    if (forms.length > 0) setSelectedFormId(forms[0]._id);
    setSelectedServices([]);
    setSelectedDoctors([]);
    setModalOpen(true);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedFormId) {
      showToast('Title and form selection are required', 'error');
      return;
    }

    try {
      const payload = {
        title,
        description,
        formId: selectedFormId,
        allowedServices: selectedServices,
        allowedDoctors: selectedDoctors,
      };

      if (editingPageId) {
        await api.updateBookingPage(editingPageId, payload);
        showToast('Booking page updated', 'success');
      } else {
        await api.createBookingPage(payload);
        showToast('Booking page created successfully', 'success');
      }

      setModalOpen(false);
      fetchPages();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking page?')) return;
    try {
      await api.deleteBookingPage(id);
      showToast('Booking page deleted', 'success');
      fetchPages();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    showToast('Booking link copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Pages & URLs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create specialized booking links for general appointments, specific treatments or promotional campaigns.
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="primary" icon={Plus}>
          New Booking Page
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No booking pages created yet"
          description="Create a booking page to get a unique patient link and QR code."
          actionLabel="Create Booking Page"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pages.map((page) => (
            <Card key={page._id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full uppercase">
                      Active Booking URL
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{page.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPageId(page._id);
                        setTitle(page.title);
                        setDescription(page.description || '');
                        setSelectedFormId(page.formId?._id || page.formId);
                        setSelectedServices(page.allowedServices?.map((s) => s._id) || []);
                        setSelectedDoctors(page.allowedDoctors?.map((d) => d._id) || []);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {page.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{page.description}</p>
                )}

                {/* Form attached & details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-brand-600" />
                    <span>
                      Intake Form: <strong>{page.formId?.title || 'Custom Dynamic Form'}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-500 truncate">
                      {page.fullUrl}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  onClick={() =>
                    setQrModalData({
                      title: page.title,
                      url: page.fullUrl,
                    })
                  }
                  variant="secondary"
                  size="sm"
                  icon={QrCode}
                >
                  View QR Code
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyUrl(page.fullUrl)}
                    variant="outline"
                    size="sm"
                    icon={Copy}
                  >
                    Copy Link
                  </Button>

                  <a
                    href={page.fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                    title="Open public page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT BOOKING PAGE MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPageId ? 'Edit Booking Page' : 'New Booking Page'}
        description="Configure form and doctor availability for this booking URL."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSavePage} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Page Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Book Your Clinical Appointment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description / Subtitle</label>
            <textarea
              rows={2}
              placeholder="e.g. Schedule your in-clinic consultation online in 60 seconds."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Patient Intake Form *</label>
            <select
              required
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              {forms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.title} ({f.fields?.length || 0} fields)
                </option>
              ))}
            </select>
          </div>

          {/* Service filter */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Allowed Services (Empty = All Services)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {services.map((s) => {
                const checked = selectedServices.includes(s._id);
                return (
                  <label key={s._id} className="flex items-center gap-2 text-xs p-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedServices((prev) =>
                          checked ? prev.filter((id) => id !== s._id) : [...prev, s._id]
                        );
                      }}
                      className="w-3.5 h-3.5 rounded text-brand-600 border-slate-300"
                    />
                    <span className="truncate">{s.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Doctor filter */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Allowed Doctors (Empty = All Doctors)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {doctors.map((d) => {
                const checked = selectedDoctors.includes(d._id);
                return (
                  <label key={d._id} className="flex items-center gap-2 text-xs p-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedDoctors((prev) =>
                          checked ? prev.filter((id) => id !== d._id) : [...prev, d._id]
                        );
                      }}
                      className="w-3.5 h-3.5 rounded text-brand-600 border-slate-300"
                    />
                    <span className="truncate">{d.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Booking Page
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR CODE MODAL */}
      {qrModalData && (
        <QRCodeModal
          isOpen={!!qrModalData}
          onClose={() => setQrModalData(null)}
          title={qrModalData.title}
          bookingUrl={qrModalData.url}
          clinicName={clinic?.name || 'CareFlow Clinic'}
        />
      )}
    </div>
  );
};
