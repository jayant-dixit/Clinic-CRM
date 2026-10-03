import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Phone,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  Upload,
  X,
  Camera,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const DEFAULT_DOCTOR_IMAGE =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';

export const DoctorsPage = () => {
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor Edit / Create Modal
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(DEFAULT_DOCTOR_IMAGE);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [assignedServices, setAssignedServices] = useState([]);
  const [status, setStatus] = useState('ACTIVE');

  // Availability Modal
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [activeDoctorForAvailability, setActiveDoctorForAvailability] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const fetchMeta = async () => {
    try {
      setLoading(true);
      const [dRes, sRes] = await Promise.all([api.getDoctors(), api.getServices()]);
      setDoctors(dRes.data || []);
      setServices(sRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleOpenCreateDoctor = () => {
    setEditingDoctorId(null);
    setName('');
    setSpecialization('');
    setPhone('');
    setEmail('');
    setBio('');
    setProfileImage(DEFAULT_DOCTOR_IMAGE);
    setIsCustomImage(false);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAssignedServices([]);
    setStatus('ACTIVE');
    setDoctorModalOpen(true);
  };

  const handleDeviceImageUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size exceeds 5MB. Please choose a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // High quality client-side canvas resize to max 600x600 for optimal fast load and crisp rendering
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setProfileImage(dataUrl);
        setIsCustomImage(true);
        showToast('Profile photo loaded from device!', 'success');
      };
      img.onerror = () => {
        setProfileImage(e.target.result);
        setIsCustomImage(true);
        showToast('Profile photo loaded from device', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    setProfileImage(DEFAULT_DOCTOR_IMAGE);
    setIsCustomImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Reset to default medical doctor photo', 'info');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDeviceImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        specialization,
        phone,
        email,
        bio,
        profileImage: isCustomImage && profileImage ? profileImage : DEFAULT_DOCTOR_IMAGE,
        assignedServices,
        status,
      };

      if (editingDoctorId) {
        await api.updateDoctor(editingDoctorId, payload);
        showToast('Doctor updated successfully', 'success');
      } else {
        await api.createDoctor(payload);
        showToast('Doctor profile created with default availability', 'success');
      }

      setDoctorModalOpen(false);
      fetchMeta();
    } catch (err) {
      showToast(err.message || 'Failed to save doctor', 'error');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete doctor? Existing past records will remain.')) return;
    try {
      await api.deleteDoctor(id);
      showToast('Doctor deleted', 'success');
      fetchMeta();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleOpenAvailability = async (doctor) => {
    setActiveDoctorForAvailability(doctor);
    try {
      const res = await api.getDoctorAvailability(doctor._id);
      if (res.data?.weeklySchedule) {
        setWeeklySchedule(res.data.weeklySchedule);
      } else {
        // Fallback default Mon-Sat
        setWeeklySchedule([
          { dayOfWeek: 1, dayName: 'Monday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [] },
          { dayOfWeek: 2, dayName: 'Tuesday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [] },
          { dayOfWeek: 3, dayName: 'Wednesday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [] },
          { dayOfWeek: 4, dayName: 'Thursday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [] },
          { dayOfWeek: 5, dayName: 'Friday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '13:00' }, { startTime: '16:00', endTime: '20:00' }], breaks: [] },
          { dayOfWeek: 6, dayName: 'Saturday', isWorkingDay: true, shifts: [{ startTime: '09:00', endTime: '14:00' }], breaks: [] },
          { dayOfWeek: 0, dayName: 'Sunday', isWorkingDay: false, shifts: [], breaks: [] },
        ]);
      }
      setAvailabilityModalOpen(true);
    } catch (err) {
      showToast('Failed to load availability', 'error');
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      await api.updateDoctorAvailability(activeDoctorForAvailability._id, {
        weeklySchedule,
      });
      showToast('Doctor schedule & shifts saved successfully', 'success');
      setAvailabilityModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save schedule', 'error');
    } finally {
      setSavingAvailability(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Doctors</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage medical and healthcare practitioners, specializations, assigned services, and weekly availability shifts.
          </p>
        </div>

        <Button onClick={handleOpenCreateDoctor} variant="primary" icon={Plus}>
          Add Doctor
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No doctors added"
          description="Add your first doctor or specialist to configure their appointment slots."
          actionLabel="Add Doctor"
          onAction={handleOpenCreateDoctor}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor._id} className="p-6 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <img
                    src={doctor.profileImage || DEFAULT_DOCTOR_IMAGE}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                    onError={(e) => {
                      e.target.src = DEFAULT_DOCTOR_IMAGE;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 truncate">{doctor.name}</h3>
                        <p className="text-xs font-semibold text-brand-600 mt-0.5">{doctor.specialization}</p>
                      </div>
                      <Badge status={doctor.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doctor.bio || 'Medical Practitioner / Specialist'}</p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {doctor.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {doctor.phone}
                        </span>
                      )}
                      {doctor.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {doctor.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Services */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Treatments & Services:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {doctor.assignedServices && doctor.assignedServices.length > 0 ? (
                      doctor.assignedServices.map((srv) => (
                        <span
                          key={srv._id || srv}
                          className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200"
                        >
                          {srv.name || 'Service'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">All clinic services</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  onClick={() => handleOpenAvailability(doctor)}
                  variant="outline"
                  size="sm"
                  icon={Clock}
                >
                  Configure Availability
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingDoctorId(doctor._id);
                      setName(doctor.name);
                      setSpecialization(doctor.specialization);
                      setPhone(doctor.phone || '');
                      setEmail(doctor.email || '');
                      setBio(doctor.bio || '');
                      const hasCustom = Boolean(
                        doctor.profileImage &&
                        doctor.profileImage !== DEFAULT_DOCTOR_IMAGE &&
                        !doctor.profileImage.includes('ui-avatars.com')
                      );
                      setProfileImage(doctor.profileImage || DEFAULT_DOCTOR_IMAGE);
                      setIsCustomImage(hasCustom);
                      setIsDragging(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      setAssignedServices(doctor.assignedServices?.map((s) => s._id || s) || []);
                      setStatus(doctor.status || 'ACTIVE');
                      setDoctorModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Edit profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DOCTOR */}
      <Modal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        title={editingDoctorId ? 'Edit Doctor Profile' : 'Add New Doctor'}
        description="Doctor details and assigned clinic services."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Doctor Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Specialization *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dermatologist / General Physician"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="doctor@smilecare.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Doctor Profile Picture: Upload from Device or Default Pic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-medium text-slate-700">Doctor Profile Picture</label>
              <span className="text-[11px] font-semibold">
                {isCustomImage ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded from Device
                  </span>
                ) : (
                  <span className="text-brand-600 font-bold flex items-center gap-1 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    <Sparkles className="w-3 h-3" /> Default Doctor Picture
                  </span>
                )}
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center gap-4 ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-200'
                  : 'border-dashed border-slate-200 bg-slate-50/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {/* Hidden Native File Input for Device Selection */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp, image/jpg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleDeviceImageUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {/* Avatar Live Preview */}
              <div className="relative flex-shrink-0">
                <img
                  src={profileImage || DEFAULT_DOCTOR_IMAGE}
                  alt="Doctor Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                  onError={(e) => {
                    e.target.src = DEFAULT_DOCTOR_IMAGE;
                  }}
                />
                <div
                  className="absolute -bottom-1 -right-1 bg-slate-900/80 text-white p-1 rounded-lg backdrop-blur-xs shadow-xs cursor-pointer hover:bg-slate-900 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload from Device"
                >
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Device Upload Controls & Helper Instructions */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-slate-100 text-xs shadow-2xs font-semibold"
                  >
                    {isCustomImage ? 'Change Photo from Device' : 'Upload from Device'}
                  </Button>

                  {isCustomImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={handleResetToDefault}
                      className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs"
                    >
                      Reset to Default Pic
                    </Button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500">
                  {isCustomImage
                    ? 'Custom photo loaded from your device. It will be saved when you click "Save Doctor".'
                    : 'Choose a photo from your computer/device (JPG, PNG, WEBP). If you don’t upload an image, the default doctor picture will be used automatically.'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Biography & Credentials</label>
            <textarea
              rows={2}
              placeholder="MBBS, MD / Specialist - 10+ years experience in clinical consultations and patient care."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Assigned Services */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Services</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {services.map((s) => {
                const checked = assignedServices.includes(s._id);
                return (
                  <label key={s._id} className="flex items-center gap-2 cursor-pointer p-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setAssignedServices((prev) =>
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

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setDoctorModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CONFIGURE AVAILABILITY SHIFTS */}
      <Modal
        isOpen={availabilityModalOpen}
        onClose={() => setAvailabilityModalOpen(false)}
        title="Weekly Availability & Shifts"
        description={`Set working hours and breaks for ${activeDoctorForAvailability?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs">
          {weeklySchedule.map((day, idx) => (
            <div
              key={day.dayOfWeek}
              className={`p-3.5 rounded-xl border transition-all ${
                day.isWorkingDay ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/60 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={day.isWorkingDay}
                    onChange={(e) => {
                      const updated = [...weeklySchedule];
                      updated[idx].isWorkingDay = e.target.checked;
                      setWeeklySchedule(updated);
                    }}
                    className="w-4 h-4 rounded text-brand-600 border-slate-300"
                  />
                  <span className="font-bold text-sm text-slate-800">{day.dayName}</span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    day.isWorkingDay ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {day.isWorkingDay ? 'WORKING' : 'OFF'}
                </span>
              </div>

              {day.isWorkingDay && (
                <div className="mt-3 pl-7 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-slate-500 font-medium text-[11px]">Shift:</span>
                    <input
                      type="time"
                      value={day.shifts[0]?.startTime || '09:00'}
                      onChange={(e) => {
                        const updated = [...weeklySchedule];
                        if (!updated[idx].shifts[0]) updated[idx].shifts[0] = { startTime: '09:00', endTime: '13:00' };
                        updated[idx].shifts[0].startTime = e.target.value;
                        setWeeklySchedule(updated);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={day.shifts[0]?.endTime || '13:00'}
                      onChange={(e) => {
                        const updated = [...weeklySchedule];
                        if (!updated[idx].shifts[0]) updated[idx].shifts[0] = { startTime: '09:00', endTime: '13:00' };
                        updated[idx].shifts[0].endTime = e.target.value;
                        setWeeklySchedule(updated);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />

                    {/* Shift 2 */}
                    <span className="text-slate-400 ml-2">| Afternoon:</span>
                    <input
                      type="time"
                      value={day.shifts[1]?.startTime || '16:00'}
                      onChange={(e) => {
                        const updated = [...weeklySchedule];
                        if (!updated[idx].shifts[1]) updated[idx].shifts[1] = { startTime: '16:00', endTime: '20:00' };
                        updated[idx].shifts[1].startTime = e.target.value;
                        setWeeklySchedule(updated);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={day.shifts[1]?.endTime || '20:00'}
                      onChange={(e) => {
                        const updated = [...weeklySchedule];
                        if (!updated[idx].shifts[1]) updated[idx].shifts[1] = { startTime: '16:00', endTime: '20:00' };
                        updated[idx].shifts[1].endTime = e.target.value;
                        setWeeklySchedule(updated);
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <Button onClick={() => setAvailabilityModalOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveAvailability}
            loading={savingAvailability}
            variant="primary"
            icon={Save}
          >
            Save Shifts
          </Button>
        </div>
      </Modal>
    </div>
  );
};
