import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  RotateCcw,
  FileText,
  MapPin,
  Activity,
  Pill,
  Send,
  Save,
  CalendarPlus,
  History,
  ClipboardList,
  Check,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';

// Quick Smart Suggestions for Doctors to write clinical details in seconds
const TREATMENT_SUGGESTIONS = [
  {
    category: 'Consultation & Clinical Diagnosis',
    items: [
      'Patient examined. Vital signs stable (BP, Pulse, SpO2, Temperature within normal limits).',
      'Detailed clinical history taken. Physical examination reveals mild localized tenderness without swelling.',
      'Symptomatic evaluation completed. Primary diagnosis established; baseline investigations ordered.',
      'Routine follow-up assessment. Symptoms improving as expected under current therapeutic regimen.',
      'Comprehensive preventive health checkup completed. Preventive lifestyle recommendations given.',
    ],
  },
  {
    category: 'Procedures & Clinical Treatment',
    items: [
      'Minor in-clinic procedure performed under aseptic conditions and local anesthesia. Well tolerated.',
      'Wound debridement and sterile dressing applied. Hemostasis achieved. Clean wound margins.',
      'Therapeutic intervention administered according to standard clinical protocol. No immediate adverse effects.',
      'Diagnostic swab / sample collected and sent for laboratory pathology analysis.',
      'Physical rehabilitation / therapy session conducted. Range of motion and mobility exercises performed.',
    ],
  },
  {
    category: 'Prescriptions & Care Instructions',
    items: [
      'Prescribed standard oral antibiotics and analgesics as indicated. Course duration: 5 days.',
      'Prescribed anti-inflammatory medication (after meals) and topical formulation for symptomatic relief.',
      'Advised rest, adequate oral hydration, and avoidance of strenuous physical exertion for 48 hours.',
      'Dietary and lifestyle advice provided. Advised to maintain symptom diary until next visit.',
      'Patient instructed on emergency red flags (high fever, severe pain, bleeding). Follow-up scheduled.',
    ],
  },
];

