import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, Sparkles, MessageSquare, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSupportModal } from '../../context/SupportModalContext';

export const LockedFeatureGuard = ({
  featureKey,
  featureName = 'Feature',
  featureDescription,
  requiredPlan = 'Growth or Enterprise Plan',
  children,
}) => {
  const { user, clinic } = useAuth();
  const navigate = useNavigate();
  const { openSupportModal } = useSupportModal();

  // SuperAdmin has full root bypass
  if (user?.role === 'SUPER_ADMIN') {
    return children;
  }

  // Check if clinic has this feature enabled
  // Default is true if features object or key is not explicitly set to false
  const isEnabled = clinic?.features ? clinic.features[featureKey] !== false : true;

  if (isEnabled) {
    return children;
  }

  // Feature is LOCKED by SuperAdmin -> Show Glassmorphism + Skeleton Locked UI
  const handleContactSuperAdmin = () => {
    openSupportModal({
      category: 'FEATURE_REQUEST',
      priority: 'HIGH',
      subject: `Request to unlock "${featureName}" module`,
      description: `Hello SuperAdmin,\n\nOur clinic "${clinic?.name || 'Clinic'}" (slug: /${clinic?.slug || ''}) would like to unlock access to the "${featureName}" feature.\n\nPlease review our subscription plan (${clinic?.subscription?.plan || 'STARTER'}) and enable permissions for this module.`,
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full rounded-3xl overflow-hidden flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* ========================================================================= */}
      {/* SKELETON BACKGROUND (Mock Dashboard Preview with Shimmer & Blur) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 p-6 sm:p-8 filter blur-[5px] opacity-40 select-none pointer-events-none overflow-hidden space-y-6">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-slate-300 rounded-lg animate-pulse" />
            <div className="h-3.5 w-80 bg-slate-200 rounded-md animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 bg-slate-300 rounded-xl animate-pulse" />
            <div className="h-9 w-28 bg-brand-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
              </div>
              <div className="h-7 w-20 bg-slate-300 rounded-lg" />
              <div className="h-2.5 w-36 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Skeleton Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-8 w-64 bg-slate-100 rounded-xl" />
            <div className="h-8 w-24 bg-slate-100 rounded-xl" />
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-36 bg-slate-300 rounded" />
                    <div className="h-2.5 w-24 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-slate-200 rounded-full" />
                <div className="h-3 w-28 bg-slate-200 rounded hidden sm:block" />
                <div className="h-7 w-16 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GLASSMORPHISM CENTERED LOCK CARD */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-lg w-full bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl rounded-3xl p-6 sm:p-8 text-center transition-all duration-300 transform translate-y-0">
        {/* Floating Glowing Lock Icon */}
        <div className="relative mx-auto mb-5 w-20 h-20">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-brand-500 opacity-25 blur-lg animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 border border-purple-500/40 shadow-xl flex items-center justify-center text-white">
            <Lock className="w-9 h-9 text-purple-400" />
          </div>
        </div>

        {/* Lock Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Locked by SuperAdmin</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          {featureName} is Restricted
        </h2>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
          {featureDescription ||
            `Access to the ${featureName} module is currently locked for your clinic account based on your active subscription plan. Contact the platform administrator to activate this feature.`}
        </p>

        {/* Current Plan & Status Details Box */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-left text-xs mb-6 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Clinic Practice:</span>
            <span className="font-bold text-slate-800">{clinic?.name || 'Your Clinic'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Current Subscription Plan:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px]">
              {clinic?.subscription?.plan || 'STARTER'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Feature Required Tier:</span>
            <span className="font-semibold text-brand-600">{requiredPlan}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200/60">
            <span>Module Permission:</span>
            <span className="font-bold text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Locked by Platform Owner
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleContactSuperAdmin}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact SuperAdmin to Unlock</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Footer tip */}
        <p className="text-[11px] text-slate-400 mt-4">
          Once the SuperAdmin updates your clinic permissions or tier, this feature unlocks immediately.
        </p>
      </div>
    </div>
  );
};
