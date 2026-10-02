import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const appointmentsByDay = data?.appointmentsByDay || [];
  const popularServices = data?.popularServices || [];
  const doctorLoads = data?.doctorLoads || [];
  const peakHours = data?.peakHours || [];

  const patientRetentionData = [
    { name: 'New Patients', value: summary.newPatients || 0, color: '#3b82f6' },
    { name: 'Returning Patients', value: summary.returningPatients || 0, color: '#10b981' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Analytics & Insights</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor appointment volume, treatment popularity, doctor workload distribution, and patient retention rates.
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Appointments</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {summary.totalAppointments || 0}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">All recorded visits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Completed Visits</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2 font-mono">
            {summary.completedAppointments || 0}
          </div>
          <span className="text-[11px] text-slate-400">Successfully treated</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Cancellation Rate</span>
          <div className="text-3xl font-extrabold text-amber-700 mt-2 font-mono">
            {summary.cancellationRate || 0}%
          </div>
          <span className="text-[11px] text-slate-400">Industry avg: 8-12%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">No-show Rate</span>
          <div className="text-3xl font-extrabold text-rose-600 mt-2 font-mono">
            {summary.noShowRate || 0}%
          </div>
          <span className="text-[11px] text-slate-400">Minimized by WhatsApp</span>
        </div>
      </div>

      {/* CHARTS ROW 1: Daily Volume + New vs Returning Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Appointments Chart (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Appointments Volume (Last 7 Days)</h3>
            <p className="text-xs text-slate-400 mb-6">Daily breakdown of total vs completed patient visits</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="total" name="Total Booked" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Patient Retention Pie (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">New vs Returning Patients</h3>
              <p className="text-xs text-slate-400 mb-4">Patient loyalty and acquisition distribution</p>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientRetentionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {patientRetentionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-around text-center text-xs">
              <div>
                <p className="text-slate-400 font-medium">New</p>
                <p className="text-base font-bold text-blue-600 font-mono">{summary.newPatients || 0}</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <p className="text-slate-400 font-medium">Returning</p>
                <p className="text-base font-bold text-emerald-600 font-mono">
                  {summary.returningPatients || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CHARTS ROW 2: Popular Treatments & Doctor Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Most Requested Treatments</h3>
          <p className="text-xs text-slate-400 mb-4">Breakdown of appointments by service category</p>

          <div className="space-y-3">
            {popularServices.map((srv, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: srv.color || '#3b82f6' }}
                  />
                  <span className="font-semibold text-slate-800">{srv.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-mono">₹{srv.price}</span>
                  <span className="font-bold text-brand-600 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {srv.count} {srv.count === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Doctor Load */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Doctor Workload Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Appointments assigned to each doctor</p>

          <div className="space-y-3">
            {doctorLoads.map((doc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{doc.name}</p>
                  <p className="text-[11px] text-slate-500">{doc.specialization}</p>
                </div>
                <span className="font-bold text-slate-800 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {doc.count} appointments
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
