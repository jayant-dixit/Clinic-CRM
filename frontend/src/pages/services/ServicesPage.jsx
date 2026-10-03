import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Edit2, Trash2, Clock, IndianRupee, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const ServicesPage = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(300);
  const [color, setColor] = useState('#2563eb');
  const [status, setStatus] = useState('ACTIVE');
  const [assignedDoctorIds, setAssignedDoctorIds] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, dRes] = await Promise.all([api.getServices(), api.getDoctors()]);
      setServices(sRes.data || []);
      setDoctors(dRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setDuration(30);
    setPrice(300);
    setColor('#2563eb');
    setStatus('ACTIVE');
    setAssignedDoctorIds(doctors.map((d) => d._id));
    setModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        duration: Number(duration),
        price: Number(price),
        color,
        status,
        doctorIds: assignedDoctorIds,
      };

      if (editingServiceId) {
        await api.updateService(editingServiceId, payload);
        showToast('Treatment service updated successfully', 'success');
      } else {
        await api.createService(payload);
        showToast('Treatment service created', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save service', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete service?')) return;
    try {
      await api.deleteService(id);
      showToast('Service deleted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical Services & Treatments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Define consultation procedures, duration in minutes (directly determines slot intervals), and pricing.
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="primary" icon={Plus}>
          Add Service
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
          <Skeleton className="h-52" />
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No services added yet"
          description="Create your clinical services and treatments such as Consultations, Checkups, Therapy, or Procedures."
          actionLabel="Add Service"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service._id} className="p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: service.color || '#2563eb' }}
                    />
                    <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                  </div>
                  <Badge status={service.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 min-h-[32px]">
                  {service.description || 'No description added.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-brand-600" /> Duration
                    </span>
                    <p className="text-base font-extrabold text-slate-800 mt-1 font-mono">
                      {service.duration} mins
                    </p>
                    <p className="text-[10px] text-brand-600 font-semibold mt-0.5">Drives slot generator</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-emerald-600" /> Fee
                    </span>
                    <p className="text-base font-extrabold text-slate-800 mt-1 font-mono">
                      ₹{service.price}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Standard price</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => {
                    setEditingServiceId(service._id);
                    setName(service.name);
                    setDescription(service.description || '');
                    setDuration(service.duration);
                    setPrice(service.price);
                    setColor(service.color || '#2563eb');
                    setStatus(service.status || 'ACTIVE');
                    setModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingServiceId ? 'Edit Treatment Service' : 'Add Treatment Service'}
        description="Set consultation procedure duration and fee."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveService} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Service Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Root Canal Treatment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Details on what is included in this clinical appointment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                required
                min={5}
                step={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-brand-600 font-medium mt-1">Affects slot intervals!</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Card Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-600 uppercase">{color}</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
