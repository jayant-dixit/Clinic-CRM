import React, { useState, useEffect } from 'react';
import { Building2, Shield, Users, Save, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage = () => {
  const { clinic, setClinic, isRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('clinic'); // 'clinic' | 'booking' | 'staff'
  const [loading, setLoading] = useState(false);

  // Clinic profile form
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [address, setAddress] = useState({ street: '', city: '', state: '', postalCode: '', country: 'India' });

  // Booking settings
  const [minAdvanceBookingHours, setMinAdvanceBookingHours] = useState(2);
  const [maxAdvanceBookingDays, setMaxAdvanceBookingDays] = useState(30);
  const [defaultSlotDuration, setDefaultSlotDuration] = useState(30);
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [allowReschedule, setAllowReschedule] = useState(true);
  const [allowCancellation, setAllowCancellation] = useState(true);

  // Staff list & modal
  const [staffList, setStaffList] = useState([]);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('Password123');
  const [newStaffRole, setNewStaffRole] = useState('STAFF');

  useEffect(() => {
    if (clinic) {
      setClinicName(clinic.name || '');
      setPhone(clinic.phone || '');
      setEmail(clinic.email || '');
      setDescription(clinic.description || '');
      setWebsite(clinic.website || '');
      setTimezone(clinic.timezone || 'Asia/Kolkata');
      if (clinic.address) setAddress(clinic.address);

      if (clinic.settings) {
        setMinAdvanceBookingHours(clinic.settings.minAdvanceBookingHours || 2);
        setMaxAdvanceBookingDays(clinic.settings.maxAdvanceBookingDays || 30);
        setDefaultSlotDuration(clinic.settings.defaultSlotDuration || 30);
        setCancellationPolicy(clinic.settings.cancellationPolicy || '');
        setAllowReschedule(clinic.settings.allowReschedule !== false);
        setAllowCancellation(clinic.settings.allowCancellation !== false);
      }
    }

    api.getClinicStaff().then((res) => setStaffList(res.data || [])).catch(console.error);
  }, [clinic]);

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.updateClinicProfile({
        name: clinicName,
        phone,
        email,
        description,
        website,
        timezone,
        address,
        settings: {
          minAdvanceBookingHours: Number(minAdvanceBookingHours),
          maxAdvanceBookingDays: Number(maxAdvanceBookingDays),
          defaultSlotDuration: Number(defaultSlotDuration),
          cancellationPolicy,
          allowReschedule,
          allowCancellation,
        },
      });

      if (res.data) setClinic(res.data);
      showToast('Clinic profile & settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await api.addClinicStaff({
        name: newStaffName,
        email: newStaffEmail,
        password: newStaffPassword,
        role: newStaffRole,
      });
      showToast('Staff member invited successfully', 'success');
      setStaffModalOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      const res = await api.getClinicStaff();
      setStaffList(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to add staff', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure clinic branding, location, advance scheduling rules, and staff team permissions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('clinic')}
          className={`pb-3 px-1 transition-all border-b-2 ${
            activeTab === 'clinic'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          General & Location
        </button>
        <button
          onClick={() => setActiveTab('booking')}
          className={`pb-3 px-1 transition-all border-b-2 ${
            activeTab === 'booking'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Scheduling Policies
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 px-1 transition-all border-b-2 ${
            activeTab === 'staff'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Staff & Roles ({staffList.length})
        </button>
      </div>

      {activeTab === 'clinic' && (
        <form onSubmit={handleSaveClinic} className="space-y-5">
          <Card className="p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Clinic Identity</h3>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Clinic Name *</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Clinic Tagline / Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://smilecaredental.in"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 pt-3 border-t border-slate-100">
              Address & Location
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" loading={loading} variant="primary" icon={Save}>
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      )}

      {activeTab === 'booking' && (
        <form onSubmit={handleSaveClinic} className="space-y-5">
          <Card className="p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Online Scheduling Policies</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Minimum Advance Notice (Hours)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minAdvanceBookingHours}
                  onChange={(e) => setMinAdvanceBookingHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Prevents patients booking slots too close to current time.</p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Maximum Advance Booking Window (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxAdvanceBookingDays}
                  onChange={(e) => setMaxAdvanceBookingDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">How far into the future patients can schedule.</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowReschedule}
                  onChange={(e) => setAllowReschedule(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-slate-300"
                />
                <div>
                  <span className="font-semibold text-slate-800">Allow Patient Rescheduling</span>
                  <p className="text-[11px] text-slate-400">Patients can change their appointment date/time online</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCancellation}
                  onChange={(e) => setAllowCancellation(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 border-slate-300"
                />
                <div>
                  <span className="font-semibold text-slate-800">Allow Patient Cancellation</span>
                  <p className="text-[11px] text-slate-400">Patients can cancel appointments from confirmation page</p>
                </div>
              </label>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Cancellation Policy Notice</label>
              <textarea
                rows={2}
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                placeholder="e.g. Please cancel at least 4 hours before your slot."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" loading={loading} variant="primary" icon={Save}>
                Save Policies
              </Button>
            </div>
          </Card>
        </form>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Clinic Team & Staff Roles</h3>
            <Button onClick={() => setStaffModalOpen(true)} variant="primary" size="sm" icon={Plus}>
              Add Staff Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffList.map((member) => (
              <Card key={member._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                    <p className="text-[11px] text-slate-400">{member.email}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                      {member.role}
                    </span>
                  </div>
                </div>

                <Badge status={member.status || 'ACTIVE'} size="sm" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Add Staff Member"
        description="Invite a receptionist or clinic admin to your workspace."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pooja Verma"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="pooja@smilecare.com"
              value={newStaffEmail}
              onChange={(e) => setNewStaffEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Role *</label>
            <select
              value={newStaffRole}
              onChange={(e) => setNewStaffRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              <option value="STAFF">STAFF (Receptionist - manage queue & appointments)</option>
              <option value="CLINIC_ADMIN">CLINIC_ADMIN (Full clinic control)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Initial Password</label>
            <input
              type="password"
              required
              value={newStaffPassword}
              onChange={(e) => setNewStaffPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setStaffModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
