import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Hourglass,
  XCircle,
  UserX,
  Users,
  UserPlus,
  Percent,
  Plus,
  QrCode,
  ArrowRight,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  Calendar,
  Stethoscope,
  Phone,
  FileText,
  User,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { PatientAppointmentDialog } from '../../components/appointments/PatientAppointmentDialog';
import { useToast } from '../../context/ToastContext';

// Helper for time-based dynamic greeting
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Helper to format Doctor + Name properly without duplicating prefixes
const getDoctorDisplayName = (fullName) => {
  if (!fullName) return 'Doctor';
  const trimmed = fullName.trim();
  const cleanName = trimmed.replace(/^(dr\.?|doctor)\s+/i, '');
  if (!cleanName) return trimmed || 'Doctor';
  return `Dr. ${cleanName}`;
};

export const DashboardHome = () => {
  const { clinic, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedBookingLink, setCopiedBookingLink] = useState(false);

  // Active Schedule Filter Tab
  const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all' | 'upcoming' | 'in_progress' | 'completed'

  // Patient Chart Dialog State
  const [selectedAppointmentForDialog, setSelectedAppointmentForDialog] = useState(null);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayStatsRes, analyticsRes, docsRes, srvsRes] = await Promise.all([
        api.getTodayStats().catch(() => ({ data: null })),
        api.getAnalytics().catch(() => ({ data: null })),
        api.getDoctors().catch(() => ({ data: [] })),
        api.getServices().catch(() => ({ data: [] })),
      ]);

      if (todayStatsRes?.data) setStats(todayStatsRes.data);
      if (analyticsRes?.data) setAnalytics(analyticsRes.data);
      if (docsRes?.data) setDoctors(docsRes.data);
      if (srvsRes?.data) setServices(srvsRes.data);
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = stats?.metrics || {
    total: 0,
    completed: 0,
    waiting: 0,
    upcoming: 0,
    inProgress: 0,
    cancelled: 0,
    noShow: 0,
  };

  const bookingUrl = `${window.location.origin}/book/${clinic?.slug || 'smilecare-dental'}/general-appointment`;

  const handleCopyBookingUrl = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopiedBookingLink(true);
    showToast('Patient booking page link copied to clipboard!', 'success');
    setTimeout(() => setCopiedBookingLink(false), 2500);
  };

  const handleOpenAppointmentDialog = (appointmentItem) => {
    setSelectedAppointmentForDialog(appointmentItem);
    setPatientDialogOpen(true);
  };

  const handleAppointmentUpdatedFromDialog = () => {
    fetchDashboardData();
  };

  // Filtered timeline appointments
  const allTimelineItems = stats?.timeline || [];
  const filteredTimeline = allTimelineItems.filter((item) => {
    if (scheduleFilter === 'all') return true;
    if (scheduleFilter === 'upcoming') return item.status === 'BOOKED' || item.status === 'CONFIRMED';
    if (scheduleFilter === 'in_progress')
      return item.status === 'IN_PROGRESS' || item.status === 'WAITING' || item.status === 'ARRIVED';
    if (scheduleFilter === 'completed') return item.status === 'COMPLETED';
    return true;
  });

  // Calculate completion percentage
  const completionPercent = metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0;

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-96 lg:col-span-8" />
          <Skeleton className="h-96 lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner with Dynamic Time-Based Greeting and Doctor Name */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {getTimeGreeting()}, {getDoctorDisplayName(user?.name)}
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your patient schedule and clinic activity for{' '}
            <span className="font-semibold text-slate-700">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setQrModalOpen(true)}
            variant="secondary"
            size="sm"
            icon={QrCode}
          >
            Booking QR
          </Button>
          <Button
            onClick={() => navigate('/appointments?new=true')}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            New Appointment
          </Button>
        </div>
      </div>

      {/* TODAY'S APPOINTMENT KPI METRIC CARDS */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Today's Appointments Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Total Today */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Today's Total</span>
              <CalendarDays className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {metrics.total}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled appointments</p>
          </div>

          {/* Completed */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-xs font-medium">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2 font-mono">
              {metrics.completed}
            </div>
            <p className="text-[11px] text-emerald-600/80 mt-0.5">Visits finished</p>
          </div>

          {/* In Consultation / Progress */}
          <div className="bg-white p-4 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-xs font-medium">In Progress</span>
              <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-2 font-mono">
              {metrics.inProgress || 0}
            </div>
            <p className="text-[11px] text-purple-600/80 mt-0.5">In consultation chair</p>
          </div>

          {/* Waiting */}
          <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium">Waiting</span>
              <Hourglass className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-2 font-mono">
              {metrics.waiting}
            </div>
            <p className="text-[11px] text-amber-600/80 mt-0.5">Arrived in clinic</p>
          </div>

          {/* Upcoming */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Upcoming</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {metrics.upcoming}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Yet to arrive</p>
          </div>

          {/* Cancelled / No-show */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">No-show / Canc.</span>
              <UserX className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-2 font-mono">
              {(metrics.cancelled || 0) + (metrics.noShow || 0)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {metrics.cancelled} canc. • {metrics.noShow} no-show
            </p>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION (REPLACED RECEPTION QUEUE WITH EXPANDED CLINICAL FLOW & PORTAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Today's Full Patient Schedule (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="flex flex-col shadow-subtle border border-slate-200/90 rounded-3xl overflow-hidden">
            {/* Schedule Header with Filter Tabs */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">Today's Patient Schedule</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    {allTimelineItems.length} visits
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any patient row to open their clinical chart & write treatment details
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setScheduleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scheduleFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({allTimelineItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleFilter('upcoming')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scheduleFilter === 'upcoming'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Upcoming ({metrics.upcoming})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleFilter('in_progress')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scheduleFilter === 'in_progress'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Active ({metrics.inProgress + metrics.waiting})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    scheduleFilter === 'completed'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Done ({metrics.completed})
                </button>
              </div>
            </div>

            {/* Schedule Items List */}
            <div className="p-4 space-y-2.5 max-h-[520px] overflow-y-auto">
              {filteredTimeline.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl">
                  <CalendarDays className="w-10 h-10 text-slate-300 mb-2.5" />
                  <p className="font-bold text-slate-700 text-sm">No appointments in this view</p>
                  <p className="mt-1 text-slate-400 max-w-sm">
                    {scheduleFilter === 'all'
                      ? 'Your clinic schedule is completely clear for today.'
                      : `There are currently no appointments matching the "${scheduleFilter}" filter.`}
                  </p>
                  <Button
                    onClick={() => navigate('/appointments?new=true')}
                    size="sm"
                    variant="outline"
                    className="mt-3.5"
                    icon={Plus}
                  >
                    Add Walk-in Appointment
                  </Button>
                </div>
              ) : (
                filteredTimeline.map((item) => {
                  const patientInitial = (item.patientName || 'P').charAt(0).toUpperCase();
                  return (
                    <div
                      key={item.id || item._id}
                      onClick={() => handleOpenAppointmentDialog(item)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-brand-300 hover:bg-brand-50/20 hover:shadow-xs transition-all cursor-pointer gap-3 group/row"
                      title="Click to open patient chart, clinical notes & next appointment scheduler"
                    >
                      {/* Left: Time + Patient Avatar + Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Time Box */}
                        <div className="w-16 text-center py-2 px-2 bg-slate-100 group-hover/row:bg-brand-600 group-hover/row:text-white rounded-xl flex flex-col justify-center flex-shrink-0 transition-colors">
                          <span className="font-mono text-xs font-black tracking-tight text-slate-900 group-hover/row:text-white">
                            {item.time || item.startTime}
                          </span>
                          <span className="text-[10px] text-slate-400 group-hover/row:text-white/80 font-medium">
                            {item.duration || 30}m
                          </span>
                        </div>

                        {/* Patient Avatar */}
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs flex-shrink-0">
                          {patientInitial}
                        </div>

                        {/* Name & Service */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900 group-hover/row:text-brand-600 transition-colors truncate">
                              {item.patientName}
                            </h4>
                            {item.queueToken && (
                              <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                                Token {item.queueToken}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mt-0.5">
                            <span className="font-semibold text-slate-700">
                              {item.serviceName || 'Consultation'}
                            </span>
                            <span>•</span>
                            <span>with {item.doctorName || 'Doctor'}</span>
                            {item.patientPhone && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {item.patientPhone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Action Button */}
                      <div className="flex items-center justify-end gap-2.5 self-end sm:self-center flex-shrink-0">
                        <Badge status={item.status} size="sm" />
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-xl opacity-80 group-hover/row:opacity-100 group-hover/row:bg-indigo-600 group-hover/row:text-white transition-all flex items-center gap-1 shadow-2xs">
                          <User className="w-3.5 h-3.5" />
                          <span>Chart</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with view all link */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs px-5">
              <span className="text-slate-400">
                Displaying {filteredTimeline.length} of {allTimelineItems.length} appointments today
              </span>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Full Appointments Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Portal Link & Clinical Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Public Patient Booking Portal */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 text-white border border-brand-800/40 shadow-lg relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-900/60 px-2 py-0.5 rounded-full border border-brand-700/50">
                  Online Portal
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">Patient Booking Page</h3>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Patients can book their own appointments, pick services, and view real-time open slots.
            </p>

            {/* Booking URL Box */}
            <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono text-slate-300 truncate max-w-[210px]">
                {bookingUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyBookingUrl}
                className="p-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors flex-shrink-0"
                title="Copy link"
              >
                {copiedBookingLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Links & QR triggers */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              >
                <span>Live Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-brand-300 bg-brand-900/40 hover:bg-brand-900/60 transition-all border border-brand-700/50"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR</span>
              </button>
            </div>
          </div>

          {/* Card 2: Clinic Quick Operations & Today's Completion Gauge */}
          <Card className="p-5 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">Today's Chair Progress</span>
                <span className="text-xs font-black text-emerald-600 font-mono">
                  {completionPercent}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {metrics.completed} of {metrics.total} patients completed today
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Quick Shortcuts
              </span>

              <button
                type="button"
                onClick={() => navigate('/appointments?new=true')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-600" />
                  <span>New Walk-in Appointment</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/calendar')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Calendar Schedule</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-left text-xs font-semibold text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Patient Records Directory</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ANALYTICS SECTION: RECHARTS & METRIC TILES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Clinic Growth & Patient Analytics
          </h2>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>Full Analytics Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Analytics KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-600" /> Total Patients
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {analytics?.summary?.totalPatients || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered in clinic</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-600" /> New Patients
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
              {analytics?.summary?.newPatients || 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">First-time appointments</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-600" /> Cancellation Rate
            </span>
            <div className="text-2xl font-extrabold text-amber-700 mt-2 font-mono">
              {analytics?.summary?.cancellationRate || 0}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Lower than industry avg (8%)</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-rose-600" /> No-show Rate
            </span>
            <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono">
              {analytics?.summary?.noShowRate || 0}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Reduced via reminders</p>
          </div>
        </div>

        {/* Weekly Activity Recharts Chart */}
        <Card className="rounded-3xl border border-slate-200/90 overflow-hidden shadow-subtle">
          <CardHeader className="py-4">
            <CardTitle className="text-sm">Weekly Appointment Volume</CardTitle>
            <p className="text-xs text-slate-400">Total appointments booked over the last 7 days</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics?.appointmentsByDay || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="total" name="Total Appointments" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal for Clinic */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="General Appointment Booking"
        bookingUrl={bookingUrl}
        clinicName={clinic?.name || 'CareSlot Clinic'}
      />

      {/* Patient Chart & Clinical Notes Dialog */}
      <PatientAppointmentDialog
        isOpen={patientDialogOpen}
        onClose={() => {
          setPatientDialogOpen(false);
          setSelectedAppointmentForDialog(null);
        }}
        appointment={selectedAppointmentForDialog}
        doctors={doctors}
        services={services}
        onAppointmentUpdated={handleAppointmentUpdatedFromDialog}
        onFollowUpCreated={handleAppointmentUpdatedFromDialog}
      />
    </div>
  );
};
