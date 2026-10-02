import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Paperclip,
  Clock,
  Send,
  UserCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const PatientsPage = () => {
  const { showToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Patient Drawer/Modal
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Add Patient Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.getPatients(search ? `?search=${encodeURIComponent(search)}` : '');
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleOpenPatient = async (id) => {
    setSelectedPatientId(id);
    try {
      setLoadingDetails(true);
      const res = await api.getPatient(id);
      setPatientDetails(res.data);
    } catch (err) {
      showToast('Failed to load patient history', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      await api.addPatientNote(selectedPatientId, { text: newNoteText });
      showToast('Clinical note added', 'success');
      setNewNoteText('');
      // Refresh patient details
      const res = await api.getPatient(selectedPatientId);
      setPatientDetails(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to add note', 'error');
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await api.createPatient({
        name,
        phone,
        email,
        dateOfBirth,
        gender,
        address,
      });
      showToast('Patient registered successfully', 'success');
      setCreateModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      fetchPatients();
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete patient profiles, past dental visit logs, clinical remarks, and medical records.
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} variant="primary" icon={Plus}>
          Register Patient
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </Card>

      {/* Patients Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients registered"
          description="Register new patients manually or wait for incoming QR code bookings."
          actionLabel="Register Patient"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((p) => (
            <Card
              key={p._id}
              hover
              onClick={() => handleOpenPatient(p._id)}
              className="p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {p.gender} • {p.dateOfBirth ? `${p.dateOfBirth}` : 'Age not specified'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {p.totalVisits || 1} {p.totalVisits === 1 ? 'visit' : 'visits'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.phone}</span>
                  </div>
                  {p.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold">
                <span>View Full History</span>
                <span>→</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* PATIENT DETAIL & HISTORY MODAL */}
      <Modal
        isOpen={!!selectedPatientId}
        onClose={() => {
          setSelectedPatientId(null);
          setPatientDetails(null);
        }}
        title={patientDetails?.patient?.name || 'Patient Profile'}
        description={`Medical history, clinical notes and appointment timeline`}
        maxWidth="max-w-2xl"
      >
        {loadingDetails || !patientDetails ? (
          <div className="p-8 text-center text-slate-400">Loading history...</div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Bio Info Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Phone</span>
                <p className="font-semibold text-slate-900 mt-0.5">{patientDetails.patient.phone}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Email</span>
                <p className="font-semibold text-slate-900 mt-0.5 truncate">
                  {patientDetails.patient.email || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Gender</span>
                <p className="font-semibold text-slate-900 mt-0.5">{patientDetails.patient.gender}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total Visits</span>
                <p className="font-bold text-brand-600 mt-0.5">{patientDetails.patient.totalVisits || 1}</p>
              </div>
            </div>

            {/* Visit History Timeline */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-3">Appointment Visit History</h4>
              {(!patientDetails.appointments || patientDetails.appointments.length === 0) ? (
                <p className="text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-xl">
                  No appointments logged yet for this patient.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {patientDetails.appointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 p-1.5 rounded-lg text-center">
                          {apt.date}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {apt.serviceId?.name || 'Treatment'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            with {apt.doctorId?.name || 'Doctor'} at {apt.startTime}
                          </p>
                        </div>
                      </div>
                      <Badge status={apt.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clinical Notes Section */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">Doctor & Staff Clinical Notes</h4>

              {/* Add note input */}
              <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a clinical note, treatment observation, or follow-up note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
                />
                <Button type="submit" variant="primary" size="sm" icon={Send}>
                  Add Note
                </Button>
              </form>

              {/* Existing notes list */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {(patientDetails.patient.notes || []).length === 0 ? (
                  <p className="text-slate-400 italic">No notes recorded yet.</p>
                ) : (
                  patientDetails.patient.notes.map((note, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-600">{note.author}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-800 text-xs">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* REGISTER PATIENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Patient"
        description="Add a patient record to your clinic database."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="patient@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
            <textarea
              rows={2}
              placeholder="Street, City, Postal Code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setCreateModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
