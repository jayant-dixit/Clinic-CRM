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
import { LiveQueueWidget } from '../../components/queue/LiveQueueWidget';
import { QRCodeModal } from '../../components/qr/QRCodeModal';
import { useToast } from '../../context/ToastContext';

export const DashboardHome = () => {
  const { clinic, user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [queue, setQueue] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [todayStatsRes, analyticsRes, queueRes] = await Promise.all([
        api.getTodayStats().catch(() => ({ data: null })),
        api.getAnalytics().catch(() => ({ data: null })),
        api.getQueue().catch(() => ({ data: null })),
      ]);

      if (todayStatsRes?.data) setStats(todayStatsRes.data);
      if (analyticsRes?.data) setAnalytics(analyticsRes.data);
      if (queueRes?.data) setQueue(queueRes.data);
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCallNext = async () => {
    try {
      setQueueLoading(true);
      const res = await api.callNextPatient();
      showToast(res.message || 'Called next patient', 'success');
      // Refresh stats & queue
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to call next patient', 'error');
    } finally {
      setQueueLoading(false);
    }
  };

  const handleSkip = async (itemId) => {
    try {
      await api.skipQueueItem(itemId);
      showToast('Patient marked skipped', 'info');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to skip patient', 'error');
    }
  };

  const handleComplete = async (itemId) => {
    try {
      await api.completeQueueItem(itemId);
      showToast('Patient consultation completed', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.message || 'Failed to complete patient', 'error');
    }
  };

  const metrics = stats?.metrics || {
    total: 0,
    completed: 0,
    waiting: 0,
    upcoming: 0,
    cancelled: 0,
    noShow: 0,
  };

  const bookingUrl = `${window.location.origin}/book/${clinic?.slug || 'smilecare-dental'}/general-appointment`;

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Doctor'}
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your patient schedule and clinic activity for{' '}
            <span className="font-semibold text-slate-700">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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
            QR Code
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
          Today's Appointments Summary
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

          {/* Waiting */}
          <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-xs font-medium">Waiting</span>
              <Hourglass className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
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
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 mt-2 font-mono">
              {metrics.upcoming}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Yet to arrive</p>
          </div>

          {/* Cancelled */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Cancelled</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2 font-mono">
              {metrics.cancelled}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Rescheduled / Void</p>
          </div>

          {/* No-show */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">No-show</span>
              <UserX className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-2 font-mono">
              {metrics.noShow}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Missed slots</p>
          </div>
        </div>
      </div>

      {/* LIVE QUEUE & TODAY'S SCHEDULE TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Queue Widget (7 cols) */}
        <div className="lg:col-span-7">
          <LiveQueueWidget
            queueData={queue}
            onCallNext={handleCallNext}
            onSkip={handleSkip}
            onComplete={handleComplete}
            isLoading={queueLoading}
            canManage={true}
          />
        </div>

        {/* Right Column: Today's Schedule Timeline (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-4">
              <div>
                <CardTitle className="text-sm">Today's Schedule Timeline</CardTitle>
                <p className="text-xs text-slate-400">Sequential appointment agenda</p>
              </div>
              <button
                onClick={() => navigate('/appointments')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </CardHeader>

            <CardContent className="p-4 flex-1 overflow-y-auto max-h-[460px]">
              {(!stats?.timeline || stats.timeline.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 rounded-xl">
                  <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">Your schedule is clear</p>
                  <p className="mt-1">No appointments scheduled for today.</p>
                  <Button
                    onClick={() => navigate('/appointments?new=true')}
                    size="sm"
                    variant="outline"
                    className="mt-3"
                  >
                    + Walk-in Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.timeline.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/appointments`)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 text-center py-1.5 px-2 bg-slate-100 rounded-lg font-mono text-xs font-bold text-slate-700">
                          {item.time}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.patientName}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.serviceName} • {item.doctorName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.queueToken && (
                          <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                            {item.queueToken}
                          </span>
                        )}
                        <Badge status={item.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
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
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm">Weekly Appointment Volume</CardTitle>
            <p className="text-xs text-slate-400">Total appointments booked over the last 7 days</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.appointmentsByDay || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        clinicName={clinic?.name || 'SmileCare Dental Clinic'}
      />
    </div>
  );
};
