import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  QrCode,
  FileSpreadsheet,
  Clock,
  Users,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Layers,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleQuickDemo = async (role = 'CLINIC_ADMIN') => {
    try {
      setLoggingIn(true);
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setLoggingIn(false);
    }
  };

  const features = [
    {
      icon: QrCode,
      title: 'Countertop QR Booking',
      desc: 'Patients scan a counter tent card with their smartphone camera and pick an available slot in seconds without downloading an app.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Dynamic Form Builder',
      desc: 'Drag and drop 18 medical intake fields. Configure conditional logic rules for allergies, medications, and consent.',
    },
    {
      icon: Clock,
      title: 'Intelligent Slot Engine',
      desc: 'Automatic slot generation respecting doctor shifts, treatment durations, breaks, and zero double-booking concurrency guarantee.',
    },
    {
      icon: Users,
      title: 'Live Reception Queue',
      desc: 'Keep your waiting room organized with automated queue tokens (#01, #02) and wait time estimations.',
    },
    {
      icon: Bell,
      title: 'WhatsApp & SMS Notifications',
      desc: 'Automated confirmations, 24h reminders, reschedule notices, and thank you notes customizable with merge tags.',
    },
    {
      icon: BarChart3,
      title: 'Revenue & Patient Analytics',
      desc: 'Visual graphs of daily clinic volume, new vs returning patient retention, and doctor workload distribution.',
    },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '₹1,999',
      period: '/ month',
      desc: 'Ideal for independent clinics and single practitioners.',
      features: [
        'Up to 2 Doctors',
        'Unlimited QR Code Bookings',
        'Custom Form Builder (Basic)',
        'Live Reception Queue Widget',
        'WhatsApp / SMS Notifications',
        'Standard Email Support',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '₹4,499',
      period: '/ month',
      desc: 'Designed for growing multi-specialty and healthcare centers.',
      features: [
        'Up to 10 Doctors & Practitioners',
        'Unlimited Dynamic Forms & Logic Rules',
        'Multi-Shift Availability & Slot Engine',
        'Patient Medical History & Notes',
        'Recharts Growth Analytics Dashboard',
        'Staff Roles & Receptionist Logins',
        'Priority Phone & Chat Support',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '₹8,999',
      period: '/ month',
      desc: 'For hospital networks and multi-location clinic chains.',
      features: [
        'Unlimited Doctors & Locations',
        'Custom Domain & Brand Whitelabeling',
        'Direct WhatsApp Business Cloud API',
        'Stripe / Razorpay Payment Integration',
        'Full Audit Logs & Role Permissions',
        'Dedicated 24/7 Account Manager',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">CareSlot</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleQuickDemo('CLINIC_ADMIN')}
              loading={loggingIn}
              variant="outline"
              size="sm"
            >
              1-Click Demo
            </Button>
            <Button onClick={() => navigate('/login')} variant="primary" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Next-Gen Clinic Appointment & Patient SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto">
          Appointments, Forms & Patient Management —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
            Built for Modern Clinics.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Let patients book appointments through a QR code or link while your clinic manages schedules, custom intake forms, waiting room queue, and follow-ups from one dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button
            onClick={() => handleQuickDemo('CLINIC_ADMIN')}
            loading={loggingIn}
            size="lg"
            className="w-full sm:w-auto text-base shadow-lg shadow-brand-500/25"
            iconRight={ArrowRight}
          >
            Launch Clinic Admin Demo
          </Button>

          <a
            href="/book/smilecare-dental/general-appointment"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center font-medium transition-all text-base px-5 py-2.5 rounded-xl gap-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm"
          >
            <span>Experience QR Booking Page</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Quick Role Switches Bar */}
        <div className="mt-8 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs max-w-xl mx-auto flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <span className="font-bold text-slate-700">Quick Test Logins:</span>
          <button
            onClick={() => handleQuickDemo('CLINIC_ADMIN')}
            className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg transition-colors"
          >
            Clinic Admin
          </button>
          <button
            onClick={() => handleQuickDemo('STAFF')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg transition-colors"
          >
            Receptionist / Staff
          </button>
          <button
            onClick={() => handleQuickDemo('SUPER_ADMIN')}
            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors"
          >
            Super Admin
          </button>
        </div>

        {/* Hero Interactive Mockup Preview */}
        <div className="mt-14 relative rounded-3xl p-3 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl">
          <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-bold text-xs text-slate-800">CareSlot Medical Practice — Schedule</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                ● LIVE SYNC ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Currently Serving</span>
                <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">#02</div>
                <p className="text-xs font-semibold text-slate-700 mt-2">Priya Gupta (Consultation)</p>
                <p className="text-[11px] text-slate-500">Dr. Rahul Sharma</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Next in Queue</span>
                <div className="text-3xl font-extrabold text-brand-600 font-mono mt-1">#03</div>
                <p className="text-xs font-semibold text-slate-700 mt-2">Amit Kumar (General Checkup)</p>
                <p className="text-[11px] text-slate-500">Wait time: ~15 mins</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Appointments</span>
                <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">24</div>
                <p className="text-xs font-semibold text-emerald-600 mt-2">12 Completed • 3 Waiting</p>
                <p className="text-[11px] text-slate-500">0 Double bookings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
              Full-Suite Healthcare SaaS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Engineered for seamless patient visits
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything your clinic needs from digital registration to appointment follow-up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-card hover:border-slate-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 group-hover:text-white text-brand-600 flex items-center justify-center transition-colors mb-4 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step by Step Workflow */}
      <section id="workflow" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
            Clinic Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How CareSlot works in practice
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              1
            </span>
            <h3 className="text-base font-bold text-slate-900">Admin Sets Up Clinic</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Add doctors, services, configure weekly shift hours, create custom patient intake forms, and print the auto-generated QR code tent card.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              2
            </span>
            <h3 className="text-base font-bold text-slate-900">Patient Scans QR Code</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Patient selects service, doctor, answers medical intake questions with live conditional rules, selects an available slot, and receives instant confirmation.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4">
              3
            </span>
            <h3 className="text-base font-bold text-slate-900">Reception & Doctor Consult</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Appointment appears on the reception dashboard. Queue token is assigned, doctor conducts treatment, adds clinical notes, and schedules follow-up.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Predictable plans for every clinic size
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Ready for Stripe & Razorpay payment gateways. Start your 14-day risk-free trial today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  tier.popular
                    ? 'bg-slate-900 text-white shadow-xl ring-2 ring-brand-500 scale-105'
                    : 'bg-white border border-slate-200 shadow-subtle text-slate-900'
                }`}
              >
                <div>
                  {tier.popular && (
                    <span className="text-[10px] font-bold text-brand-400 bg-brand-950 px-2.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-brand-800">
                      Most Popular for Clinics
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  <p className={`text-xs mt-1 ${tier.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tier.desc}
                  </p>

                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-extrabold font-mono">{tier.price}</span>
                    <span className={`text-xs ml-1 ${tier.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tier.period}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 ${
                            tier.popular ? 'text-brand-400' : 'text-emerald-600'
                          }`}
                        />
                        <span className={tier.popular ? 'text-slate-300' : 'text-slate-600'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleQuickDemo('CLINIC_ADMIN')}
                    variant={tier.popular ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                  >
                    Start Free Trial
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-white font-extrabold text-sm">CareSlot</span>
            <span className="text-slate-600">| Modern Clinic Appointment SaaS</span>
          </div>

          <p>© {new Date().getFullYear()} CareSlot Inc. Built for healthcare clinics and medical practices worldwide.</p>
        </div>
      </footer>
    </div>
  );
};