export const PatientAppointmentDialog = ({
  isOpen,
  onClose,
  appointment,
  doctors = [],
  services = [],
  onAppointmentUpdated,
  onFollowUpCreated,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('treatment'); // 'treatment' | 'history' | 'schedule'
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [pastAppointments, setPastAppointments] = useState([]);

  // Editable Appointment State
  const [status, setStatus] = useState('BOOKED');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentProvided, setTreatmentProvided] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [recentlyCopied, setRecentlyCopied] = useState(null);

  // New Profile Note State
  const [newProfileNote, setNewProfileNote] = useState('');
  const [savingProfileNote, setSavingProfileNote] = useState(false);

  // Follow-up / Next Appointment Scheduling State
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpDoctorId, setFollowUpDoctorId] = useState('');
  const [followUpServiceId, setFollowUpServiceId] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpSlots, setFollowUpSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingFollowUp, setBookingFollowUp] = useState(false);

  // Sync state whenever the opened appointment changes
  useEffect(() => {
    if (!isOpen || !appointment) return;

    setStatus(appointment.status || 'BOOKED');
    setClinicalNotes(appointment.clinicalNotes || '');
    setTreatmentProvided(appointment.treatmentProvided || '');
    setInternalNotes(appointment.internalNotes || '');
    setActiveTab('treatment');

    // Default follow-up doctor & service
    setFollowUpDoctorId(appointment.doctorId?._id || appointment.doctorId || doctors[0]?._id || '');
    setFollowUpServiceId(appointment.serviceId?._id || appointment.serviceId || services[0]?._id || '');

    // Default follow-up date to +7 days
    const baseDate = appointment.date ? new Date(appointment.date) : new Date();
    const futureDate = new Date(baseDate.getTime() + 7 * 86400000);
    const y = futureDate.getFullYear();
    const m = String(futureDate.getMonth() + 1).padStart(2, '0');
    const d = String(futureDate.getDate()).padStart(2, '0');
    setFollowUpDate(`${y}-${m}-${d}`);
    setFollowUpNotes(`Follow-up consultation for ${appointment.patientDetails?.name || 'patient'}.`);

    // Fetch patient profile and complete appointment history
    const patientId = appointment.patientId?._id || appointment.patientId;
    if (patientId) {
      setLoadingPatient(true);
      api
        .getPatient(patientId)
        .then((res) => {
          if (res.data) {
            setPatientData(res.data.patient || appointment.patientId);
            setPastAppointments(res.data.appointments || []);
          }
        })
        .catch((err) => {
          console.error('Error fetching patient history:', err);
          setPatientData(appointment.patientId);
          setPastAppointments([appointment]);
        })
        .finally(() => setLoadingPatient(false));
    } else {
      setPatientData({
        name: appointment.patientDetails?.name,
        phone: appointment.patientDetails?.phone,
        email: appointment.patientDetails?.email,
        gender: appointment.patientDetails?.gender,
        dateOfBirth: appointment.patientDetails?.dateOfBirth,
      });
      setPastAppointments([appointment]);
    }
  }, [isOpen, appointment]);

  // Load available slots whenever follow-up doctor, service, or date changes
  useEffect(() => {
    if (activeTab === 'schedule' && followUpDoctorId && followUpServiceId && followUpDate) {
      setLoadingSlots(true);
      api
        .getAvailableSlotsPreview(followUpDoctorId, followUpServiceId, followUpDate)
        .then((res) => {
          const slots = res.data || [];
          setFollowUpSlots(slots);
          if (slots.length > 0) {
            setFollowUpTime(slots[0].startTime);
          } else {
            setFollowUpTime('');
          }
        })
        .catch((err) => {
          console.error('Error loading slots for next appointment:', err);
          setFollowUpSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [activeTab, followUpDoctorId, followUpServiceId, followUpDate]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  const patientName = patientData?.name || appointment.patientDetails?.name || 'Patient';
  const patientPhone = patientData?.phone || appointment.patientDetails?.phone || '';
  const patientEmail = patientData?.email || appointment.patientDetails?.email || '';
  const patientGender = patientData?.gender || appointment.patientDetails?.gender || 'Not specified';
  const patientDOB = patientData?.dateOfBirth || appointment.patientDetails?.dateOfBirth || '';
  const patientAddress = patientData?.address || '';
  const patientInitial = patientName.charAt(0).toUpperCase();

  // Helper to append suggestion text
  const handleInsertSuggestion = (text, targetField = 'treatment') => {
    if (targetField === 'treatment') {
      setTreatmentProvided((prev) => (prev ? `${prev}\n• ${text}` : `• ${text}`));
    } else {
      setClinicalNotes((prev) => (prev ? `${prev}\n• ${text}` : `• ${text}`));
    }
    setRecentlyCopied(text);
    setTimeout(() => setRecentlyCopied(null), 2000);
    showToast('Suggestion added to notes', 'info');
  };

  // Quick Preset Date selector for next appointment
  const handleApplyPresetDays = (days) => {
    const baseDate = appointment.date ? new Date(appointment.date) : new Date();
    const futureDate = new Date(baseDate.getTime() + days * 86400000);
    const y = futureDate.getFullYear();
    const m = String(futureDate.getMonth() + 1).padStart(2, '0');
    const d = String(futureDate.getDate()).padStart(2, '0');
    setFollowUpDate(`${y}-${m}-${d}`);
  };

  // 1-Click Status Update
  const handleQuickStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await api.updateAppointmentStatus(appointment._id, { status: newStatus });
      showToast(`Appointment status updated to ${newStatus}`, 'success');
      if (onAppointmentUpdated) {
        onAppointmentUpdated({ ...appointment, status: newStatus });
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Save Clinical & Treatment Notes
  const handleSaveAppointmentDetails = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingAppointment(true);
      const res = await api.updateAppointment(appointment._id, {
        status,
        clinicalNotes,
        treatmentProvided,
        internalNotes,
      });

      showToast('Treatment notes and clinical remarks saved successfully!', 'success');
      if (onAppointmentUpdated) {
        onAppointmentUpdated(res.data || { ...appointment, status, clinicalNotes, treatmentProvided, internalNotes });
      }
    } catch (err) {
      showToast(err.message || 'Failed to save appointment details', 'error');
    } finally {
      setSavingAppointment(false);
    }
  };

  // Add General Clinical Profile Note
  const handleAddProfileNote = async (e) => {
    e.preventDefault();
    if (!newProfileNote.trim()) return;

    const patientId = patientData?._id || appointment.patientId?._id || appointment.patientId;
    if (!patientId) {
      showToast('Patient record not found to attach general profile note', 'error');
      return;
    }

    try {
      setSavingProfileNote(true);
      await api.addPatientNote(patientId, { text: newProfileNote });
      showToast('Note added to permanent patient file', 'success');
      setNewProfileNote('');
      // Reload patient
      const res = await api.getPatient(patientId);
      if (res.data?.patient) {
        setPatientData(res.data.patient);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add profile note', 'error');
    } finally {
      setSavingProfileNote(false);
    }
  };

  // Schedule Next Appointment Directly
  const handleScheduleNextAppointment = async (e) => {
    e.preventDefault();
    if (!followUpDate) {
      showToast('Please select a date for next appointment', 'error');
      return;
    }
    if (!followUpTime) {
      showToast('Please select a time slot for next appointment', 'error');
      return;
    }

    try {
      setBookingFollowUp(true);
      const res = await api.scheduleFollowUp(appointment._id, {
        recommendedDate: followUpDate,
        startTime: followUpTime,
        doctorId: followUpDoctorId,
        serviceId: followUpServiceId,
        notes: followUpNotes,
      });

      showToast('Next appointment scheduled & notification sent!', 'success');
      if (onFollowUpCreated) {
        onFollowUpCreated(res.data);
      }

      // Refresh past appointments list to include newly scheduled visit
      const patientId = patientData?._id || appointment.patientId?._id || appointment.patientId;
      if (patientId) {
        const refreshed = await api.getPatient(patientId);
        if (refreshed.data?.appointments) {
          setPastAppointments(refreshed.data.appointments);
        }
      }

      // Switch to history tab to show the newly booked appointment
      setActiveTab('history');
    } catch (err) {
      showToast(err.message || 'Failed to schedule next appointment', 'error');
    } finally {
      setBookingFollowUp(false);
    }
  };

  const statusOptions = [
    { key: 'COMPLETED', label: 'Completed', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100' },
    { key: 'NO_SHOW', label: 'No Show', color: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' },
    { key: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Dark backdrop blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Main Dialog Window */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-5xl my-4 sm:my-8 border border-slate-200/90 flex flex-col max-h-[92vh]">
          {/* Header Banner: Patient Info & Fast Action Bar */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex-shrink-0 border-b border-slate-700/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Patient Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-brand-500/20 flex-shrink-0 ring-2 ring-white/20">
                  {patientInitial}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-white tracking-tight">{patientName}</h2>
                    <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-700">
                      {patientGender} {patientDOB ? `• DOB: ${patientDOB}` : ''}
                    </span>
                    <Badge status={status} size="sm" />
                    {appointment.queueToken && (
                      <span className="font-mono text-xs font-bold text-brand-300 bg-brand-950/80 px-2 py-0.5 rounded-lg border border-brand-800/60">
                        Token {appointment.queueToken}
                      </span>
                    )}
                  </div>

                  {/* Contact Chips */}
                  <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap pt-0.5">
                    {patientPhone && (
                      <a
                        href={`tel:${patientPhone}`}
                        className="flex items-center gap-1.5 hover:text-brand-300 transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
                      >
                        <Phone className="w-3.5 h-3.5 text-brand-400" />
                        <span>{patientPhone}</span>
                      </a>
                    )}
                    {patientEmail && (
                      <a
                        href={`mailto:${patientEmail}`}
                        className="flex items-center gap-1.5 hover:text-brand-300 transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        <span>{patientEmail}</span>
                      </a>
                    )}
                    {patientAddress && (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{patientAddress}</span>
                      </span>
                    )}
                    <span className="text-slate-400">
                      Total Visits: <strong className="text-white">{pastAppointments.length || 1}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
                  title="Close dialog (Esc)"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Current Appointment Mini Strip */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs flex-wrap gap-2 text-slate-300">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <strong>{appointment.date}</strong> at <strong>{appointment.startTime}</strong> ({appointment.duration}m)
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-slate-200">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                  Service: <strong>{appointment.serviceId?.name || 'General Consultation'}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span>
                  Doctor: <strong>{appointment.doctorId?.name || 'Doctor'}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">#{appointment.appointmentNumber}</span>
              </div>

              <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                Active Appointment
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center justify-between px-6 bg-slate-50 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              <button
                type="button"
                onClick={() => setActiveTab('treatment')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'treatment'
                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-brand-600" />
                <span>Current Appointment & Treatment</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4 text-indigo-600" />
                <span>Patient History ({pastAppointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CalendarPlus className="w-4 h-4 text-emerald-600" />
                <span>Schedule Next Appointment</span>
              </button>
            </div>
          </div>

          {/* Main Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 text-slate-800 space-y-6">
            {/* TAB 1: CURRENT APPOINTMENT & CLINICAL TREATMENT */}
            {activeTab === 'treatment' && (
              <div className="space-y-6">
                {/* 1. Instant Status Switcher */}
                <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Update Appointment Status
                    </span>
                    <span className="text-[11px] text-slate-400">Click any status to apply immediately</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleQuickStatusChange(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          status === opt.key
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102 ring-2 ring-brand-500/20'
                            : opt.color
                        }`}
                      >
                        {status === opt.key && <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Doctor Treatment Notes & Clinical Observation Inputs */}
                <form onSubmit={handleSaveAppointmentDetails} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Clinical Notes & Diagnosis */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-indigo-600" />
                          <span>Clinical Observations & Diagnosis</span>
                        </label>
                        <span className="text-[11px] text-slate-400">Symptoms, examination, caries, pulp status</span>
                      </div>
                      <textarea
                        rows={6}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Write findings, teeth numbers examined, patient symptoms, diagnostic tests (e.g. cold test, percussion)..."
                        className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-sans leading-relaxed"
                      />
                    </div>

                    {/* Treatment Provided */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-brand-600" />
                          <span>Treatment Provided & Procedures Done</span>
                        </label>
                        <span className="text-[11px] text-slate-400">Fillings, RCT stages, extractions, materials</span>
                      </div>
                      <textarea
                        rows={6}
                        value={treatmentProvided}
                        onChange={(e) => setTreatmentProvided(e.target.value)}
                        placeholder="Enter clinical procedures carried out today, diagnosis, medicines prescribed, observations, and care instructions..."
                        className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Reception / Internal Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Internal Front-Desk / Staff Notes</span>
                    </label>
                    <input
                      type="text"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Notes for reception or billing (e.g. insurance claim needed, patient requested evening slots)..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  {/* Action Button: Save Details */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('schedule')}
                      icon={CalendarPlus}
                    >
                      Proceed to Schedule Next Visit
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Save}
                      disabled={savingAppointment}
                    >
                      {savingAppointment ? 'Saving Details...' : 'Save Appointment & Treatment Details'}
                    </Button>
                  </div>
                </form>

                {/* 3. Fast Clinical Suggestion Chips (Speed Writing for Doctors) */}
                <div className="bg-gradient-to-br from-indigo-50/60 via-brand-50/40 to-slate-50 rounded-2xl p-5 border border-indigo-100/80 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                          Fast Clinical Suggestions (1-Click Insert)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Click any ready-made clinical template below to append it immediately into your treatment or diagnosis.
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-2.5 py-1 rounded-lg">
                      ⚡ Doctor Productivity Booster
                    </span>
                  </div>

                  {/* Categories */}
                  <div className="space-y-3.5">
                    {TREATMENT_SUGGESTIONS.map((categoryGroup, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          {categoryGroup.category}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {categoryGroup.items.map((itemText, i) => {
                            const isCopied = recentlyCopied === itemText;
                            const isDiagnosis = categoryGroup.category.includes('Diagnosis');
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleInsertSuggestion(itemText, isDiagnosis ? 'clinical' : 'treatment')}
                                title="Click to insert into notes"
                                className={`text-left text-[11px] px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-white/90 text-slate-700 hover:text-brand-900 border-slate-200/90 hover:border-brand-300 hover:bg-brand-50/50 shadow-2xs'
                                }`}
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-white flex-shrink-0" />
                                ) : (
                                  <Plus className="w-3 h-3 text-brand-600 flex-shrink-0" />
                                )}
                                <span>{itemText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PATIENT HISTORY & PAST APPOINTMENTS */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Patient Summary Header Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-semibold block">Total Clinic Visits</span>
                    <span className="text-2xl font-black text-slate-900 mt-1 block">
                      {pastAppointments.length}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Recorded in CareFlow CRM</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="text-[11px] text-emerald-800 font-semibold block">Completed Treatments</span>
                    <span className="text-2xl font-black text-emerald-900 mt-1 block">
                      {pastAppointments.filter((a) => a.status === 'COMPLETED').length}
                    </span>
                    <p className="text-[11px] text-emerald-700/80 mt-0.5">Successful procedures</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                    <span className="text-[11px] text-indigo-800 font-semibold block">Registered Since</span>
                    <span className="text-sm font-bold text-indigo-950 mt-2 block">
                      {patientData?.createdAt ? new Date(patientData.createdAt).toLocaleDateString() : 'Active Member'}
                    </span>
                    <p className="text-[11px] text-indigo-700/80 mt-0.5">Patient ID: {patientData?._id ? patientData._id.slice(-6).toUpperCase() : 'N/A'}</p>
                  </div>
                </div>

                {/* Permanent Patient Profile Remarks */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span>Permanent Patient Profile Remarks & Medical Alerts</span>
                    </h4>
                    <span className="text-[11px] text-amber-700">Follows patient across all visits</span>
                  </div>

                  {patientData?.notes && patientData.notes.length > 0 ? (
                    <div className="space-y-2">
                      {patientData.notes.map((n, i) => (
                        <div key={i} className="bg-white/80 p-2.5 rounded-xl border border-amber-100 text-xs text-slate-800">
                          <p>{n.text}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            By {n.author || 'Staff'} • {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No general medical alerts recorded for this patient.</p>
                  )}

                  {/* Add Profile Note form */}
                  <form onSubmit={handleAddProfileNote} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newProfileNote}
                      onChange={(e) => setNewProfileNote(e.target.value)}
                      placeholder="Add medical alert or permanent note (e.g. allergic to penicillin, asthma, diabetes)..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                    <Button type="submit" size="sm" variant="outline" disabled={savingProfileNote}>
                      {savingProfileNote ? 'Saving...' : 'Add Note'}
                    </Button>
                  </form>
                </div>

                {/* All Past Appointments Chronological Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-600" />
                    <span>Appointment History & Visit Log</span>
                  </h4>

                  {loadingPatient ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : pastAppointments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      No previous appointments recorded for this patient.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastAppointments.map((aptItem) => {
                        const isCurrent = aptItem._id === appointment._id;
                        return (
                          <div
                            key={aptItem._id}
                            className={`p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
                              isCurrent
                                ? 'bg-brand-50/30 border-brand-300 ring-1 ring-brand-400/20'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm">
                                  {aptItem.date}
                                </span>
                                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                  {aptItem.startTime}
                                </span>
                                <Badge status={aptItem.status} size="sm" />
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                                    Current Selected Visit
                                  </span>
                                )}
                                {aptItem.queueToken && (
                                  <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                    Token {aptItem.queueToken}
                                  </span>
                                )}
                              </div>

                              <span className="text-[11px] font-mono text-slate-400">
                                #{aptItem.appointmentNumber}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                              <span className="font-semibold text-slate-800">
                                {aptItem.serviceId?.name || 'Clinical Service'} ({aptItem.duration}m)
                              </span>
                              <span>•</span>
                              <span>Doctor: {aptItem.doctorId?.name || 'Clinic Doctor'}</span>
                              <span>•</span>
                              <span className="text-slate-400">Source: {aptItem.bookingSource}</span>
                            </div>

                            {/* Treatment provided in this visit */}
                            {aptItem.treatmentProvided && (
                              <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-emerald-950">
                                <strong className="text-[11px] text-emerald-800 uppercase block mb-0.5">
                                  Treatment Done:
                                </strong>
                                <p className="whitespace-pre-line leading-relaxed">{aptItem.treatmentProvided}</p>
                              </div>
                            )}

                            {/* Clinical notes in this visit */}
                            {aptItem.clinicalNotes && (
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                                <strong className="text-[11px] text-slate-500 uppercase block mb-0.5">
                                  Clinical Notes:
                                </strong>
                                <p className="whitespace-pre-line leading-relaxed">{aptItem.clinicalNotes}</p>
                              </div>
                            )}

                            {/* Follow up details if present */}
                            {aptItem.followUp?.isScheduled && (
                              <div className="text-[11px] text-indigo-700 bg-indigo-50/80 px-2.5 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1.5">
                                <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>
                                  Follow-up booked for <strong>{aptItem.followUp.recommendedDate}</strong>: {aptItem.followUp.notes || 'Routine check'}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SCHEDULE NEXT APPOINTMENT (DIRECT FOLLOW-UP) */}
            {activeTab === 'schedule' && (
              <form onSubmit={handleScheduleNextAppointment} className="space-y-5">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <CalendarPlus className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-950">
                        Schedule Next Visit for {patientName}
                      </h4>
                      <p className="text-[11px] text-emerald-700">
                        Pick a date, doctor, and slot to schedule directly. Patient will receive an instant confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Date Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quick Date Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '+3 Days', days: 3 },
                      { label: '+1 Week', days: 7 },
                      { label: '+2 Weeks', days: 14 },
                      { label: '+1 Month', days: 30 },
                      { label: '+3 Months', days: 90 },
                      { label: '+6 Months (Recall)', days: 180 },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => handleApplyPresetDays(preset.days)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date, Doctor & Service selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Next Visit Date *</label>
                    <input
                      type="date"
                      required
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                    />
                  </div>

                  {/* Doctor Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Assigned Doctor *</label>
                    <select
                      value={followUpDoctorId}
                      onChange={(e) => setFollowUpDoctorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                    >
                      {doctors.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.specialization || 'Doctor'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Procedure / Service *</label>
                    <select
                      value={followUpServiceId}
                      onChange={(e) => setFollowUpServiceId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                    >
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.duration} mins)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Available Slot Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>Select Available Time Slot *</span>
                    </label>
                    {loadingSlots && (
                      <span className="text-[11px] text-brand-600 animate-pulse font-medium">
                        Loading free slots for doctor...
                      </span>
                    )}
                  </div>

                  {followUpSlots.length === 0 && !loadingSlots ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      No vacant slots found for this doctor on {followUpDate}. You can choose another date or doctor above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1">
                      {followUpSlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setFollowUpTime(slot.startTime)}
                          className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all text-center border ${
                            followUpTime === slot.startTime
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-brand-500 hover:text-brand-600'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reason / Instructions for Next Visit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Follow-up Reason / Clinical Instructions</label>
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="e.g. Crown cementation, suture removal, second stage RCT obturation, 6-month cleaning recall..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-sans"
                  />
                </div>

                {/* Submit Schedule button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setActiveTab('treatment')}>
                    Back to Treatment Notes
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={CalendarPlus}
                    disabled={bookingFollowUp || !followUpTime}
                  >
                    {bookingFollowUp ? 'Scheduling Next Appointment...' : 'Confirm & Schedule Next Appointment'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
