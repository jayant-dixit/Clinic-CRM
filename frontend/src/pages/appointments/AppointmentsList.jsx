import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  UserX,
  FileText,
  Calendar,
  ChevronRight,
  UserPlus,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  LayoutGrid,
  LayoutList,
  RotateCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { StatusDropdown } from '../../components/appointments/StatusDropdown';
import { AppointmentTile } from '../../components/appointments/AppointmentTile';
import { PatientAppointmentDialog } from '../../components/appointments/PatientAppointmentDialog';

// Helper to get local date string YYYY-MM-DD
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to match logged-in doctor from auth user
export const findLoggedInDoctor = (currentUser, doctorList) => {
  if (!doctorList || doctorList.length === 0) return null;
  if (!currentUser) return doctorList[0];

  // 1. Direct email match
  if (currentUser.email) {
    const emailMatch = doctorList.find(
      (d) => d.email && d.email.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (emailMatch) return emailMatch;
  }

  // 2. Direct ID or doctorId match
  const idMatch = doctorList.find(
    (d) => d._id === currentUser.doctorId || d.userId === currentUser._id || d._id === currentUser._id
  );
  if (idMatch) return idMatch;

  // 3. Name match: normalized match
  const clean = (str) =>
    str
      ? str
          .toLowerCase()
          .replace(/^(dr\.?|doctor)\s+/i, '')
          .replace(/\s*\(.*?\)/g, '')
          .trim()
      : '';

  const userNameClean = clean(currentUser.name);
  if (userNameClean) {
    const nameMatch = doctorList.find((d) => {
      const docNameClean = clean(d.name);
      return (
        docNameClean &&
        (userNameClean.includes(docNameClean) || docNameClean.includes(userNameClean))
      );
    });
    if (nameMatch) return nameMatch;
  }

  // Fallback: Default to first doctor
  return doctorList[0];
};

export const AppointmentsList = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { user } = useAuth();

  const todayStr = getTodayDateString();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const prevAppointmentsRef = useRef([]);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedDate, setSelectedDate] = useState(todayStr); // Always default to today's date
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('appointments_view_mode') || 'list'
  );
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  // Modals state
  const [newModalOpen, setNewModalOpen] = useState(searchParams.get('new') === 'true');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [formDataModalOpen, setFormDataModalOpen] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientDialogAppointment, setPatientDialogAppointment] = useState(null);

  // New Walk-in Appointment Form State
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [newPatientData, setNewPatientData] = useState({ name: '', phone: '', email: '', gender: 'Male' });
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [manualDoctorId, setManualDoctorId] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualTime, setManualTime] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [patientsList, setPatientsList] = useState([]);

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false);

  // Follow-up Form State
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpDoctorId, setFollowUpDoctorId] = useState('');
  const [followUpServiceId, setFollowUpServiceId] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpSlots, setFollowUpSlots] = useState([]);
  const [followUpLoadingSlots, setFollowUpLoadingSlots] = useState(false);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('appointments_view_mode', mode);
  };

  const fetchAppointments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsSyncing(true);

      let queryStr = '?';
      if (selectedStatus !== 'all') queryStr += `status=${selectedStatus}&`;
      if (selectedDoctorId !== 'all') queryStr += `doctorId=${selectedDoctorId}&`;
      if (selectedDate) queryStr += `date=${selectedDate}&`;
      if (searchQuery) queryStr += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await api.getAppointments(queryStr);
      const loaded = res.data || [];

      // If in background silent mode, check if any new appointments arrived
      if (silent && prevAppointmentsRef.current.length > 0) {
        const incoming = loaded.filter(
          (item) => !prevAppointmentsRef.current.includes(item._id)
        );
        if (incoming.length > 0) {
          incoming.forEach((newApt) => {
            const pName = newApt.patientDetails?.name || 'Patient';
            const src = newApt.bookingSource === 'QR' ? 'QR Code' : newApt.bookingSource || 'Online';
            showToast(
              `🔔 New booking via ${src} for ${pName} (${newApt.startTime || ''})`,
              'info'
            );
          });
        }
      }

      prevAppointmentsRef.current = loaded.map((a) => a._id);
      setAppointments(loaded);
    } catch (err) {
      if (!silent) console.error('Error fetching appointments:', err);
    } finally {
      if (!silent) setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [docsRes, srvsRes, ptsRes] = await Promise.all([
        api.getDoctors(),
        api.getServices(),
        api.getPatients('?limit=100'),
      ]);
      const loadedDocs = docsRes.data || [];
      setDoctors(loadedDocs);
      setServices(srvsRes.data || []);
      setPatientsList(ptsRes.data || []);

      // Always select login doctor as default in filter
      const matchedDoc = findLoggedInDoctor(user, loadedDocs);
      if (matchedDoc) {
        setSelectedDoctorId(matchedDoc._id);
        setManualDoctorId(matchedDoc._id);
      } else if (loadedDocs.length > 0) {
        setSelectedDoctorId(loadedDocs[0]._id);
        setManualDoctorId(loadedDocs[0]._id);
      }

      if (srvsRes.data?.length > 0) {
        setManualServiceId(srvsRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  // Update selected doctor if user context loads later
  useEffect(() => {
    if (doctors.length > 0 && (selectedDoctorId === 'all' || !selectedDoctorId)) {
      const matchedDoc = findLoggedInDoctor(user, doctors);
      if (matchedDoc) {
        setSelectedDoctorId(matchedDoc._id);
        if (!manualDoctorId) setManualDoctorId(matchedDoc._id);
      }
    }
  }, [user, doctors]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, selectedDoctorId, selectedDate, searchQuery]);

  // Real-time live sync: BroadcastChannel (cross-tab) & Background polling every 5s (cross-device/QR)
  useEffect(() => {
    // 1. Cross-tab live broadcast
    let channel = null;
    try {
      channel = new BroadcastChannel('careflow_live_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_APPOINTMENT') {
          fetchAppointments(true);
          const apt = event.data.appointment;
          const pName = apt?.patientDetails?.name || 'Patient';
          showToast(
            `🔔 New ${event.data.bookingSource || 'QR'} appointment from ${pName}!`,
            'info'
          );
        }
      };
    } catch (_) {}

    // 2. Background polling every 5 seconds (when tab is visible)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchAppointments(true);
      }
    }, 5000);

    // 3. Tab focus auto-sync
    const onFocus = () => {
      fetchAppointments(true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      if (channel) channel.close();
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [selectedStatus, selectedDoctorId, selectedDate, searchQuery]);

  // Load available slots when creating manual appointment
  useEffect(() => {
    if (manualDoctorId && manualServiceId && manualDate) {
      setLoadingSlots(true);
      api
        .getAvailableSlotsPreview(manualDoctorId, manualServiceId, manualDate)
        .then((res) => {
          setAvailableSlots(res.data || []);
          if (res.data?.length > 0) {
            setManualTime(res.data[0].startTime);
          } else {
            setManualTime('');
          }
        })
        .catch(console.error)
        .finally(() => setLoadingSlots(false));
    }
  }, [manualDoctorId, manualServiceId, manualDate]);

  // Load slots when rescheduling
  useEffect(() => {
    if (rescheduleDoctorId && selectedAppointment?.serviceId?._id && rescheduleDate) {
      setRescheduleLoadingSlots(true);
      api
        .getAvailableSlotsPreview(rescheduleDoctorId, selectedAppointment.serviceId._id, rescheduleDate)
        .then((res) => {
          setRescheduleSlots(res.data || []);
          if (res.data?.length > 0) setRescheduleTime(res.data[0].startTime);
        })
        .catch(console.error)
        .finally(() => setRescheduleLoadingSlots(false));
    }
  }, [rescheduleDoctorId, rescheduleDate, selectedAppointment]);

  // Load slots for follow-up
  useEffect(() => {
    if (followUpDoctorId && followUpServiceId && followUpDate) {
      setFollowUpLoadingSlots(true);
      api
        .getAvailableSlotsPreview(followUpDoctorId, followUpServiceId, followUpDate)
        .then((res) => {
          setFollowUpSlots(res.data || []);
          if (res.data?.length > 0) setFollowUpTime(res.data[0].startTime);
          else setFollowUpTime('');
        })
        .catch(console.error)
        .finally(() => setFollowUpLoadingSlots(false));
    }
  }, [followUpDoctorId, followUpServiceId, followUpDate]);

  const handleStatusChange = async (aptId, newStatus) => {
    // 1. Optimistic instant in-place update (prevents whole-list re-rendering and skeleton flashing!)
    setAppointments((prev) =>
      prev.map((apt) => (apt._id === aptId ? { ...apt, status: newStatus } : apt))
    );

    try {
      await api.updateAppointmentStatus(aptId, { status: newStatus });
      showToast(`Appointment status changed to ${newStatus}`, 'success');
      // Do not refetch full appointments list with loading screen to prevent re-render flicker
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
      // Revert if error occurs by silently fetching
      fetchAppointments(true);
    }
  };

  const handleOpenPatientDialog = (apt) => {
    setPatientDialogAppointment(apt);
    setPatientDialogOpen(true);
  };

  const handleAppointmentUpdatedFromDialog = (updatedApt) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === updatedApt._id ? { ...a, ...updatedApt } : a))
    );
    setPatientDialogAppointment((prev) => (prev ? { ...prev, ...updatedApt } : updatedApt));
  };

  const handleFollowUpCreatedFromDialog = () => {
    fetchAppointments(true);
  };

  const handleOpenFollowUp = (apt) => {
    setSelectedAppointment(apt);
    setFollowUpDoctorId(apt.doctorId?._id || doctors[0]?._id);
    setFollowUpServiceId(apt.serviceId?._id || services[0]?._id);
    setFollowUpNotes('');

    // Default to +7 days from appointment date (or today)
    const base = apt.date ? new Date(apt.date) : new Date();
    const now = new Date();
    const start = base < now ? now : base;
    const target = new Date(start.getTime() + 7 * 86400000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setFollowUpDate(`${y}-${m}-${d}`);
    setFollowUpModalOpen(true);
  };

  const handleApplyFollowUpDays = (days) => {
    const base = selectedAppointment?.date ? new Date(selectedAppointment.date) : new Date();
    const now = new Date();
    const start = base < now ? now : base;
    const target = new Date(start.getTime() + days * 86400000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    setFollowUpDate(`${y}-${m}-${d}`);
  };

  const isFollowUpPresetActive = (days) => {
    if (!followUpDate) return false;
    const base = selectedAppointment?.date ? new Date(selectedAppointment.date) : new Date();
    const now = new Date();
    const start = base < now ? now : base;
    const target = new Date(start.getTime() + days * 86400000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return followUpDate === `${y}-${m}-${d}`;
  };

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    if (!manualTime) {
      showToast('Please select a valid time slot', 'error');
      return;
    }

    try {
      await api.createAppointment({
        isNewPatient,
        patientId: isNewPatient ? undefined : selectedPatientId,
        newPatientData: isNewPatient ? newPatientData : undefined,
        doctorId: manualDoctorId,
        serviceId: manualServiceId,
        date: manualDate,
        startTime: manualTime,
        bookingSource: 'RECEPTION',
        internalNotes: manualNotes,
      });

      showToast('Walk-in appointment booked successfully', 'success');
      setNewModalOpen(false);
      fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to create appointment', 'error');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTime) {
      showToast('Please select a time slot', 'error');
      return;
    }

    try {
      await api.rescheduleAppointment(selectedAppointment._id, {
        date: rescheduleDate,
        startTime: rescheduleTime,
        doctorId: rescheduleDoctorId,
      });

      showToast('Appointment rescheduled and patient notified!', 'success');
      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Rescheduling failed', 'error');
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpTime) {
      showToast('Please choose a time slot for the follow-up', 'error');
      return;
    }

    try {
      await api.scheduleFollowUp(selectedAppointment._id, {
        recommendedDate: followUpDate,
        startTime: followUpTime,
        doctorId: followUpDoctorId,
        serviceId: followUpServiceId,
        notes: followUpNotes,
      });

      showToast('Follow-up scheduled and notification sent to patient!', 'success');
      setFollowUpModalOpen(false);
      fetchAppointments();
    } catch (err) {
      showToast(err.message || 'Follow-up booking failed', 'error');
    }
  };

  const statusesList = [
    { key: 'all', label: 'All' },
    { key: 'BOOKED', label: 'Booked' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'WAITING', label: 'Waiting' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'NO_SHOW', label: 'No Show' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming bookings, walk-ins, consultation statuses, and follow-ups.
          </p>
        </div>

        <Button onClick={() => setNewModalOpen(true)} variant="primary" icon={Plus}>
          New Appointment (Reception)
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, phone, or appointment #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            />
          </div>

          {/* Doctor Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => {
                const isUserDoc = user && findLoggedInDoctor(user, [d])?._id === d._id;
                return (
                  <option key={d._id} value={d._id}>
                    {d.name} {isUserDoc ? ' (You)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Filter */}
          <div className="w-full md:w-auto flex items-center gap-1.5 flex-wrap">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                title="Filter by today's date"
              >
                Today
              </button>
            )}

            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-xs text-slate-500 hover:text-rose-600 hover:underline px-2 whitespace-nowrap"
                title="Show all dates"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100 text-xs">
          {statusesList.map((st) => (
            <button
              key={st.key}
              onClick={() => setSelectedStatus(st.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedStatus === st.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </Card>

      {/* View Mode Toggle and Appointment Count Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <span>Showing</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {appointments.length}
          </span>
          <span>appointments</span>
          {selectedDate === todayStr && (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Today's Schedule
            </span>
          )}
          {selectedDoctorId !== 'all' && doctors.find((d) => d._id === selectedDoctorId) && (
            <span className="text-slate-400">
              • for <strong className="text-slate-700">{doctors.find((d) => d._id === selectedDoctorId)?.name}</strong>
            </span>
          )}
        </div>

        {/* Live Sync Status & View Mode Toggle Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Live Sync</span>
            <button
              type="button"
              onClick={() => fetchAppointments(true)}
              title="Sync appointments now"
              className="ml-0.5 text-emerald-600 hover:text-emerald-950 transition-all p-0.5 rounded hover:bg-emerald-100"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Switch to List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Switch to Card / Tile View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List / Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments found"
          description={
            selectedDate
              ? `There are no appointments scheduled for this doctor on ${selectedDate}.`
              : 'There are no appointments matching your current filters.'
          }
          actionLabel={selectedDate ? 'View All Dates' : '+ New Walk-in Appointment'}
          onAction={() => {
            if (selectedDate) setSelectedDate('');
            else setNewModalOpen(true);
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Card / Tile View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {appointments.map((apt) => (
            <AppointmentTile
              key={apt._id}
              appointment={apt}
              onStatusChange={handleStatusChange}
              onOpenPatientDialog={handleOpenPatientDialog}
              onReschedule={(targetApt) => {
                setSelectedAppointment(targetApt);
                setRescheduleDate(targetApt.date);
                setRescheduleDoctorId(targetApt.doctorId?._id || doctors[0]?._id);
                setRescheduleModalOpen(true);
              }}
              onFollowUp={handleOpenFollowUp}
              onViewFormData={(targetApt) => {
                setSelectedAppointment(targetApt);
                setFormDataModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt._id} hover className="p-4 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Info - Clickable to open patient dialog */}
                <div
                  onClick={() => handleOpenPatientDialog(apt)}
                  className="flex items-start gap-4 cursor-pointer group/patient flex-1"
                  title="Click to view complete patient chart, visit history & clinical actions"
                >
                  {/* Time badge */}
                  <div className="w-20 text-center py-2 px-2 bg-slate-100 group-hover/patient:bg-brand-50 group-hover/patient:border-brand-200 border border-transparent rounded-xl flex flex-col justify-center flex-shrink-0 transition-all">
                    <span className="font-mono text-sm font-bold text-slate-900 group-hover/patient:text-brand-700">{apt.startTime}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{apt.date}</span>
                  </div>

                  {/* Patient & Service details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover/patient:text-brand-600 transition-colors flex items-center gap-1.5">
                        <span>{apt.patientDetails?.name || 'Patient'}</span>
                        <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.2 rounded-full border border-brand-200 opacity-80 group-hover/patient:opacity-100">
                          View Chart ↗
                        </span>
                      </h4>
                      <Badge status={apt.status} size="sm" />
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {apt.appointmentNumber}
                      </span>
                      {apt.queueToken && (
                        <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          Token: {apt.queueToken}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${apt.patientDetails?.phone}`;
                        }}
                        className="flex items-center gap-1 hover:text-brand-600"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        {apt.patientDetails?.phone}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-700">
                        {apt.serviceId?.name || 'Service'} ({apt.duration}m)
                      </span>
                      <span>•</span>
                      <span>with {apt.doctorId?.name || 'Doctor'}</span>
                      <span>•</span>
                      <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                        Source: {apt.bookingSource}
                      </span>
                    </div>

                    {/* Treatment summary preview if recorded */}
                    {apt.treatmentProvided && (
                      <p className="text-xs text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200/60 w-fit line-clamp-1">
                        <strong>Treatment:</strong> {apt.treatmentProvided}
                      </p>
                    )}

                    {apt.internalNotes && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/60 p-1.5 rounded-lg border border-amber-100 w-fit">
                        Note: {apt.internalNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 flex-wrap lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  {/* Status Dropdown with Color-Coded Blur Background */}
                  <StatusDropdown
                    status={apt.status}
                    onChange={(newStatus) => handleStatusChange(apt._id, newStatus)}
                  />

                  {/* Patient Chart & Clinical Actions Button */}
                  <Button
                    onClick={() => handleOpenPatientDialog(apt)}
                    variant="outline"
                    size="sm"
                    icon={User}
                    className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    title="Open complete patient chart, history & clinical actions"
                  >
                    Chart & Actions
                  </Button>

                  {/* Quick Reschedule */}
                  <Button
                    onClick={() => {
                      setSelectedAppointment(apt);
                      setRescheduleDate(apt.date);
                      setRescheduleDoctorId(apt.doctorId?._id || doctors[0]?._id);
                      setRescheduleModalOpen(true);
                    }}
                    variant="ghost"
                    size="sm"
                    icon={RotateCcw}
                  >
                    Reschedule
                  </Button>

                  {/* Follow-up button */}
                  <Button
                    onClick={() => handleOpenFollowUp(apt)}
                    variant="outline"
                    size="sm"
                    icon={Calendar}
                  >
                    Follow-up
                  </Button>

                  {/* Form Submission Viewer */}
                  {apt.formData && Object.keys(apt.formData).length > 0 && (
                    <Button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setFormDataModalOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      icon={FileText}
                      title="View dynamic form responses"
                    >
                      Form Data
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL 1: NEW APPOINTMENT (RECEPTION / WALK-IN) */}
      <Modal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Create New Appointment (Reception)"
        description="Book a walk-in or phone patient directly into clinic schedule."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateWalkIn} className="space-y-4">
          {/* Patient Type Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsNewPatient(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isNewPatient ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              New Patient
            </button>
            <button
              type="button"
              onClick={() => setIsNewPatient(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isNewPatient ? 'bg-white text-brand-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Existing Patient
            </button>
          </div>

          {isNewPatient ? (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anil Kumar"
                  value={newPatientData.name}
                  onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newPatientData.phone}
                  onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={newPatientData.email}
                  onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Patient *</label>
              <select
                required
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="">Select registered patient</option>
                {patientsList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Service & Doctor selection */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Service *</label>
              <select
                required
                value={manualServiceId}
                onChange={(e) => setManualServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.duration} min - ₹{s.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Doctor *</label>
              <select
                required
                value={manualDoctorId}
                onChange={(e) => setManualDoctorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Slot selection */}
          <div className="text-xs">
            <label className="block font-medium text-slate-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white mb-3"
            />

            <label className="block font-medium text-slate-700 mb-1.5">
              Available Slots Generated Automatically *
            </label>
            {loadingSlots ? (
              <p className="text-xs text-slate-400 py-2">Calculating available doctor shifts...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-rose-500 py-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                Doctor is not available or all slots are booked on this date.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {availableSlots.map((slot) => {
                  const isSelected = manualTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => setManualTime(slot.startTime)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-brand-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Internal Clinical Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Walk-in patient consultation and clinical assessment"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setNewModalOpen(false)} variant="secondary" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!manualTime}>
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RESCHEDULE APPOINTMENT */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
        description={`Pick a new time slot for ${selectedAppointment?.patientDetails?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Doctor</label>
            <select
              value={rescheduleDoctorId}
              onChange={(e) => setRescheduleDoctorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">New Date</label>
            <input
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Select New Slot</label>
            {rescheduleLoadingSlots ? (
              <p className="text-slate-400 py-2">Loading slots...</p>
            ) : rescheduleSlots.length === 0 ? (
              <p className="text-rose-500 py-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                No slots available on this date.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {rescheduleSlots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setRescheduleTime(slot.startTime)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                      rescheduleTime === slot.startTime
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-brand-50'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setRescheduleModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!rescheduleTime}>
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: SCHEDULE FOLLOW-UP */}
      <Modal
        isOpen={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        title="Schedule Follow-up Consultation"
        description={`Book next visit for ${selectedAppointment?.patientDetails?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFollowUpSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Follow-up Service</label>
            <select
              value={followUpServiceId}
              onChange={(e) => setFollowUpServiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            >
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.duration} min)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium text-slate-700">Recommended Date *</label>
              <span className="text-[11px] font-mono font-semibold text-brand-600">
                {followUpDate ? new Date(followUpDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </span>
            </div>

            {/* Quick Helper Days Presets */}
            <div className="mb-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-600" />
                <span>Quick Follow-up Presets</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '+3 Days', days: 3 },
                  { label: '+7 Days (1 Wk)', days: 7 },
                  { label: '+10 Days', days: 10 },
                  { label: '+14 Days (2 Wks)', days: 14 },
                  { label: '+21 Days (3 Wks)', days: 21 },
                  { label: '+30 Days (1 Mo)', days: 30 },
                ].map((preset) => {
                  const isSelected = isFollowUpPresetActive(preset.days);
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handleApplyFollowUpDays(preset.days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-2xs font-bold ring-1 ring-brand-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="date"
              required
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Available Slots</label>
            {followUpLoadingSlots ? (
              <p className="text-slate-400 py-2">Loading slots...</p>
            ) : followUpSlots.length === 0 ? (
              <p className="text-rose-500 py-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                No slots available on this date.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                {followUpSlots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setFollowUpTime(slot.startTime)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                      followUpTime === slot.startTime
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-brand-50'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Follow-up Instructions / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Suture removal, check healing, replace temporary dressing"
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button onClick={() => setFollowUpModalOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!followUpTime}>
              Schedule Follow-up
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: VIEW DYNAMIC FORM SUBMISSION */}
      <Modal
        isOpen={formDataModalOpen}
        onClose={() => setFormDataModalOpen(false)}
        title="Patient Dynamic Form Submission"
        description={`Submitted by ${selectedAppointment?.patientDetails?.name} (${selectedAppointment?.appointmentNumber})`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          {selectedAppointment?.formData && Object.keys(selectedAppointment.formData).length > 0 ? (
            Object.entries(selectedAppointment.formData).map(([k, v]) => (
              <div key={k} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                  {k.replace(/_/g, ' ')}
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 whitespace-pre-wrap">
                  {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v || 'N/A')}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No custom form data recorded.</p>
          )}
        </div>
      </Modal>

      {/* MODAL 5: COMPLETE PATIENT CHART, HISTORY & CLINICAL ACTIONS DIALOG */}
      <PatientAppointmentDialog
        isOpen={patientDialogOpen}
        onClose={() => {
          setPatientDialogOpen(false);
          setPatientDialogAppointment(null);
        }}
        appointment={patientDialogAppointment}
        doctors={doctors}
        services={services}
        onAppointmentUpdated={handleAppointmentUpdatedFromDialog}
        onFollowUpCreated={handleFollowUpCreatedFromDialog}
      />
    </div>
  );
};
