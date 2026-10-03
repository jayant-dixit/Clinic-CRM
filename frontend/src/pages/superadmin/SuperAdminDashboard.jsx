import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Stethoscope,
  Sliders,
  CreditCard,
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  DollarSign,
  TrendingUp,
  FileText,
  Shield,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  Layers,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  LayoutDashboard,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

export const SuperAdminDashboard = () => {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Data states
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [paymentsData, setPaymentsData] = useState(null);
  const [tickets, setTickets] = useState([]);

  // Search & Filter states
  const [patientSearch, setPatientSearch] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('ALL');

  // Modal states
  const [isRegisterClinicOpen, setIsRegisterClinicOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  // Active items for modals
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Form states
  const [clinicForm, setClinicForm] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    clinicType: 'Multi-Speciality Clinic',
    googleBusinessProfile: '',
    ownerName: '',
    ownerEmail: '',
    plan: 'GROWTH',
    pricePerMonth: 49,
    patientQuota: 300,
    billingCycle: 'MONTHLY',
    password: '',
    features: {
      publicBooking: true,
      qrCodeBooking: true,
      customForms: true,
      analyticsReporting: true,
      automatedNotifications: true,
      multiDoctor: true,
    },
  });

  const [staffForm, setStaffForm] = useState({
    clinicId: '',
    role: 'DOCTOR',
    name: '',
    email: '',
    phone: '',
    specialization: 'General Practitioner',
    licenseNumber: '',
    consultationFee: 50,
    password: '',
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: 'GROWTH',
    status: 'ACTIVE',
    pricePerMonth: 49,
    patientQuota: 300,
    billingCycle: 'MONTHLY',
  });

  const [paymentForm, setPaymentForm] = useState({
    clinicId: '',
    amount: 49,
    billingCycle: 'MONTHLY',
    paymentMethod: 'STRIPE',
    status: 'PAID',
    transactionId: '',
    notes: '',
  });

  const [ticketResponseForm, setTicketResponseForm] = useState({
    status: 'RESOLVED',
    priority: 'HIGH',
    resolutionNote: '',
  });

  // Load data based on tab or initial
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, clinicsRes] = await Promise.all([
        api.getSuperAdminAnalytics(),
        api.getSuperAdminClinics(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (clinicsRes.success) setClinics(clinicsRes.data);

      // Load specific tab data lazily if needed
      if (tab === 'doctors' || tab === 'overview') {
        const docRes = await api.getSuperAdminDoctors();
        if (docRes.success) setDoctors(docRes.data);
      }

      if (tab === 'patients' || tab === 'overview') {
        const patRes = await api.getSuperAdminPatients();
        if (patRes.success) setPatients(patRes.data);
      }

      if (tab === 'payments' || tab === 'overview') {
        const payRes = await api.getSuperAdminPayments();
        if (payRes.success) setPaymentsData(payRes.data);
      }

      if (tab === 'support' || tab === 'overview') {
        const tickRes = await api.getSuperAdminSupportTickets();
        if (tickRes.success) setTickets(tickRes.data);
      }
    } catch (err) {
      console.error('Failed to load SuperAdmin dashboard:', err);
      showToast(err.message || 'Failed to load platform data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [tab]);

  // Copy helper
  const handleCopy = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // 1-Click Clinic Register Submit
  const handleRegisterClinic = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.createSuperAdminClinic(clinicForm);
      if (res.success) {
        showToast('Clinic and Owner created successfully!', 'success');
        setIsRegisterClinicOpen(false);
        // Show credentials modal
        setGeneratedCredentials({
          clinicName: res.data.clinic.name,
          name: res.data.owner.name,
          email: res.data.owner.email,
          role: res.data.owner.role,
          password: res.data.owner.generatedPassword || res.data.credentials?.password,
          loginUrl: `${window.location.origin}/login`,
        });
        setIsCredentialsModalOpen(true);
        // Reset form
        setClinicForm({
          name: '',
          slug: '',
          email: '',
          phone: '',
          address: '',
          clinicType: 'Multi-Speciality Clinic',
          googleBusinessProfile: '',
          ownerName: '',
          ownerEmail: '',
          plan: 'GROWTH',
          pricePerMonth: 49,
          patientQuota: 300,
          billingCycle: 'MONTHLY',
          password: '',
          features: {
            publicBooking: true,
            qrCodeBooking: true,
            customForms: true,
            analyticsReporting: true,
            automatedNotifications: true,
            multiDoctor: true,
          },
        });
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create clinic', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add Staff / Doctor Submit
  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      if (!staffForm.clinicId) {
        showToast('Please select a clinic', 'error');
        return;
      }
      setLoading(true);
      const res = await api.createSuperAdminDoctorOrStaff(staffForm.clinicId, staffForm);
      if (res.success) {
        showToast(`${staffForm.role} added successfully!`, 'success');
        setIsAddStaffOpen(false);

        const targetClinic = clinics.find((c) => c._id === staffForm.clinicId);
        setGeneratedCredentials({
          clinicName: targetClinic?.name || 'Clinic',
          name: res.data.user.name,
          email: res.data.credentials.email,
          role: res.data.credentials.role,
          password: res.data.credentials.generatedPassword || res.data.credentials.password,
          loginUrl: `${window.location.origin}/login`,
        });
        setIsCredentialsModalOpen(true);

        setStaffForm({
          clinicId: '',
          role: 'DOCTOR',
          name: '',
          email: '',
          phone: '',
          specialization: 'General Practitioner',
          licenseNumber: '',
          consultationFee: 50,
          password: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add doctor/staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Feature directly
  const handleToggleFeature = async (clinicId, featureKey, currentValue) => {
    try {
      const updatedValue = !currentValue;
      // Optimistic UI update
      setClinics((prev) =>
        prev.map((c) =>
          c._id === clinicId
            ? { ...c, features: { ...c.features, [featureKey]: updatedValue } }
            : c
        )
      );

      const res = await api.updateSuperAdminClinicFeatures(clinicId, {
        [featureKey]: updatedValue,
      });

      if (res.success) {
        showToast(
          `Feature "${featureKey}" ${updatedValue ? 'Enabled' : 'Disabled'}!`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update feature', 'error');
      loadDashboardData();
    }
  };

  // Update Clinic Subscription Plan & Price
  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!selectedClinic) return;
    try {
      setLoading(true);
      const res = await api.updateSuperAdminClinicSubscription(
        selectedClinic._id,
        subscriptionForm
      );
      if (res.success) {
        showToast('Clinic subscription updated successfully!', 'success');
        setIsSubscriptionModalOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update subscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Record SaaS Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.clinicId) {
      showToast('Please select a clinic', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await api.recordSuperAdminPayment(paymentForm);
      if (res.success) {
        showToast('Payment invoice recorded successfully!', 'success');
        setIsRecordPaymentOpen(false);
        setPaymentForm({
          clinicId: '',
          amount: 49,
          billingCycle: 'MONTHLY',
          paymentMethod: 'STRIPE',
          status: 'PAID',
          transactionId: '',
          notes: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Update Support Ticket
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      setLoading(true);
      const res = await api.updateSuperAdminSupportTicket(
        selectedTicket._id,
        ticketResponseForm
      );
      if (res.success) {
        showToast('Support ticket updated & response saved!', 'success');
        setIsTicketModalOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              Root SaaS Command Center
            </span>
            <span className="text-xs text-slate-400">CareSlot Multi-Tenant Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            SuperAdmin Platform Dashboard
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Production
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register clinics, provision staff credentials, toggle feature gates, track patient usage & manage billing.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRegisterClinicOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95"
          >
            <Building2 className="w-4 h-4" />
            <span>Register Clinic & Owner</span>
          </button>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Add Doctor/Staff</span>
          </button>

          <button
            onClick={loadDashboardData}
            title="Refresh Data"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {[
          { key: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
          { key: 'clinics', label: 'Clinics & Owners', icon: Building2 },
          { key: 'doctors', label: 'Doctors & Staff', icon: Stethoscope },
          { key: 'features', label: 'Feature Gating', icon: Sliders },
          { key: 'patients', label: 'Global Patients', icon: Users },
          { key: 'payments', label: 'Revenue & Invoices', icon: CreditCard },
          { key: 'support', label: 'Support & Feedback', icon: LifeBuoy },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.key || (tab === '' && item.key === 'overview');
          return (
            <button
              key={item.key}
              onClick={() => navigate(`/superadmin/${item.key === 'overview' ? '' : item.key}`)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition whitespace-nowrap ${active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.key === 'support' && tickets.filter((t) => t.status === 'OPEN').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PLATFORM OVERVIEW */}
      {/* ========================================================================= */}
      {(tab === 'overview' || !tab) && (
        <div className="space-y-6">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Platform MRR</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                ${analytics?.overview?.totalMRR?.toLocaleString() || '0'}
                <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Active SaaS Subscriptions
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Onboarded Clinics</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {analytics?.overview?.totalClinics || clinics.length || 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {clinics.filter((c) => c.subscription?.status === 'ACTIVE').length} active subscriptions
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Network Doctors</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {analytics?.overview?.totalDoctors || 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Practicing in registered clinics</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Global Patients</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {analytics?.overview?.totalPatients?.toLocaleString() || '0'}
              </div>
              <p className="text-[11px] text-cyan-400 mt-1">Across all registered clinics</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Appointments</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {analytics?.overview?.totalAppointments?.toLocaleString() || '0'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Booked platform-wide</p>
            </div>
          </div>

          {/* Usage-Based Billing & Quota Monitor (User Request: "track each clinic analytics like no of patient they serve so i can charge based on that") */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Tenant Patient Usage & Billing Matrix
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    Usage Tracker
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time patient count served per clinic. Track quota limits and calculate usage-based overage fees.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &lt;80% Normal
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 80-99% Near Quota
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 100%+ Overage
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Clinic & Plan</th>
                    <th className="py-3 px-3">Owner Contact</th>
                    <th className="py-3 px-3">Patients Served vs Quota</th>
                    <th className="py-3 px-3">Doctors</th>
                    <th className="py-3 px-3">Base Price</th>
                    <th className="py-3 px-3">Est. Total Monthly Bill</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(analytics?.clinicUsageMetrics || clinics).map((item) => {
                    const clinicObj = clinics.find((c) => c._id === item.clinicId || c._id === item._id) || item;
                    const patientCount = item.patientCount ?? clinicObj.patientCount ?? 0;
                    const quota = item.patientQuota ?? clinicObj.subscription?.patientQuota ?? 300;
                    const basePrice = item.pricePerMonth ?? clinicObj.subscription?.pricePerMonth ?? 49;
                    const usagePercent = item.usagePercentage ?? Math.round((patientCount / quota) * 100);
                    const isOverage = usagePercent > 100;
                    const overageCount = Math.max(0, patientCount - quota);
                    const overageCost = overageCount * 0.15; // $0.15 per extra patient
                    const totalEstimatedBill = item.estimatedBilling ?? Math.round(basePrice + overageCost);

                    return (
                      <tr key={item.clinicId || item._id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-white text-sm">{item.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">/{item.slug}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {clinicObj.subscription?.plan || 'GROWTH'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${clinicObj.subscription?.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                              }`}>
                              {clinicObj.subscription?.status || 'ACTIVE'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-300 font-medium">{clinicObj.ownerId?.name || 'Owner'}</div>
                          <div className="text-[11px] text-slate-400">{clinicObj.ownerId?.email || clinicObj.email}</div>
                        </td>

                        <td className="py-3.5 px-3 min-w-[200px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-white">
                              {patientCount} <span className="text-slate-400 font-normal">/ {quota} patients</span>
                            </span>
                            <span
                              className={`text-[11px] font-bold ${isOverage
                                  ? 'text-rose-400'
                                  : usagePercent >= 80
                                    ? 'text-amber-400'
                                    : 'text-emerald-400'
                                }`}
                            >
                              {usagePercent}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isOverage
                                  ? 'bg-rose-500'
                                  : usagePercent >= 80
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              style={{ width: `${Math.min(100, usagePercent)}%` }}
                            />
                          </div>
                          {isOverage && (
                            <p className="text-[10px] text-rose-400 mt-1 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> +{overageCount} patients over quota
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 font-semibold">
                            {item.doctorCount ?? clinicObj.doctorCount ?? 1} Doctors
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-300 font-medium">
                          ${basePrice}/mo
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-sm font-bold text-white">${totalEstimatedBill}</div>
                          <div className="text-[10px] text-slate-400">
                            {isOverage ? `(Base $${basePrice} + Overage $${Math.round(overageCost)})` : 'Base subscription'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedClinic(clinicObj);
                                setSubscriptionForm({
                                  plan: clinicObj.subscription?.plan || 'GROWTH',
                                  status: clinicObj.subscription?.status || 'ACTIVE',
                                  pricePerMonth: clinicObj.subscription?.pricePerMonth || 49,
                                  patientQuota: clinicObj.subscription?.patientQuota || 300,
                                  billingCycle: clinicObj.subscription?.billingCycle || 'MONTHLY',
                                });
                                setIsSubscriptionModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                            >
                              Edit Plan & Quota
                            </button>
                            <button
                              onClick={() => navigate('/superadmin/features')}
                              className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs font-medium border border-purple-500/30 transition"
                            >
                              Gates
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Grid: Recent Activity & Recent Tickets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Feature Gates Overview */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Active Feature Access Overview</h3>
                  <p className="text-xs text-slate-400">Platform-wide tenant capability enablement</p>
                </div>
                <button
                  onClick={() => navigate('/superadmin/features')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  Manage All Gates <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {clinics.slice(0, 4).map((clinic) => (
                  <div key={clinic._id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs">{clinic.name}</span>
                      <span className="text-[10px] text-slate-400">Plan: {clinic.subscription?.plan}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-medium ${clinic.features?.publicBooking ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500 line-through'
                        }`}>
                        Public Booking
                      </span>
                      <span className={`px-2 py-0.5 rounded font-medium ${clinic.features?.qrCodeBooking ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500 line-through'
                        }`}>
                        QR Code
                      </span>
                      <span className={`px-2 py-0.5 rounded font-medium ${clinic.features?.customForms ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500 line-through'
                        }`}>
                        Forms
                      </span>
                      <span className={`px-2 py-0.5 rounded font-medium ${clinic.features?.analyticsReporting ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500 line-through'
                        }`}>
                        Analytics
                      </span>
                      <span className={`px-2 py-0.5 rounded font-medium ${clinic.features?.automatedNotifications ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500 line-through'
                        }`}>
                        SMS/Email Alerts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Complaints & Feedback Highlights */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Clinic Complaints & Feedback</h3>
                  <p className="text-xs text-slate-400">Feedback and tickets filed by clinic admins</p>
                </div>
                <button
                  onClick={() => navigate('/superadmin/support')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  View All Tickets <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-white">No active complaints or tickets</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All customer feedback has been handled!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 3).map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketResponseForm({
                          status: ticket.status,
                          priority: ticket.priority,
                          resolutionNote: ticket.resolutionNote || '',
                        });
                        setIsTicketModalOpen(true);
                      }}
                      className="p-3.5 bg-slate-900/60 hover:bg-slate-900 rounded-xl border border-slate-800 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ticket.status === 'OPEN'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : ticket.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                            {ticket.status}
                          </span>
                          <span className="text-xs font-bold text-white">{ticket.subject}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{ticket.clinicId?.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{ticket.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLINICS & OWNERS (Registration & Credentials) */}
      {/* ========================================================================= */}
      {tab === 'clinics' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Registered Clinics & Owners</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Register new clinic practices, manage subscriptions, and generate login credentials for clinic owners.
              </p>
            </div>
            <button
              onClick={() => setIsRegisterClinicOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Clinic</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clinics by name, slug or email..."
                value={clinicSearch}
                onChange={(e) => setClinicSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Clinics Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Clinic Name & Slug</th>
                    <th className="py-3 px-3">Owner & Contact</th>
                    <th className="py-3 px-3">Subscription</th>
                    <th className="py-3 px-3">Price / Cycle</th>
                    <th className="py-3 px-3">Usage / Quota</th>
                    <th className="py-3 px-3">Staff / Doctors</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clinics
                    .filter((c) =>
                      c.name.toLowerCase().includes(clinicSearch.toLowerCase()) ||
                      c.slug?.toLowerCase().includes(clinicSearch.toLowerCase()) ||
                      c.email?.toLowerCase().includes(clinicSearch.toLowerCase())
                    )
                    .map((clinic) => (
                      <tr key={clinic._id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">{clinic.name}</div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {clinic.clinicType || 'Multi-Speciality'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">/{clinic.slug}</span>
                          </div>
                          {clinic.googleBusinessProfile && (
                            <a
                              href={clinic.googleBusinessProfile}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-1 font-medium inline-block"
                              title="Google Business Profile & Review Link"
                            >
                              ★ Google Reviews Connected
                            </a>
                          )}
                          {clinic.phone && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{clinic.phone}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-200 font-semibold">{clinic.ownerId?.name || 'Clinic Owner'}</div>
                          <div className="text-[11px] text-slate-400">{clinic.ownerId?.email || clinic.email}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {clinic.subscription?.plan || 'GROWTH'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${clinic.subscription?.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                              }`}>
                              {clinic.subscription?.status || 'ACTIVE'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white">${clinic.subscription?.pricePerMonth || 49}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{clinic.subscription?.billingCycle || 'Monthly'}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-white">
                            {clinic.patientCount || 0} / {clinic.subscription?.patientQuota || 300}
                          </div>
                          <div className="text-[10px] text-slate-400">Patients onboarded</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-300 font-medium">{clinic.doctorCount || 1} Doctors</div>
                          <div className="text-[10px] text-slate-400">{clinic.appointmentCount || 0} Appointments</div>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setStaffForm((prev) => ({ ...prev, clinicId: clinic._id }));
                                setIsAddStaffOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
                            >
                              + Staff
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClinic(clinic);
                                setSubscriptionForm({
                                  plan: clinic.subscription?.plan || 'GROWTH',
                                  status: clinic.subscription?.status || 'ACTIVE',
                                  pricePerMonth: clinic.subscription?.pricePerMonth || 49,
                                  patientQuota: clinic.subscription?.patientQuota || 300,
                                  billingCycle: clinic.subscription?.billingCycle || 'MONTHLY',
                                });
                                setIsSubscriptionModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition"
                            >
                              Edit Plan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCTORS & STAFF PROVISIONING */}
      {/* ========================================================================= */}
      {tab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Doctors & Staff Provisioning</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add doctors and clinic staff across any tenant and generate instant login credentials to share.
              </p>
            </div>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Provision Doctor or Staff</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            {/* Filter by Clinic Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Filter by Clinic:</span>
                <select
                  value={selectedClinicFilter}
                  onChange={(e) => setSelectedClinicFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Clinics ({clinics.length})</option>
                  {clinics.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-slate-400">
                Total Doctors Platform-wide: <strong className="text-white">{doctors.length}</strong>
              </span>
            </div>

            {/* Doctors Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Doctor / Staff Name</th>
                    <th className="py-3 px-3">Clinic Assigned</th>
                    <th className="py-3 px-3">Specialization & License</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Consultation Fee</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Credentials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {doctors
                    .filter((doc) => selectedClinicFilter === 'ALL' || doc.clinicId?._id === selectedClinicFilter || doc.clinicId === selectedClinicFilter)
                    .map((doc) => (
                      <tr key={doc._id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                              {doc.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{doc.name}</span>
                          </div>
                          <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                            DOCTOR
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-200 font-semibold">{doc.clinicId?.name || 'Clinic'}</div>
                          <div className="text-[10px] text-slate-400">/{doc.clinicId?.slug || 'clinic'}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-300 font-medium">{doc.specialization || 'Doctor'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Lic: {doc.licenseNumber || 'Verified'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-300">{doc.userId?.email || doc.email || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400">{doc.userId?.phone || doc.phone || '-'}</div>
                        </td>

                        <td className="py-3.5 px-3 font-semibold text-white">
                          ${doc.consultationFee || 50}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${doc.isActive !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                            {doc.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => {
                              const clinicObj = clinics.find((c) => c._id === doc.clinicId?._id || c._id === doc.clinicId);
                              setGeneratedCredentials({
                                clinicName: clinicObj?.name || 'Clinic',
                                name: doc.name,
                                email: doc.userId?.email || doc.email || 'doctor@example.com',
                                role: 'DOCTOR',
                                password: '[Encrypted in Database - Reset if needed]',
                                loginUrl: `${window.location.origin}/login`,
                              });
                              setIsCredentialsModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                          >
                            View Card
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FEATURE GATING & TIERS */}
      {/* ========================================================================= */}
      {tab === 'features' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Feature Gating & Access Control Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly toggle and lock/unlock specific features for each clinic according to their subscription plan and payments.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Clinic & Plan</th>
                    <th className="py-3 px-3 text-center">Public Booking Page</th>
                    <th className="py-3 px-3 text-center">QR Code Booking</th>
                    <th className="py-3 px-3 text-center">Custom Forms</th>
                    <th className="py-3 px-3 text-center">Analytics Reporting</th>
                    <th className="py-3 px-3 text-center">Automated Notifications</th>
                    <th className="py-3 px-3 text-center">Multi-Doctor System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clinics.map((clinic) => {
                    const f = clinic.features || {};
                    return (
                      <tr key={clinic._id} className="hover:bg-slate-900/60 transition">
                        <td className="py-4 px-3 min-w-[180px]">
                          <div className="font-bold text-white text-sm">{clinic.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">/{clinic.slug}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                              {clinic.subscription?.plan || 'GROWTH'}
                            </span>
                          </div>
                        </td>

                        {/* Public Booking */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFeature(clinic._id, 'publicBooking', f.publicBooking)}
                            className={`p-1.5 rounded-lg border transition ${f.publicBooking
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                          >
                            {f.publicBooking ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500 inline" />
                            )}
                            <span className="block text-[10px] mt-0.5 font-bold">
                              {f.publicBooking ? 'Active' : 'Locked'}
                            </span>
                          </button>
                        </td>

                        {/* QR Code Booking */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFeature(clinic._id, 'qrCodeBooking', f.qrCodeBooking)}
                            className={`p-1.5 rounded-lg border transition ${f.qrCodeBooking
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                          >
                            {f.qrCodeBooking ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500 inline" />
                            )}
                            <span className="block text-[10px] mt-0.5 font-bold">
                              {f.qrCodeBooking ? 'Active' : 'Locked'}
                            </span>
                          </button>
                        </td>

                        {/* Custom Forms */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFeature(clinic._id, 'customForms', f.customForms)}
                            className={`p-1.5 rounded-lg border transition ${f.customForms
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                          >
                            {f.customForms ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500 inline" />
                            )}
                            <span className="block text-[10px] mt-0.5 font-bold">
                              {f.customForms ? 'Active' : 'Locked'}
                            </span>
                          </button>
                        </td>

                        {/* Analytics Reporting */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFeature(clinic._id, 'analyticsReporting', f.analyticsReporting)}
                            className={`p-1.5 rounded-lg border transition ${f.analyticsReporting
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                          >
                            {f.analyticsReporting ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500 inline" />
                            )}
                            <span className="block text-[10px] mt-0.5 font-bold">
                              {f.analyticsReporting ? 'Active' : 'Locked'}
                            </span>
                          </button>
                        </td>

                        {/* Automated Notifications */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFeature(clinic._id, 'automatedNotifications', f.automatedNotifications)}
                            className={`p-1.5 rounded-lg border transition ${f.automatedNotifications
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                          >
                            {f.automatedNotifications ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500 inline" />
                            )}
                            <span className="block text-[10px] mt-0.5 font-bold">
                              {f.automatedNotifications ? 'Active' : 'Locked'}
                            </span>
                          </button>
                        </td>

                        {/* Multi-Doctor */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFeature(clinic._id, 'multiDoctor', f.multiDoctor)}
                            className={`p-1.5 rounded-lg border transition ${f.multiDoctor
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                          >
                            {f.multiDoctor ? (
                              <ToggleRight className="w-5 h-5 text-emerald-400 inline" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500 inline" />
                            )}
                            <span className="block text-[10px] mt-0.5 font-bold">
                              {f.multiDoctor ? 'Active' : 'Locked'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: GLOBAL PATIENTS DIRECTORY */}
      {/* ========================================================================= */}
      {tab === 'patients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Global Patients Directory</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {patients.length} Total Registered
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized registry of all patients across every clinic tenant in your SaaS ecosystem.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name, phone, email, or clinic..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Patient Name</th>
                    <th className="py-3 px-3">Phone & Contact</th>
                    <th className="py-3 px-3">Clinic Origin</th>
                    <th className="py-3 px-3">Gender / Age</th>
                    <th className="py-3 px-3">Completed Visits</th>
                    <th className="py-3 px-3">Date Registered</th>
                    <th className="py-3 px-3 text-right">Last Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {patients
                    .filter((p) =>
                      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                      p.phone?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                      p.email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
                      p.clinicId?.name?.toLowerCase().includes(patientSearch.toLowerCase())
                    )
                    .map((pat) => (
                      <tr key={pat._id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white text-sm">{pat.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {pat._id.slice(-6).toUpperCase()}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-200 font-medium">{pat.phone}</div>
                          <div className="text-[11px] text-slate-400">{pat.email || 'No email'}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-slate-200 font-semibold">{pat.clinicId?.name || 'Clinic'}</div>
                          <div className="text-[10px] text-slate-400">/{pat.clinicId?.slug || 'clinic'}</div>
                        </td>

                        <td className="py-3.5 px-3 capitalize text-slate-300">
                          {pat.gender || 'Not specified'} {pat.age ? `(${pat.age} yrs)` : ''}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/20">
                            {pat.appointmentCount ?? 1} Appointments
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-400">
                          {new Date(pat.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-3 text-right text-slate-300 font-medium">
                          {pat.lastVisit ? new Date(pat.lastVisit).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SAAS REVENUE & PAYMENTS */}
      {/* ========================================================================= */}
      {tab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">SaaS Revenue & Payment Analytics</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track subscription collections, outstanding dues, and generate manual invoices for clinic fees.
              </p>
            </div>
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Payment / Invoice</span>
            </button>
          </div>

          {/* Revenue KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400">Monthly Recurring Revenue (MRR)</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                ${paymentsData?.metrics?.mrr || analytics?.overview?.totalMRR || 0}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">Active subscriptions</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400">Annual Run Rate (ARR)</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                ${paymentsData?.metrics?.arr || ((analytics?.overview?.totalMRR || 0) * 12).toLocaleString()}
              </div>
              <p className="text-[11px] text-indigo-400 mt-1">Projected 12 months</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400">Total Collected To Date</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                ${paymentsData?.metrics?.totalCollected || 0}
              </div>
              <p className="text-[11px] text-teal-400 mt-1">Cleared invoice payments</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400">Pending & Overdue Invoices</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                ${paymentsData?.metrics?.pendingPayments || 0}
              </div>
              <p className="text-[11px] text-amber-400 mt-1">Awaiting settlement</p>
            </div>
          </div>

          {/* Payments Invoices Table */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Subscription Billing & Invoices Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Clinic Tenant</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Cycle</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Billing Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(paymentsData?.payments || []).map((pay) => (
                    <tr key={pay._id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-purple-300">
                        {pay.invoiceNumber || `INV-${pay._id.slice(-6).toUpperCase()}`}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{pay.clinicId?.name || 'Clinic'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">/{pay.clinicId?.slug}</div>
                      </td>

                      <td className="py-3.5 px-3 font-extrabold text-white text-sm">
                        ${pay.amount}
                      </td>

                      <td className="py-3.5 px-3 uppercase text-slate-300 font-medium">
                        {pay.billingCycle || 'MONTHLY'}
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        {pay.paymentMethod || 'STRIPE'}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pay.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : pay.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                          {pay.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(pay.billingDate || pay.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {pay.status !== 'PAID' && (
                          <button
                            onClick={async () => {
                              try {
                                await api.recordSuperAdminPayment({
                                  clinicId: pay.clinicId?._id || pay.clinicId,
                                  amount: pay.amount,
                                  status: 'PAID',
                                  notes: `Settled invoice ${pay.invoiceNumber}`,
                                });
                                showToast('Marked as paid!', 'success');
                                loadDashboardData();
                              } catch (err) {
                                showToast(err.message, 'error');
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/30 transition"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SUPPORT & FEEDBACK COMPLAINTS */}
      {/* ========================================================================= */}
      {tab === 'support' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Customer Support & Clinic Feedback</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review complaints, feature requests, and inquiries submitted by clinic owners and practitioners.
              </p>
            </div>
          </div>

          {/* Ticket status filter pills */}
          <div className="flex items-center gap-2">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setTicketStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${ticketStatusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
              >
                {st.replace('_', ' ')}
                {st === 'OPEN' && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                    {tickets.filter((t) => t.status === 'OPEN').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {tickets
              .filter((t) => ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter)
              .map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${ticket.status === 'OPEN'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : ticket.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                        {ticket.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        {ticket.category || 'GENERAL'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ticket.priority === 'URGENT'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                        }`}>
                        {ticket.priority || 'MEDIUM'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Filed on: {new Date(ticket.createdAt).toLocaleDateString()} at{' '}
                      {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{ticket.subject}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 mb-3">
                    {ticket.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="text-slate-400 flex items-center gap-3">
                      <span>
                        Clinic: <strong className="text-white">{ticket.clinicId?.name}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Submitted by: <strong className="text-white">{ticket.submittedBy?.name}</strong> (
                        {ticket.submittedBy?.email})
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketResponseForm({
                          status: ticket.status,
                          priority: ticket.priority,
                          resolutionNote: ticket.resolutionNote || '',
                        });
                        setIsTicketModalOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-md transition"
                    >
                      Respond & Update Ticket
                    </button>
                  </div>

                  {ticket.resolutionNote && (
                    <div className="mt-3 p-3 bg-purple-950/40 rounded-xl border border-purple-800/40 text-xs">
                      <div className="font-semibold text-purple-300 mb-0.5">SuperAdmin Resolution Note / Reply:</div>
                      <p className="text-slate-300">{ticket.resolutionNote}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW CLINIC & OWNER */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRegisterClinicOpen}
        onClose={() => setIsRegisterClinicOpen(false)}
        title="Register New Clinic Practice & Owner"
        description="Creates tenant clinic, initial subscription invoice, and provisions owner credentials."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRegisterClinic} className="space-y-4 text-xs font-sans">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Auto-Credential Generator
            </span>
            <p className="text-[11px] text-purple-700 mt-0.5">
              A secure password will be automatically generated and presented with 1-click copy to send directly to the clinic admin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Care Clinic & Diagnostics"
                value={clinicForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-');
                  setClinicForm({ ...clinicForm, name, slug });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Slug (URL identifier) *</label>
              <input
                type="text"
                required
                placeholder="e.g. metro-care"
                value={clinicForm.slug}
                onChange={(e) => setClinicForm({ ...clinicForm, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* User Request: Clinic Type & Google Business Profile (for patient ratings) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Type / Speciality *</label>
              <select
                value={clinicForm.clinicType}
                onChange={(e) => setClinicForm({ ...clinicForm, clinicType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="Multi-Speciality Clinic">Multi-Speciality Clinic</option>
                <option value="Dental & Oral Care">Dental & Oral Care</option>
                <option value="Aesthetic & Dermatology">Aesthetic & Dermatology</option>
                <option value="Physiotherapy & Rehabilitation">Physiotherapy & Rehabilitation</option>
                <option value="Ophthalmology / Eye Care">Ophthalmology / Eye Care</option>
                <option value="General Medicine & Primary Care">General Medicine & Primary Care</option>
                <option value="Pediatrics & Child Care">Pediatrics & Child Care</option>
                <option value="Orthopedics & Joint Clinic">Orthopedics & Joint Clinic</option>
                <option value="Cardiology & Heart Care">Cardiology & Heart Care</option>
                <option value="ENT Clinic">ENT Clinic (Ear, Nose, Throat)</option>
                <option value="Psychiatry & Mental Health">Psychiatry & Mental Health</option>
                <option value="Ayurveda & Wellness">Ayurveda & Wellness</option>
                <option value="Other Healthcare Specialty">Other Healthcare Specialty</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Google Business Profile / Maps Link</label>
              <input
                type="url"
                placeholder="https://maps.app.goo.gl/... or https://g.page/r/..."
                value={clinicForm.googleBusinessProfile}
                onChange={(e) => setClinicForm({ ...clinicForm, googleBusinessProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Used to collect Google 5-star ratings and reviews from patients.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Phone</label>
              <input
                type="tel"
                placeholder="+1 555-0192"
                value={clinicForm.phone}
                onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Address</label>
              <input
                type="text"
                placeholder="Suite 400, Medical Tower"
                value={clinicForm.address}
                onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">Clinic Owner / Administrator Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Sarah Jenkins"
                  value={clinicForm.ownerName}
                  onChange={(e) => setClinicForm({ ...clinicForm, ownerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="admin@metrocare.com"
                  value={clinicForm.ownerEmail}
                  onChange={(e) => setClinicForm({ ...clinicForm, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">SaaS Subscription & Pricing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Tier</label>
                <select
                  value={clinicForm.plan}
                  onChange={(e) => setClinicForm({ ...clinicForm, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
                >
                  <option value="STARTER">STARTER</option>
                  <option value="GROWTH">GROWTH</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price / Month ($)</label>
                <input
                  type="number"
                  min="0"
                  value={clinicForm.pricePerMonth}
                  onChange={(e) => setClinicForm({ ...clinicForm, pricePerMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Quota Limit</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={clinicForm.patientQuota}
                  onChange={(e) => setClinicForm({ ...clinicForm, patientQuota: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1.5">Initial Feature Gating</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(clinicForm.features).map((featKey) => (
                <label key={featKey} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clinicForm.features[featKey]}
                    onChange={(e) =>
                      setClinicForm({
                        ...clinicForm,
                        features: { ...clinicForm.features, [featKey]: e.target.checked },
                      })
                    }
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="capitalize text-[11px] font-medium text-slate-700">
                    {featKey.replace(/([A-Z])/g, ' $1')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsRegisterClinicOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              Register Clinic & Generate Login
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: ADD DOCTOR OR STAFF TO CLINIC */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Add Doctor or Staff to Clinic"
        description="Assign a new practitioner or receptionist to a tenant clinic and generate credentials."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddStaff} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Clinic *</label>
            <select
              required
              value={staffForm.clinicId}
              onChange={(e) => setStaffForm({ ...staffForm, clinicId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
            >
              <option value="">Select Clinic</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (/{c.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role *</label>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
              >
                <option value="DOCTOR">Doctor / Specialist</option>
                <option value="STAFF">Frontdesk / Staff</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Dr. Michael Scott"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="michael@careclinic.com"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 555-0188"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {staffForm.role === 'DOCTOR' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800">Doctor Profile Settings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={staffForm.specialization}
                    onChange={(e) => setStaffForm({ ...staffForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License No.</label>
                  <input
                    type="text"
                    placeholder="DDS-84729"
                    value={staffForm.licenseNumber}
                    onChange={(e) => setStaffForm({ ...staffForm, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={staffForm.consultationFee}
                    onChange={(e) => setStaffForm({ ...staffForm, consultationFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              Provision Staff & Generate Login
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: CREDENTIALS GENERATED (1-Click Copy to Share) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        title="🎉 Credentials Generated Successfully"
        description="Share these login credentials directly with the clinic owner or doctor."
        maxWidth="max-w-lg"
      >
        {generatedCredentials && (
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-gradient-to-tr from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                  CareSlot Account Access
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-200/80 text-purple-800 font-bold text-[10px]">
                  {generatedCredentials.role}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-[11px] text-slate-500">Clinic Name</span>
                  <div className="font-bold text-slate-800 text-sm">{generatedCredentials.clinicName}</div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500">User Full Name</span>
                  <div className="font-semibold text-slate-800">{generatedCredentials.name}</div>
                </div>

                {/* Email Box */}
                <div>
                  <span className="text-[11px] text-slate-500">Login Email</span>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-200 mt-0.5">
                    <span className="font-mono text-purple-950 font-bold">{generatedCredentials.email}</span>
                    <button
                      onClick={() => handleCopy(generatedCredentials.email, 'email')}
                      className="p-1 text-slate-400 hover:text-purple-600 transition"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Box */}
                <div>
                  <span className="text-[11px] text-slate-500">Temporary Password</span>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-200 mt-0.5">
                    <span className="font-mono text-purple-950 font-extrabold text-sm">{generatedCredentials.password}</span>
                    <button
                      onClick={() => handleCopy(generatedCredentials.password, 'password')}
                      className="p-1 text-slate-400 hover:text-purple-600 transition"
                      title="Copy Password"
                    >
                      {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login URL */}
                <div>
                  <span className="text-[11px] text-slate-500">Sign In Portal URL</span>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-200 mt-0.5">
                    <span className="font-mono text-slate-600 text-[11px] truncate mr-2">{generatedCredentials.loginUrl}</span>
                    <button
                      onClick={() => handleCopy(generatedCredentials.loginUrl, 'url')}
                      className="p-1 text-slate-400 hover:text-purple-600 transition"
                      title="Copy URL"
                    >
                      {copiedField === 'url' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const message = `🦷 CareSlot Platform Credentials:\nClinic: ${generatedCredentials.clinicName}\nName: ${generatedCredentials.name}\nRole: ${generatedCredentials.role}\nLogin URL: ${generatedCredentials.loginUrl}\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}\n\nPlease sign in and change your password in Settings.`;
                  handleCopy(message, 'all');
                }}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'all' ? 'Copied Full Welcome Message!' : 'Copy Full Welcome Message'}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT SUBSCRIPTION & PATIENT QUOTA */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        title="Update Clinic Subscription Plan & Pricing"
        description={`Modify tier, pricing, or patient volume quota for ${selectedClinic?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateSubscription} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Plan Tier</label>
            <select
              value={subscriptionForm.plan}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, plan: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
            >
              <option value="STARTER">STARTER</option>
              <option value="GROWTH">GROWTH</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={subscriptionForm.status}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="TRIAL">TRIAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={subscriptionForm.billingCycle}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, billingCycle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price per Month ($)</label>
              <input
                type="number"
                min="0"
                value={subscriptionForm.pricePerMonth}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, pricePerMonth: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Patient Volume Quota</label>
              <input
                type="number"
                min="50"
                step="50"
                value={subscriptionForm.patientQuota}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, patientQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsSubscriptionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              Save Subscription Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: RECORD SAAS PAYMENT / INVOICE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        title="Record SaaS Payment Invoice"
        description="Log an invoice or offline/online subscription payment for a clinic."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinic *</label>
            <select
              required
              value={paymentForm.clinicId}
              onChange={(e) => setPaymentForm({ ...paymentForm, clinicId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
            >
              <option value="">Select Clinic</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (${c.subscription?.pricePerMonth || 49}/mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                required
                min="1"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={paymentForm.status}
                onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="STRIPE">Stripe Online</option>
                <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
                <option value="UPI">UPI / Digital</option>
                <option value="CASH">Cash / Cheque</option>
                <option value="CARD">Credit/Debit Card</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={paymentForm.billingCycle}
                onChange={(e) => setPaymentForm({ ...paymentForm, billingCycle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Notes</label>
            <input
              type="text"
              placeholder="e.g. TXN-948194, Wire transfer received"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsRecordPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Save Invoice Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 6: RESPOND & RESOLVE SUPPORT TICKET */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Respond & Resolve Customer Complaint"
        description="Update ticket status and provide resolution remarks to the clinic."
        maxWidth="max-w-lg"
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 text-sm mb-1">{selectedTicket.subject}</div>
              <p className="text-slate-600">{selectedTicket.description}</p>
              <div className="text-[11px] text-slate-400 mt-2">
                From: <strong>{selectedTicket.clinicId?.name}</strong> • By: {selectedTicket.submittedBy?.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={ticketResponseForm.status}
                  onChange={(e) => setTicketResponseForm({ ...ticketResponseForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={ticketResponseForm.priority}
                  onChange={(e) => setTicketResponseForm({ ...ticketResponseForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 bg-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resolution Reply / Note *</label>
              <textarea
                required
                rows={4}
                placeholder="Explain the solution or action taken (e.g. 'Issue resolved: Feature gate enabled for your account')..."
                value={ticketResponseForm.resolutionNote}
                onChange={(e) => setTicketResponseForm({ ...ticketResponseForm, resolutionNote: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsTicketModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Response & Update Status
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
